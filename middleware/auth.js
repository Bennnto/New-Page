const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

// Middleware to verify JWT token and authenticate user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is missing.'
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists and is active
    const session = await Session.findOne({
      token: token,
      user: decoded.userId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please login again.'
      });
    }
    
    // Get user details
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or inactive.'
      });
    }
    
    // Update session activity
    await session.updateActivity();
    
    // Attach user and session to request
    req.user = user;
    req.session = session;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed due to server error.'
    });
  }
};

// Middleware to check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredRole: roles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

// Middleware to check if user has premium subscription
const requirePremium = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }
  
  if (!req.user.isPremium) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required for this feature.',
      subscriptionStatus: req.user.subscription.status,
      currentPlan: req.user.subscription.plan
    });
  }
  
  next();
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const session = await Session.findOne({
      token: token,
      user: decoded.userId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    });
    
    if (session) {
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        await session.updateActivity();
        req.user = user;
        req.session = session;
      }
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

// Middleware to check resource ownership
const checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }
      
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }
      
      // Check if user owns the resource or is admin
      if (resource.owner?.toString() !== req.user._id.toString() && 
          resource.user?.toString() !== req.user._id.toString() &&
          req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource.'
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify resource ownership.'
      });
    }
  };
};

// Middleware to validate subscription limits
const checkSubscriptionLimits = (feature, limit = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }
      
      const user = req.user;
      const plan = user.subscription.plan;
      
      // Define limits for each plan
      const limits = {
        free: {
          mediaUploads: 10,
          mediaSize: 5 * 1024 * 1024, // 5MB
          storage: 100 * 1024 * 1024, // 100MB
          apiCalls: 100
        },
        basic: {
          mediaUploads: 100,
          mediaSize: 25 * 1024 * 1024, // 25MB
          storage: 1024 * 1024 * 1024, // 1GB
          apiCalls: 1000
        },
        premium: {
          mediaUploads: 1000,
          mediaSize: 100 * 1024 * 1024, // 100MB
          storage: 10 * 1024 * 1024 * 1024, // 10GB
          apiCalls: 10000
        },
        enterprise: {
          mediaUploads: -1, // unlimited
          mediaSize: 500 * 1024 * 1024, // 500MB
          storage: -1, // unlimited
          apiCalls: -1 // unlimited
        }
      };
      
      const userLimits = limits[plan] || limits.free;
      const featureLimit = limit || userLimits[feature];
      
      if (featureLimit === -1) {
        // Unlimited for this feature
        return next();
      }
      
      // Check specific feature limits
      if (feature === 'mediaUploads') {
        if (user.stats.mediaUploaded >= featureLimit) {
          return res.status(403).json({
            success: false,
            message: `Upload limit reached. Your ${plan} plan allows ${featureLimit} uploads.`,
            currentUsage: user.stats.mediaUploaded,
            limit: featureLimit,
            plan: plan
          });
        }
      }
      
      req.subscriptionLimits = userLimits;
      next();
    } catch (error) {
      console.error('Subscription limit check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify subscription limits.'
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  requirePremium,
  optionalAuth,
  checkOwnership,
  checkSubscriptionLimits
};

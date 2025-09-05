const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Media = require('../models/Media');
const Payment = require('../models/Payment');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('First name must be 1-50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Last name must be 1-50 characters'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .isAlphanumeric()
    .withMessage('Username must be 3-30 characters and alphanumeric')
];

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', 
  authenticate, 
  updateProfileValidation,
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const { firstName, lastName, username } = req.body;
      const userId = req.user._id;
      
      // Check if username is already taken by another user
      if (username && username !== req.user.username) {
        const existingUser = await User.findOne({ 
          username, 
          _id: { $ne: userId } 
        });
        
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Username is already taken'
          });
        }
      }
      
      // Update user
      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (username !== undefined) updateData.username = username;
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser.toJSON()
        }
      });
      
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }
);

// @route   PUT /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const { theme, notifications, privacy } = req.body;
    const userId = req.user._id;
    
    const updateData = {};
    
    if (theme) {
      updateData['preferences.theme'] = theme;
    }
    
    if (notifications) {
      if (notifications.email !== undefined) {
        updateData['preferences.notifications.email'] = notifications.email;
      }
      if (notifications.push !== undefined) {
        updateData['preferences.notifications.push'] = notifications.push;
      }
      if (notifications.announcements !== undefined) {
        updateData['preferences.notifications.announcements'] = notifications.announcements;
      }
    }
    
    if (privacy) {
      if (privacy.profileVisible !== undefined) {
        updateData['preferences.privacy.profileVisible'] = privacy.profileVisible;
      }
      if (privacy.mediaVisible !== undefined) {
        updateData['preferences.privacy.mediaVisible'] = privacy.mediaVisible;
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: updatedUser.preferences
      }
    });
    
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// @route   GET /api/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get media stats
    const mediaStats = await Media.aggregate([
      { $match: { owner: userId, isActive: true } },
      {
        $group: {
          _id: null,
          totalMedia: { $sum: 1 },
          totalViews: { $sum: '$stats.views' },
          totalLikes: { $sum: '$stats.likes' },
          totalSize: { $sum: '$size' }
        }
      }
    ]);
    
    // Get recent media
    const recentMedia = await Media.find({ 
      owner: userId, 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt stats.views stats.likes');
    
    // Get payment stats
    const paymentStats = await Payment.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          successfulPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] }
          }
        }
      }
    ]);
    
    // Get subscription info
    const subscription = {
      plan: req.user.subscription.plan,
      status: req.user.subscription.status,
      currentPeriodEnd: req.user.subscription.currentPeriodEnd,
      cancelAtPeriodEnd: req.user.subscription.cancelAtPeriodEnd
    };
    
    const dashboardData = {
      user: req.user.toJSON(),
      stats: {
        media: mediaStats[0] || {
          totalMedia: 0,
          totalViews: 0,
          totalLikes: 0,
          totalSize: 0
        },
        payments: paymentStats[0] || {
          totalPayments: 0,
          totalAmount: 0,
          successfulPayments: 0
        }
      },
      recentMedia,
      subscription
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
});

// @route   GET /api/user/activity
// @desc    Get user activity log
// @access  Private
router.get('/activity', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const userId = req.user._id;
    
    // This would typically require an Activity model
    // For now, we'll return recent media and payment activities
    
    const activities = [];
    
    // Get recent media uploads
    const recentMedia = await Media.find({ 
      owner: userId, 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title category createdAt');
    
    recentMedia.forEach(media => {
      activities.push({
        type: 'media_upload',
        description: `Uploaded ${media.category}: ${media.title}`,
        timestamp: media.createdAt,
        data: { mediaId: media._id }
      });
    });
    
    // Get recent payments
    const recentPayments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('amount status description createdAt');
    
    recentPayments.forEach(payment => {
      activities.push({
        type: 'payment',
        description: `Payment ${payment.status}: ${payment.description}`,
        timestamp: payment.createdAt,
        data: { paymentId: payment._id, amount: payment.amount }
      });
    });
    
    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedActivities = activities.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(activities.length / limit),
          totalItems: activities.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activity'
    });
  }
});

// @route   GET /api/user/search
// @desc    Search users
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const searchQuery = {
      isActive: true,
      'preferences.privacy.profileVisible': true,
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ]
    };
    
    const users = await User.find(searchQuery)
      .select('username firstName lastName avatar stats.mediaUploaded stats.joinDate')
      .sort({ 'stats.mediaUploaded': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(searchQuery);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
});

// @route   GET /api/user/:id
// @desc    Get public user profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('username firstName lastName avatar stats preferences.privacy');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.preferences.privacy.profileVisible) {
      return res.status(403).json({
        success: false,
        message: 'User profile is private'
      });
    }
    
    // Get public media count if media is visible
    let mediaCount = 0;
    if (user.preferences.privacy.mediaVisible) {
      mediaCount = await Media.countDocuments({
        owner: id,
        visibility: 'public',
        isActive: true
      });
    }
    
    const publicProfile = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      joinDate: user.stats.joinDate,
      mediaCount: mediaCount
    };
    
    res.json({
      success: true,
      data: {
        user: publicProfile
      }
    });
    
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// Admin routes
// @route   GET /api/user/admin/users
// @desc    Get all users (Admin only)
// @access  Private (Admin only)
router.get('/admin/users', 
  authenticate, 
  authorize('admin'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        role, 
        plan, 
        isActive 
      } = req.query;
      
      const query = {};
      
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (role) query.role = role;
      if (plan) query['subscription.plan'] = plan;
      if (isActive !== undefined) query.isActive = isActive === 'true';
      
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      const total = await User.countDocuments(query);
      
      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });
      
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users'
      });
    }
  }
);

// @route   PUT /api/user/admin/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin only)
router.put('/admin/users/:id', 
  authenticate, 
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role, isActive, subscription } = req.body;
      
      const updateData = {};
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (subscription) {
        if (subscription.plan !== undefined) {
          updateData['subscription.plan'] = subscription.plan;
        }
        if (subscription.status !== undefined) {
          updateData['subscription.status'] = subscription.status;
        }
      }
      
      const user = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user
        }
      });
      
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }
);

module.exports = router;

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for session']
  },
  token: {
    type: String,
    required: [true, 'Session token is required'],
    unique: true
  },
  refreshToken: {
    type: String,
    required: [true, 'Refresh token is required'],
    unique: true
  },
  deviceInfo: {
    userAgent: String,
    browser: String,
    os: String,
    device: String,
    ip: String,
    location: {
      country: String,
      city: String,
      timezone: String
    }
  },
  loginMethod: {
    type: String,
    enum: ['email_password', 'social_google', 'social_facebook', 'social_apple', 'magic_link'],
    default: 'email_password'
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  loginAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Default session expires in 7 days
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  },
  refreshExpiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Refresh token expires in 30 days
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  logoutAt: Date,
  logoutReason: {
    type: String,
    enum: ['user_logout', 'timeout', 'admin_revoke', 'security_breach', 'expired']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for session duration
sessionSchema.virtual('duration').get(function() {
  const endTime = this.logoutAt || new Date();
  return Math.round((endTime - this.loginAt) / 1000); // in seconds
});

// Virtual for is expired
sessionSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for is refresh expired
sessionSchema.virtual('isRefreshExpired').get(function() {
  return new Date() > this.refreshExpiresAt;
});

// Virtual for time until expiry
sessionSchema.virtual('timeUntilExpiry').get(function() {
  const now = new Date();
  const expiry = this.expiresAt;
  
  if (now >= expiry) return 0;
  
  return Math.round((expiry - now) / 1000); // in seconds
});

// Method to refresh session
sessionSchema.methods.refresh = function(newToken, newRefreshToken) {
  this.token = newToken;
  this.refreshToken = newRefreshToken;
  this.lastActivity = new Date();
  this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  this.refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  this.status = 'active';
  
  return this.save();
};

// Method to update activity
sessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Method to revoke session
sessionSchema.methods.revoke = function(reason = 'user_logout') {
  this.status = 'revoked';
  this.logoutAt = new Date();
  this.logoutReason = reason;
  this.isActive = false;
  
  return this.save();
};

// Method to extend session
sessionSchema.methods.extend = function(hours = 24) {
  const extension = hours * 60 * 60 * 1000; // convert hours to milliseconds
  this.expiresAt = new Date(this.expiresAt.getTime() + extension);
  this.lastActivity = new Date();
  
  return this.save();
};

// Static method to cleanup expired sessions
sessionSchema.statics.cleanupExpired = async function() {
  const result = await this.updateMany(
    {
      $or: [
        { expiresAt: { $lt: new Date() } },
        { refreshExpiresAt: { $lt: new Date() } }
      ],
      status: 'active'
    },
    {
      status: 'expired',
      logoutAt: new Date(),
      logoutReason: 'expired',
      isActive: false
    }
  );
  
  return result;
};

// Static method to get active sessions for user
sessionSchema.statics.getActiveSessions = function(userId) {
  return this.find({
    user: userId,
    status: 'active',
    expiresAt: { $gt: new Date() }
  }).sort({ lastActivity: -1 });
};

// Static method to revoke all user sessions
sessionSchema.statics.revokeAllUserSessions = function(userId, reason = 'security_revoke') {
  return this.updateMany(
    {
      user: userId,
      status: 'active'
    },
    {
      status: 'revoked',
      logoutAt: new Date(),
      logoutReason: reason,
      isActive: false
    }
  );
};

// Pre-save middleware to handle status changes
sessionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'active') {
    this.isActive = false;
    if (!this.logoutAt) {
      this.logoutAt = new Date();
    }
  }
  next();
});

// Indexes for performance
sessionSchema.index({ user: 1, status: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ refreshToken: 1 });
sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ lastActivity: -1 });
sessionSchema.index({ createdAt: -1 });

// TTL index to automatically remove expired sessions after 30 days
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Session', sessionSchema);

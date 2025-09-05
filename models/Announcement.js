const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'maintenance', 'feature', 'promotion'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Announcement author is required']
  },
  audience: {
    targetUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    targetRoles: [{
      type: String,
      enum: ['user', 'admin', 'moderator']
    }],
    targetPlans: [{
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise']
    }],
    isGlobal: {
      type: Boolean,
      default: false
    }
  },
  visibility: {
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: Date,
    scheduledFor: Date,
    expiresAt: Date
  },
  display: {
    showOnDashboard: {
      type: Boolean,
      default: true
    },
    showAsPopup: {
      type: Boolean,
      default: false
    },
    showInNotifications: {
      type: Boolean,
      default: true
    },
    allowDismiss: {
      type: Boolean,
      default: true
    },
    sticky: {
      type: Boolean,
      default: false
    }
  },
  media: {
    image: String,
    video: String,
    attachments: [{
      filename: String,
      url: String,
      size: Number,
      mimetype: String
    }]
  },
  actions: [{
    label: {
      type: String,
      required: true,
      maxlength: [50, 'Action label cannot exceed 50 characters']
    },
    url: String,
    action: {
      type: String,
      enum: ['link', 'dismiss', 'upgrade', 'contact', 'custom']
    },
    style: {
      type: String,
      enum: ['primary', 'secondary', 'success', 'warning', 'danger'],
      default: 'primary'
    }
  }],
  stats: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    dismissals: {
      type: Number,
      default: 0
    }
  },
  interactions: {
    views: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      },
      userAgent: String,
      ip: String
    }],
    clicks: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      action: String,
      clickedAt: {
        type: Date,
        default: Date.now
      }
    }],
    dismissals: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      dismissedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for is published
announcementSchema.virtual('isPublished').get(function() {
  return this.visibility.isPublished && 
         (!this.visibility.scheduledFor || this.visibility.scheduledFor <= new Date());
});

// Virtual for is expired
announcementSchema.virtual('isExpired').get(function() {
  return this.visibility.expiresAt && this.visibility.expiresAt <= new Date();
});

// Virtual for is active and visible
announcementSchema.virtual('isVisible').get(function() {
  return this.isActive && this.isPublished && !this.isExpired;
});

// Virtual for view count
announcementSchema.virtual('viewCount').get(function() {
  return this.interactions.views.length;
});

// Virtual for click count
announcementSchema.virtual('clickCount').get(function() {
  return this.interactions.clicks.length;
});

// Virtual for dismissal count
announcementSchema.virtual('dismissalCount').get(function() {
  return this.interactions.dismissals.length;
});

// Virtual for engagement rate
announcementSchema.virtual('engagementRate').get(function() {
  const views = this.viewCount;
  if (views === 0) return 0;
  
  const engagements = this.clickCount + this.dismissalCount;
  return Math.round((engagements / views) * 100);
});

// Method to publish announcement
announcementSchema.methods.publish = function(scheduleFor = null) {
  this.visibility.isPublished = true;
  this.visibility.publishedAt = scheduleFor || new Date();
  
  if (scheduleFor && scheduleFor > new Date()) {
    this.visibility.scheduledFor = scheduleFor;
  }
  
  return this.save();
};

// Method to unpublish announcement
announcementSchema.methods.unpublish = function() {
  this.visibility.isPublished = false;
  return this.save();
};

// Method to add view
announcementSchema.methods.addView = function(userId, userAgent = null, ip = null) {
  // Check if user already viewed this announcement
  const existingView = this.interactions.views.find(
    view => view.user && view.user.toString() === userId.toString()
  );
  
  if (!existingView) {
    this.interactions.views.push({
      user: userId,
      userAgent: userAgent,
      ip: ip
    });
    this.stats.views += 1;
  }
  
  return this.save();
};

// Method to add click
announcementSchema.methods.addClick = function(userId, action) {
  this.interactions.clicks.push({
    user: userId,
    action: action
  });
  this.stats.clicks += 1;
  
  return this.save();
};

// Method to add dismissal
announcementSchema.methods.addDismissal = function(userId) {
  // Check if user already dismissed this announcement
  const existingDismissal = this.interactions.dismissals.find(
    dismissal => dismissal.user && dismissal.user.toString() === userId.toString()
  );
  
  if (!existingDismissal) {
    this.interactions.dismissals.push({
      user: userId
    });
    this.stats.dismissals += 1;
  }
  
  return this.save();
};

// Method to check if user has dismissed
announcementSchema.methods.isDismissedByUser = function(userId) {
  return this.interactions.dismissals.some(
    dismissal => dismissal.user && dismissal.user.toString() === userId.toString()
  );
};

// Method to check if user can see announcement
announcementSchema.methods.canUserView = function(user) {
  if (!this.isVisible) return false;
  
  // Check if user dismissed and dismissal is allowed
  if (this.display.allowDismiss && this.isDismissedByUser(user._id)) {
    return false;
  }
  
  // Check audience targeting
  const { audience } = this;
  
  if (audience.isGlobal) return true;
  
  // Check specific users
  if (audience.targetUsers.length > 0) {
    return audience.targetUsers.some(
      targetUser => targetUser.toString() === user._id.toString()
    );
  }
  
  // Check roles
  if (audience.targetRoles.length > 0) {
    if (!audience.targetRoles.includes(user.role)) return false;
  }
  
  // Check plans
  if (audience.targetPlans.length > 0) {
    if (!audience.targetPlans.includes(user.subscription.plan)) return false;
  }
  
  return true;
};

// Static method to get active announcements for user
announcementSchema.statics.getActiveForUser = function(user) {
  return this.find({
    isActive: true,
    'visibility.isPublished': true,
    $or: [
      { 'visibility.scheduledFor': { $exists: false } },
      { 'visibility.scheduledFor': { $lte: new Date() } }
    ],
    $or: [
      { 'visibility.expiresAt': { $exists: false } },
      { 'visibility.expiresAt': { $gt: new Date() } }
    ]
  }).populate('author', 'username firstName lastName')
    .sort({ priority: -1, createdAt: -1 })
    .then(announcements => {
      return announcements.filter(announcement => 
        announcement.canUserView(user)
      );
    });
};

// Indexes for performance
announcementSchema.index({ 'visibility.isPublished': 1, 'visibility.scheduledFor': 1 });
announcementSchema.index({ 'visibility.expiresAt': 1 });
announcementSchema.index({ author: 1, createdAt: -1 });
announcementSchema.index({ type: 1, priority: 1 });
announcementSchema.index({ 'audience.targetRoles': 1 });
announcementSchema.index({ 'audience.targetPlans': 1 });
announcementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    default: '',
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'monthly', '6month', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired', 'cancelled'],
      default: 'inactive'
    },
    startDate: {
      type: Date,
      default: null
    },
    currentPeriodEnd: {
      type: Date,
      default: null
    },
    paymentMethod: {
      type: String,
      enum: ['interac', 'paypal', 'stripe'],
      default: null
    }
  },
  stats: {
    mediaUploaded: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    joinDate: {
      type: Date,
      default: Date.now
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdFromSubmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContactSubmission',
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'subscription.status': 1 });

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: null
  },
  selectedPlan: {
    type: String,
    enum: ['monthly', '6month'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['interac', 'paypal'],
    required: true
  },
  paymentConfirmation: {
    type: String,
    required: true
  },
  confirmationFile: {
    filename: String,
    originalName: String,
    size: Number,
    mimetype: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'account_created'],
    default: 'pending'
  },
  processedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
contactSubmissionSchema.index({ email: 1 });
contactSubmissionSchema.index({ status: 1 });
contactSubmissionSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);

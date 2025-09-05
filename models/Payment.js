const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for payment']
  },
  stripePaymentIntentId: {
    type: String,
    required: [true, 'Stripe Payment Intent ID is required'],
    unique: true
  },
  stripeCustomerId: {
    type: String,
    required: [true, 'Stripe Customer ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'usd',
    uppercase: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'processing', 
      'succeeded', 
      'failed', 
      'cancelled',
      'refunded',
      'partially_refunded'
    ],
    required: true,
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'digital_wallet', 'crypto'],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Payment description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  metadata: {
    plan: String,
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'one_time']
    },
    features: [String],
    discountCode: String,
    discountAmount: Number
  },
  invoice: {
    number: String,
    url: String,
    downloadUrl: String
  },
  refund: {
    amount: Number,
    reason: String,
    stripeRefundId: String,
    refundedAt: Date,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  subscription: {
    stripeSubscriptionId: String,
    plan: String,
    isRecurring: {
      type: Boolean,
      default: false
    },
    nextBillingDate: Date,
    trialEnd: Date
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  failureReason: String,
  receiptEmail: String,
  receiptUrl: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return (this.amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: this.currency.toLowerCase()
  });
});

// Virtual for payment status display
paymentSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending',
    'processing': 'Processing',
    'succeeded': 'Completed',
    'failed': 'Failed',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded',
    'partially_refunded': 'Partially Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for is successful
paymentSchema.virtual('isSuccessful').get(function() {
  return this.status === 'succeeded';
});

// Virtual for is refundable
paymentSchema.virtual('isRefundable').get(function() {
  return this.status === 'succeeded' && !this.refund.amount;
});

// Method to process refund
paymentSchema.methods.processRefund = function(amount, reason, refundedBy) {
  this.refund = {
    amount: amount || this.amount,
    reason: reason || 'Customer request',
    refundedAt: new Date(),
    refundedBy: refundedBy
  };
  
  if (amount >= this.amount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }
  
  return this.save();
};

// Method to update payment status
paymentSchema.methods.updateStatus = function(newStatus, failureReason = null) {
  this.status = newStatus;
  if (failureReason) {
    this.failureReason = failureReason;
  }
  return this.save();
};

// Static method to get payment stats
paymentSchema.statics.getPaymentStats = async function(userId = null, dateRange = null) {
  const matchQuery = {};
  
  if (userId) {
    matchQuery.user = mongoose.Types.ObjectId(userId);
  }
  
  if (dateRange) {
    matchQuery.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalPayments: { $sum: 1 },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        refundedAmount: { $sum: '$refund.amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalAmount: 0,
    totalPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    refundedAmount: 0,
    avgAmount: 0
  };
};

// Indexes for performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ stripeCustomerId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ 'subscription.stripeSubscriptionId': 1 });

module.exports = mongoose.model('Payment', paymentSchema);

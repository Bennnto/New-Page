const mongoose = require('mongoose');

const websiteContentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true,
    enum: ['landing', 'features', 'pricing', 'about', 'home']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

// Index for efficient queries
websiteContentSchema.index({ section: 1 });
websiteContentSchema.index({ id: 1 });

module.exports = mongoose.model('WebsiteContent', websiteContentSchema);

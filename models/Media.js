const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Media title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  mimetype: {
    type: String,
    required: [true, 'File type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  url: {
    type: String,
    required: [true, 'File URL is required']
  },
  thumbnailUrl: String,
  category: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'other'],
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Media owner is required']
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'ready'
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number, // for videos/audio
    bitrate: Number,
    format: String,
    compression: Number
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  interactions: {
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: Date,
  expiresAt: Date // for temporary files
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for file extension
mediaSchema.virtual('extension').get(function() {
  return this.originalName.split('.').pop().toLowerCase();
});

// Virtual for human readable file size
mediaSchema.virtual('humanSize').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for like count
mediaSchema.virtual('likeCount').get(function() {
  return this.interactions.likes.length;
});

// Virtual for comment count
mediaSchema.virtual('commentCount').get(function() {
  return this.interactions.comments.length;
});

// Method to increment view count
mediaSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

// Method to add like
mediaSchema.methods.addLike = function(userId) {
  const existingLike = this.interactions.likes.find(
    like => like.user.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.interactions.likes.push({ user: userId });
    this.stats.likes += 1;
  }
  
  return this.save();
};

// Method to remove like
mediaSchema.methods.removeLike = function(userId) {
  const likeIndex = this.interactions.likes.findIndex(
    like => like.user.toString() === userId.toString()
  );
  
  if (likeIndex > -1) {
    this.interactions.likes.splice(likeIndex, 1);
    this.stats.likes = Math.max(0, this.stats.likes - 1);
  }
  
  return this.save();
};

// Method to add comment
mediaSchema.methods.addComment = function(userId, text) {
  this.interactions.comments.push({
    user: userId,
    text: text
  });
  
  return this.save();
};

// Pre-save middleware to categorize file
mediaSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('mimetype')) {
    const mimeType = this.mimetype.toLowerCase();
    
    if (mimeType.startsWith('image/')) {
      this.category = 'image';
    } else if (mimeType.startsWith('video/')) {
      this.category = 'video';
    } else if (mimeType.startsWith('audio/')) {
      this.category = 'audio';
    } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
      this.category = 'document';
    } else {
      this.category = 'other';
    }
  }
  next();
});

// Indexes for performance
mediaSchema.index({ owner: 1, createdAt: -1 });
mediaSchema.index({ category: 1, visibility: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ 'stats.views': -1 });
mediaSchema.index({ uploadedAt: -1 });
mediaSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Media', mediaSchema);

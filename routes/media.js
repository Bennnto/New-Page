const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const Media = require('../models/Media');
const User = require('../models/User');
const { 
  authenticate, 
  optionalAuth, 
  checkOwnership,
  checkSubscriptionLimits 
} = require('../middleware/auth');
const { 
  createUploadMiddleware, 
  validateUpload, 
  cleanupOnError,
  deleteFile 
} = require('../middleware/upload');

const router = express.Router();

// Validation rules
const mediaValidation = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Title must be 1-100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Description cannot exceed 500 characters'),
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'unlisted'])
    .withMessage('Visibility must be public, private, or unlisted'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .trim()
    .withMessage('Each tag cannot exceed 30 characters')
];

// @route   POST /api/media/upload
// @desc    Upload media file
// @access  Private
router.post('/upload', 
  authenticate,
  checkSubscriptionLimits('mediaUploads'),
  createUploadMiddleware('media', 1),
  validateUpload,
  cleanupOnError,
  mediaValidation,
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
      
      const { title, description, visibility = 'public', tags = [] } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      // Create media record
      const media = new Media({
        title,
        description,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: file.url,
        visibility,
        tags: Array.isArray(tags) ? tags : [],
        owner: req.user._id,
        metadata: {
          // You can add more metadata extraction here
          // For now, basic info from multer
        }
      });
      
      await media.save();
      
      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.mediaUploaded': 1 }
      });
      
      res.status(201).json({
        success: true,
        message: 'Media uploaded successfully',
        data: {
          media: media.toJSON()
        }
      });
      
    } catch (error) {
      console.error('Media upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload media',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   POST /api/media/upload-multiple
// @desc    Upload multiple media files
// @access  Private
router.post('/upload-multiple',
  authenticate,
  checkSubscriptionLimits('mediaUploads'),
  createUploadMiddleware('media', 10), // Allow up to 10 files
  validateUpload,
  cleanupOnError,
  async (req, res) => {
    try {
      const files = req.files;
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }
      
      const uploadedMedia = [];
      const { visibility = 'public' } = req.body;
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const title = req.body[`title_${i}`] || file.originalname;
        const description = req.body[`description_${i}`] || '';
        const tags = req.body[`tags_${i}`] ? JSON.parse(req.body[`tags_${i}`]) : [];
        
        const media = new Media({
          title,
          description,
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          url: file.url,
          visibility,
          tags,
          owner: req.user._id
        });
        
        await media.save();
        uploadedMedia.push(media.toJSON());
      }
      
      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.mediaUploaded': files.length }
      });
      
      res.status(201).json({
        success: true,
        message: `${files.length} files uploaded successfully`,
        data: {
          media: uploadedMedia,
          count: uploadedMedia.length
        }
      });
      
    } catch (error) {
      console.error('Multiple media upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload media files'
      });
    }
  }
);

// @route   GET /api/media
// @desc    Get media list with filtering and pagination
// @access  Public (with optional auth for private content)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      visibility,
      owner,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      tags
    } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    // Visibility filter
    if (req.user) {
      // Authenticated users can see their own private content
      if (visibility) {
        query.visibility = visibility;
      } else {
        query.$or = [
          { visibility: 'public' },
          { visibility: 'unlisted' },
          { owner: req.user._id } // Can see own private content
        ];
      }
    } else {
      // Public users can only see public content
      query.visibility = 'public';
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Owner filter
    if (owner) {
      query.owner = owner;
    }
    
    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query
    const media = await Media.find(query)
      .populate('owner', 'username firstName lastName avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Media.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get media list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get media list'
    });
  }
});

// @route   GET /api/media/:id
// @desc    Get single media item
// @access  Public (with optional auth for private content)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const media = await Media.findById(id)
      .populate('owner', 'username firstName lastName avatar')
      .populate('interactions.comments.user', 'username firstName lastName avatar');
    
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }
    
    // Check visibility permissions
    if (media.visibility === 'private') {
      if (!req.user || media.owner._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to private media'
        });
      }
    }
    
    // Increment view count (if not owner)
    if (!req.user || media.owner._id.toString() !== req.user._id.toString()) {
      await media.incrementViews();
    }
    
    res.json({
      success: true,
      data: {
        media: media.toJSON()
      }
    });
    
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get media'
    });
  }
});

// @route   PUT /api/media/:id
// @desc    Update media item
// @access  Private (owner only)
router.put('/:id', 
  authenticate, 
  checkOwnership(Media),
  mediaValidation,
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
      
      const { title, description, visibility, tags } = req.body;
      const media = req.resource;
      
      // Update fields
      if (title !== undefined) media.title = title;
      if (description !== undefined) media.description = description;
      if (visibility !== undefined) media.visibility = visibility;
      if (tags !== undefined) media.tags = tags;
      
      await media.save();
      
      res.json({
        success: true,
        message: 'Media updated successfully',
        data: {
          media: media.toJSON()
        }
      });
      
    } catch (error) {
      console.error('Update media error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update media'
      });
    }
  }
);

// @route   DELETE /api/media/:id
// @desc    Delete media item
// @access  Private (owner only)
router.delete('/:id', 
  authenticate, 
  checkOwnership(Media),
  async (req, res) => {
    try {
      const media = req.resource;
      
      // Delete physical file
      try {
        await deleteFile(media.path);
      } catch (fileError) {
        console.error('Failed to delete physical file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
      
      // Delete from database
      await Media.findByIdAndDelete(media._id);
      
      // Update user stats
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.mediaUploaded': -1 }
      });
      
      res.json({
        success: true,
        message: 'Media deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete media error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete media'
      });
    }
  }
);

// @route   POST /api/media/:id/like
// @desc    Like/unlike media item
// @access  Private
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const media = await Media.findById(id);
    
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }
    
    // Check if user already liked this media
    const existingLike = media.interactions.likes.find(
      like => like.user.toString() === userId.toString()
    );
    
    if (existingLike) {
      // Unlike
      await media.removeLike(userId);
      res.json({
        success: true,
        message: 'Media unliked',
        data: {
          liked: false,
          likeCount: media.likeCount
        }
      });
    } else {
      // Like
      await media.addLike(userId);
      res.json({
        success: true,
        message: 'Media liked',
        data: {
          liked: true,
          likeCount: media.likeCount
        }
      });
    }
    
  } catch (error) {
    console.error('Like media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike media'
    });
  }
});

// @route   POST /api/media/:id/comment
// @desc    Add comment to media item
// @access  Private
router.post('/:id/comment', 
  authenticate,
  [body('text').isLength({ min: 1, max: 500 }).trim().withMessage('Comment must be 1-500 characters')],
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
      
      const { id } = req.params;
      const { text } = req.body;
      const userId = req.user._id;
      
      const media = await Media.findById(id);
      
      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media not found'
        });
      }
      
      await media.addComment(userId, text);
      
      // Populate the new comment
      const updatedMedia = await Media.findById(id)
        .populate('interactions.comments.user', 'username firstName lastName avatar');
      
      const newComment = updatedMedia.interactions.comments[updatedMedia.interactions.comments.length - 1];
      
      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: {
          comment: newComment,
          commentCount: media.commentCount
        }
      });
      
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add comment'
      });
    }
  }
);

// @route   GET /api/media/user/:userId
// @desc    Get media by specific user
// @access  Public
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, category } = req.query;
    
    // Build query
    const query = { 
      owner: userId, 
      isActive: true
    };
    
    // Visibility check
    if (!req.user || req.user._id.toString() !== userId) {
      // If not the owner, only show public content
      query.visibility = 'public';
    } else {
      // Owner can see all their content
      query.$or = [
        { visibility: 'public' },
        { visibility: 'private' },
        { visibility: 'unlisted' }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    const media = await Media.find(query)
      .populate('owner', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Media.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        media,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get user media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user media'
    });
  }
});

// @route   GET /api/media/stats/overview
// @desc    Get media statistics overview
// @access  Private
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Media.aggregate([
      { $match: { owner: userId, isActive: true } },
      {
        $group: {
          _id: null,
          totalMedia: { $sum: 1 },
          totalViews: { $sum: '$stats.views' },
          totalLikes: { $sum: '$stats.likes' },
          totalSize: { $sum: '$size' },
          categories: {
            $push: '$category'
          }
        }
      }
    ]);
    
    const categoryStats = await Media.aggregate([
      { $match: { owner: userId, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalMedia: 0,
      totalViews: 0,
      totalLikes: 0,
      totalSize: 0
    };
    
    res.json({
      success: true,
      data: {
        overview: result,
        categories: categoryStats
      }
    });
    
  } catch (error) {
    console.error('Get media stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get media statistics'
    });
  }
});

module.exports = router;

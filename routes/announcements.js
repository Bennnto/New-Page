const express = require('express');
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const announcementValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Title must be 1-200 characters'),
  body('content')
    .isLength({ min: 1, max: 2000 })
    .trim()
    .withMessage('Content must be 1-2000 characters'),
  body('type')
    .optional()
    .isIn(['info', 'warning', 'success', 'error', 'maintenance', 'feature', 'promotion'])
    .withMessage('Invalid announcement type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level')
];

// @route   POST /api/announcements
// @desc    Create new announcement
// @access  Private (Admin/Moderator only)
router.post('/', 
  authenticate, 
  authorize('admin', 'moderator'),
  announcementValidation,
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
      
      const {
        title,
        content,
        type = 'info',
        priority = 'medium',
        audience = {},
        display = {},
        actions = [],
        scheduledFor,
        expiresAt
      } = req.body;
      
      const announcement = new Announcement({
        title,
        content,
        type,
        priority,
        author: req.user._id,
        audience: {
          targetUsers: audience.targetUsers || [],
          targetRoles: audience.targetRoles || [],
          targetPlans: audience.targetPlans || [],
          isGlobal: audience.isGlobal || false
        },
        display: {
          showOnDashboard: display.showOnDashboard !== false,
          showAsPopup: display.showAsPopup || false,
          showInNotifications: display.showInNotifications !== false,
          allowDismiss: display.allowDismiss !== false,
          sticky: display.sticky || false
        },
        actions,
        visibility: {
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null
        }
      });
      
      await announcement.save();
      
      const populatedAnnouncement = await Announcement.findById(announcement._id)
        .populate('author', 'username firstName lastName');
      
      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: {
          announcement: populatedAnnouncement
        }
      });
      
    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create announcement'
      });
    }
  }
);

// @route   GET /api/announcements
// @desc    Get announcements (filtered by user permissions)
// @access  Public (with optional auth for personalized content)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      priority,
      includeExpired = false,
      includeDismissed = false
    } = req.query;
    
    let announcements;
    
    if (req.user) {
      // Get personalized announcements for authenticated users
      announcements = await Announcement.getActiveForUser(req.user);
      
      // Filter by type and priority if specified
      if (type) {
        announcements = announcements.filter(a => a.type === type);
      }
      
      if (priority) {
        announcements = announcements.filter(a => a.priority === priority);
      }
      
      // Filter out dismissed announcements unless specifically requested
      if (!includeDismissed) {
        announcements = announcements.filter(a => !a.isDismissedByUser(req.user._id));
      }
      
    } else {
      // Get global public announcements for unauthenticated users
      const query = {
        isActive: true,
        'visibility.isPublished': true,
        'audience.isGlobal': true,
        $or: [
          { 'visibility.scheduledFor': { $exists: false } },
          { 'visibility.scheduledFor': { $lte: new Date() } }
        ]
      };
      
      if (!includeExpired) {
        query.$and = [
          {
            $or: [
              { 'visibility.expiresAt': { $exists: false } },
              { 'visibility.expiresAt': { $gt: new Date() } }
            ]
          }
        ];
      }
      
      if (type) query.type = type;
      if (priority) query.priority = priority;
      
      announcements = await Announcement.find(query)
        .populate('author', 'username firstName lastName')
        .sort({ priority: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    }
    
    // Apply pagination for authenticated users (array)
    if (req.user && Array.isArray(announcements)) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedAnnouncements = announcements.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: {
          announcements: paginatedAnnouncements,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(announcements.length / limit),
            totalItems: announcements.length,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } else {
      // For unauthenticated users (Mongoose query result)
      const total = await Announcement.countDocuments({
        isActive: true,
        'visibility.isPublished': true,
        'audience.isGlobal': true
      });
      
      res.json({
        success: true,
        data: {
          announcements,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    }
    
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get announcements'
    });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get single announcement
// @access  Public (with visibility checks)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findById(id)
      .populate('author', 'username firstName lastName');
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    // Check if user can view this announcement
    if (req.user) {
      if (!announcement.canUserView(req.user)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this announcement'
        });
      }
      
      // Add view if user hasn't viewed yet
      await announcement.addView(req.user._id, req.get('User-Agent'), req.ip);
    } else {
      // For unauthenticated users, only allow global announcements
      if (!announcement.audience.isGlobal || !announcement.isVisible) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this announcement'
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        announcement
      }
    });
    
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get announcement'
    });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private (Admin/Moderator only)
router.put('/:id', 
  authenticate, 
  authorize('admin', 'moderator'),
  announcementValidation,
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
      const updateData = req.body;
      
      const announcement = await Announcement.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('author', 'username firstName lastName');
      
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Announcement updated successfully',
        data: {
          announcement
        }
      });
      
    } catch (error) {
      console.error('Update announcement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update announcement'
      });
    }
  }
);

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Admin only)
router.delete('/:id', 
  authenticate, 
  authorize('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const announcement = await Announcement.findByIdAndDelete(id);
      
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Announcement deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete announcement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete announcement'
      });
    }
  }
);

// @route   POST /api/announcements/:id/publish
// @desc    Publish announcement
// @access  Private (Admin/Moderator only)
router.post('/:id/publish', 
  authenticate, 
  authorize('admin', 'moderator'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { scheduledFor } = req.body;
      
      const announcement = await Announcement.findById(id);
      
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }
      
      await announcement.publish(scheduledFor ? new Date(scheduledFor) : null);
      
      res.json({
        success: true,
        message: scheduledFor ? 'Announcement scheduled for publication' : 'Announcement published successfully',
        data: {
          announcement
        }
      });
      
    } catch (error) {
      console.error('Publish announcement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to publish announcement'
      });
    }
  }
);

// @route   POST /api/announcements/:id/unpublish
// @desc    Unpublish announcement
// @access  Private (Admin/Moderator only)
router.post('/:id/unpublish', 
  authenticate, 
  authorize('admin', 'moderator'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const announcement = await Announcement.findById(id);
      
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }
      
      await announcement.unpublish();
      
      res.json({
        success: true,
        message: 'Announcement unpublished successfully',
        data: {
          announcement
        }
      });
      
    } catch (error) {
      console.error('Unpublish announcement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unpublish announcement'
      });
    }
  }
);

// @route   POST /api/announcements/:id/dismiss
// @desc    Dismiss announcement for current user
// @access  Private
router.post('/:id/dismiss', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    if (!announcement.display.allowDismiss) {
      return res.status(400).json({
        success: false,
        message: 'This announcement cannot be dismissed'
      });
    }
    
    await announcement.addDismissal(req.user._id);
    
    res.json({
      success: true,
      message: 'Announcement dismissed successfully'
    });
    
  } catch (error) {
    console.error('Dismiss announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss announcement'
    });
  }
});

// @route   POST /api/announcements/:id/click
// @desc    Track click on announcement action
// @access  Private
router.post('/:id/click', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }
    
    await announcement.addClick(req.user._id, action);
    
    res.json({
      success: true,
      message: 'Click tracked successfully'
    });
    
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click'
    });
  }
});

// @route   GET /api/announcements/:id/stats
// @desc    Get announcement statistics
// @access  Private (Admin/Moderator only)
router.get('/:id/stats', 
  authenticate, 
  authorize('admin', 'moderator'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const announcement = await Announcement.findById(id);
      
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }
      
      const stats = {
        views: announcement.viewCount,
        clicks: announcement.clickCount,
        dismissals: announcement.dismissalCount,
        engagementRate: announcement.engagementRate,
        createdAt: announcement.createdAt,
        publishedAt: announcement.visibility.publishedAt,
        isPublished: announcement.isPublished,
        isExpired: announcement.isExpired
      };
      
      res.json({
        success: true,
        data: {
          stats
        }
      });
      
    } catch (error) {
      console.error('Get announcement stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get announcement statistics'
      });
    }
  }
);

module.exports = router;

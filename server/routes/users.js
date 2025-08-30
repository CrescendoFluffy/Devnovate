const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Blog = require('../models/Blog');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// @desc    Get user's blogs with pagination and filters
// @route   GET /api/users/blogs
// @access  Private
router.get('/blogs', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['draft', 'pending', 'published', 'rejected', 'hidden']).withMessage('Invalid status'),
  query('category').optional().isString().withMessage('Category must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = { author: req.user._id };
  
  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  const blogs = await Blog.find(filter)
    .populate('author', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: blogs,
    pagination: {
      currentPage: page,
      totalPages,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}));

// @desc    Get user's blog by ID
// @route   GET /api/users/blogs/:id
// @access  Private (Owner only)
router.get('/blogs/:id', asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({
    _id: req.params.id,
    author: req.user._id
  }).populate('author', 'username firstName lastName avatar');

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  res.json({
    success: true,
    data: blog
  });
}));

// @desc    Get user's profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('blogsCount');

  res.json({
    success: true,
    data: user
  });
}));

// @desc    Update user's profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be either light or dark')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { firstName, lastName, bio, avatar, preferences } = req.body;

  const user = await User.findById(req.user._id);

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (bio !== undefined) user.bio = bio;
  if (avatar) user.avatar = avatar;
  if (preferences) {
    if (preferences.emailNotifications !== undefined) {
      user.preferences.emailNotifications = preferences.emailNotifications;
    }
    if (preferences.theme) {
      user.preferences.theme = preferences.theme;
    }
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      preferences: updatedUser.preferences
    }
  });
}));

// @desc    Get user's blog statistics
// @route   GET /api/users/blog-stats
// @access  Private
router.get('/blog-stats', asyncHandler(async (req, res) => {
  const [
    totalBlogs,
    publishedBlogs,
    pendingBlogs,
    draftBlogs,
    rejectedBlogs,
    totalViews,
    totalLikes,
    totalComments
  ] = await Promise.all([
    Blog.countDocuments({ author: req.user._id }),
    Blog.countDocuments({ author: req.user._id, status: 'published' }),
    Blog.countDocuments({ author: req.user._id, status: 'pending' }),
    Blog.countDocuments({ author: req.user._id, status: 'draft' }),
    Blog.countDocuments({ author: req.user._id, status: 'rejected' }),
    Blog.aggregate([
      { $match: { author: req.user._id, status: 'published' } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]),
    Blog.aggregate([
      { $match: { author: req.user._id, status: 'published' } },
      { $group: { _id: null, total: { $sum: { $size: '$likes' } } } }
    ]),
    Blog.aggregate([
      { $match: { author: req.user._id, status: 'published' } },
      { $group: { _id: null, total: { $sum: { $size: '$comments' } } } }
    ])
  ]);

  // Get category distribution
  const categoryStats = await Blog.aggregate([
    {
      $match: { author: req.user._id, status: 'published' }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get recent blog activity
  const recentBlogs = await Blog.find({ author: req.user._id })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('title status updatedAt');

  res.json({
    success: true,
    data: {
      stats: {
        totalBlogs,
        publishedBlogs,
        pendingBlogs,
        draftBlogs,
        rejectedBlogs,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        totalComments: totalComments[0]?.total || 0
      },
      categoryStats,
      recentBlogs
    }
  });
}));

// @desc    Get user's liked blogs
// @route   GET /api/users/liked-blogs
// @access  Private
router.get('/liked-blogs', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const likedBlogs = await Blog.find({
    likes: req.user._id,
    status: 'published'
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-content');

  const total = await Blog.countDocuments({
    likes: req.user._id,
    status: 'published'
  });
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: likedBlogs,
    pagination: {
      currentPage: page,
      totalPages,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}));

// @desc    Get user's commented blogs
// @route   GET /api/users/commented-blogs
// @access  Private
router.get('/commented-blogs', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const commentedBlogs = await Blog.find({
    'comments.user': req.user._id,
    status: 'published'
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-content');

  const total = await Blog.countDocuments({
    'comments.user': req.user._id,
    status: 'published'
  });
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: commentedBlogs,
    pagination: {
      currentPage: page,
      totalPages,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}));

// @desc    Get user's reading history
// @route   GET /api/users/reading-history
// @access  Private
router.get('/reading-history', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // This would require a separate ReadingHistory model
  // For now, we'll return an empty response
  res.json({
    success: true,
    data: [],
    pagination: {
      currentPage: page,
      totalPages: 0,
      total: 0,
      hasNext: false,
      hasPrev: false
    },
    message: 'Reading history feature coming soon'
  });
}));

// @desc    Delete user's account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', [
  body('password')
    .notEmpty()
    .withMessage('Password is required for account deletion')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { password } = req.body;

  const user = await User.findById(req.user._id);

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Password is incorrect'
    });
  }

  // Delete user's blogs
  await Blog.deleteMany({ author: req.user._id });

  // Delete user account
  await user.remove();

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
}));

module.exports = router;


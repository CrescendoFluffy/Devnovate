const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Blog = require('../models/Blog');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendBlogStatusEmail } = require('../utils/emailService');

const router = express.Router();

// Apply admin middleware to all routes
router.use(protect, admin);

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBlogs,
    pendingBlogs,
    publishedBlogs,
    totalViews,
    totalLikes,
    totalComments
  ] = await Promise.all([
    User.countDocuments(),
    Blog.countDocuments(),
    Blog.countDocuments({ status: 'pending' }),
    Blog.countDocuments({ status: 'published' }),
    Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]),
    Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, total: { $sum: { $size: '$likes' } } } }
    ]),
    Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, total: { $sum: { $size: '$comments' } } } }
    ])
  ]);

  // Get recent activity
  const recentBlogs = await Blog.find()
    .populate('author', 'username firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentUsers = await User.find()
    .select('username firstName lastName createdAt lastLogin')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalBlogs,
        pendingBlogs,
        publishedBlogs,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        totalComments: totalComments[0]?.total || 0
      },
      recentActivity: {
        blogs: recentBlogs,
        users: recentUsers
      }
    }
  });
}));

// @desc    Get pending blogs for approval
// @route   GET /api/admin/blogs/pending
// @access  Private (Admin only)
router.get('/blogs/pending', [
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

  const pendingBlogs = await Blog.find({ status: 'pending' })
    .populate('author', 'username firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Blog.countDocuments({ status: 'pending' });
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: pendingBlogs,
    pagination: {
      currentPage: page,
      totalPages,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}));

// @desc    Approve blog
// @route   PUT /api/admin/blogs/:id/approve
// @access  Private (Admin only)
router.put('/blogs/:id/approve', [
  body('feedback').optional().isString().withMessage('Feedback must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  if (blog.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Blog is not pending approval'
    });
  }

  blog.status = 'published';
  blog.publishedAt = new Date();
  blog.approvedBy = req.user._id;
  blog.approvedAt = new Date();

  await blog.save();

  // Send approval email to author
  try {
    const author = await User.findById(blog.author);
    await sendBlogStatusEmail(author.email, author.firstName, blog.title, 'approved');
  } catch (error) {
    console.error('Approval email failed:', error);
  }

  res.json({
    success: true,
    data: blog,
    message: 'Blog approved successfully'
  });
}));

// @desc    Reject blog
// @route   PUT /api/admin/blogs/:id/reject
// @access  Private (Admin only)
router.put('/blogs/:id/reject', [
  body('rejectionReason')
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  if (blog.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Blog is not pending approval'
    });
  }

  blog.status = 'rejected';
  blog.rejectionReason = req.body.rejectionReason;

  await blog.save();

  // Send rejection email to author
  try {
    const author = await User.findById(blog.author);
    await sendBlogStatusEmail(author.email, author.firstName, blog.title, 'rejected', req.body.rejectionReason);
  } catch (error) {
    console.error('Rejection email failed:', error);
  }

  res.json({
    success: true,
    data: blog,
    message: 'Blog rejected successfully'
  });
}));

// @desc    Hide/Unhide published blog
// @route   PUT /api/admin/blogs/:id/toggle-visibility
// @access  Private (Admin only)
router.put('/blogs/:id/toggle-visibility', asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  if (blog.status !== 'published') {
    return res.status(400).json({
      success: false,
      message: 'Can only toggle visibility of published blogs'
    });
  }

  blog.status = blog.status === 'published' ? 'hidden' : 'published';
  
  if (blog.status === 'published') {
    blog.publishedAt = new Date();
  }

  await blog.save();

  res.json({
    success: true,
    data: blog,
    message: `Blog ${blog.status === 'published' ? 'published' : 'hidden'} successfully`
  });
}));

// @desc    Delete blog (admin override)
// @route   DELETE /api/admin/blogs/:id
// @access  Private (Admin only)
router.delete('/blogs/:id', asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  await blog.remove();

  res.json({
    success: true,
    message: 'Blog deleted successfully'
  });
}));

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin')
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
  const filter = {};
  
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { username: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex }
    ];
  }

  if (req.query.role) {
    filter.role = req.query.role;
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: users,
    pagination: {
      currentPage: page,
      totalPages,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}));

// @desc    Toggle user status (activate/deactivate)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin only)
router.put('/users/:id/toggle-status', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot deactivate your own account'
    });
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    data: user,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
  });
}));

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
router.put('/users/:id/role', [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from changing their own role
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot change your own role'
    });
  }

  user.role = req.body.role;
  await user.save();

  res.json({
    success: true,
    data: user,
    message: `User role changed to ${user.role} successfully`
  });
}));

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
router.get('/analytics', [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Period must be 7d, 30d, 90d, or 1y')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const period = req.query.period || '30d';
  const days = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  }[period];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get blog creation stats
  const blogStats = await Blog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get user registration stats
  const userStats = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get top performing blogs
  const topBlogs = await Blog.find({ status: 'published' })
    .populate('author', 'username firstName lastName')
    .sort({ views: -1, 'likes.length': -1 })
    .limit(10)
    .select('title views likes comments author');

  // Get category distribution
  const categoryStats = await Blog.aggregate([
    {
      $match: { status: 'published' }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: { $size: '$likes' } }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.json({
    success: true,
    data: {
      period,
      blogStats,
      userStats,
      topBlogs,
      categoryStats
    }
  });
}));

module.exports = router;


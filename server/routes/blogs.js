const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Blog = require('../models/Blog');
const { protect, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Get all published blogs with pagination and filters
// @route   GET /api/blogs
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('sort').optional().isIn(['latest', 'popular', 'trending']).withMessage('Sort must be latest, popular, or trending')
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
  const filter = { status: 'published' };
  
  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { title: searchRegex },
      { content: searchRegex },
      { tags: { $in: [searchRegex] } }
    ];
  }

  // Build sort object
  let sort = {};
  switch (req.query.sort) {
    case 'popular':
      sort = { views: -1, 'likes.length': -1 };
      break;
    case 'trending':
      sort = { 'analytics.uniqueVisitors': -1, 'likes.length': -1, 'comments.length': -1 };
      break;
    default:
      sort = { publishedAt: -1 };
  }

  const blogs = await Blog.find(filter)
    .populate('author', 'username firstName lastName avatar')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('-content');

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

// @desc    Get trending blogs
// @route   GET /api/blogs/trending
// @access  Public
router.get('/trending', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const trendingBlogs = await Blog.find({ status: 'published' })
    .populate('author', 'username firstName lastName avatar')
    .sort({ 'analytics.uniqueVisitors': -1, 'likes.length': -1, 'comments.length': -1 })
    .limit(limit)
    .select('-content');

  res.json({
    success: true,
    data: trendingBlogs
  });
}));

// @desc    Get blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
router.get('/:slug', optionalAuth, asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ 
    slug: req.params.slug, 
    status: 'published' 
  }).populate('author', 'username firstName lastName avatar bio');

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  // Increment views if user is authenticated
  if (req.user) {
    await blog.incrementViews();
  }

  res.json({
    success: true,
    data: blog
  });
}));

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
router.post('/', protect, [
  body('title')
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('content')
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters long'),
  body('excerpt')
    .isLength({ min: 10, max: 300 })
    .withMessage('Excerpt must be between 10 and 300 characters'),
  body('category')
    .isIn(['Technology', 'Business', 'Lifestyle', 'Health', 'Education', 'Entertainment', 'Sports', 'Politics', 'Science', 'Other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('tags.*')
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('Featured image must be a valid URL')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { title, content, excerpt, category, tags, featuredImage } = req.body;

  const blog = await Blog.create({
    title,
    content,
    excerpt,
    category,
    tags: tags || [],
    featuredImage,
    author: req.user._id,
    status: 'pending' // Default to pending for admin approval
  });

  const populatedBlog = await Blog.findById(blog._id)
    .populate('author', 'username firstName lastName avatar');

  res.status(201).json({
    success: true,
    data: populatedBlog
  });
}));

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Author or Admin)
router.put('/:id', protect, [
  body('title')
    .optional()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('content')
    .optional()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters long'),
  body('excerpt')
    .optional()
    .isLength({ min: 10, max: 300 })
    .withMessage('Excerpt must be between 10 and 300 characters'),
  body('category')
    .optional()
    .isIn(['Technology', 'Business', 'Lifestyle', 'Health', 'Education', 'Entertainment', 'Sports', 'Politics', 'Science', 'Other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('Featured image must be a valid URL')
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

  // Check if user is author or admin
  if (req.user.role !== 'admin' && blog.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this blog'
    });
  }

  // If blog is published and being updated, set status back to pending
  if (blog.status === 'published') {
    req.body.status = 'pending';
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('author', 'username firstName lastName avatar');

  res.json({
    success: true,
    data: updatedBlog
  });
}));

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Author or Admin)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Blog not found'
    });
  }

  // Check if user is author or admin
  if (req.user.role !== 'admin' && blog.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this blog'
    });
  }

  await blog.remove();

  res.json({
    success: true,
    message: 'Blog deleted successfully'
  });
}));

// @desc    Toggle like on blog
// @route   POST /api/blogs/:id/like
// @access  Private
router.post('/:id/like', protect, asyncHandler(async (req, res) => {
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
      message: 'Cannot like unpublished blog'
    });
  }

  await blog.toggleLike(req.user._id);

  res.json({
    success: true,
    data: {
      likesCount: blog.likes.length,
      isLiked: blog.likes.includes(req.user._id)
    }
  });
}));

// @desc    Add comment to blog
// @route   POST /api/blogs/:id/comments
// @access  Private
router.post('/:id/comments', protect, [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
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

  if (blog.status !== 'published') {
    return res.status(400).json({
      success: false,
      message: 'Cannot comment on unpublished blog'
    });
  }

  await blog.addComment(req.user._id, req.body.content);

  const updatedBlog = await Blog.findById(req.params.id)
    .populate('comments.user', 'username firstName lastName avatar')
    .populate('author', 'username firstName lastName avatar');

  res.json({
    success: true,
    data: updatedBlog
  });
}));

// @desc    Get blogs by category
// @route   GET /api/blogs/category/:category
// @access  Public
router.get('/category/:category', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const blogs = await Blog.find({ 
    category: req.params.category, 
    status: 'published' 
  })
    .populate('author', 'username firstName lastName avatar')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-content');

  const total = await Blog.countDocuments({ 
    category: req.params.category, 
    status: 'published' 
  });
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

module.exports = router;


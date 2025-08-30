const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Reply cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    minlength: [100, 'Blog content must be at least 100 characters long']
  },
  excerpt: {
    type: String,
    required: [true, 'Blog excerpt is required'],
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected', 'hidden'],
    default: 'draft'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Technology', 'Business', 'Lifestyle', 'Health', 'Education', 'Entertainment', 'Sports', 'Politics', 'Science', 'Other']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  featuredImage: {
    type: String,
    default: ''
  },
  readTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  shares: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [String]
  },
  analytics: {
    uniqueVisitors: {
      type: Number,
      default: 0
    },
    bounceRate: {
      type: Number,
      default: 0
    },
    avgTimeOnPage: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for likes count
blogSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for comments count
blogSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Virtual for engagement score (for trending calculation)
blogSchema.virtual('engagementScore').get(function() {
  const likesWeight = 2;
  const commentsWeight = 3;
  const viewsWeight = 0.1;
  const sharesWeight = 5;
  
  return (this.likes.length * likesWeight) + 
         (this.comments.length * commentsWeight) + 
         (this.views * viewsWeight) + 
         (this.shares * sharesWeight);
});

// Virtual for reading time calculation
blogSchema.virtual('estimatedReadTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Indexes for better query performance
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ 'analytics.uniqueVisitors': -1 });
blogSchema.index({ createdAt: -1 });

// Pre-save middleware to generate slug and calculate read time
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  if (this.isModified('content')) {
    this.readTime = this.estimatedReadTime;
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Static method to find published blogs
blogSchema.statics.findPublished = function() {
  return this.find({ status: 'published' });
};

// Static method to find trending blogs
blogSchema.statics.findTrending = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'analytics.uniqueVisitors': -1, likesCount: -1, commentsCount: -1 })
    .limit(limit);
};

// Static method to find blogs by category
blogSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({ category, status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Method to increment views
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle like
blogSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(likeIndex, 1);
  }
  return this.save();
};

// Method to add comment
blogSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  return this.save();
};

module.exports = mongoose.model('Blog', blogSchema);


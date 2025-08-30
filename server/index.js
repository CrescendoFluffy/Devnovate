const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // default 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // default 100 requests
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Devnovate Blog Platform is running!' });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/devnovate-blog';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return false;
  }
};

// Start server with database connection
const startServer = async () => {
  const dbConnected = await connectDB();
  
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Devnovate Blog Platform is ready!`);
      console.log(`🌐 Frontend: http://localhost:3000`);
      console.log(`🔧 API: http://localhost:5000/api`);
    });
  } else {
    console.log('⚠️  Starting server without database connection...');
    console.log('💡 To enable full functionality, please:');
    console.log('   1. Install MongoDB locally, or');
    console.log('   2. Use MongoDB Atlas (free cloud service)');
    console.log('   3. Update MONGO_URI in .env file');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (limited mode)`);
      console.log(`🌐 Frontend: http://localhost:3000`);
      console.log(`🔧 API: http://localhost:5000/api`);
    });
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
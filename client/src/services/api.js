import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error('Access denied:', error.response.data);
    }
    
    if (error.response?.status === 500) {
      // Server error
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    me: '/api/auth/me',
    updateProfile: '/api/auth/me',
    changePassword: '/api/auth/change-password',
    forgotPassword: '/api/auth/forgot-password',
    logout: '/api/auth/logout',
  },
  
  // Blogs
  blogs: {
    getAll: '/api/blogs',
    getBySlug: (slug) => `/api/blogs/${slug}`,
    getTrending: '/api/blogs/trending',
    getByCategory: (category) => `/api/blogs/category/${category}`,
    create: '/api/blogs',
    update: (id) => `/api/blogs/${id}`,
    delete: (id) => `/api/blogs/${id}`,
    like: (id) => `/api/blogs/${id}/like`,
    comment: (id) => `/api/blogs/${id}/comments`,
  },
  
  // Users
  users: {
    getProfile: '/api/users/profile',
    updateProfile: '/api/users/profile',
    getBlogs: '/api/users/blogs',
    getBlogStats: '/api/users/blog-stats',
    getLikedBlogs: '/api/users/liked-blogs',
    getCommentedBlogs: '/api/users/commented-blogs',
    deleteAccount: '/api/users/account',
  },
  
  // Admin
  admin: {
    dashboard: '/api/admin/dashboard',
    pendingBlogs: '/api/admin/blogs/pending',
    approveBlog: (id) => `/api/admin/blogs/${id}/approve`,
    rejectBlog: (id) => `/api/admin/blogs/${id}/reject`,
    toggleBlogVisibility: (id) => `/api/admin/blogs/${id}/toggle-visibility`,
    deleteBlog: (id) => `/api/admin/blogs/${id}`,
    getUsers: '/api/admin/users',
    toggleUserStatus: (id) => `/api/admin/users/${id}/toggle-status`,
    changeUserRole: (id) => `/api/admin/users/${id}/role`,
    analytics: '/api/admin/analytics',
  },
};

// Helper functions
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export const isServerError = (error) => {
  return error.response?.status >= 500;
};

export const isClientError = (error) => {
  return error.response?.status >= 400 && error.response?.status < 500;
};

export default api;


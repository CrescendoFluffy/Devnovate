import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [blogs, setBlogs] = useState([]);
  const { user } = useAuth();

  // Load blogs from localStorage on mount
  useEffect(() => {
    const savedBlogs = JSON.parse(localStorage.getItem('blogs') || '[]');
    if (savedBlogs.length === 0) {
      // Add some sample blogs if none exist
      const sampleBlogs = [
        {
          id: '1',
          title: 'Getting Started with React Development',
          content: 'React is a powerful JavaScript library for building user interfaces that has revolutionized web development since its release by Facebook in 2013. This comprehensive guide covers React fundamentals including components, JSX, props, state, hooks, and event handling. Learn how to create your first React app, understand project structure, and implement advanced concepts like custom hooks and error boundaries. Perfect for beginners and intermediate developers looking to master React development. React components are the building blocks of modern web applications, allowing developers to create reusable UI elements that can be composed together to build complex interfaces. The virtual DOM technology ensures optimal performance by minimizing actual DOM manipulations. With the introduction of hooks in React 16.8, functional components gained the ability to manage state and side effects, making React development more intuitive and functional. The ecosystem around React includes powerful tools like React Router for navigation, Redux for state management, and Next.js for server-side rendering. This guide will take you from the basics of setting up a React project to building sophisticated applications with modern React patterns and best practices.',
          excerpt: 'Learn the fundamentals of React development and build your first application...',
          author: 'admin',
          authorId: 'admin',
          status: 'published',
          category: 'Programming',
          tags: ['React', 'JavaScript', 'Frontend'],
          featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
          readTime: 8,
          views: 1250,
          likes: 89,
          comments: [],
          publishedAt: new Date('2024-01-15').toISOString(),
          createdAt: new Date('2024-01-15').toISOString()
        },
        {
          id: '2',
          title: 'The Future of Web Development in 2024',
          content: 'Web development is constantly evolving with new technologies and frameworks emerging every year, reshaping how we build and deploy applications. This comprehensive guide explores emerging technologies like WebAssembly and PWAs, framework evolution including React 18+ and Vue 3, performance optimization with Core Web Vitals, AI-powered development tools, security trends with zero trust architecture, and modern development workflows including GitOps and containerization. The landscape of web development in 2024 is characterized by unprecedented innovation and rapid adoption of cutting-edge technologies. WebAssembly has emerged as a game-changer, allowing developers to write high-performance code in languages like Rust, C++, and Go that runs in the browser at near-native speeds. Progressive Web Apps continue to gain traction, offering native app-like experiences through web browsers with offline capabilities and push notifications. Modern frameworks are evolving rapidly, with React 18 introducing concurrent features and Vue 3 providing better TypeScript support. Performance optimization has become crucial with Google\'s Core Web Vitals becoming essential for SEO and user experience. AI-powered development tools are transforming how developers write and debug code, while security practices are evolving towards zero-trust architectures. The development workflow has been revolutionized by GitOps, CI/CD pipelines, and containerization technologies like Docker and Kubernetes.',
          excerpt: 'Discover the latest trends and technologies shaping the future of web development...',
          author: 'admin',
          authorId: 'admin',
          status: 'published',
          category: 'Technology',
          tags: ['Web Development', 'Trends', '2024'],
          featuredImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
          readTime: 12,
          views: 2100,
          likes: 156,
          comments: [],
          publishedAt: new Date('2024-01-20').toISOString(),
          createdAt: new Date('2024-01-20').toISOString()
        },
        {
          id: '3',
          title: 'Mastering CSS Grid Layout',
          content: 'CSS Grid is a powerful layout system that allows you to create complex web layouts with ease, revolutionizing how we approach web design and layout. This comprehensive guide covers everything from basic concepts to advanced techniques including grid templates, areas, responsive design, and practical examples. Learn how to create magazine layouts, card grids, photo galleries, and more using CSS Grid Layout. CSS Grid Layout represents a fundamental shift in web layout capabilities, providing developers with unprecedented control over both rows and columns simultaneously. Unlike Flexbox, which is primarily a one-dimensional layout system, Grid gives you precise control over both dimensions, making it perfect for complex page layouts, dashboards, and application interfaces. The system introduces powerful concepts like grid areas, named grid lines, and the ability to create responsive layouts that adapt beautifully to different screen sizes. Grid templates allow you to define the structure of your layout with incredible flexibility, using units like fr (fractional units), minmax functions, and the repeat function for efficient grid creation. With CSS Grid, you can create sophisticated layouts that were previously impossible or extremely difficult to achieve with traditional CSS methods. This guide will take you from understanding the basic grid concepts to implementing advanced responsive patterns and creating professional-grade layouts.',
          excerpt: 'A complete guide to CSS Grid Layout for modern web design...',
          author: 'admin',
          authorId: 'admin',
          status: 'published',
          category: 'Design',
          tags: ['CSS', 'Grid', 'Layout', 'Web Design'],
          featuredImage: 'https://ralfvanveen.com/wp-content/uploads/2021/06/CSS-_-Begrippenlijst.webp',
          readTime: 15,
          views: 890,
          likes: 67,
          comments: [],
          publishedAt: new Date('2024-01-25').toISOString(),
          createdAt: new Date('2024-01-25').toISOString()
        }
      ];
      setBlogs(sampleBlogs);
      localStorage.setItem('blogs', JSON.stringify(sampleBlogs));
    } else {
      setBlogs(savedBlogs);
    }
  }, []);

  // Save blogs to localStorage whenever blogs change
  useEffect(() => {
    localStorage.setItem('blogs', JSON.stringify(blogs));
  }, [blogs]);

  const createBlog = (blogData) => {
    const newBlog = {
      id: Date.now().toString(),
      title: blogData.title,
      content: blogData.content,
      excerpt: blogData.content.substring(0, 150) + '...',
      author: user?.username || 'Anonymous',
      authorId: user?.id || 'anonymous',
      status: 'published', // Auto-publish for hackathon
      category: blogData.category || 'General',
      tags: blogData.tags || [],
      featuredImage: blogData.featuredImage || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
      readTime: Math.ceil(blogData.content.split(' ').length / 200),
      views: 0,
      likes: 0,
      comments: [],
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setBlogs(prevBlogs => [newBlog, ...prevBlogs]);
    return newBlog;
  };

  const getPublishedBlogs = () => {
    return blogs.filter(blog => blog.status === 'published');
  };

  const getBlogById = (id) => {
    return blogs.find(blog => blog.id === id);
  };

  const likeBlog = (blogId) => {
    setBlogs(prevBlogs => 
      prevBlogs.map(blog => 
        blog.id === blogId 
          ? { ...blog, likes: blog.likes + 1 }
          : blog
      )
    );
  };

  const addComment = (blogId, commentText) => {
    const newComment = {
      id: Date.now().toString(),
      content: commentText,
      author: user?.username || 'Anonymous',
      authorId: user?.id || 'anonymous',
      createdAt: new Date().toISOString()
    };

    setBlogs(prevBlogs => 
      prevBlogs.map(blog => 
        blog.id === blogId 
          ? { ...blog, comments: [...blog.comments, newComment] }
          : blog
      )
    );
  };

  const value = {
    blogs,
    createBlog,
    getPublishedBlogs,
    getBlogById,
    likeBlog,
    addComment
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

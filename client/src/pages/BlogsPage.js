import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';

const BlogsPage = () => {
  const { getPublishedBlogs } = useBlog();
  const blogs = getPublishedBlogs();
  const navigate = useNavigate();

  const handleBlogClick = (blog) => {
    navigate(`/blogs/${blog.id}`, { state: { blog } });
  };

  return (
         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         {/* Header */}
         <div className="text-center mb-16">
           <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
             All Blog Posts
           </h1>
           <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
             Discover amazing content from our community of writers
           </p>
         </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {blogs.map((blog) => (
            <article 
              key={blog.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleBlogClick(blog)}
            >
              <img 
                src={blog.featuredImage} 
                alt={blog.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-8">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-xs font-medium">
                    {blog.category}
                  </span>
                  <span className="mx-3">•</span>
                  <span>{blog.readTime} min read</span>
                  <span className="mx-3">•</span>
                  <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {blog.title}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {blog.content}
                </p>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author and Stats */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {blog.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{blog.author}</p>
                      <p className="text-xs text-gray-500">Author</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {blog.likes} likes
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      {blog.comments.length} comments
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {blog.views} views
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <svg className="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;

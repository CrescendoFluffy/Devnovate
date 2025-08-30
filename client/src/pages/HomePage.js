import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBlog } from '../contexts/BlogContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { getPublishedBlogs } = useBlog();
  const blogs = getPublishedBlogs();
  const navigate = useNavigate();

  const handleBlogClick = (blog) => {
    navigate(`/blogs/${blog.id}`, { state: { blog } });
  };

  return (
         <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
       {/* Hero Section */}
       <section className="bg-white dark:bg-gray-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
           <div className="text-center">
             <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
               Welcome to{' '}
               <span className="text-primary-600">Devnovate</span>
             </h1>
             <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
               A comprehensive blogging and article platform for writers and readers. 
               Share your knowledge, discover amazing content, and connect with the community.
             </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="border border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

             {/* Features Section */}
       <section className="py-20 bg-gray-50 dark:bg-gray-900">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
               Why Choose Devnovate?
             </h2>
             <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
               Our platform offers everything you need to create, share, and discover amazing content.
             </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
               <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                 <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                 </svg>
               </div>
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Easy Content Creation</h3>
               <p className="text-gray-600 dark:text-gray-300">
                 Create and submit blogs with our intuitive editor. Get feedback and approval from our content team.
               </p>
             </div>

                         <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
               <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                 <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </div>
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Trending Content</h3>
               <p className="text-gray-600 dark:text-gray-300">
                 Discover what's popular with our trending algorithm based on engagement and quality.
               </p>
             </div>

             <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
               <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                 <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 </svg>
               </div>
               <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quality Control</h3>
               <p className="text-gray-600 dark:text-gray-300">
                 Our admin team ensures all published content meets high standards for quality and accuracy.
               </p>
             </div>
          </div>
        </div>
      </section>

             {/* Latest Blogs Section */}
       <section className="py-20 bg-white dark:bg-gray-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
               Latest Blog Posts
             </h2>
             <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
               Discover amazing content from our community of writers
             </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {blogs.slice(0, 6).map((blog) => (
               <article 
                 key={blog.id} 
                 className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => handleBlogClick(blog)}
               >
                 <img 
                   src={blog.featuredImage} 
                   alt={blog.title}
                   className="w-full h-48 object-cover"
                 />
                 <div className="p-6">
                   <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                     <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full text-xs font-medium">
                       {blog.category}
                     </span>
                     <span className="mx-2">•</span>
                     <span>{blog.readTime} min read</span>
                   </div>
                   <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                     {blog.title}
                   </h3>
                   <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                     {blog.excerpt}
                   </p>
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2">
                       <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                         <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                           {blog.author.charAt(0).toUpperCase()}
                         </span>
                       </div>
                       <span className="text-sm text-gray-700 dark:text-gray-300">{blog.author}</span>
                     </div>
                     <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                       <span className="flex items-center">
                         <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                           <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                         </svg>
                         {blog.likes}
                       </span>
                       <span className="flex items-center">
                         <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                         </svg>
                         {blog.comments.length}
                       </span>
                     </div>
                   </div>
                 </div>
               </article>
             ))}
           </div>
          
          {blogs.length > 6 && (
            <div className="text-center mt-12">
              <Link
                to="/blogs"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                View All Blogs
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Writing?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of writers who are already sharing their knowledge on Devnovate.
          </p>
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Your Account
            </Link>
          ) : (
            <Link
              to="/create-blog"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Write Your First Blog
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { BlogProvider } from './contexts/BlogContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BlogDetailPage from './pages/BlogDetailPage';
import BlogsPage from './pages/BlogsPage';
import CreateBlogPage from './pages/CreateBlogPage';
import EditBlogPage from './pages/EditBlogPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBlogsPage from './pages/admin/AdminBlogsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
            <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <BlogProvider>
                                 <Router>
             <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/blogs" element={<BlogsPage />} />
                  <Route path="/blogs/:slug" element={<BlogDetailPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  } />
                  <Route path="/create-blog" element={
                    <PrivateRoute>
                      <CreateBlogPage />
                    </PrivateRoute>
                  } />
                  <Route path="/edit-blog/:id" element={
                    <PrivateRoute>
                      <EditBlogPage />
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  } />
                  <Route path="/admin/blogs" element={
                    <AdminRoute>
                      <AdminBlogsPage />
                    </AdminRoute>
                  } />
                  <Route path="/admin/users" element={
                    <AdminRoute>
                      <AdminUsersPage />
                    </AdminRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <AdminRoute>
                      <AdminAnalyticsPage />
                    </AdminRoute>
                  } />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
            
            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
                          </Router>
              </BlogProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
  );
}

export default App;

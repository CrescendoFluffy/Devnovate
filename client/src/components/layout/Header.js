import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  HiMenu, 
  HiX, 
  HiUser, 
  HiCog, 
  HiLogout,
  HiPlus,
  HiChartBar
} from 'react-icons/hi';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Blogs', href: '/blogs', current: location.pathname.startsWith('/blogs') },
  ];

  const userMenuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HiChartBar,
      current: location.pathname === '/dashboard',
    },
    {
      name: 'Create Blog',
      href: '/create-blog',
      icon: HiPlus,
      current: location.pathname === '/create-blog',
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: HiUser,
      current: location.pathname === '/profile',
    },
  ];

  const adminMenuItems = [
    {
      name: 'Admin Dashboard',
      href: '/admin',
      icon: HiChartBar,
      current: location.pathname.startsWith('/admin'),
    },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Devnovate</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  item.current
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side - Theme toggle, Auth */}
          <div className="flex items-center space-x-4">


            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/create-blog"
                  className="hidden md:flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <HiPlus className="w-4 h-4" />
                  <span>Write Blog</span>
                </Link>
                <div className="relative">
                                 {/* User Menu Button */}
                 <button
                   onClick={toggleUserMenu}
                   className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                 >
                   {user?.avatar ? (
                     <img
                       src={user.avatar}
                       alt={user.firstName}
                       className="w-8 h-8 rounded-full"
                     />
                   ) : (
                     <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                       <span className="text-white font-medium text-sm">
                         {user?.firstName?.charAt(0)}
                       </span>
                     </div>
                   )}
                   <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-white">
                     {user?.firstName}
                   </span>
                 </button>

                                 {/* User Dropdown Menu */}
                 {isUserMenuOpen && (
                   <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                     {/* User Info */}
                     <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                       <p className="text-sm font-medium text-gray-900 dark:text-white">
                         {user?.firstName} {user?.lastName}
                       </p>
                       <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                     </div>

                                         {/* Menu Items */}
                     <div className="py-2">
                       {userMenuItems.map((item) => (
                         <Link
                           key={item.name}
                           to={item.href}
                           onClick={() => setIsUserMenuOpen(false)}
                           className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                             item.current ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
                           }`}
                         >
                           <item.icon className="w-4 h-4 mr-3" />
                           {item.name}
                         </Link>
                       ))}

                                             {/* Admin Menu Items */}
                       {isAdmin() && (
                         <>
                           <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                           {adminMenuItems.map((item) => (
                             <Link
                               key={item.name}
                               to={item.href}
                               onClick={() => setIsUserMenuOpen(false)}
                               className={`flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                                 item.current ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
                               }`}
                             >
                               <item.icon className="w-4 h-4 mr-3" />
                               {item.name}
                             </Link>
                           ))}
                         </>
                       )}

                                             {/* Logout */}
                       <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                       <button
                         onClick={handleLogout}
                         className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200"
                       >
                         <HiLogout className="w-4 h-4 mr-3" />
                         Logout
                       </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
                         ) : (
               <div className="flex items-center space-x-3">
                 <Link
                   to="/login"
                   className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                 >
                   Sign In
                 </Link>
                 <Link
                   to="/register"
                   className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
                 >
                   Get Started
                 </Link>
               </div>
             )}

                         {/* Mobile menu button */}
             <button
               onClick={toggleMobileMenu}
               className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
               aria-label="Toggle mobile menu"
             >
               {isMobileMenuOpen ? (
                 <HiX className="w-6 h-6" />
               ) : (
                 <HiMenu className="w-6 h-6" />
               )}
             </button>
          </div>
        </div>
      </div>

             {/* Mobile Navigation */}
       {isMobileMenuOpen && (
         <div className="md:hidden">
           <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                         {navigation.map((item) => (
               <Link
                 key={item.name}
                 to={item.href}
                 onClick={closeMobileMenu}
                 className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                   item.current
                     ? 'text-primary-600 bg-primary-50 dark:bg-primary-900 dark:text-primary-400'
                     : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900'
                 }`}
               >
                 {item.name}
               </Link>
             ))}

                         {/* Mobile Auth Section */}
             {isAuthenticated ? (
               <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                 <div className="px-3 py-2">
                   <p className="text-sm font-medium text-gray-900 dark:text-white">
                     {user?.firstName} {user?.lastName}
                   </p>
                   <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                 </div>
                
                                 {userMenuItems.map((item) => (
                   <Link
                     key={item.name}
                     to={item.href}
                     onClick={closeMobileMenu}
                     className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                       item.current ? 'text-primary-600 bg-primary-50 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900'
                     }`}
                   >
                     {item.name}
                   </Link>
                 ))}

                                 {isAdmin() && (
                   <>
                     <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                     {adminMenuItems.map((item) => (
                       <Link
                         key={item.name}
                         to={item.href}
                         onClick={closeMobileMenu}
                         className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                           item.current ? 'text-primary-600 bg-primary-50 dark:bg-primary-900 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900'
                         }`}
                       >
                         {item.name}
                       </Link>
                     ))}
                   </>
                 )}

                                 <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                 <button
                   onClick={() => {
                     handleLogout();
                     closeMobileMenu();
                   }}
                   className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200"
                 >
                   Logout
                 </button>
              </div>
                           ) : (
                 <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                   <Link
                     to="/login"
                     onClick={closeMobileMenu}
                     className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-200"
                   >
                     Sign In
                   </Link>
                   <Link
                     to="/register"
                     onClick={closeMobileMenu}
                     className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-200"
                   >
                     Get Started
                   </Link>
                 </div>
               )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

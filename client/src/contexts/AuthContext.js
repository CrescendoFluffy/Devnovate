import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const queryClient = useQueryClient();

  // Set auth token in axios headers
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token && !state.user) {
        try {
          // For local storage auth, decode the token
          const tokenData = JSON.parse(atob(state.token));
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const user = users.find(u => u.id === tokenData.id);
          
          if (user) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: user,
                token: state.token,
              },
            });
          } else {
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      }
    };

    checkAuth();
  }, [state.token, state.user]);

  // Initialize with admin user if none exists
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      const adminUser = {
        id: 'admin',
        username: 'admin',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      };
      users.push(adminUser);
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, []);

  // Login function
  const login = async (username, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      // Simple local storage authentication
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        const token = btoa(JSON.stringify({ username: user.username, id: user.id }));
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });
        toast.success(`Welcome back, ${user.username}!`);
        return { success: true };
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      // Simple local storage registration
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if username already exists
      if (users.find(u => u.username === userData.username)) {
        throw new Error('Username already exists');
      }
      
      const newUser = {
        id: Date.now().toString(),
        username: userData.username,
        password: userData.password,
        firstName: userData.username,
        lastName: '',
        role: 'user'
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      const token = btoa(JSON.stringify({ username: newUser.username, id: newUser.id }));
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: newUser, token },
      });

      toast.success(`Welcome to Devnovate, ${newUser.username}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (state.token) {
        await api.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      queryClient.clear();
      toast.success('Logged out successfully');
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/auth/me', profileData);
      const updatedUser = response.data.data;

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: updatedUser,
      });

      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      await api.post('/api/auth/forgot-password', { email });
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  // Check if user is the author of a resource
  const isAuthor = (authorId) => {
    return state.user?._id === authorId;
  };

  // Check if user can edit a resource (author or admin)
  const canEdit = (authorId) => {
    return isAdmin() || isAuthor(authorId);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    clearError,
    isAdmin,
    isAuthor,
    canEdit,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

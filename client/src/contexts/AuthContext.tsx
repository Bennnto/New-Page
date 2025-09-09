import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd: boolean;
  };
  preferences: {
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      announcements: boolean;
    };
  };
  stats: {
    mediaUploaded: number;
    totalViews: number;
    joinDate: Date;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  subscription?: {
    plan: string;
    cardDetails: {
      number: string;
      expiry: string;
      cvc: string;
      name: string;
    };
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL - use current domain for production
// Force empty string in production to prevent localhost issues
const getApiBaseUrl = () => {
  // If we're in production, always use empty string (same domain)
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  
  // In development, use localhost:5001
  return process.env.REACT_APP_API_URL || 'http://localhost:5001';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔧 Environment check:');
console.log('📝 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🎯 Final API_BASE_URL:', API_BASE_URL);

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
console.log('🌐 API_BASE_URL configured:', API_BASE_URL);

// Add token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login to:', API_BASE_URL);
      console.log('📧 Email:', email);
      console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
      console.log('🔗 axios.defaults.baseURL:', axios.defaults.baseURL);
      
      // Use fetch with explicit URL to avoid axios baseURL issues
      const loginUrl = `${API_BASE_URL}/api/auth/login`;
      console.log('🎯 Full login URL:', loginUrl);
      
      // Additional debugging
      if (loginUrl.includes('localhost:5000')) {
        console.error('❌ ERROR: Still using localhost:5000!');
        console.log('🔍 Debug info:', {
          API_BASE_URL,
          envApiUrl: process.env.REACT_APP_API_URL,
          nodeEnv: process.env.NODE_ENV,
          isProd: process.env.NODE_ENV === 'production'
        });
      }
      
      const fetchResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      if (!fetchResponse.ok) {
        throw new Error(`HTTP error! status: ${fetchResponse.status}`);
      }

      const response = { data: await fetchResponse.json() };

      console.log('✅ Login response:', response.data);
      
      const { user, accessToken, refreshToken } = response.data.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      
      console.log('👤 User set:', user);
      console.log('🔑 Token stored:', accessToken.substring(0, 20) + '...');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('📍 API URL:', API_BASE_URL);
      console.error('🔗 Full error:', error.response || error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);

      const { user, accessToken, refreshToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      console.log('🔐 Logged out, tokens cleared');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await axios.put('/api/user/profile', data);
      setUser(response.data.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.data.user);
    } catch (error) {
      console.error('User refresh failed:', error);
    }
  };

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (token) {
        console.log('🔄 Found token, attempting to refresh user...');
        try {
          // Try to get user profile from API
          const getApiBaseUrl = () => {
            if (process.env.NODE_ENV === 'production') {
              return '';
            }
            return process.env.REACT_APP_API_URL || 'http://localhost:5001';
          };
          const API_BASE_URL = getApiBaseUrl();
          
          const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUser(data.data);
              console.log('✅ User initialized from token:', data.data.email);
            } else {
              throw new Error('Invalid token');
            }
          } else {
            throw new Error('Token validation failed');
          }
        } catch (error) {
          console.error('❌ Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    initializeUser();
  }, []);

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Components
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import MediaGallery from './pages/Media/MediaGallery';
import MediaUpload from './pages/Media/MediaUpload';
import MediaDetail from './pages/Media/MediaDetail';
import MediaLibrary from './pages/Media/MediaLibrary';
import ChatRoom from './pages/Chat/ChatRoom';
import Profile from './pages/Profile/Profile';
import Subscription from './pages/Subscription/Subscription';
import PaymentContact from './pages/Contact/PaymentContact';
import Announcements from './pages/Announcements/Announcements';
import UserRequests from './pages/Admin/UserRequests';
import ContentEditor from './pages/Admin/ContentEditor';

// Context
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Dark theme optimized for reduced background brightness
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4f46e5', // Indigo
      light: '#6366f1',
      dark: '#3730a3',
    },
    secondary: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#0f0f23', // Very dark blue-purple
      paper: '#1a1a2e', // Slightly lighter dark blue
    },
    text: {
      primary: '#e2e8f0', // Light gray for primary text
      secondary: '#94a3b8', // Medium gray for secondary text
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundColor: '#1a1a2e',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0f0f23',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0f0f23',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Elements stripe={stripePromise}>
          <AuthProvider>
            <Router>
              <Routes>
                  {/* Public Routes - No Layout/Sidebar */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/contact-payment" element={<PaymentContact />} />
                
                {/* Protected Routes - With Layout/Sidebar */}
                <Route path="/dashboard" element={
                  <Layout>
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </Layout>
                } />
                <Route path="/media" element={
                  <Layout>
                    <ProtectedRoute>
                      <MediaLibrary />
                    </ProtectedRoute>
                  </Layout>
                } />
                <Route path="/media/gallery" element={
                  <Layout>
                    <ProtectedRoute>
                      <MediaGallery />
                    </ProtectedRoute>
                  </Layout>
                } />
                <Route path="/media/:id" element={
                  <Layout>
                    <ProtectedRoute>
                      <MediaDetail />
                    </ProtectedRoute>
                  </Layout>
                } />
                <Route path="/chat" element={
                  <Layout>
                    <ProtectedRoute>
                      <ChatRoom />
                    </ProtectedRoute>
                  </Layout>
                } />
                <Route path="/announcements" element={
                  <Layout>
                    <ProtectedRoute>
                      <Announcements />
                    </ProtectedRoute>
                  </Layout>
                } />
                <Route path="/upload" element={
                  <Layout>
                    <ProtectedRoute>
                      <MediaUpload />
                    </ProtectedRoute>
                  </Layout>
                } />
                <Route path="/profile" element={
                  <Layout>
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  </Layout>
                } />
                  <Route path="/subscription" element={
                    <Layout>
                      <ProtectedRoute>
                        <Subscription />
                      </ProtectedRoute>
                    </Layout>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <Layout>
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/admin/members" element={
                    <Layout>
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/admin/media" element={
                    <Layout>
                      <ProtectedRoute>
                        <MediaUpload />
                      </ProtectedRoute>
                    </Layout>
                  } />
                <Route path="/admin/announcements" element={
                  <Layout>
                    <ProtectedRoute>
                      <Announcements />
                    </ProtectedRoute>
                  </Layout>
                } />
                
                <Route path="/admin/user-requests" element={
                  <Layout>
                    <ProtectedRoute>
                      <UserRequests />
                    </ProtectedRoute>
                  </Layout>
                } />
                
                <Route path="/admin/content" element={
                  <Layout>
                    <ProtectedRoute>
                      <ContentEditor />
                    </ProtectedRoute>
                  </Layout>
                } />
                </Routes>
            </Router>
          </AuthProvider>
        </Elements>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
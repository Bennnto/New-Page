// Development server that works without MongoDB
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data store (in-memory for development)
let users = [];
let media = [];
let announcements = [];

// Mock authentication routes
app.post('/api/auth/register', (req, res) => {
  const { email, username, firstName, lastName } = req.body;
  const user = {
    _id: Date.now().toString(),
    email,
    username,
    firstName,
    lastName,
    subscription: { plan: 'free', status: 'active' },
    preferences: { theme: 'dark' },
    stats: { mediaUploaded: 0, totalViews: 0, joinDate: new Date() }
  };
  users.push(user);
  
  res.json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      accessToken: 'mock_token_' + user._id,
      refreshToken: 'mock_refresh_' + user._id
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  let user = users.find(u => u.email === email);
  
  if (!user) {
    // Create demo user if not exists
    user = {
      _id: Date.now().toString(),
      email,
      username: email.split('@')[0],
      firstName: 'Demo',
      lastName: 'User',
      subscription: { plan: 'premium', status: 'active' },
      preferences: { theme: 'dark' },
      stats: { mediaUploaded: 5, totalViews: 123, joinDate: new Date() }
    };
    users.push(user);
  }
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      accessToken: 'mock_token_' + user._id,
      refreshToken: 'mock_refresh_' + user._id
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  // Mock authentication - return demo user
  const user = {
    _id: '1',
    email: 'demo@example.com',
    username: 'demouser',
    firstName: 'Demo',
    lastName: 'User',
    subscription: { plan: 'premium', status: 'active' },
    preferences: { theme: 'dark' },
    stats: { mediaUploaded: 5, totalViews: 123, joinDate: new Date() }
  };
  
  res.json({
    success: true,
    data: { user }
  });
});

// Mock media routes
app.get('/api/media', (req, res) => {
  const mockMedia = [
    {
      _id: '1',
      title: 'Beautiful Sunset',
      category: 'image',
      url: 'https://picsum.photos/400/300?random=1',
      owner: { username: 'photographer', avatar: null },
      stats: { views: 245, likes: 12 },
      createdAt: new Date().toISOString(),
      tags: ['nature', 'sunset']
    },
    {
      _id: '2',
      title: 'City Lights',
      category: 'image',
      url: 'https://picsum.photos/400/300?random=2',
      owner: { username: 'urbanexplorer', avatar: null },
      stats: { views: 156, likes: 8 },
      createdAt: new Date().toISOString(),
      tags: ['city', 'night']
    }
  ];
  
  res.json({
    success: true,
    data: {
      media: mockMedia,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockMedia.length,
        itemsPerPage: 20
      }
    }
  });
});

// Mock dashboard data
app.get('/api/user/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        firstName: 'Demo',
        subscription: { plan: 'premium' }
      },
      stats: {
        media: { totalMedia: 5, totalViews: 123, totalLikes: 15, totalSize: 2300000 },
        payments: { totalPayments: 1, totalAmount: 1999, successfulPayments: 1 }
      },
      recentMedia: [
        { _id: '1', title: 'Demo Image 1', category: 'image', stats: { views: 45 }, createdAt: '2 days ago' },
        { _id: '2', title: 'Demo Video 1', category: 'video', stats: { views: 78 }, createdAt: '1 week ago' }
      ],
      subscription: { plan: 'premium', status: 'active' }
    }
  });
});

// Mock announcements
app.get('/api/announcements', (req, res) => {
  res.json({
    success: true,
    data: {
      announcements: [
        {
          _id: '1',
          title: 'Welcome to Page Project!',
          content: 'Your application is running in development mode. Connect a database to enable full functionality.',
          type: 'info',
          author: { username: 'system' },
          createdAt: new Date().toISOString()
        }
      ],
      pagination: { currentPage: 1, totalPages: 1, totalItems: 1 }
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Development server running',
    timestamp: new Date().toISOString(),
    mode: 'development'
  });
});

// Serve uploaded files (mock)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Development server error',
    error: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 Development server running on port', PORT);
  console.log('📱 Frontend should connect to: http://localhost:3000');
  console.log('⚠️  This is a development server with mock data');
  console.log('💡 To use full features, set up MongoDB and run: npm start');
});

module.exports = app;

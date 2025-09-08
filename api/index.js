// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory data store with fixed admin credentials
let users = [
  {
    _id: 'admin_001',
    email: 'admin@undercovered.com',
    password: 'admin123456',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    subscription: { plan: 'enterprise', status: 'active' },
    preferences: { theme: 'dark' },
    stats: { mediaUploaded: 25, totalViews: 1250, joinDate: new Date() },
    isActive: true
  },
  {
    _id: 'demo_001',
    email: 'demo@undercovered.com',
    password: 'demo123456',
    username: 'demouser',
    firstName: 'Demo',
    lastName: 'User',
    role: 'user',
    subscription: { plan: 'premium', status: 'active' },
    preferences: { theme: 'dark' },
    stats: { mediaUploaded: 5, totalViews: 123, joinDate: new Date() },
    isActive: true
  }
];

let media = [
  {
    _id: 'media_001',
    title: 'Welcome to Undercovered',
    description: 'Premium content for our exclusive members',
    type: 'image',
    filename: 'welcome.jpg',
    url: '/uploads/images/welcome.jpg',
    uploadedBy: 'admin_001',
    uploadDate: new Date(),
    views: 150,
    isPublic: true,
    tags: ['welcome', 'featured']
  },
  {
    _id: 'media_demo_video',
    title: 'Demo Video - Premium Content',
    description: 'This is a demo video showing how premium video content works in the Undercovered platform',
    type: 'video',
    filename: 'demo-video.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    uploadedBy: 'admin_001',
    uploadDate: new Date(),
    views: 89,
    isPublic: true,
    tags: ['demo', 'premium', 'video'],
    fileSize: 158000000,
    duration: 596
  }
];

// Storage for contact form submissions
let contactSubmissions = [];

// Root API handler
app.all('/api/*', (req, res) => {
  const path = req.path;
  const method = req.method;
  
  console.log(`🔍 API Request: ${method} ${path}`);
  
  // Auth Routes
  if (path === '/api/auth/login' && method === 'POST') {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    
    // Create mock tokens for demo
    const accessToken = 'demo_access_token_' + Date.now();
    const refreshToken = 'demo_refresh_token_' + Date.now();
    
    return res.json({
      success: true,
      data: { 
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  }
  
  // Media Routes
  if (path === '/api/media' && method === 'GET') {
    const transformedMedia = media.map(item => ({
      id: item._id,
      title: item.title,
      description: item.description,
      type: item.type,
      thumbnail: `/api/placeholder/400/225`,
      url: item.url,
      category: item.tags.includes('exclusive') ? 'Exclusive' : 
                item.tags.includes('photography') ? 'Photography' :
                item.tags.includes('audio') ? 'Audio' : 'Resources',
      uploadedBy: item.uploadedBy === 'admin_001' ? 'Admin' : 'Admin',
      uploadedAt: item.uploadDate.toISOString().split('T')[0],
      likes: item.views || 0,
      isLiked: false,
      tags: item.tags,
      duration: item.duration ? `${Math.floor(item.duration/60)}:${(item.duration%60).toString().padStart(2, '0')}` : undefined,
      size: item.fileSize ? `${(item.fileSize / (1024*1024)).toFixed(1)} MB` : '0 MB',
      quality: item.fileSize > 50000000 ? '4K' : item.fileSize > 10000000 ? 'HD' : 'Standard'
    }));
    
    return res.json({
      success: true,
      media: transformedMedia,
      total: transformedMedia.length
    });
  }
  
  if (path === '/api/media' && method === 'POST') {
    const timestamp = Date.now();
    const newMedia = {
      _id: 'media_' + timestamp,
      title: req.body.title || `Admin Upload ${new Date().toLocaleTimeString()}`,
      description: req.body.description || 'Uploaded by admin for premium members',
      type: req.body.type || 'video',
      filename: `video-${timestamp}.mp4`,
      url: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
      uploadedBy: 'admin_001',
      uploadDate: new Date(),
      views: 0,
      isPublic: true,
      tags: ['admin-upload', 'premium'],
      fileSize: Math.floor(Math.random() * 100000000) + 1000000,
      duration: Math.floor(Math.random() * 3600) + 60
    };
    
    media.unshift(newMedia);
    
    return res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: { media: newMedia }
    });
  }
  
  // Contact form submission endpoint
  if (path === '/api/contact/payment' && method === 'POST') {
    try {
      const {
        username,
        password,
        email,
        phone,
        selectedPlan,
        paymentMethod,
        paymentConfirmation
      } = req.body;

      // Create submission record
      const submission = {
        _id: 'contact_' + Date.now(),
        username,
        password, // In production, this should be hashed immediately
        email,
        phone: phone || null,
        selectedPlan,
        paymentMethod,
        paymentConfirmation,
        submittedAt: new Date(),
        status: 'pending'
      };

      // Store submission
      contactSubmissions.unshift(submission);
      
      console.log('📝 New contact form submission received:', {
        id: submission._id,
        email: submission.email,
        plan: submission.selectedPlan
      });

      return res.json({
        success: true,
        message: 'Form submitted successfully',
        submissionId: submission._id
      });

    } catch (error) {
      console.error('❌ Contact form submission error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing form submission'
      });
    }
  }
  
  // Get contact submissions (admin only)
  if (path === '/api/contact/submissions' && method === 'GET') {
    return res.json({
      success: true,
      data: contactSubmissions.map(sub => ({
        ...sub,
        password: '[REDACTED]' // Don't send passwords in response
      }))
    });
  }
  
  // Default 404 for unmatched API routes
  return res.status(404).json({ 
    success: false,
    message: `API endpoint not found: ${method} ${path}`,
    availableEndpoints: [
      'POST /api/auth/login',
      'GET /api/media',
      'POST /api/media', 
      'POST /api/contact/payment',
      'GET /api/contact/submissions'
    ]
  });
});

// Health check
app.get('/api', (req, res) => {
  res.json({ 
    success: true,
    message: 'Undercovered API is running',
    endpoints: [
      'POST /api/auth/login',
      'GET /api/media',
      'POST /api/media', 
      'POST /api/contact/payment',
      'GET /api/contact/submissions'
    ]
  });
});

// Catch all handler
app.all('*', (req, res) => {
  console.log(`❓ Unmatched request: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

module.exports = app;
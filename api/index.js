// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Auth Routes
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;
  
  res.json({
    success: true,
    data: { user: userWithoutPassword }
  });
});

// Media Routes
app.get('/media', (req, res) => {
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
  
  res.json({
    success: true,
    media: transformedMedia,
    total: transformedMedia.length
  });
});

app.post('/media', (req, res) => {
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
  
  res.status(201).json({
    success: true,
    message: 'Video uploaded successfully',
    data: { media: newMedia }
  });
});

// Catch all handler for API routes
app.all('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

module.exports = app;

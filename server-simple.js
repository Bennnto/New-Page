const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (videos, images, documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Create uploads directories if they don't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const videosDir = path.join(uploadsDir, 'videos');
const imagesDir = path.join(uploadsDir, 'images');
const documentsDir = path.join(uploadsDir, 'documents');

[uploadsDir, videosDir, imagesDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// In-memory data store with fixed admin credentials
// Storage for contact form submissions
let contactSubmissions = [];

let users = [
  {
    _id: 'admin_001',
    email: 'admin@undercovered.com',
    password: 'admin123456', // In production, this would be hashed
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    subscription: { plan: 'premium', status: 'active' },
    preferences: { theme: 'dark' },
    stats: { mediaUploaded: 10, totalViews: 500, joinDate: new Date() },
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

let announcements = [
  {
    _id: 'ann_001',
    title: 'Welcome to Undercovered Platform!',
    content: 'We are excited to have you join our exclusive community. Enjoy premium content and connect with fellow members in our chat room.',
    author: 'admin_001',
    createdAt: new Date(),
    isImportant: true,
    isPublic: true
  }
];

// Helper function to find user
const findUser = (email, password = null) => {
  if (password) {
    return users.find(u => u.email === email && u.password === password);
  }
  return users.find(u => u.email === email);
};

// Authentication Routes
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login attempt:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const user = findUser(email, password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  
  console.log('✅ Login successful for:', user.email, '- Role:', user.role);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      accessToken: 'undercovered_token_' + user._id,
      refreshToken: 'undercovered_refresh_' + user._id,
      expiresIn: '7d'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;
  
  if (!email || !password || !username || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  // Check if user already exists
  if (findUser(email)) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }
  
  // Create new user
  const user = {
    _id: 'user_' + Date.now(),
    email,
    password,
    username,
    firstName,
    lastName,
    role: 'user',
    subscription: { plan: 'premium', status: 'active' }, // All new users get premium for demo
    preferences: { theme: 'dark' },
    stats: { mediaUploaded: 0, totalViews: 0, joinDate: new Date() },
    isActive: true
  };
  
  users.push(user);
  
  const { password: _, ...userWithoutPassword } = user;
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userWithoutPassword,
      accessToken: 'undercovered_token_' + user._id,
      refreshToken: 'undercovered_refresh_' + user._id,
      expiresIn: '7d'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  // Mock authentication - return admin user for demo
  const user = users.find(u => u.role === 'admin');
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    data: { user: userWithoutPassword }
  });
});

// Media Routes
app.get('/api/media', (req, res) => {
  console.log('📁 GET /api/media - Fetching all media');
  console.log('📊 Total media items:', media.length);
  
  // Transform backend format to frontend format
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
    total: transformedMedia.length,
    // Also include the old format for compatibility
    data: {
      media: transformedMedia,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: transformedMedia.length,
        itemsPerPage: 10
      }
    }
  });
});

app.post('/api/media', (req, res) => {
  console.log('📹 Media upload request received');
  console.log('📋 Headers:', req.headers);
  console.log('🗂️ Body keys:', Object.keys(req.body || {}));
  
  // Extract form data (simulating multipart/form-data processing)
  let title = 'Untitled Upload';
  let description = 'Uploaded by admin';
  let type = 'video';
  let tags = ['admin-upload', 'premium'];
  let visibility = 'public';
  
  // Parse form data from request body (in a real app, this would be handled by multer)
  if (req.body) {
    title = req.body.title || req.body.title_0 || title;
    description = req.body.description || req.body.description_0 || description;
    visibility = req.body.visibility || visibility;
    
    // Try to parse tags
    try {
      if (req.body.tags_0) {
        const parsedTags = JSON.parse(req.body.tags_0);
        if (Array.isArray(parsedTags)) {
          tags = [...tags, ...parsedTags];
        }
      }
    } catch (e) {
      console.log('⚠️ Could not parse tags, using defaults');
    }
  }
  
  // Detect file type from filename or content type (simulated)
  const mediaTypes = ['video', 'image', 'audio', 'document'];
  const actualType = mediaTypes.includes(type) ? type : 'video';
  
  const timestamp = Date.now();
  const newMedia = {
    _id: 'media_' + timestamp,
    title: title,
    description: description,
    type: actualType,
    filename: `${actualType}-${timestamp}.${actualType === 'video' ? 'mp4' : actualType === 'image' ? 'jpg' : actualType === 'audio' ? 'mp3' : 'pdf'}`,
    url: `/uploads/${actualType}s/${actualType}-${timestamp}.${actualType === 'video' ? 'mp4' : actualType === 'image' ? 'jpg' : actualType === 'audio' ? 'mp3' : 'pdf'}`,
    uploadedBy: 'admin_001',
    uploadDate: new Date(),
    views: 0,
    isPublic: visibility === 'public',
    tags: [...new Set(tags)], // Remove duplicates
    fileSize: Math.floor(Math.random() * 100000000) + 1000000, // Random file size for simulation
    duration: actualType === 'video' || actualType === 'audio' ? Math.floor(Math.random() * 3600) + 60 : null
  };
  
  media.unshift(newMedia); // Add to beginning so it shows first
  
  console.log('✅ Created new media item:', {
    id: newMedia._id,
    title: newMedia.title,
    type: newMedia.type,
    tags: newMedia.tags
  });
  
  console.log('✅ Media uploaded:', newMedia.title, '- Type:', newMedia.type);
  
  res.status(201).json({
    success: true,
    message: `${actualType.charAt(0).toUpperCase() + actualType.slice(1)} uploaded successfully`,
    data: { media: newMedia }
  });
});

// Announcements Routes
app.get('/api/announcements', (req, res) => {
  res.json({
    success: true,
    data: {
      announcements: announcements,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: announcements.length,
        itemsPerPage: 10
      }
    }
  });
});

app.post('/api/announcements', (req, res) => {
  const { title, content, isImportant = false } = req.body;
  
  const newAnnouncement = {
    _id: 'ann_' + Date.now(),
    title: title || 'New Announcement',
    content: content || 'Announcement content...',
    author: 'admin_001',
    createdAt: new Date(),
    isImportant,
    isPublic: true
  };
  
  announcements.unshift(newAnnouncement); // Add to beginning
  
  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data: { announcement: newAnnouncement }
  });
});

// Contact form submission endpoint
app.post('/api/contact/payment', upload.single('confirmationFile'), (req, res) => {
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
      confirmationFile: req.file ? {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
      } : null,
      submittedAt: new Date(),
      status: 'pending', // pending, approved, rejected
      processedAt: null,
      notes: ''
    };

    // Store submission
    contactSubmissions.unshift(submission);
    
    console.log('📝 New contact form submission received:', {
      id: submission._id,
      email: submission.email,
      plan: submission.selectedPlan,
      hasFile: !!submission.confirmationFile
    });

    res.json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: submission._id
    });

  } catch (error) {
    console.error('❌ Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing form submission'
    });
  }
});

// Get contact submissions (admin only)
app.get('/api/contact/submissions', (req, res) => {
  res.json({
    success: true,
    data: contactSubmissions.map(sub => ({
      ...sub,
      password: '[REDACTED]' // Don't send passwords in response
    }))
  });
});

// Update submission status and create user account
app.put('/api/contact/submissions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    
    const submissionIndex = contactSubmissions.findIndex(sub => sub._id === id);
    if (submissionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const submission = contactSubmissions[submissionIndex];
    
    switch (action) {
      case 'approve':
        submission.status = 'approved';
        submission.processedAt = new Date();
        submission.notes = notes || '';
        console.log('✅ Submission approved:', submission.email);
        break;
        
      case 'reject':
        submission.status = 'rejected';
        submission.processedAt = new Date();
        submission.notes = notes || '';
        console.log('❌ Submission rejected:', submission.email);
        break;
        
      case 'create_account':
        if (submission.status !== 'approved') {
          return res.status(400).json({
            success: false,
            message: 'Submission must be approved before creating account'
          });
        }
        
        // Check if user already exists
        const existingUser = users.find(u => u.email === submission.email || u.username === submission.username);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'User with this email or username already exists'
          });
        }
        
        // Create new user account
        const newUser = {
          _id: 'user_' + Date.now(),
          username: submission.username,
          email: submission.email,
          password: submission.password, // In production, hash this!
          firstName: submission.username, // Default to username
          lastName: '',
          phone: submission.phone || '',
          role: 'user',
          subscription: { 
            plan: submission.selectedPlan, 
            status: 'active',
            startDate: new Date(),
            paymentMethod: submission.paymentMethod
          },
          preferences: { theme: 'dark' },
          stats: { 
            mediaUploaded: 0, 
            totalViews: 0, 
            joinDate: new Date() 
          },
          isActive: true,
          createdFromSubmission: submission._id
        };
        
        // Add user to users array
        users.push(newUser);
        
        // Update submission status
        submission.status = 'account_created';
        submission.processedAt = new Date();
        submission.notes = notes || 'Account created successfully';
        
        console.log('👤 New user account created:', {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          plan: newUser.subscription.plan
        });
        
        // In a real app, you would:
        // 1. Hash the password
        // 2. Send welcome email with login instructions
        // 3. Store in actual database
        
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
    
    res.json({
      success: true,
      message: `Submission ${action.replace('_', ' ')} successfully`,
      data: {
        submission: {
          ...submission,
          password: '[REDACTED]'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing request'
    });
  }
});

// User Routes
app.get('/api/user/profile', (req, res) => {
  const user = users.find(u => u.role === 'admin');
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    data: { user: userWithoutPassword }
  });
});

app.put('/api/user/profile', (req, res) => {
  console.log('👤 Profile update request:', req.body);
  const { firstName, lastName, email, username } = req.body;
  
  // Find and update user
  const userIndex = users.findIndex(u => u.role === 'admin');
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      firstName: firstName || users[userIndex].firstName,
      lastName: lastName || users[userIndex].lastName,
      email: email || users[userIndex].email,
      username: username || users[userIndex].username,
    };
    
    const { password: _, ...userWithoutPassword } = users[userIndex];
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userWithoutPassword }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

app.put('/api/user/password', (req, res) => {
  console.log('🔐 Password change request');
  
  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

app.get('/api/user/stats', (req, res) => {
  const stats = {
    mediaUploaded: 10,
    totalViews: 500,
    joinDate: new Date().toISOString(),
    subscriptionDays: 30,
    favoriteContent: 12,
  };
  
  res.json({
    success: true,
    data: stats
  });
});

// Admin Users Management
app.get('/api/user/admin/users', (req, res) => {
  console.log('👥 Admin users request');
  
  const usersWithoutPasswords = users.map(user => {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  
  res.json({
    success: true,
    data: {
      users: usersWithoutPasswords,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: users.length,
        itemsPerPage: 20
      }
    }
  });
});

// File Upload Simulation
app.post('/api/upload', (req, res) => {
  console.log('📁 File upload simulation');
  
  // Simulate file upload response
  const uploadedFile = {
    filename: `upload-${Date.now()}.mp4`,
    originalName: req.body.originalName || 'video.mp4',
    size: Math.floor(Math.random() * 50000000) + 1000000,
    mimetype: 'video/mp4',
    url: `/uploads/videos/upload-${Date.now()}.mp4`
  };
  
  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: { file: uploadedFile }
  });
});

// Subscription Management
app.post('/api/subscription/change', (req, res) => {
  console.log('💳 Subscription change request:', req.body);
  const { planId } = req.body;
  
  // Update user subscription
  const userIndex = users.findIndex(u => u.role === 'admin');
  if (userIndex !== -1) {
    users[userIndex].subscription.plan = planId === 'monthly' ? 'monthly' : 'sixmonth';
    
    res.json({
      success: true,
      message: `Successfully upgraded to ${planId} plan!`,
      data: { subscription: users[userIndex].subscription }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

app.post('/api/subscription/cancel', (req, res) => {
  console.log('❌ Subscription cancel request');
  
  // Update user subscription status
  const userIndex = users.findIndex(u => u.role === 'admin');
  if (userIndex !== -1) {
    users[userIndex].subscription.status = 'cancelled';
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: { subscription: users[userIndex].subscription }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Undercovered API is running!',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Serve React app for all non-API routes (for client-side routing)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log('🎉 UNDERCOVERED SERVER STARTED!');
  console.log('================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log('');
  console.log('👑 ADMIN LOGIN CREDENTIALS:');
  console.log('📧 Email: admin@undercovered.com');
  console.log('🔑 Password: admin123456');
  console.log('🎭 Role: Admin');
  console.log('');
  console.log('👤 DEMO USER CREDENTIALS:');
  console.log('📧 Email: demo@undercovered.com');
  console.log('🔑 Password: demo123456');
  console.log('🎭 Role: User');
  console.log('');
  console.log('✨ Ready for connections!');
});

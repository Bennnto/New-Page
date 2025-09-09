// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../database/connection');
const seedDefaultData = require('../database/seedData');

// Import database models
const User = require('../database/models/User');
const ContactSubmission = require('../database/models/ContactSubmission');
const WebsiteContent = require('../database/models/WebsiteContent');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JWT Secret
const JWT_SECRET = 'your-secret-key-here-please-change-in-production';

// Helper function to check if subscription is valid
const isSubscriptionActive = (user) => {
  if (!user.subscription) return false;
  if (user.subscription.status !== 'active') return false;
  if (!user.subscription.currentPeriodEnd) return true; // No expiry set
  
  const now = new Date();
  const expiryDate = new Date(user.subscription.currentPeriodEnd);
  
  if (now > expiryDate) {
    // Subscription has expired, update status
    user.subscription.status = 'expired';
    return false;
  }
  
  return true;
};


// In-memory data store with fixed admin credentials
let users = [
  {
    _id: 'admin_001',
    id: 'admin_001',
    email: 'admin@undercovered.com',
    password: 'admin123456',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    subscription: { 
      plan: 'enterprise', 
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Admin gets 1 year
    },
    preferences: { theme: 'dark' },
    stats: { mediaUploaded: 25, totalViews: 1250, joinDate: new Date() },
    isActive: true
  },
  {
    _id: 'demo_001',
    id: 'demo_001',
    email: 'demo@undercovered.com',
    password: 'demo123456',
    username: 'demouser',
    firstName: 'Demo',
    lastName: 'User',
    role: 'user',
    subscription: { 
      plan: 'monthly', 
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    preferences: { theme: 'dark' },
    stats: { mediaUploaded: 5, totalViews: 123, joinDate: new Date() },
    isActive: true
  },
  {
    _id: 'expired_001',
    id: 'expired_001',
    email: 'expired@undercovered.com',
    password: 'expired123456',
    username: 'expireduser',
    firstName: 'Expired',
    lastName: 'User',
    role: 'user',
    subscription: { 
      plan: 'monthly', 
      status: 'active', // Will be marked as expired when checked
      currentPeriodEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago (expired)
    },
    preferences: { theme: 'dark' },
    stats: { mediaUploaded: 2, totalViews: 45, joinDate: new Date() },
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

// Add some test submissions so admin can see data
contactSubmissions.push({
  _id: 'test_001',
  username: 'testuser',
  email: 'test@example.com',
  phone: '+1234567890',
  selectedPlan: 'monthly',
  paymentMethod: 'interac',
  paymentConfirmation: 'Sent $10.99 via Interac e-Transfer to vissarut.rod@gmail.com',
  submittedAt: new Date().toISOString(),
  status: 'pending'
});

// Storage for website content
let websiteContent = [
  {
    id: 'hero-title',
    title: 'Hero Title',
    content: 'Welcome to Undercovered',
    section: 'landing'
  },
  {
    id: 'hero-subtitle', 
    title: 'Hero Subtitle',
    content: 'Premium content for exclusive members',
    section: 'landing'
  },
  {
    id: 'hero-description',
    title: 'Hero Description', 
    content: 'Access premium media, join our community, and enjoy exclusive content curated just for you.',
    section: 'landing'
  },
  {
    id: 'feature-1-title',
    title: 'Feature 1 - Premium',
    content: 'Premium Quality Content',
    section: 'features'
  },
  {
    id: 'feature-2-title',
    title: 'Feature 2 - Private', 
    content: 'Private & Secure',
    section: 'features'
  },
  {
    id: 'feature-3-title',
    title: 'Feature 3 - Secure',
    content: 'Advanced Security',
    section: 'features'
  },
  {
    id: 'feature-4-title',
    title: 'Feature 4 - Community',
    content: 'Exclusive Community',
    section: 'features'
  }
];

// Storage for announcements
let announcements = [
  {
    _id: 'ann_001',
    title: 'Welcome to Undercovered!',
    content: 'We are excited to launch our premium platform. Enjoy exclusive content, community chat, and admin-curated media.',
    author: 'admin_001',
    createdAt: new Date('2024-01-15'),
    isImportant: true,
    isPublic: true
  },
  {
    _id: 'ann_002',
    title: 'New Video Content Available',
    content: 'Fresh premium video content has been uploaded to the media library. Check out the latest exclusive releases.',
    author: 'admin_001',
    createdAt: new Date('2024-01-10'),
    isImportant: false,
    isPublic: true
  },
  {
    _id: 'ann_003',
    title: 'Community Guidelines',
    content: 'Please remember to follow our community guidelines in the chat room. Be respectful and enjoy the premium experience.',
    author: 'admin_001',
    createdAt: new Date('2024-01-05'),
    isImportant: false,
    isPublic: true
  }
];

// Root API handler
app.all('/api/*', async (req, res) => {
  const path = req.path;
  const method = req.method;
  
  console.log(`🔍 API Request: ${method} ${path}`);
  console.log(`📝 Request body:`, req.body);
  
  try {
    // Try to connect to MongoDB Atlas (fallback to in-memory if not available)
    let mongoConnected = false;
    try {
      await connectToDatabase();
      mongoConnected = true;
      console.log('✅ MongoDB connection successful');
      
      // Seed default data if needed (only runs once)
      if (path === '/api/auth/login' && method === 'POST') {
        await seedDefaultData();
      }
    } catch (mongoError) {
      console.log('⚠️ MongoDB connection failed, using fallback data:', mongoError.message);
      mongoConnected = false;
    }
  
  // Auth Routes
  if (path === '/api/auth/login' && method === 'POST') {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);
    
    let user = null;
    
    if (mongoConnected) {
      // Try MongoDB first
      try {
        user = await User.findOne({ email: email.toLowerCase() });
        console.log('📊 MongoDB user lookup:', user ? 'found' : 'not found');
      } catch (dbError) {
        console.log('❌ MongoDB user lookup failed:', dbError.message);
      }
    }
    
    // Fallback to in-memory users if MongoDB not available or user not found
    if (!user) {
      console.log('🔄 Using fallback user data');
      const fallbackUsers = [
        {
          _id: 'admin_001',
          id: 'admin_001',
          email: 'admin@undercovered.com',
          password: 'admin123456',
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          subscription: { 
            plan: 'enterprise', 
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          },
          stats: { mediaUploaded: 25, totalViews: 1250, joinDate: new Date() }
        },
        {
          _id: 'demo_001',
          id: 'demo_001',
          email: 'demo@undercovered.com',
          password: 'demo123456',
          username: 'demouser',
          firstName: 'Demo',
          lastName: 'User',
          role: 'user',
          subscription: { 
            plan: 'monthly', 
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          stats: { mediaUploaded: 5, totalViews: 123, joinDate: new Date() }
        }
      ];
      
      user = fallbackUsers.find(u => u.email === email && u.password === password);
    }
    
    if (!user || user.password !== password) {
      console.log('❌ Invalid credentials for:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('✅ User authenticated:', user.email);

    const userWithoutPassword = user.toObject ? user.toObject() : { ...user };
    delete userWithoutPassword.password;
    
    // Create real JWT tokens
    const userId = user._id ? (typeof user._id === 'string' ? user._id : user._id.toString()) : user.id;
    const accessToken = jwt.sign(
      { userId: userId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const refreshToken = jwt.sign(
      { userId: userId, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log('🎫 JWT tokens created for:', user.email);
    
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
    try {
      // Check authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization token required' });
      }
      
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = users.find(u => u.id === decoded.userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Check subscription status and expiration
      const hasActiveSubscription = isSubscriptionActive(user);
      if (!hasActiveSubscription) {
        return res.status(403).json({ 
          success: false, 
          message: 'Active subscription required to access media content',
          subscriptionExpired: user.subscription?.status === 'expired',
          expiryDate: user.subscription?.currentPeriodEnd
        });
      }
      
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
        total: transformedMedia.length,
        subscriptionStatus: {
          plan: user.subscription?.plan,
          status: user.subscription?.status,
          expiryDate: user.subscription?.currentPeriodEnd
        }
      });
    } catch (error) {
      console.error('❌ Error fetching media:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch media' });
    }
  }
  
  if (path === '/api/media' && method === 'POST') {
    try {
      console.log('📁 Processing media upload...');
      console.log('📋 Content-Type:', req.headers['content-type']);
      console.log('📋 Body type:', typeof req.body);
      
      // Handle JSON upload with base64 encoded files
      const { files, title, description, tags, visibility } = req.body;
      
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files provided'
        });
      }
      
      const uploadedMedia = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now() + i;
        
        // Validate file data
        if (!file.name || !file.data || !file.type) {
          return res.status(400).json({
            success: false,
            message: `Invalid file data for file ${i + 1}`
          });
        }
        
        // Create media entry
        const newMedia = {
          _id: 'media_' + timestamp,
          title: title || file.name,
          description: description || `Uploaded by admin`,
          type: file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'image',
          filename: file.name,
          url: `data:${file.type};base64,${file.data}`, // Store as data URL for now
          originalMimeType: file.type,
          uploadedBy: 'admin_001',
          uploadDate: new Date(),
          views: 0,
          isPublic: visibility === 'public',
          tags: tags || ['admin-upload'],
          fileSize: Math.floor(file.size) || 1000000,
          duration: file.type.startsWith('video/') || file.type.startsWith('audio/') ? Math.floor(Math.random() * 3600) + 60 : 0
        };
        
        media.unshift(newMedia);
        uploadedMedia.push(newMedia);
        
        console.log(`✅ Uploaded file: ${file.name} (${file.type})`);
      }
      
      return res.status(201).json({
        success: true,
        message: `Successfully uploaded ${uploadedMedia.length} file(s)`,
        data: { media: uploadedMedia }
      });
      
    } catch (error) {
      console.error('❌ Error uploading media:', error);
      return res.status(500).json({
        success: false,
        message: 'Upload failed: ' + error.message
      });
    }
  }
  
  // Chunked file upload endpoint
  if (path === '/api/media/chunk' && method === 'POST') {
    try {
      console.log('🧩 Processing file chunk...');
      
      const { fileId, chunkIndex, totalChunks, fileName, fileType, fileSize, chunkData, isLastChunk } = req.body;
      
      if (!fileId || chunkIndex === undefined || !chunkData) {
        return res.status(400).json({
          success: false,
          message: 'Missing required chunk data'
        });
      }
      
      // Store chunk in memory (in production, use Redis or database)
      if (!global.fileChunks) {
        global.fileChunks = {};
      }
      
      if (!global.fileChunks[fileId]) {
        global.fileChunks[fileId] = {
          chunks: {},
          fileName,
          fileType,
          fileSize,
          totalChunks
        };
      }
      
      // Store this chunk
      global.fileChunks[fileId].chunks[chunkIndex] = chunkData;
      
      console.log(`📦 Stored chunk ${chunkIndex + 1}/${totalChunks} for file ${fileName}`);
      
      // If this is the last chunk, assemble the file
      if (isLastChunk && Object.keys(global.fileChunks[fileId].chunks).length === totalChunks) {
        console.log('🔧 Assembling complete file...');
        
        // Reconstruct file from chunks
        let completeFileData = '';
        for (let i = 0; i < totalChunks; i++) {
          completeFileData += global.fileChunks[fileId].chunks[i];
        }
        
        // Create media entry
        const timestamp = Date.now();
        const newMedia = {
          _id: 'media_' + timestamp,
          title: fileName,
          description: `Large file uploaded via chunked transfer`,
          type: fileType.startsWith('video/') ? 'video' : fileType.startsWith('audio/') ? 'audio' : 'image',
          filename: fileName,
          url: `data:${fileType};base64,${completeFileData}`,
          originalMimeType: fileType,
          uploadedBy: 'admin_001',
          uploadDate: new Date(),
          views: 0,
          isPublic: true,
          tags: ['chunked-upload', 'large-file'],
          fileSize: fileSize,
          duration: fileType.startsWith('video/') || fileType.startsWith('audio/') ? Math.floor(Math.random() * 3600) + 60 : 0
        };
        
        media.unshift(newMedia);
        
        // Clean up chunks from memory
        delete global.fileChunks[fileId];
        
        console.log(`✅ Large file assembled: ${fileName} (${(fileSize / (1024 * 1024)).toFixed(1)}MB)`);
        
        return res.json({
          success: true,
          message: 'File uploaded successfully',
          fileComplete: true,
          data: { media: newMedia }
        });
      }
      
      return res.json({
        success: true,
        message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded`,
        fileComplete: false,
        progress: Math.round(((chunkIndex + 1) / totalChunks) * 100)
      });
      
    } catch (error) {
      console.error('❌ Error processing chunk:', error);
      return res.status(500).json({
        success: false,
        message: 'Chunk upload failed: ' + error.message
      });
    }
  }
  
  // Contact form submission endpoint
  if (path === '/api/contact/payment' && method === 'POST') {
    try {
      console.log('💳 Processing contact form submission...');
      console.log('📋 Content-Type:', req.headers['content-type']);
      console.log('📋 Request body:', req.body);
      
      // Handle both JSON and FormData
      let formData = {};
      
      if (req.headers['content-type']?.includes('application/json')) {
        formData = req.body || {};
      } else {
        // If it's FormData, we need to parse it differently
        // For now, let's assume the data is in req.body
        formData = req.body || {};
      }
      
      const {
        username,
        password,
        email,
        phone,
        selectedPlan,
        paymentMethod,
        paymentConfirmation
      } = formData;

      // Create submission record in MongoDB
      const submission = new ContactSubmission({
        username,
        password, // In production, this should be hashed immediately
        email,
        phone: phone || null,
        selectedPlan,
        paymentMethod,
        paymentConfirmation,
        status: 'pending'
      });

      // Save to MongoDB
      const savedSubmission = await submission.save();
      console.log('✅ Contact submission saved to database:', savedSubmission._id);
      
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
    try {
      console.log('📋 Fetching contact submissions from database...');
      
      const submissions = await ContactSubmission.find()
        .sort({ submittedAt: -1 })
        .lean();
      
      console.log('📋 Found submissions in database:', submissions.length);
      
      const sanitizedSubmissions = submissions.map(sub => ({
        ...sub,
        password: '[REDACTED]' // Don't send passwords in response
      }));
      
      return res.json({
        success: true,
        data: sanitizedSubmissions
      });
    } catch (error) {
      console.error('❌ Error fetching submissions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch submissions'
      });
    }
  }
  
  // User Stats Route
  if (path === '/api/user/stats' && method === 'GET') {
    try {
      console.log('📊 User stats request received');
      
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ No authorization header');
        return res.status(401).json({ success: false, message: 'Authorization token required' });
      }
      
      const token = authHeader.substring(7);
      console.log('🔑 Token extracted, length:', token.length);
      
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ JWT verified, userId:', decoded.userId);
      } catch (jwtError) {
        console.error('❌ JWT verification failed:', jwtError.message);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }
      
      const user = users.find(u => u.id === decoded.userId || u._id === decoded.userId);
      
      if (!user) {
        console.error('❌ User not found for ID:', decoded.userId);
        console.log('📋 Available users:', users.map(u => ({ id: u.id, _id: u._id, email: u.email })));
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      console.log('✅ User found:', user.email);
      
      const userStats = {
        mediaUploaded: user.stats?.mediaUploaded || 0,
        totalViews: user.stats?.totalViews || 0,
        joinDate: user.stats?.joinDate || user.createdAt || new Date().toISOString(),
        subscriptionDays: user.subscription?.status === 'active' ? 30 : 0,
        favoriteContent: 12, // Mock data
      };
      
      console.log('📊 Returning user stats:', userStats);
      return res.json({ success: true, data: userStats });
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      console.error('❌ Stack trace:', error.stack);
      return res.status(500).json({ success: false, message: 'Failed to fetch user stats', error: error.message });
    }
  }
  
  // Subscription Status Route
  if (path === '/api/user/subscription' && method === 'GET') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization token required' });
      }
      
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = users.find(u => u.id === decoded.userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const isActive = isSubscriptionActive(user);
      const now = new Date();
      const expiryDate = user.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd) : null;
      const daysUntilExpiry = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : null;
      
      return res.json({ 
        success: true, 
        data: {
          ...user.subscription,
          isActive,
          daysUntilExpiry,
          hasExpired: expiryDate && now > expiryDate
        }
      });
    } catch (error) {
      console.error('❌ Error fetching subscription status:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch subscription status' });
    }
  }
  
  // Update submission status (admin only)
  if (path.startsWith('/api/contact/submissions/') && method === 'PUT') {
    try {
      const submissionId = path.split('/').pop();
      const { action, notes } = req.body || {};
      
      console.log(`📝 Processing action '${action}' for submission ${submissionId}`);
      
      const submissionIndex = contactSubmissions.findIndex(sub => sub._id === submissionId);
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
              currentPeriodEnd: new Date(Date.now() + (
                submission.selectedPlan === '6month' ? 180 : 30
              ) * 24 * 60 * 60 * 1000), // 180 days for 6-month, 30 days for monthly
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
          
          break;
          
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid action'
          });
      }
      
      return res.json({
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
      return res.status(500).json({
        success: false,
        message: 'Error processing request'
      });
    }
  }
  
  // Content Management Routes
  if (path === '/api/admin/content' && method === 'GET') {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization required' });
      }
      
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = users.find(u => (u.id === decoded.userId || u._id === decoded.userId));
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }
      
      return res.json({
        success: true,
        content: websiteContent
      });
    } catch (error) {
      console.error('❌ Error fetching content:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch content' });
    }
  }
  
  if (path === '/api/admin/content' && method === 'POST') {
    try {
      // Check if user is admin
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization required' });
      }
      
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = users.find(u => (u.id === decoded.userId || u._id === decoded.userId));
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }
      
      const { content } = req.body;
      if (!content || !Array.isArray(content)) {
        return res.status(400).json({ success: false, message: 'Invalid content data' });
      }
      
      // Update website content
      websiteContent = content;
      
      console.log('✅ Website content updated by admin:', user.email);
      
      return res.json({
        success: true,
        message: 'Content updated successfully',
        content: websiteContent
      });
    } catch (error) {
      console.error('❌ Error updating content:', error);
      return res.status(500).json({ success: false, message: 'Failed to update content' });
    }
  }
  
  // Public content endpoint for frontend to fetch content
  if (path === '/api/content' && method === 'GET') {
    return res.json({
      success: true,
      content: websiteContent
    });
  }
  
  // Announcements Routes
  if (path === '/api/announcements' && method === 'GET') {
    const transformedAnnouncements = announcements.map(ann => ({
      ...ann,
      author: ann.author === 'admin_001' ? 'Admin' : 'Unknown',
      createdAt: ann.createdAt.toISOString()
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return res.json({
      success: true,
      data: {
        announcements: transformedAnnouncements,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: transformedAnnouncements.length,
          itemsPerPage: 10
        }
      }
    });
  }
  
  if (path === '/api/announcements' && method === 'POST') {
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
    
    announcements.unshift(newAnnouncement);
    console.log('📢 New announcement created:', newAnnouncement._id);
    
    return res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: { announcement: newAnnouncement }
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
      'GET /api/contact/submissions',
      'PUT /api/contact/submissions/:id',
      'GET /api/announcements',
      'POST /api/announcements'
    ]
  });
  
  } catch (error) {
    console.error(`❌ Server error in ${method} ${path}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      path: path,
      method: method
    });
  }
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
      'GET /api/contact/submissions',
      'PUT /api/contact/submissions/:id',
      'GET /api/announcements',
      'POST /api/announcements'
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
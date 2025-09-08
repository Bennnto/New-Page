const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/undercovered');
    console.log('✅ Connected to MongoDB successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@undercovered.com' },
        { username: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      console.log('🎭 Role:', existingAdmin.role);
      
      // Update existing admin if needed
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.subscription.status = 'active';
        existingAdmin.subscription.plan = 'premium';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
      
      return;
    }

    // Create new admin user
    console.log('👑 Creating admin user...');
    
    const adminUser = new User({
      email: 'admin@undercovered.com',
      password: 'admin123456', // Will be hashed automatically
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      subscription: {
        status: 'active',
        plan: 'premium'
      },
      isActive: true
    });

    await adminUser.save();
    
    console.log('🎉 Admin user created successfully!');
    console.log('');
    console.log('📋 ADMIN CREDENTIALS:');
    console.log('📧 Email: admin@undercovered.com');
    console.log('🔑 Password: admin123456');
    console.log('👤 Username: admin');
    console.log('🎭 Role: admin');
    console.log('💳 Subscription: Premium (Active)');
    console.log('');
    console.log('🚀 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.message.includes('Could not connect')) {
      console.log('');
      console.log('🔧 MONGODB CONNECTION HELP:');
      console.log('1. Make sure your MongoDB Atlas cluster is running');
      console.log('2. Check your IP is whitelisted in MongoDB Atlas');
      console.log('3. Verify your MongoDB connection string in .env file');
      console.log('4. Or install MongoDB locally: brew install mongodb-community');
    }
  } finally {
    mongoose.connection.close();
  }
};

// Demo user credentials for development
const createDemoUsers = async () => {
  try {
    console.log('👥 Creating demo users...');
    
    const demoUsers = [
      {
        email: 'demo@undercovered.com',
        password: 'demo123456',
        username: 'demouser',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        subscription: { status: 'active', plan: 'premium' }
      },
      {
        email: 'user@undercovered.com',
        password: 'user123456',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        subscription: { status: 'active', plan: 'basic' }
      }
    ];

    for (const userData of demoUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created demo user: ${userData.email}`);
      } else {
        console.log(`ℹ️  Demo user already exists: ${userData.email}`);
      }
    }

  } catch (error) {
    console.error('❌ Error creating demo users:', error.message);
  }
};

// Run the script
const runSeeder = async () => {
  console.log('🌱 UNDERCOVERED ADMIN SEEDER');
  console.log('============================');
  
  await createAdminUser();
  await createDemoUsers();
  
  console.log('');
  console.log('🎯 AVAILABLE LOGIN CREDENTIALS:');
  console.log('');
  console.log('👑 ADMIN:');
  console.log('   Email: admin@undercovered.com');
  console.log('   Password: admin123456');
  console.log('');
  console.log('👤 DEMO USERS:');
  console.log('   Email: demo@undercovered.com');
  console.log('   Password: demo123456');
  console.log('');
  console.log('   Email: user@undercovered.com');
  console.log('   Password: user123456');
  console.log('');
  
  process.exit(0);
};

runSeeder();

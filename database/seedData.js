const User = require('./models/User');
const WebsiteContent = require('./models/WebsiteContent');
const ContactSubmission = require('./models/ContactSubmission');

const seedDefaultData = async () => {
  try {
    console.log('🌱 Seeding default data...');

    // Create default admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@undercovered.com' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: 'admin@undercovered.com', 
        password: 'admin123456', // In production, this should be hashed!
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        subscription: {
          plan: 'enterprise',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        },
        stats: {
          mediaUploaded: 25,
          totalViews: 1250
        }
      });
      await admin.save();
      console.log('👑 Default admin user created');
    }

    // Create demo user if doesn't exist
    const demoExists = await User.findOne({ email: 'demo@undercovered.com' });
    if (!demoExists) {
      const demo = new User({
        username: 'demouser',
        email: 'demo@undercovered.com',
        password: 'demo123456',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        subscription: {
          plan: 'monthly',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        stats: {
          mediaUploaded: 5,
          totalViews: 123
        }
      });
      await demo.save();
      console.log('👤 Default demo user created');
    }

    // Seed default website content
    const defaultContent = [
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

    for (const contentItem of defaultContent) {
      const exists = await WebsiteContent.findOne({ id: contentItem.id });
      if (!exists) {
        await WebsiteContent.create(contentItem);
      }
    }
    console.log('📝 Default website content seeded');

    // Create a test contact submission
    const testSubmissionExists = await ContactSubmission.findOne({ email: 'test@example.com' });
    if (!testSubmissionExists) {
      await ContactSubmission.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpass123',
        phone: '+1234567890',
        selectedPlan: 'monthly',
        paymentMethod: 'interac',
        paymentConfirmation: 'Sent $10.99 via Interac e-Transfer to vissarut.rod@gmail.com',
        status: 'pending'
      });
      console.log('📋 Test contact submission created');
    }

    console.log('✅ Default data seeding completed');
    
  } catch (error) {
    console.error('❌ Error seeding default data:', error);
    throw error;
  }
};

module.exports = seedDefaultData;

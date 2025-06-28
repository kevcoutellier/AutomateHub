require('dotenv').config();
const mongoose = require('mongoose');

async function seedWithLogs() {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('📡 MongoDB URI:', process.env.MONGODB_URI ? 'Set (Atlas)' : 'Not set (using localhost)');
    
    // Connect to database
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/automatehub';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    const collections = ['users', 'experts', 'projects', 'reviews'];
    for (const collection of collections) {
      const result = await mongoose.connection.db.collection(collection).deleteMany({});
      console.log(`🗑️  Cleared ${result.deletedCount} documents from ${collection}`);
    }

    // Create sample users
    const sampleUsers = [
      {
        email: 'client@automatehub.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'client',
        isEmailVerified: true
      },
      {
        email: 'sarah.chen@automatehub.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Chen',
        role: 'expert',
        isEmailVerified: true
      },
      {
        email: 'marcus.rodriguez@automatehub.com',
        password: 'password123',
        firstName: 'Marcus',
        lastName: 'Rodriguez',
        role: 'expert',
        isEmailVerified: true
      },
      {
        email: 'emily.watson@automatehub.com',
        password: 'password123',
        firstName: 'Emily',
        lastName: 'Watson',
        role: 'expert',
        isEmailVerified: true
      }
    ];

    // Insert users directly without password hashing for now
    const bcrypt = require('bcryptjs');
    const hashedUsers = await Promise.all(sampleUsers.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 12),
      createdAt: new Date(),
      updatedAt: new Date()
    })));

    const userResult = await mongoose.connection.db.collection('users').insertMany(hashedUsers);
    console.log(`👥 Created ${userResult.insertedCount} users`);

    // Get inserted user IDs
    const insertedUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    const expertUsers = insertedUsers.filter(user => user.role === 'expert');
    const clientUser = insertedUsers.find(user => user.role === 'client');

    console.log(`🔧 Found ${expertUsers.length} expert users`);

    // Create sample expert profile
    if (expertUsers.length > 0) {
      const sampleExpert = {
        userId: expertUsers[0]._id,
        name: 'Sarah Chen',
        title: 'E-commerce Automation Specialist',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
        location: 'San Francisco, CA',
        timezone: 'PST (UTC-8)',
        rating: 4.9,
        reviewCount: 47,
        projectsCompleted: 47,
        successRate: 98,
        responseTime: '< 2 hours',
        hourlyRate: { min: 85, max: 120, currency: 'USD' },
        availability: 'available',
        nextAvailable: 'Immediately',
        specialties: ['E-commerce Integration', 'Shopify Automation', 'Multi-platform Sync', 'Data Analytics'],
        industries: ['E-commerce', 'Retail', 'SaaS'],
        certifications: ['n8n Certified Professional', 'Shopify Partner'],
        languages: ['English', 'Mandarin'],
        experience: '5+ years',
        completionTime: '1-2 weeks',
        recentProject: 'Automated order processing for 10K+ orders/month',
        featured: true,
        bio: 'Specialized in e-commerce automation with deep expertise in Shopify, WooCommerce, and multi-platform integrations.',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const expertResult = await mongoose.connection.db.collection('experts').insertOne(sampleExpert);
      console.log(`🔧 Created expert profile: ${expertResult.insertedId}`);

      // Create sample project
      if (clientUser) {
        const sampleProject = {
          title: 'E-commerce Order Processing Automation',
          description: 'Automate our Shopify order processing workflow to reduce manual work and improve accuracy.',
          status: 'in-progress',
          progress: 65,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-02-28'),
          budget: { total: 8500, spent: 5500, currency: 'USD' },
          expertId: expertResult.insertedId,
          clientId: clientUser._id,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const projectResult = await mongoose.connection.db.collection('projects').insertOne(sampleProject);
        console.log(`📋 Created project: ${projectResult.insertedId}`);

        // Create sample review
        const sampleReview = {
          expertId: expertResult.insertedId,
          clientId: clientUser._id,
          projectId: projectResult.insertedId,
          rating: 5,
          comment: 'Sarah did an amazing job automating our order processing. Highly recommend!',
          aspects: {
            communication: 5,
            quality: 5,
            timeliness: 4,
            expertise: 5
          },
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const reviewResult = await mongoose.connection.db.collection('reviews').insertOne(sampleReview);
        console.log(`⭐ Created review: ${reviewResult.insertedId}`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📧 Sample login credentials:');
    console.log('Client: client@automatehub.com / password123');
    console.log('Expert: sarah.chen@automatehub.com / password123');
    console.log('Expert: marcus.rodriguez@automatehub.com / password123');
    console.log('Expert: emily.watson@automatehub.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

seedWithLogs();

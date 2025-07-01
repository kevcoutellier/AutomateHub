import mongoose from 'mongoose';
import { config } from '../config/config';
import { UserModel } from '../models/User';

const createAdminAccount = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('Database URI:', config.database.uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    // Connect to database with timeout
    await mongoose.connect(config.database.uri, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    console.log('✅ Connected to MongoDB successfully');

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ 
      $or: [
        { email: 'admin@automatehub.com' },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin account already exists:');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`Role: ${existingAdmin.role}`);
      return;
    }

    // Create admin user
    const adminUser = {
      email: 'admin@automatehub.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'AutomateHub',
      role: 'admin',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const createdAdmin = await UserModel.create(adminUser);
    console.log('✅ Admin account created successfully!');
    console.log('\n🔐 Admin Login Credentials:');
    console.log('Email: admin@automatehub.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log(`User ID: ${createdAdmin._id}`);
    console.log('\n⚠️  IMPORTANT: Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('E11000')) {
        console.log('⚠️  Admin account with this email already exists');
      } else {
        console.log('Error details:', error.message);
      }
    }
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  createAdminAccount();
}

export { createAdminAccount };

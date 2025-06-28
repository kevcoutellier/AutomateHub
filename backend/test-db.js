const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/automatehub');
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Make sure MongoDB is running on localhost:27017');
  }
}

testConnection();

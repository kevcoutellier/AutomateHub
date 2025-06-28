require('dotenv').config();
const mongoose = require('mongoose');

async function checkExpertStructure() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/automatehub';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = mongoose.connection.db;
    
    // Get one expert to see the structure
    const expert = await db.collection('experts').findOne({});
    console.log('\n🔧 Expert data structure:');
    console.log(JSON.stringify(expert, null, 2));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkExpertStructure();

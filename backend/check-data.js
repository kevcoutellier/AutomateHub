const mongoose = require('mongoose');

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/automatehub');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check users
    const users = await db.collection('users').find({}).toArray();
    console.log(`👥 Users: ${users.length}`);
    users.forEach(user => console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`));
    
    // Check experts
    const experts = await db.collection('experts').find({}).toArray();
    console.log(`\n🔧 Experts: ${experts.length}`);
    experts.forEach(expert => console.log(`  - ${expert.name} (${expert.title})`));
    
    // Check projects
    const projects = await db.collection('projects').find({}).toArray();
    console.log(`\n📋 Projects: ${projects.length}`);
    projects.forEach(project => console.log(`  - ${project.title} (${project.status})`));
    
    // Check reviews
    const reviews = await db.collection('reviews').find({}).toArray();
    console.log(`\n⭐ Reviews: ${reviews.length}`);
    reviews.forEach(review => console.log(`  - Rating: ${review.rating}/5`));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();

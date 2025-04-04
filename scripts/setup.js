require('dotenv').config();
const mongoose = require('mongoose');
const Ad = require('../server/models/ad.model');
const User = require('../server/models/user.model');

async function verifySetup() {
  console.log('Verifying setup...');

  try {
    // Connect to MongoDB with explicit timeouts
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/date_night', {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log('✓ MongoDB connection successful');

    // Create collections first - without using models
    console.log('Creating collections...');
    const db = mongoose.connection.db;
    
    try {
      await db.createCollection('users');
      await db.createCollection('ads');
      console.log('✓ Collections created');
    } catch (err) {
      console.log('Collections already exist, continuing...');
    }

    // Create indexes
    console.log('Creating indexes...');
    await Promise.all([
      // Ad indexes
      db.collection('ads').createIndex({ location: '2dsphere' }),
      db.collection('ads').createIndex({ advertiser: 1 }),
      db.collection('ads').createIndex({ category: 1 }),
      db.collection('ads').createIndex({ county: 1 }),
      
      // User indexes
      db.collection('users').createIndex({ username: 1 }, { unique: true }),
      db.collection('users').createIndex({ 'socialProfiles.github.id': 1 }),
      db.collection('users').createIndex({ 'socialProfiles.google.id': 1 }),
      db.collection('users').createIndex({ 'socialProfiles.reddit.id': 1 })
    ]);
    console.log('✓ Indexes created');

    // Verify environment variables
    const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length) {
      throw new Error('Missing required environment variables: ' + missingVars.join(', '));
    }
    console.log('✓ Environment variables verified');

    console.log('\n✨ Setup verification complete!');
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Setup verification failed:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error(`
MongoDB Connection Error:
1. Make sure MongoDB is running:
   $ mongod --dbpath ./data/db
2. In a new terminal, verify MongoDB is running:
   $ mongosh
3. Run setup again:
   $ node scripts/setup.js
      `);
    }
    
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

verifySetup();

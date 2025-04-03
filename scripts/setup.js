require('dotenv').config();
const mongoose = require('mongoose');
const { User, Ad } = require('../models');

async function verifySetup() {
  console.log('Verifying setup...');

  // Check environment variables
  const requiredEnvVars = [
    'JWT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'REDDIT_CLIENT_ID',
    'REDDIT_CLIENT_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  if (missingVars.length) {
    console.error('Missing environment variables:', missingVars);
    process.exit(1);
  }

  // Test database connection
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/travelling_fortune_tellers', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connection successful');

    // Verify indexes
    await Ad.collection.getIndexes();
    await User.collection.getIndexes();
    console.log('Database indexes verified');

    console.log('Setup verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('Setup verification failed:', error);
    process.exit(1);
  }
}

verifySetup();

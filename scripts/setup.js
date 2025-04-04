require('dotenv').config();
const mongoose = require('mongoose');
const { User, Ad } = require('../server/components');

async function verifySetup() {
  console.log('Verifying setup...');
  console.log('Checking MongoDB connection...');

  try {
    // Check if MongoDB is running
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/date_night');
    console.log('✓ MongoDB connection successful');

    // Verify models and indexes
    await Promise.all([
      Ad.collection.getIndexes(),
      User.collection.getIndexes()
    ]);
    console.log('✓ Database indexes verified');

    // Check environment variables
    const requiredEnvVars = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length) {
      console.error('❌ Missing required environment variables:', missingVars);
      process.exit(1);
    }
    console.log('✓ Environment variables verified');

    console.log('\nSetup verification complete! ✨');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup verification failed:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error(`
Make sure MongoDB is running:
1. Start MongoDB:
   $ mongod
2. In a new terminal, verify MongoDB is running:
   $ mongosh
3. Run setup again:
   $ node scripts/setup.js
      `);
    } else {
      console.error(error);
    }
    
    process.exit(1);
  }
}

verifySetup();

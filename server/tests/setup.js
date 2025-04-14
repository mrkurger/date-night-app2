// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for test environment setup
// 
// COMMON CUSTOMIZATIONS:
// - TEST_MONGODB_URI: MongoDB connection string for tests (default: mongodb://localhost:27017/datenight_test)
//   Related to: server/config/environment.js:mongoUri
// - MOCK_JWT_SECRET: Secret used for JWT in tests (default: 'test_jwt_secret')
//   Related to: server/config/environment.js:jwtSecret
// ===================================================

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup function to be called before tests
module.exports.setupTestDB = async () => {
  // Create an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
};

// Teardown function to be called after tests
module.exports.teardownTestDB = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

// Reset database between tests
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.SESSION_SECRET = 'test_session_secret';
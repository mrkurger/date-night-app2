import type { jest } from '@jest/globals';
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

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

/**
 * Setup function to be called before tests
 * Creates an in-memory MongoDB server and connects to it
 * @returns {Promise<void>}
 */
export const setupTestDB = async (): Promise<void> => {
  // Create an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);

  console.log(`Connected to in-memory MongoDB at ${mongoUri}`);
};

/**
 * Teardown function to be called after tests
 * Disconnects from MongoDB and stops the in-memory server
 * @returns {Promise<void>}
 */
export const teardownTestDB = async (): Promise<void> => {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('Disconnected from in-memory MongoDB');
};

/**
 * Reset database between tests
 * Clears all collections in the database
 * @returns {Promise<void>}
 */
export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  // console.log('Database cleared'); // Silenced to reduce test output noise
};

/**
 * Mock a mongoose model for testing
 * @param {Object} Model - The mongoose model to mock
 * @param {Object} mockData - The mock data to return
 * @returns {Object} - The mocked model
 */
export const mockModel = (Model, mockData): void => {
  // Save the original methods
  const originalMethods = {
    find: Model.find,
    findById: Model.findById,
    findOne: Model.findOne,
    create: Model.create,
    save: Model.prototype.save,
  };

  // Mock the methods
  Model.find = jest.fn().mockResolvedValue(mockData);
  Model.findById = jest.fn().mockResolvedValue(mockData[0]);
  Model.findOne = jest.fn().mockResolvedValue(mockData[0]);
  Model.create = jest.fn().mockResolvedValue(mockData[0]);
  Model.prototype.save = jest.fn().mockResolvedValue(mockData[0]);

  // Return a function to restore the original methods
  return () => {
    Model.find = originalMethods.find;
    Model.findById = originalMethods.findById;
    Model.findOne = originalMethods.findOne;
    Model.create = originalMethods.create;
    Model.prototype.save = originalMethods.save;
  };
};

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.SESSION_SECRET = 'test_session_secret';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_token_secret';
process.env.STRIPE_SECRET_KEY = 'test_stripe_secret_key';
process.env.STRIPE_WEBHOOK_SECRET = 'test_stripe_webhook_secret';

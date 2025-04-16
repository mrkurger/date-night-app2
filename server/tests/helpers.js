// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains helper functions for testing
//
// COMMON CUSTOMIZATIONS:
// - TEST_USER_DATA: Default test user data (default: see object below)
//   Related to: server/models/user.model.js
// - MOCK_TOKEN_GENERATION: Settings for token generation in tests
//   Related to: server/services/auth.service.js
// ===================================================

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user.model');

// Default test user data
const TEST_USER_DATA = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '+4712345678',
  dateOfBirth: new Date('1990-01-01'),
  gender: 'other',
  location: {
    city: 'Oslo',
    country: 'Norway',
  },
};

// Default test ad data
const TEST_AD_DATA = {
  title: 'Test Ad',
  description: 'This is a test ad',
  price: 100,
  location: 'Oslo',
  category: 'Dinner',
  media: [{ url: '/assets/images/test-image-1.jpg', type: 'image' }],
  images: ['/assets/images/test-image-1.jpg'],
  advertiser: 'Test User',
  isActive: true,
  isFeatured: false,
  isTrending: false,
  isTouring: false,
  viewCount: 0,
  clickCount: 0,
  inquiryCount: 0,
  tags: ['tag1', 'tag2'],
};

// Default test message data
const TEST_MESSAGE_DATA = {
  content: 'This is a test message',
  sender: new mongoose.Types.ObjectId(),
  receiver: new mongoose.Types.ObjectId(),
  roomId: new mongoose.Types.ObjectId(),
  isRead: false,
};

/**
 * Create a test user in the database
 * @param {Object} userData - Optional user data to override defaults
 * @returns {Promise<Object>} The created user object
 */
const createTestUser = async (userData = {}) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(
    userData.password || TEST_USER_DATA.password,
    saltRounds
  );

  const user = new User({
    ...TEST_USER_DATA,
    ...userData,
    password: hashedPassword,
  });

  await user.save();
  return user;
};

/**
 * Create multiple test users in the database
 * @param {number} count - Number of users to create
 * @param {Object} baseUserData - Base user data to use for all users
 * @returns {Promise<Array<Object>>} Array of created user objects
 */
const createTestUsers = async (count, baseUserData = {}) => {
  const users = [];

  for (let i = 0; i < count; i++) {
    const userData = {
      ...baseUserData,
      username: `testuser${i}`,
      email: `test${i}@example.com`,
    };

    const user = await createTestUser(userData);
    users.push(user);
  }

  return users;
};

/**
 * Generate a valid JWT token for testing
 * @param {string} userId - User ID to include in the token
 * @param {Object} additionalClaims - Additional claims to include in the token
 * @returns {string} JWT token
 */
const generateTestToken = (userId, additionalClaims = {}) => {
  return jwt.sign(
    {
      sub: userId,
      ...additionalClaims,
    },
    process.env.JWT_SECRET || 'test_jwt_secret',
    { expiresIn: '1h' }
  );
};

/**
 * Generate a refresh token for testing
 * @param {string} userId - User ID to include in the token
 * @returns {string} Refresh token
 */
const generateRefreshToken = userId => {
  return jwt.sign(
    { sub: userId },
    process.env.REFRESH_TOKEN_SECRET || 'test_refresh_token_secret',
    { expiresIn: '7d' }
  );
};

/**
 * Create a test request with authentication headers
 * @param {Object} request - Supertest request object
 * @param {string} token - JWT token
 * @returns {Object} Request with auth headers
 */
const authenticatedRequest = (request, token) => {
  return request.set('Authorization', `Bearer ${token}`);
};

/**
 * Create a mock request object for middleware testing
 * @param {Object} options - Request options
 * @returns {Object} Mock request object
 */
const mockRequest = (options = {}) => {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    ...options,
  };

  return req;
};

/**
 * Create a mock response object for middleware testing
 * @returns {Object} Mock response object with jest spy methods
 */
const mockResponse = () => {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.locals = {};

  return res;
};

/**
 * Create a mock next function for middleware testing
 * @returns {Function} Jest spy function
 */
const mockNext = jest.fn();

/**
 * Create a mock error for testing error handling
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} Error object with statusCode
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Create a timing utility for performance testing
 * @returns {Object} Timing utility object
 */
const createTimingUtil = () => {
  const startTime = process.hrtime();

  return {
    /**
     * Get elapsed time in milliseconds
     * @returns {number} Elapsed time in milliseconds
     */
    getElapsedTimeInMs: () => {
      const elapsedTime = process.hrtime(startTime);
      return elapsedTime[0] * 1000 + elapsedTime[1] / 1000000;
    },
  };
};

module.exports = {
  TEST_USER_DATA,
  TEST_AD_DATA,
  TEST_MESSAGE_DATA,
  createTestUser,
  createTestUsers,
  generateTestToken,
  generateRefreshToken,
  authenticatedRequest,
  mockRequest,
  mockResponse,
  mockNext,
  createError,
  createTimingUtil,
};

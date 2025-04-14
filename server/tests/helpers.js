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
    country: 'Norway'
  }
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
    password: hashedPassword
  });
  
  await user.save();
  return user;
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
      ...additionalClaims
    },
    process.env.JWT_SECRET || 'test_jwt_secret',
    { expiresIn: '1h' }
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

module.exports = {
  TEST_USER_DATA,
  createTestUser,
  generateTestToken,
  authenticatedRequest
};
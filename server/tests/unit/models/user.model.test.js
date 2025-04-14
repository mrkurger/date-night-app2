// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the user model
// 
// COMMON CUSTOMIZATIONS:
// - TEST_USER_DATA: Test user data (default: imported from helpers)
//   Related to: server/tests/helpers.js:TEST_USER_DATA
// ===================================================

const mongoose = require('mongoose');
const User = require('../../../models/user.model');
const { setupTestDB, teardownTestDB, clearDatabase } = require('../../setup');
const { TEST_USER_DATA } = require('../../helpers');

describe('User Model', () => {
  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Clear database between tests
  afterEach(async () => {
    await clearDatabase();
  });

  it('should create a new user successfully', async () => {
    const user = new User(TEST_USER_DATA);
    const savedUser = await user.save();
    
    // Verify the saved user
    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(TEST_USER_DATA.username);
    expect(savedUser.email).toBe(TEST_USER_DATA.email);
    // Check that the user was saved successfully
    // The model might not have all the fields from TEST_USER_DATA
    // Just verify the required fields are present
    expect(savedUser.password).toBeDefined();
    expect(savedUser.role).toBe('user'); // Default role
  });

  it('should require username, email, and password', async () => {
    const userWithoutRequiredFields = new User({
      firstName: 'Test',
      lastName: 'User'
    });

    // Expect validation to fail
    await expect(userWithoutRequiredFields.save()).rejects.toThrow();
  });

  it('should not allow duplicate usernames', async () => {
    // Create first user
    const user1 = new User(TEST_USER_DATA);
    await user1.save();
    
    // Try to create second user with same username
    const user2 = new User({
      ...TEST_USER_DATA,
      email: 'different@example.com' // Different email
    });
    
    // Expect duplicate username to throw error
    await expect(user2.save()).rejects.toThrow();
  });

  it('should not allow duplicate emails', async () => {
    // Create first user
    const user1 = new User(TEST_USER_DATA);
    await user1.save();
    
    // Try to create second user with same email
    const user2 = new User({
      ...TEST_USER_DATA,
      username: 'differentuser' // Different username
    });
    
    // Expect duplicate email to throw error
    await expect(user2.save()).rejects.toThrow();
  });

  it('should validate email format', async () => {
    const userWithInvalidEmail = new User({
      ...TEST_USER_DATA,
      email: 'invalid-email'
    });
    
    // Expect invalid email to throw error
    await expect(userWithInvalidEmail.save()).rejects.toThrow();
  });

  // Add more tests as needed for other validation rules
});
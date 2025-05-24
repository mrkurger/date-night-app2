import type { jest } from '@jest/globals';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the user model
//
// COMMON CUSTOMIZATIONS:
// - TEST_USER_DATA: Test user data (default: imported from helpers)
//   Related to: server/tests/helpers.js:TEST_USER_DATA
// ===================================================

import mongoose from 'mongoose';
import argon2 from 'argon2';
import bcrypt from 'bcrypt';
import User from '../../../models/user.model.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.js';
import { TEST_USER_DATA } from '../../helpers.js';

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

  describe('Basic Validation', () => {
    it('should create a new user successfully', async () => {
      const user = new User(TEST_USER_DATA);
      const savedUser = await user.save();

      // Verify the saved user
      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(TEST_USER_DATA.username);
      expect(savedUser.email).toBe(TEST_USER_DATA.email);
      expect(savedUser.password).toBeDefined();
      expect(savedUser.role).toBe('user'); // Default role
      expect(savedUser.verified).toBe(false); // Default verified status
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should require username, email, and password', async () => {
      const userWithoutRequiredFields = new User({
        firstName: 'Test',
        lastName: 'User',
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
        email: 'different@example.com', // Different email
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
        username: 'differentuser', // Different username
      });

      // Expect duplicate email to throw error
      await expect(user2.save()).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userWithInvalidEmail = new User({
        ...TEST_USER_DATA,
        email: 'invalid-email',
      });

      // Expect invalid email to throw error
      await expect(userWithInvalidEmail.save()).rejects.toThrow();
    });

    it('should enforce minimum username length', async () => {
      const userWithShortUsername = new User({
        ...TEST_USER_DATA,
        username: 'ab', // Too short (min is 3)
      });

      await expect(userWithShortUsername.save()).rejects.toThrow();
    });

    it('should enforce maximum username length', async () => {
      const userWithLongUsername = new User({
        ...TEST_USER_DATA,
        username: 'a'.repeat(31), // Too long (max is 30)
      });

      await expect(userWithLongUsername.save()).rejects.toThrow();
    });

    it('should enforce minimum password length', async () => {
      const userWithShortPassword = new User({
        ...TEST_USER_DATA,
        password: 'short', // Too short (min is 8)
      });

      await expect(userWithShortPassword.save()).rejects.toThrow();
    });

    it('should trim whitespace from username and email', async () => {
      const userWithWhitespace = new User({
        ...TEST_USER_DATA,
        username: '  testuser  ',
        email: '  test@example.com  ',
      });

      const savedUser = await userWithWhitespace.save();

      expect(savedUser.username).toBe('testuser');
      expect(savedUser.email).toBe('test@example.com');
    });

    it('should convert email to lowercase', async () => {
      const userWithUppercaseEmail = new User({
        ...TEST_USER_DATA,
        email: 'TEST@EXAMPLE.COM',
      });

      const savedUser = await userWithUppercaseEmail.save();

      expect(savedUser.email).toBe('test@example.com');
    });
  });

  describe('Password Handling', () => {
    it('should hash password before saving', async () => {
      const user = new User(TEST_USER_DATA);
      const savedUser = await user.save();

      // Password should be hashed
      expect(savedUser.password).not.toBe(TEST_USER_DATA.password);
      expect(savedUser.password.startsWith('$argon2')).toBe(true);
    });

    it('should set passwordChangedAt when password is changed', async () => {
      // Create a user
      const user = new User(TEST_USER_DATA);
      const savedUser = await user.save();

      // Initial passwordChangedAt should be set
      expect(savedUser.passwordChangedAt).toBeDefined();

      // Store the initial timestamp
      const initialPasswordChangedAt = savedUser.passwordChangedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Change password
      savedUser.password = 'NewPassword123!';
      await savedUser.save();

      // passwordChangedAt should be updated
      expect(savedUser.passwordChangedAt).not.toEqual(initialPasswordChangedAt);
    });

    it('should not rehash password if not modified', async () => {
      // Create a user
      const user = new User(TEST_USER_DATA);
      const savedUser = await user.save();

      // Store the hashed password
      const hashedPassword = savedUser.password;

      // Update a field other than password
      savedUser.firstName = 'Updated';
      await savedUser.save();

      // Password hash should remain the same
      expect(savedUser.password).toBe(hashedPassword);
    });

    it('should correctly compare valid password with comparePassword method', async () => {
      // Create a user
      const user = new User(TEST_USER_DATA);
      const savedUser = await user.save();

      // Compare with correct password
      const isMatch = await savedUser.comparePassword(TEST_USER_DATA.password);

      expect(isMatch).toBe(true);
    });

    it('should correctly compare invalid password with comparePassword method', async () => {
      // Create a user
      const user = new User(TEST_USER_DATA);
      const savedUser = await user.save();

      // Compare with incorrect password
      const isMatch = await savedUser.comparePassword('wrongpassword');

      expect(isMatch).toBe(false);
    });

    it('should handle bcrypt hashed passwords in comparePassword method', async () => {
      // Create a user with bcrypt hashed password
      const bcryptHash = await bcrypt.hash(TEST_USER_DATA.password, 10);
      const user = new User({
        ...TEST_USER_DATA,
        password: bcryptHash,
      });

      // Save without triggering the pre-save hook (to keep the bcrypt hash)
      const savedUser = await User.create(user);

      // Compare with correct password
      const isMatch = await savedUser.comparePassword(TEST_USER_DATA.password);

      expect(isMatch).toBe(true);
    });
  });

  describe('Role Methods', () => {
    it('should correctly identify an advertiser with isAdvertiser method', async () => {
      // Create an advertiser user
      const advertiserUser = new User({
        ...TEST_USER_DATA,
        username: 'advertiser',
        email: 'advertiser@example.com',
        role: 'advertiser',
      });

      const savedUser = await advertiserUser.save();

      expect(savedUser.isAdvertiser()).toBe(true);
      expect(savedUser.isAdmin()).toBe(false);
    });

    it('should correctly identify an admin with isAdmin method', async () => {
      // Create an admin user
      const adminUser = new User({
        ...TEST_USER_DATA,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
      });

      const savedUser = await adminUser.save();

      expect(savedUser.isAdmin()).toBe(true);
      expect(savedUser.isAdvertiser()).toBe(false);
    });

    it('should correctly identify a regular user with role methods', async () => {
      // Create a regular user
      const regularUser = new User(TEST_USER_DATA);

      const savedUser = await regularUser.save();

      expect(savedUser.isAdmin()).toBe(false);
      expect(savedUser.isAdvertiser()).toBe(false);
    });
  });

  describe('Travel Plan Methods', () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(now);
    nextMonth.setDate(nextMonth.getDate() + 30);

    it('should correctly identify active travel plans', async () => {
      // Create a user with active, future, and past travel plans
      const user = new User({
        ...TEST_USER_DATA,
        travelPlan: [
          // Active plan (started yesterday, ends tomorrow)
          {
            location: {
              type: 'Point',
              coordinates: [10.7522, 59.9139], // Oslo
            },
            county: 'Oslo',
            city: 'Oslo',
            startDate: yesterday,
            endDate: tomorrow,
            active: true,
          },
          // Future plan
          {
            location: {
              type: 'Point',
              coordinates: [5.3221, 60.3913], // Bergen
            },
            county: 'Vestland',
            city: 'Bergen',
            startDate: nextWeek,
            endDate: nextMonth,
            active: true,
          },
          // Inactive plan (should be excluded even if date range is current)
          {
            location: {
              type: 'Point',
              coordinates: [10.3951, 63.4305], // Trondheim
            },
            county: 'Trøndelag',
            city: 'Trondheim',
            startDate: yesterday,
            endDate: tomorrow,
            active: false,
          },
        ],
      });

      const savedUser = await user.save();

      // Get active travel plans
      const activePlans = savedUser.getActiveTravelPlans();

      expect(activePlans.length).toBe(1);
      expect(activePlans[0].city).toBe('Oslo');
    });

    it('should correctly identify upcoming travel plans', async () => {
      // Create a user with active, future, and past travel plans
      const user = new User({
        ...TEST_USER_DATA,
        travelPlan: [
          // Active plan (started yesterday, ends tomorrow)
          {
            location: {
              type: 'Point',
              coordinates: [10.7522, 59.9139], // Oslo
            },
            county: 'Oslo',
            city: 'Oslo',
            startDate: yesterday,
            endDate: tomorrow,
            active: true,
          },
          // Future plan 1
          {
            location: {
              type: 'Point',
              coordinates: [5.3221, 60.3913], // Bergen
            },
            county: 'Vestland',
            city: 'Bergen',
            startDate: nextWeek,
            endDate: nextMonth,
            active: true,
          },
          // Future plan 2 (starts sooner than Future plan 1)
          {
            location: {
              type: 'Point',
              coordinates: [10.3951, 63.4305], // Trondheim
            },
            county: 'Trøndelag',
            city: 'Trondheim',
            startDate: tomorrow,
            endDate: nextWeek,
            active: true,
          },
          // Inactive future plan (should be excluded)
          {
            location: {
              type: 'Point',
              coordinates: [9.082, 58.1599], // Kristiansand
            },
            county: 'Agder',
            city: 'Kristiansand',
            startDate: nextWeek,
            endDate: nextMonth,
            active: false,
          },
        ],
      });

      const savedUser = await user.save();

      // Get upcoming travel plans
      const upcomingPlans = savedUser.getUpcomingTravelPlans();

      expect(upcomingPlans.length).toBe(2);
      // Should be sorted by startDate (Trondheim first, then Bergen)
      expect(upcomingPlans[0].city).toBe('Trondheim');
      expect(upcomingPlans[1].city).toBe('Bergen');
    });
  });

  describe('Virtual Properties', () => {
    it('should generate correct profile URL', async () => {
      const user = new User(TEST_USER_DATA);
      const savedUser = await user.save();

      expect(savedUser.profileUrl).toBe(`/profile/${savedUser._id}`);
    });
  });

  describe('Timestamps', () => {
    it('should update updatedAt timestamp on save', async () => {
      // Create a user
      const user = new User(TEST_USER_DATA);
      const savedUser = await user.save();

      // Store the initial updatedAt
      const initialUpdatedAt = savedUser.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update a field
      savedUser.firstName = 'Updated';
      await savedUser.save();

      // updatedAt should be updated
      expect(savedUser.updatedAt).not.toEqual(initialUpdatedAt);
    });
  });

  describe('Preferences and Settings', () => {
    it('should have default notification preferences', async () => {
      const user = new User(TEST_USER_DATA);
      const savedUser = await user.save();

      expect(savedUser.preferences.notifications.email).toBe(true);
      expect(savedUser.preferences.notifications.push).toBe(true);
    });

    it('should have default privacy settings', async () => {
      const user = new User(TEST_USER_DATA);
      const savedUser = await user.save();

      expect(savedUser.preferences.privacy.showOnlineStatus).toBe(true);
      expect(savedUser.preferences.privacy.showLastActive).toBe(true);
    });

    it('should have default verification level and badges', async () => {
      const user = new User(TEST_USER_DATA);
      const savedUser = await user.save();

      expect(savedUser.verificationLevel).toBe(0);
      expect(savedUser.verificationBadges.identity).toBe(false);
      expect(savedUser.verificationBadges.photo).toBe(false);
      expect(savedUser.verificationBadges.phone).toBe(false);
      expect(savedUser.verificationBadges.email).toBe(false);
      expect(savedUser.verificationBadges.address).toBe(false);
    });

    it('should have default subscription tier', async () => {
      const user = new User(TEST_USER_DATA);
      const savedUser = await user.save();

      expect(savedUser.subscriptionTier).toBe('free');
    });
  });
});

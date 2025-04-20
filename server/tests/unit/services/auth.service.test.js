/**
 * Auth Service Unit Tests
 *
 * Tests the functionality of the auth service, which handles user authentication,
 * registration, token generation, and validation.
 */

import { jest } from '@jest/globals';
import mongoose from 'mongoose';

// Mock dependencies first
jest.mock('crypto', () => {
  return {
    randomBytes: jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue('random-hex-string'),
    }),
  };
});
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

// Improved User Mock
jest.mock('../../../models/user.model.js', () => {
  const mongoose = require('mongoose'); // Use require inside mock for CJS context
  // Mock the save method for instances
  const mockSave = jest.fn();
  // Mock the toObject method for instances
  const mockToObject = jest.fn(function () {
    // Return a plain object representation, excluding password and mock methods
    const obj = { ...this };
    delete obj.password;
    delete obj.save;
    delete obj.toObject;
    // Simulate mongoose behavior of converting ObjectId to string if needed
    if (obj._id && typeof obj._id !== 'string') {
      obj._id = obj._id.toString();
    }
    return obj;
  });

  // Mock the User class constructor
  const MockUser = jest.fn().mockImplementation(userData => {
    const newUser = {
      ...userData,
      _id: userData._id || new mongoose.Types.ObjectId(), // Use ObjectId
      role: userData.role || 'user',
      socialProfiles: userData.socialProfiles || {},
      lastActive: userData.lastActive || new Date(),
      save: mockSave,
      toObject: mockToObject,
    };
    // Make save resolve with the created user object itself
    // Important: Clone the object to avoid issues if it's modified later
    mockSave.mockResolvedValue({ ...newUser });
    return newUser;
  });

  // Mock static methods
  MockUser.findById = jest.fn();
  MockUser.findOne = jest.fn();
  MockUser.create = jest.fn().mockImplementation(userData => {
    // Simulate create returning a saved instance
    const instance = MockUser(userData);
    return Promise.resolve(instance);
  });

  return MockUser; // Return the mocked constructor
});

// Import the modules after mocking
import authService from '../../../services/auth.service.js';
import User from '../../../models/user.model.js'; // This will be the mocked User
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const { ObjectId } = mongoose.Types;

// crypto mock is set up in the jest.mock call above

// User mock static methods are accessed via User.findById, User.findOne etc.
// User instance methods (save, toObject) are part of the object returned by `new User()`

// Setup JWT mock
jwt.sign = jest.fn().mockReturnValue('mock-token');
jwt.verify = jest.fn().mockImplementation((token, secret) => {
  if (token === 'valid-refresh-token') return { id: 'user1', type: 'refresh' };
  if (token === 'valid-access-token') return { id: 'user1', type: 'access' };
  throw new Error('Invalid token');
});

// Setup bcrypt mock
bcrypt.compare = jest.fn().mockResolvedValue(true);

// Re-define mockSave based on the instance returned by the mock constructor
// We need a reference to the mock function created inside jest.mock
const mockSave = User({}).save; // Pass empty object to avoid undefined userData

// Create mock user for tests (ensure it has the mocked methods)
const mockUser = {
  _id: new ObjectId('605fe1718709576a042a1e84'), // Use ObjectId for consistency
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword', // Will be removed by sanitizeUser/toObject mock
  role: 'user',
  socialProfiles: {},
  lastActive: new Date(),
  toObject: jest.fn(function () {
    // Ensure mockUser also has a working toObject
    return {
      _id: this._id.toString(),
      username: this.username,
      email: this.email,
      role: this.role,
      socialProfiles: this.socialProfiles,
      lastActive: this.lastActive,
    };
  }),
  save: mockSave, // Assign the mock save function
};

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set environment variables for tests
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const result = authService.generateTokens(mockUser);

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('token', 'mock-token');
      expect(result).toHaveProperty('refreshToken', 'mock-token');
      expect(result).toHaveProperty('expiresIn');
    });

    it('should sanitize the user object', () => {
      const result = authService.generateTokens(mockUser);
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate a refresh token and return the user', async () => {
      User.findById.mockResolvedValue(mockUser);

      const result = await authService.validateRefreshToken('valid-refresh-token');
      expect(result).toEqual(mockUser);
      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', expect.any(String));
    });

    it('should throw an error if user is not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(authService.validateRefreshToken('valid-refresh-token')).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw an error if token is invalid', async () => {
      await expect(authService.validateRefreshToken('invalid-refresh-token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });

  describe('authenticate', () => {
    it('should authenticate a user with email and password', async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.authenticate('test@example.com', 'password');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should authenticate a user with username and password', async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.authenticate('testuser', 'password');

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw an error if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(authService.authenticate('nonexistent@example.com', 'password')).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw an error if password is invalid', async () => {
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.authenticate('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Setup mocks
      User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null); // No existing username or email

      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      };

      // Mock the save function for this specific instance if needed,
      // but the default mock inside jest.mock should handle it.
      // const newUserInstance = new User(userData); // Instance created inside service now

      // Execute
      const result = await authService.register(userData);

      // Verify
      expect(User.findOne).toHaveBeenCalledWith({ username: userData.username });
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      // Check that the save mock was called (indirectly via service)
      expect(mockSave).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password'); // Check sanitization worked
      expect(result.user).toHaveProperty('username', userData.username);
    });

    it('should throw an error if username is already taken', async () => {
      // Setup mocks
      User.findOne.mockResolvedValueOnce(mockUser); // Username exists

      const userData = {
        username: 'testuser',
        email: 'newuser@example.com',
        password: 'password123',
      };

      // Execute & Verify
      await expect(authService.register(userData)).rejects.toThrow('Username already taken');
    });

    it('should throw an error if email is already in use', async () => {
      // Setup mocks
      User.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser); // Email exists

      const userData = {
        username: 'newuser',
        email: 'test@example.com',
        password: 'password123',
      };

      // Execute & Verify
      await expect(authService.register(userData)).rejects.toThrow('Email already in use');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      // Setup
      User.findById.mockResolvedValue(mockUser);

      // Execute
      const result = await authService.refreshAccessToken('valid-refresh-token');

      // Verify
      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', expect.any(String));
      expect(User.findById).toHaveBeenCalledWith('user1');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw an error if refresh token is invalid', async () => {
      // Execute & Verify
      await expect(authService.refreshAccessToken('invalid-refresh-token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });

  describe('validateAccessToken', () => {
    it('should validate an access token and return the user', async () => {
      // Setup
      User.findById.mockResolvedValue(mockUser);

      // Execute
      const result = await authService.validateAccessToken('valid-access-token');

      // Verify
      expect(jwt.verify).toHaveBeenCalledWith('valid-access-token', expect.any(String));
      expect(User.findById).toHaveBeenCalledWith('user1');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw an error if user is not found', async () => {
      // Setup
      User.findById.mockResolvedValue(null);

      // Execute & Verify
      await expect(authService.validateAccessToken('valid-access-token')).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw an error if token is invalid', async () => {
      // Execute & Verify
      await expect(authService.validateAccessToken('invalid-access-token')).rejects.toThrow(
        'Invalid access token'
      );
    });
  });

  describe('handleOAuth', () => {
    it('should find an existing user by OAuth provider ID', async () => {
      // Setup
      const mockOAuthUser = {
        ...mockUser,
        socialProfiles: {
          google: { id: 'google-id-123' },
        },
      };

      User.findOne.mockResolvedValue(mockOAuthUser);

      const profile = {
        id: 'google-id-123',
        email: 'test@example.com',
      };

      // Execute
      const result = await authService.handleOAuth('google', profile);

      // Verify
      expect(User.findOne).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should link OAuth account to existing user by email', async () => {
      // Setup
      User.findOne.mockResolvedValueOnce(null); // No user with this OAuth ID
      User.findOne.mockResolvedValueOnce(mockUser); // User exists with this email

      const profile = {
        id: 'google-id-123',
        email: 'test@example.com',
      };

      // Execute
      const result = await authService.handleOAuth('google', profile);

      // Verify
      expect(User.findOne).toHaveBeenCalledTimes(2);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should create a new user if no existing user is found', async () => {
      // Setup
      User.findOne.mockResolvedValueOnce(null); // No user with this OAuth ID
      User.findOne.mockResolvedValueOnce(null); // No user with this email

      const profile = {
        id: 'google-id-123',
        email: 'newuser@example.com',
        username: 'newuser',
      };

      // Mock the save function for this specific instance if needed
      // const newUserInstance = new User(profile); // Instance created inside service

      // Execute
      const result = await authService.handleOAuth('google', profile);

      // Verify
      expect(User.findOne).toHaveBeenCalledTimes(2);
      // Check that the save mock was called (indirectly via service)
      // It might be called twice: once for creation, once for lastActive update
      expect(mockSave).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password'); // Check sanitization worked
      expect(result.user).toHaveProperty('username', profile.username);
    });
  });

  describe('sanitizeUser', () => {
    it('should remove sensitive information from user object', () => {
      // Setup
      const userWithPassword = {
        _id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        password: 'secret-password',
        toObject: function () {
          return { ...this };
        },
      };

      // Execute
      const result = authService.sanitizeUser(userWithPassword);

      // Verify
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('username', 'testuser');
      expect(result).toHaveProperty('email', 'test@example.com');
    });

    it('should handle user objects without toObject method', () => {
      // Setup
      const userWithoutToObject = {
        _id: 'user-id',
        username: 'testuser',
        email: 'test@example.com',
        password: 'secret-password',
      };

      // Execute
      const result = authService.sanitizeUser(userWithoutToObject);

      // Verify
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('username', 'testuser');
      expect(result).toHaveProperty('email', 'test@example.com');
    });
  });
});

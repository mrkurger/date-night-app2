// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the auth service
//
// COMMON CUSTOMIZATIONS:
// - MOCK_USER_DATA: Test user data for auth service tests
//   Related to: server/tests/helpers.js:TEST_USER_DATA
// - MOCK_TOKEN_GENERATION: Settings for token generation in tests
//   Related to: server/services/auth.service.js:generateTokens
// ===================================================

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const authService = require('../../../services/auth.service');
const User = require('../../../models/user.model');
const { TEST_USER_DATA } = require('../../helpers');

// Mock the User model and jwt functions
jest.mock('../../../models/user.model');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('Auth Service', () => {
  let mockUser;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock user
    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      ...TEST_USER_DATA,
      role: 'user',
      lastActive: new Date(),
      save: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockReturnValue({
        _id: new mongoose.Types.ObjectId(),
        ...TEST_USER_DATA,
        role: 'user',
        lastActive: new Date(),
        password: 'hashedPassword123',
      }),
    };

    // Mock jwt.sign
    jwt.sign.mockImplementation((payload, secret, options) => {
      return 'mock_token';
    });

    // Mock jwt.verify
    jwt.verify.mockImplementation((token, secret) => {
      return { id: mockUser._id };
    });

    // Mock bcrypt.compare
    bcrypt.compare.mockResolvedValue(true);

    // Mock User.findOne and User.findById
    User.findOne.mockResolvedValue(mockUser);
    User.findById.mockResolvedValue(mockUser);
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const result = authService.generateTokens(mockUser);

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should sanitize the user object', () => {
      const result = authService.generateTokens(mockUser);

      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate a refresh token and return the user', async () => {
      const result = await authService.validateRefreshToken('valid_refresh_token');

      expect(jwt.verify).toHaveBeenCalledWith(
        'valid_refresh_token',
        process.env.JWT_REFRESH_SECRET
      );
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user is not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(authService.validateRefreshToken('valid_refresh_token')).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw an error if token is invalid', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.validateRefreshToken('invalid_refresh_token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });

  describe('authenticate', () => {
    it('should authenticate a user with email and password', async () => {
      const result = await authService.authenticate('test@example.com', 'Password123!');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', mockUser.password);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should authenticate a user with username and password', async () => {
      const result = await authService.authenticate('testuser', 'Password123!');

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', mockUser.password);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw an error if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        authService.authenticate('nonexistent@example.com', 'Password123!')
      ).rejects.toThrow('User not found');
    });

    it('should throw an error if password is invalid', async () => {
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.authenticate('test@example.com', 'WrongPassword123!')
      ).rejects.toThrow('Invalid password');
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      // Mock User.findOne to return null (no existing user)
      User.findOne.mockResolvedValue(null);

      // Mock User constructor
      User.mockImplementation(() => ({
        ...mockUser,
        save: jest.fn().mockResolvedValue(true),
      }));

      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123!',
      };

      const result = await authService.register(userData);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: userData.email }, { username: userData.username }],
      });
      expect(User).toHaveBeenCalledWith({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: 'user',
      });
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw an error if email is already in use', async () => {
      // Mock User.findOne to return a user with the same email
      User.findOne.mockResolvedValue({
        ...mockUser,
        email: 'existing@example.com',
      });

      const userData = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'Password123!',
      };

      await expect(authService.register(userData)).rejects.toThrow('Email already in use');
    });

    it('should throw an error if username is already taken', async () => {
      // Mock User.findOne to return a user with the same username
      User.findOne.mockResolvedValue({
        ...mockUser,
        username: 'existinguser',
        email: 'different@example.com',
      });

      const userData = {
        username: 'existinguser',
        email: 'newuser@example.com',
        password: 'Password123!',
      };

      await expect(authService.register(userData)).rejects.toThrow('Username already taken');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh an access token', async () => {
      const result = await authService.refreshAccessToken('valid_refresh_token');

      expect(jwt.verify).toHaveBeenCalledWith(
        'valid_refresh_token',
        process.env.JWT_REFRESH_SECRET
      );
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw an error if refresh token is invalid', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshAccessToken('invalid_refresh_token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });

  describe('validateAccessToken', () => {
    it('should validate an access token and return the user', async () => {
      const result = await authService.validateAccessToken('valid_access_token');

      expect(jwt.verify).toHaveBeenCalledWith('valid_access_token', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw an error if user is not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(authService.validateAccessToken('valid_access_token')).rejects.toThrow(
        'Invalid access token'
      );
    });

    it('should throw an error if token is invalid', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.validateAccessToken('invalid_access_token')).rejects.toThrow(
        'Invalid access token'
      );
    });
  });

  describe('handleOAuth', () => {
    it('should find an existing user by OAuth provider ID', async () => {
      // Mock User.findOne to return a user with the OAuth provider ID
      User.findOne.mockImplementationOnce(() => {
        return Promise.resolve(mockUser);
      });

      const profile = {
        id: 'oauth_id_123',
        email: 'oauth_user@example.com',
        username: 'oauth_user',
      };

      const result = await authService.handleOAuth('google', profile);

      expect(User.findOne).toHaveBeenCalledWith({ 'socialProfiles.google.id': 'oauth_id_123' });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should link OAuth account to existing user by email', async () => {
      // Mock User.findOne to return null for OAuth ID, but a user for email
      User.findOne.mockImplementationOnce(() => Promise.resolve(null));
      User.findOne.mockImplementationOnce(() => Promise.resolve(mockUser));

      // Mock user without socialProfiles
      mockUser.socialProfiles = undefined;

      const profile = {
        id: 'oauth_id_123',
        email: 'test@example.com',
        username: 'oauth_user',
      };

      const result = await authService.handleOAuth('google', profile);

      expect(User.findOne).toHaveBeenCalledWith({ 'socialProfiles.google.id': 'oauth_id_123' });
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockUser.socialProfiles).toEqual({ google: { id: 'oauth_id_123' } });
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should create a new user if no existing user is found', async () => {
      // Mock User.findOne to return null for both OAuth ID and email
      User.findOne.mockResolvedValue(null);

      // Mock User constructor
      User.mockImplementation(() => ({
        ...mockUser,
        save: jest.fn().mockResolvedValue(true),
      }));

      const profile = {
        id: 'oauth_id_123',
        email: 'new_oauth_user@example.com',
        username: 'new_oauth_user',
      };

      const result = await authService.handleOAuth('google', profile);

      expect(User.findOne).toHaveBeenCalledWith({ 'socialProfiles.google.id': 'oauth_id_123' });
      expect(User.findOne).toHaveBeenCalledWith({ email: 'new_oauth_user@example.com' });
      expect(User).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('sanitizeUser', () => {
    it('should remove sensitive information from user object', () => {
      const userWithPassword = {
        ...mockUser.toObject(),
        password: 'hashedPassword123',
      };

      const sanitizedUser = authService.sanitizeUser(userWithPassword);

      expect(sanitizedUser).not.toHaveProperty('password');
    });

    it('should handle non-mongoose objects', () => {
      const plainUser = {
        _id: 'user_id',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      const sanitizedUser = authService.sanitizeUser(plainUser);

      expect(sanitizedUser).not.toHaveProperty('password');
    });
  });
});

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for auth service functionality
//
// COMMON CUSTOMIZATIONS:
// - MOCK_USER_DATA: Test user data for auth service tests
//   Related to: server/tests/helpers.js:TEST_USER_DATA
// - JWT_EXPIRY: Token expiration settings for tests (default: '1h' for access, '7d' for refresh)
//   Related to: server/services/auth.service.js
// ===================================================
const AuthService = require('./auth.service');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

jest.mock('../models/user.model');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('AuthService', () => {
  const mockUser = {
    _id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    password: '$2b$10$hashedPassword',
    name: 'Test User',
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnValue({
      _id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should generate tokens for valid credentials', async () => {
      // Setup mocks
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation((payload, secret, options) => {
        return options.expiresIn === '1h' ? 'mock-access-token' : 'mock-refresh-token';
      });

      // Call the service
      const result = await AuthService.authenticate('testuser', 'password123');

      // Verify results
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('token', 'mock-refresh-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
      expect(result).toHaveProperty('user');
    });

    it('should throw error for invalid username', async () => {
      // Setup mocks
      User.findOne.mockResolvedValue(null);

      // Call and verify
      await expect(AuthService.authenticate('wronguser', 'password123')).rejects.toThrow(
        'User not found'
      );

      expect(User.findOne).toHaveBeenCalledWith({ username: 'wronguser' });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error for invalid password', async () => {
      // Setup mocks
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Call and verify
      await expect(AuthService.authenticate('testuser', 'wrongpassword')).rejects.toThrow(
        'Invalid password'
      );

      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const registerData = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'User',
    };

    it('should register a new user successfully', async () => {
      // Setup mocks
      User.findOne.mockResolvedValue(null); // No existing user

      const mockNewUser = {
        ...registerData,
        _id: 'new-user-123',
        password: 'hashed-password',
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: 'new-user-123',
          username: registerData.username,
          email: registerData.email,
          name: 'New User',
        }),
      };

      // Mock the User constructor
      User.mockImplementation(() => mockNewUser);

      // Mock JWT sign to return tokens
      jwt.sign.mockReturnValue('mock-refresh-token');

      // Call the service
      const result = await AuthService.register(registerData);

      // Verify results
      expect(User.findOne).toHaveBeenCalledTimes(1); // Check for existing user
      expect(mockNewUser.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('token', 'mock-refresh-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
      expect(result).toHaveProperty('user');
    });

    it('should throw error if username already exists', async () => {
      // Setup mocks - use a simpler approach that works consistently
      User.findOne.mockResolvedValue({
        username: registerData.username,
        email: 'different@example.com',
      });

      // Call and verify
      await expect(AuthService.register(registerData)).rejects.toThrow('Username already taken');

      expect(User.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      // Setup mocks - use a simpler approach that works consistently
      User.findOne.mockResolvedValue({
        username: 'differentuser',
        email: registerData.email,
      });

      // Call and verify
      await expect(AuthService.register(registerData)).rejects.toThrow('Email already in use');

      expect(User.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should generate new access token with valid refresh token', async () => {
      // Setup mocks
      jwt.verify.mockImplementation(() => ({ id: mockUser._id }));
      User.findById.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('new-access-token');

      // Call the service - use the correct method name
      const result = await AuthService.refreshAccessToken('valid-refresh-token');

      // Verify results
      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', expect.any(String));
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(jwt.sign).toHaveBeenCalledTimes(2); // Both access and refresh tokens
      expect(result).toHaveProperty('token', 'new-access-token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw error with invalid refresh token', async () => {
      // Setup mocks
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid refresh token');
      });

      // Call and verify - use the correct method name
      await expect(AuthService.refreshAccessToken('invalid-token')).rejects.toThrow(
        'Invalid refresh token'
      );

      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', expect.any(String));
      expect(User.findById).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // Setup mocks
      jwt.verify.mockImplementation(() => ({ id: 'nonexistent-id' }));
      // First call to verify token succeeds, but findById returns null
      User.findById.mockResolvedValue(null);

      // Call and verify - use the correct method name
      await expect(AuthService.refreshAccessToken('valid-token-wrong-user')).rejects.toThrow(
        'User not found'
      );

      expect(jwt.verify).toHaveBeenCalledWith('valid-token-wrong-user', expect.any(String));
      expect(User.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});

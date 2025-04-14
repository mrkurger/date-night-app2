
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
    firstName: 'Test',
    lastName: 'User',
    toJSON: jest.fn().mockReturnValue({
      _id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    })
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
      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
      expect(result).toHaveProperty('user');
    });

    it('should throw error for invalid username', async () => {
      // Setup mocks
      User.findOne.mockResolvedValue(null);

      // Call and verify
      await expect(AuthService.authenticate('wronguser', 'password123'))
        .rejects.toThrow('User not found');
      
      expect(User.findOne).toHaveBeenCalledWith({ username: 'wronguser' });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error for invalid password', async () => {
      // Setup mocks
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      // Call and verify
      await expect(AuthService.authenticate('testuser', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
      
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
      lastName: 'User'
    };

    it('should register a new user successfully', async () => {
      // Setup mocks
      User.findOne.mockResolvedValue(null); // No existing user
      bcrypt.hash.mockResolvedValue('hashed-password');
      
      const mockNewUser = {
        ...registerData,
        _id: 'new-user-123',
        password: 'hashed-password',
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          _id: 'new-user-123',
          username: registerData.username,
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName
        })
      };
      
      User.mockImplementation(() => mockNewUser);
      
      jwt.sign.mockImplementation((payload, secret, options) => {
        return options.expiresIn === '1h' ? 'mock-access-token' : 'mock-refresh-token';
      });

      // Call the service
      const result = await AuthService.register(registerData);

      // Verify results
      expect(User.findOne).toHaveBeenCalledTimes(2); // Check for existing username and email
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, expect.any(Number));
      expect(mockNewUser.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
      expect(result).toHaveProperty('user');
    });

    it('should throw error if username already exists', async () => {
      // Setup mocks
      User.findOne.mockImplementation((query) => {
        if (query.username === registerData.username) {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(null);
      });

      // Call and verify
      await expect(AuthService.register(registerData))
        .rejects.toThrow('Username already exists');
      
      expect(User.findOne).toHaveBeenCalledWith({ username: registerData.username });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      // Setup mocks
      User.findOne.mockImplementation((query) => {
        if (query.username) return Promise.resolve(null);
        if (query.email === registerData.email) return Promise.resolve(mockUser);
        return Promise.resolve(null);
      });

      // Call and verify
      await expect(AuthService.register(registerData))
        .rejects.toThrow('Email already exists');
      
      expect(User.findOne).toHaveBeenCalledWith({ username: registerData.username });
      expect(User.findOne).toHaveBeenCalledWith({ email: registerData.email });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should generate new access token with valid refresh token', async () => {
      // Setup mocks
      jwt.verify.mockImplementation(() => ({ sub: mockUser._id }));
      User.findById.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('new-access-token');

      // Call the service
      const result = await AuthService.refreshToken('valid-refresh-token');

      // Verify results
      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', expect.any(String));
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('user');
    });

    it('should throw error with invalid refresh token', async () => {
      // Setup mocks
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Call and verify
      await expect(AuthService.refreshToken('invalid-token'))
        .rejects.toThrow('Invalid token');
      
      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', expect.any(String));
      expect(User.findById).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // Setup mocks
      jwt.verify.mockImplementation(() => ({ sub: 'nonexistent-id' }));
      User.findById.mockResolvedValue(null);

      // Call and verify
      await expect(AuthService.refreshToken('valid-token-wrong-user'))
        .rejects.toThrow('User not found');
      
      expect(jwt.verify).toHaveBeenCalledWith('valid-token-wrong-user', expect.any(String));
      expect(User.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});

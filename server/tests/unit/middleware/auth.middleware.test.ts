// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the auth middleware
//
// COMMON CUSTOMIZATIONS:
// - MOCK_TOKEN_GENERATION: Settings for token generation in tests
//   Related to: server/tests/helpers.js:generateTestToken
// - MOCK_USER_DATA: Test user data for auth middleware tests
//   Related to: server/tests/helpers.js:TEST_USER_DATA
// ===================================================

import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { protect, optionalAuth, restrictTo } from '../../../middleware/auth.js';
import User from '../../../models/user.model.js';
// Import the default export, which is what auth.js uses
import TokenBlacklistModel from '../../../models/token-blacklist.model.js';
import authService from '../../../services/auth.service.js';

// Alias protect as authenticate for backward compatibility with tests
const authenticate = protect;
import {
  mockRequest,
  mockResponse,
  mockNext,
  generateTestToken,
  TEST_USER_DATA,
} from '../../helpers.ts';
import { mockModel } from '../../setup.ts';

// Set up mocks before using them
jest.mock('../../../models/user.model.js');

// Updated mock for token-blacklist.model.js
// The actual module exports the Mongoose model as a default export.
// auth.js imports this default export.
// So, we need to mock the default export.
jest.mock('../../../models/token-blacklist.model.js', () => {
  const mockStaticMethods = {
    isBlacklisted: jest.fn(), // Will be configured in beforeEach or tests
    // Add other static methods of TokenBlacklist model if they are used
  };
  return {
    __esModule: true, // Important for ES modules
    default: mockStaticMethods, // This is what `import TokenBlacklist from '...'` will get
  };
});

jest.mock('../../../services/auth.service.js');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;
  let mockUser;
  let mockToken;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock user
    const userId = new mongoose.Types.ObjectId();
    mockUser = {
      _id: userId,
      ...TEST_USER_DATA,
      role: 'user',
      lastActive: new Date(),
      save: jest.fn().mockResolvedValue(true),
    };

    // Generate mock token - use a simple test token since we're mocking jwt.verify anyway
    mockToken = 'test-jwt-token-' + userId.toString();

    // Setup request, response, and next function
    req = mockRequest();
    res = mockResponse();
    next = mockNext;

    // Configure the default mock behavior for TokenBlacklistModel.isBlacklisted
    // TokenBlacklistModel here refers to the mocked default export's object
    TokenBlacklistModel.isBlacklisted.mockResolvedValue(false);

    // Mock User.findById
    User.findById = jest.fn().mockResolvedValue(mockUser);

    // Mock jwt.verify with default successful verification
    jwt.verify = jest.fn().mockReturnValue({
      id: userId.toString(),
      iat: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    });
  });

  describe('authenticate middleware', () => {
    it('should return 401 if no token is provided', async () => {
      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required. No token provided.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should authenticate user with token in Authorization header', async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      await authenticate(req, res, next);

      expect(TokenBlacklistModel.isBlacklisted).toHaveBeenCalledWith(mockToken);
      expect(User.findById).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(req.user).toEqual(mockUser);
      expect(req.token).toEqual(mockToken);
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate user with token in cookie', async () => {
      req.cookies = { access_token: mockToken };

      await authenticate(req, res, next);

      expect(TokenBlacklistModel.isBlacklisted).toHaveBeenCalledWith(mockToken);
      expect(User.findById).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(req.user).toEqual(mockUser);
      expect(req.token).toEqual(mockToken);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is blacklisted', async () => {
      req.headers.authorization = `Bearer ${mockToken}`;
      TokenBlacklistModel.isBlacklisted.mockResolvedValue(true);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token has been revoked. Please log in again.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not found', async () => {
      req.headers.authorization = `Bearer ${mockToken}`;
      User.findById.mockResolvedValue(null);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user account is locked', async () => {
      req.headers.authorization = `Bearer ${mockToken}`;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow

      User.findById.mockResolvedValue({
        ...mockUser,
        securityLockout: futureDate,
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account locked for security reasons. Please reset your password.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if password was changed after token issuance', async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      // Mock a decoded token with an iat (issued at) timestamp
      jwt.verify = jest.fn().mockReturnValue({
        id: mockUser._id,
        iat: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      });

      // Mock a user with a password change after token issuance
      const passwordChangedAt = new Date();
      User.findById.mockResolvedValue({
        ...mockUser,
        passwordChangedAt,
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Password has been changed. Please log in again.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is expired', async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      // Mock a TokenExpiredError
      jwt.verify = jest.fn().mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      // Mock a JsonWebTokenError
      jwt.verify = jest.fn().mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 for other errors', async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      // Mock a generic error
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Some other error');
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication error',
        error: 'Some other error',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth middleware', () => {
    it('should continue without authentication if no token is provided', async () => {
      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate user if valid token is provided', async () => {
      req.headers.authorization = `Bearer ${mockToken}`;
      TokenBlacklistModel.isBlacklisted.mockResolvedValue(false); // Explicitly set for this test case
      jwt.verify.mockReturnValue({ id: mockUser._id, iat: Math.floor(Date.now() / 1000) - 3600 });
      User.findById.mockResolvedValue(mockUser);

      await optionalAuth(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should continue without authentication if token is blacklisted', async () => {
      req.headers.authorization = `Bearer ${mockToken}`;
      TokenBlacklistModel.isBlacklisted.mockResolvedValue(true);

      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should continue without authentication if token verification fails', async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      // Mock a JsonWebTokenError
      jwt.verify = jest.fn().mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('restrictTo middleware', () => {
    it('should return 401 if user is not authenticated', async () => {
      const restrictToAdmin = restrictTo('admin');

      await restrictToAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', async () => {
      const restrictToAdmin = restrictTo('admin');
      req.user = { ...mockUser, role: 'user' };

      await restrictToAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You do not have permission to perform this action',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user has required role', async () => {
      const restrictToUser = restrictTo('user');
      req.user = { ...mockUser, role: 'user' };

      await restrictToUser(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next if user has one of multiple required roles', async () => {
      const restrictToUserOrAdmin = restrictTo('user', 'admin');
      req.user = { ...mockUser, role: 'admin' };

      await restrictToUserOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

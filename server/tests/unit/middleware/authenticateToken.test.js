// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the authenticateToken middleware
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
import { authenticateToken } from '../../../middleware/authenticateToken.js';
import User from '../../../models/user.model.js';
import { TokenBlacklist } from '../../../models/token-blacklist.model.js';
import {
  mockRequest,
  mockResponse,
  mockNext,
  generateTestToken,
  TEST_USER_DATA,
} from '../../helpers.js';

// Set up mocks before using them
jest.mock('jsonwebtoken');
jest.mock('../../../models/user.model.js');
jest.mock('../../../models/token-blacklist.model.js', () => ({
  TokenBlacklist: {
    isBlacklisted: jest.fn().mockResolvedValue(false),
  },
}));

describe('Authenticate Token Middleware', () => {
  let req, res, next;
  let mockUser;
  let mockToken;

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
    };

    // Generate mock token
    mockToken = generateTestToken(mockUser._id);

    // Setup request, response, and next function
    req = mockRequest();
    res = mockResponse();
    next = mockNext;

    // Mock TokenBlacklist.isBlacklisted
    TokenBlacklist.isBlacklisted.mockResolvedValue(false);

    // Mock User.findById
    User.findById = jest.fn().mockResolvedValue(mockUser);

    // Mock jwt.verify
    jwt.verify = jest.fn().mockReturnValue({ id: mockUser._id.toString() });
  });

  it('should return 401 if no token is provided', async () => {
    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No token provided',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should authenticate user with token in Authorization header', async () => {
    req.headers.authorization = `Bearer ${mockToken}`;

    await authenticateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
    expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it('should authenticate user with token in cookie', async () => {
    req.cookies = { token: mockToken };

    await authenticateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String));
    expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if token is blacklisted', async () => {
    req.headers.authorization = `Bearer ${mockToken}`;
    TokenBlacklist.isBlacklisted.mockResolvedValue(true);

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token has been revoked',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not found', async () => {
    req.headers.authorization = `Bearer ${mockToken}`;
    User.findById.mockResolvedValue(null);

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User not found',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    req.headers.authorization = `Bearer ${mockToken}`;

    // Mock a JsonWebTokenError
    jwt.verify.mockImplementation(() => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      throw error;
    });

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is expired', async () => {
    req.headers.authorization = `Bearer ${mockToken}`;

    // Mock a TokenExpiredError
    jwt.verify.mockImplementation(() => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      throw error;
    });

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token expired',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle malformed authorization header', async () => {
    req.headers.authorization = mockToken; // Missing 'Bearer ' prefix

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No token provided',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle other errors during verification', async () => {
    req.headers.authorization = `Bearer ${mockToken}`;

    // Mock a generic error
    jwt.verify.mockImplementation(() => {
      throw new Error('Some other error');
    });

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication error',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should update user lastActive timestamp', async () => {
    req.headers.authorization = `Bearer ${mockToken}`;

    await authenticateToken(req, res, next);

    expect(mockUser.lastActive).toBeDefined();
    expect(mockUser.save).toHaveBeenCalled();
  });

  it('should handle errors when updating user lastActive', async () => {
    req.headers.authorization = `Bearer ${mockToken}`;
    mockUser.save.mockRejectedValue(new Error('Database error'));

    await authenticateToken(req, res, next);

    // Should still authenticate the user despite the error updating lastActive
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });
});

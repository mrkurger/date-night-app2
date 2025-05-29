// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the authenticateToken middleware
//
// COMMON CUSTOMIZATIONS:
// - MOCK_TOKEN_GENERATION: Settings for token generation in tests
//   Related to: server/tests/helpers.js:generateTestToken
// ===================================================

import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../../middleware/authenticateToken.js';
import { mockRequest, mockResponse, mockNext, generateTestToken } from '../../helpers.ts';

// Set up mocks before using them
jest.mock('jsonwebtoken');
// No need to mock User or TokenBlacklist as they are not used by authenticateToken.js
// jest.mock('../../../models/user.model.js');
// jest.mock('../../../models/token-blacklist.model.js');

describe('Authenticate Token Middleware', () => {
  let req, res, next;
  let mockDecodedUserPayload; // Represents the payload decoded from JWT
  let mockTokenString; // Ensure this is a string for the test
  const mockJwtSecret = 'test-secret'; // Mock secret

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock decoded user payload (what jwt.verify would return)
    mockDecodedUserPayload = { id: 'mockUserId', role: 'user', iat: Math.floor(Date.now() / 1000) };

    // Generate a string mock token
    // The actual content doesn't matter since jwt.verify is mocked,
    // but it must be a string to be correctly parsed by `split(' ')[1]`
    mockTokenString = 'mock-jwt-token-string';

    // Setup request, response, and next function
    req = mockRequest();
    res = mockResponse();
    next = mockNext;

    // Mock jwt.verify to return the decoded payload
    jwt.verify.mockReturnValue(mockDecodedUserPayload);

    // Set the mock secret in environment variables
    process.env.JWT_SECRET = mockJwtSecret;
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('should return 401 if no token is provided', async () => {
    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Access denied',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should authenticate user with token in Authorization header', async () => {
    req.headers.authorization = `Bearer ${mockTokenString}`; // Use the string token

    await authenticateToken(req, res, next);

    // Check if jwt.verify was called correctly
    expect(jwt.verify).toHaveBeenCalledWith(mockTokenString, mockJwtSecret); // Expect the string token
    // Check if req.user is set to the decoded payload
    expect(req.user).toEqual(mockDecodedUserPayload);
    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if token is invalid (JsonWebTokenError)', async () => {
    req.headers.authorization = `Bearer ${mockTokenString}`; // Use the string token

    jwt.verify.mockImplementation(() => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      throw error;
    });

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is expired (TokenExpiredError)', async () => {
    req.headers.authorization = `Bearer ${mockTokenString}`; // Use the string token

    // Mock a real TokenExpiredError
    jwt.verify.mockImplementation(() => {
      // Import or use the actual TokenExpiredError from jsonwebtoken library
      const { TokenExpiredError } = jwt; // Or: import { TokenExpiredError } from 'jsonwebtoken'; at top
      throw new TokenExpiredError('Token expired', new Date(Date.now() - 3600 * 1000)); // message, expiredAt
    });

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Token expired',
      shouldRefresh: true,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle malformed authorization header (no Bearer prefix or token)', async () => {
    req.headers.authorization = 'MalformedToken';

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Access denied',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle other errors during jwt.verify by returning 403', async () => {
    req.headers.authorization = `Bearer ${mockTokenString}`; // Use the string token

    jwt.verify.mockImplementation(() => {
      throw new Error('Some other verification error');
    });

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid token',
    });
    expect(next).not.toHaveBeenCalled();
  });
});

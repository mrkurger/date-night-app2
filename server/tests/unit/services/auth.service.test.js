/**
 * Auth Service Unit Tests
 *
 * Tests the functionality of the auth service, which handles user authentication,
 * registration, token generation, and validation.
 */

import { jest } from '@jest/globals';

// Mock mongoose and ObjectId
const mockObjectId = jest.fn(id => id || 'mockObjectId');
mockObjectId.isValid = jest.fn(id => !!id); // Simple isValid mock

jest.mock('mongoose', () => {
  const originalMongoose = jest.requireActual('mongoose');
  return {
    ...originalMongoose, // Spread original mongoose to keep other exports like Schema, model etc.
    Types: {
      ...originalMongoose.Types,
      ObjectId: mockObjectId, // Mock ObjectId
    },
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    model: jest.fn().mockImplementation((name, schema) => {
      // Return a basic mock for any model requested
      // This helps if the service indirectly causes model registration/lookup
      if (name === 'User') return User; // Use the existing User mock
      if (name === 'Session') return Session; // Use the existing Session mock
      return jest.fn();
    }),
    Schema: originalMongoose.Schema, // Use actual Schema
  };
});

// Define mock functions used by jest.mock factories with var or ensure they are in scope.
// These need to be `var` or function declarations due to hoisting of jest.mock
var mockCryptoRandomBytes = jest.fn().mockReturnValue({ toString: mockCryptoToString });
var mockCryptoToString = jest.fn().mockReturnValue('random-hex-string'); // mockCryptoRandomBytes depends on this

var mockJwtSign = jest.fn().mockReturnValue('mock-token');
var mockJwtVerify = jest.fn();
var mockJwtDecode = jest.fn();

var mockBcryptCompare = jest.fn().mockResolvedValue(true);

// Mock dependencies first
// IMPORTANT: jest.mock calls are hoisted. Ensure variables used inside them are declared above or are otherwise in scope.
jest.mock('crypto', () => ({
  randomBytes: mockCryptoRandomBytes,
}));

jest.mock('jsonwebtoken', () => ({
  sign: mockJwtSign,
  verify: mockJwtVerify,
  decode: mockJwtDecode,
  JsonWebTokenError: class JsonWebTokenError extends Error {
    constructor(message) {
      super(message);
      this.name = 'JsonWebTokenError';
    }
  },
  TokenExpiredError: class TokenExpiredError extends Error {
    constructor(message, expiredAt) {
      super(message);
      this.name = 'TokenExpiredError';
      this.expiredAt = expiredAt;
    }
  },
  NotBeforeError: class NotBeforeError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotBeforeError';
    }
  },
}));

jest.mock('bcrypt', () => ({
  compare: mockBcryptCompare,
}));

// These can remain `let` as they are assigned within the jest.mock factory scope for models
let mockUserInstanceSave;
let mockUserInstanceToObject;
let mockUserFindById;
let mockUserFindOne;
let mockUserCreate;

let mockSessionInstanceSave;
let mockSessionFindById;
let mockSessionFindOne; // If needed by service

let mockTokenBlacklistCreate;

jest.mock('../../../models/user.model.js', () => {
  mockUserInstanceSave = jest.fn();
  mockUserInstanceToObject = jest.fn();
  mockUserFindById = jest.fn();
  mockUserFindOne = jest.fn();
  mockUserCreate = jest.fn();

  const MockUser = jest.fn().mockImplementation(userData => {
    const userInstance = {
      _id: userData._id || mockObjectId(), // Use mocked ObjectId
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'user',
      socialProfiles: userData.socialProfiles || {},
      lastActive: userData.lastActive || new Date(),
      knownIpAddresses: userData.knownIpAddresses || [],
      knownDeviceFingerprints: userData.knownDeviceFingerprints || [],
      save: mockUserInstanceSave,
      toObject: mockUserInstanceToObject,
      ...userData,
    };
    mockUserInstanceSave.mockImplementation(function () {
      return Promise.resolve({ ...this });
    });
    mockUserInstanceToObject.mockImplementation(function () {
      const obj = { ...this };
      delete obj.password;
      delete obj.save;
      delete obj.toObject;
      return obj;
    });
    return userInstance;
  });

  MockUser.findById = mockUserFindById;
  MockUser.findOne = mockUserFindOne;
  MockUser.create = mockUserCreate.mockImplementation(userData => {
    const instance = MockUser(userData);
    return Promise.resolve(instance);
  });

  return MockUser;
});

jest.mock('../../../models/session.model.js', () => {
  mockSessionInstanceSave = jest.fn();
  mockSessionFindById = jest.fn();
  mockSessionFindOne = jest.fn();

  const MockSession = jest.fn().mockImplementation(sessionData => {
    const sessionInstance = {
      _id: mockObjectId(), // Use mocked ObjectId
      userId: sessionData.userId,
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      deviceFingerprint: sessionData.deviceFingerprint,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      ...sessionData,
      save: mockSessionInstanceSave,
    };
    mockSessionInstanceSave.mockImplementation(function () {
      return Promise.resolve({ ...this });
    });
    return sessionInstance;
  });

  MockSession.findById = mockSessionFindById;
  MockSession.findOne = mockSessionFindOne;

  return MockSession;
});

jest.mock('../../../models/token-blacklist.model.js', () => {
  mockTokenBlacklistCreate = jest.fn();
  return {
    __esModule: true,
    default: {
      create: mockTokenBlacklistCreate,
    },
  };
});

// Import the modules after mocking
import authService from '../../../services/auth.service.js';
import User from '../../../models/user.model.js';
import Session from '../../../models/session.model.js';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

const getMockUser = (overrides = {}) => ({
  _id: ObjectId('605fe1718709576a042a1e84'), // Use mocked ObjectId
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
  role: 'user',
  socialProfiles: {},
  lastActive: new Date(),
  knownIpAddresses: [],
  knownDeviceFingerprints: [],
  ...overrides,
  toObject: mockUserInstanceToObject,
  save: mockUserInstanceSave,
});

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObjectId.mockClear().mockImplementation(id => id || 'mockObjectId' + Math.random());

    mockCryptoRandomBytes.mockReset().mockReturnValue({ toString: mockCryptoToString });
    mockCryptoToString.mockReset().mockReturnValue('random-hex-string');
    mockJwtSign.mockReset().mockReturnValue('mock-token');
    mockJwtVerify.mockReset();
    mockJwtDecode.mockReset();
    mockBcryptCompare.mockReset().mockResolvedValue(true);

    if (mockUserInstanceSave)
      mockUserInstanceSave.mockReset().mockImplementation(function () {
        return Promise.resolve({ ...this });
      });
    if (mockUserInstanceToObject)
      mockUserInstanceToObject.mockReset().mockImplementation(function () {
        const obj = { ...this };
        delete obj.password;
        delete obj.save;
        delete obj.toObject;
        return obj;
      });
    if (mockUserFindById) mockUserFindById.mockReset();
    if (mockUserFindOne) mockUserFindOne.mockReset();
    if (mockUserCreate)
      mockUserCreate.mockReset().mockImplementation(userData => Promise.resolve(User(userData)));

    if (mockSessionInstanceSave)
      mockSessionInstanceSave.mockReset().mockImplementation(function () {
        return Promise.resolve({ ...this });
      });
    if (mockSessionFindById) mockSessionFindById.mockReset();
    if (mockSessionFindOne) mockSessionFindOne.mockReset();

    if (mockTokenBlacklistCreate) mockTokenBlacklistCreate.mockReset().mockResolvedValue({});

    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens with session ID', () => {
      const user = getMockUser();
      const sessionId = ObjectId(); // Use mocked ObjectId
      const result = authService.generateTokens(user, sessionId);

      expect(mockJwtSign).toHaveBeenCalledTimes(2);
      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: user._id,
          role: user.role,
          username: user.username,
          sessionId: sessionId,
        }),
        'test-jwt-secret',
        { expiresIn: `${15 * 60}s` }
      );
      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({ id: user._id, sessionId: sessionId }),
        'test-jwt-refresh-secret',
        { expiresIn: '7d' }
      );
      expect(result).toHaveProperty('token', 'mock-token');
      expect(result).toHaveProperty('refreshToken', 'mock-token');
      expect(result).toHaveProperty('expiresIn', 15 * 60);
      expect(result.user).not.toHaveProperty('password');
      expect(mockUserInstanceToObject).toHaveBeenCalled();
    });
  });

  describe('validateRefreshToken', () => {
    it('should validate a refresh token and return the user', async () => {
      const userId = ObjectId().toString(); // Mock ObjectId will return a string
      const user = getMockUser({ _id: userId });
      mockJwtVerify.mockReturnValue({ id: userId });
      mockUserFindById.mockResolvedValue(user);

      const result = await authService.validateRefreshToken('valid-refresh-token');

      expect(mockJwtVerify).toHaveBeenCalledWith('valid-refresh-token', 'test-jwt-refresh-secret');
      expect(mockUserFindById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });

    it('should throw an error if user is not found for refresh token', async () => {
      mockJwtVerify.mockReturnValue({ id: 'nonexistent-user-id' });
      mockUserFindById.mockResolvedValue(null);
      await expect(authService.validateRefreshToken('valid-refresh-token')).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw an error if refresh token is invalid', async () => {
      mockJwtVerify.mockImplementation(() => {
        throw new Error('jwt error');
      });
      await expect(authService.validateRefreshToken('invalid-refresh-token')).rejects.toThrow(
        'Invalid refresh token'
      );
    });
  });

  describe('authenticate', () => {
    it('should authenticate a user, create a session, and return tokens', async () => {
      const userEmail = 'test@example.com';
      const rawPassword = 'password123';
      const mockUserInstance = getMockUser({
        email: userEmail,
        password: 'hashedTestPassword',
      });
      const newSessionId = ObjectId(); // Use mocked ObjectId

      mockUserFindOne.mockResolvedValue(mockUserInstance);
      mockBcryptCompare.mockResolvedValue(true);

      // Mock the Session constructor and its save method
      Session.mockImplementation(sessionData => {
        const sessionInstance = {
          _id: newSessionId, // Use the same newSessionId for consistency
          userId: mockUserInstance._id,
          ipAddress: sessionData.ipAddress,
          userAgent: sessionData.userAgent,
          deviceFingerprint: sessionData.deviceFingerprint,
          lastActiveAt: expect.any(Date),
          expiresAt: expect.any(Date),
          isActive: true,
          save: mockSessionInstanceSave.mockResolvedValue({
            _id: newSessionId,
            userId: mockUserInstance._id,
            ...sessionData,
          }),
        };
        return sessionInstance;
      });

      mockUserInstanceSave.mockResolvedValue(mockUserInstance); // For user.save()

      const result = await authService.authenticate(
        userEmail,
        rawPassword,
        '1.1.1.1',
        'test-agent',
        { data: 'fp' }
      );

      expect(mockUserFindOne).toHaveBeenCalledWith({ email: userEmail });
      expect(mockBcryptCompare).toHaveBeenCalledWith(rawPassword, mockUserInstance.password);
      expect(Session).toHaveBeenCalledTimes(1);
      expect(mockSessionInstanceSave).toHaveBeenCalledTimes(1);
      expect(mockUserInstanceSave).toHaveBeenCalledTimes(1); // user.save() for lastActive update

      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId: newSessionId }),
        'test-jwt-secret',
        expect.any(Object)
      );
      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({ sessionId: newSessionId }),
        'test-jwt-refresh-secret',
        expect.any(Object)
      );
      expect(result).toHaveProperty('token', 'mock-token');
      expect(result.user.email).toBe(userEmail);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if user not found during authenticate', async () => {
      mockUserFindOne.mockResolvedValue(null);
      await expect(authService.authenticate('unknown@example.com', 'password')).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw error if password invalid during authenticate', async () => {
      const user = getMockUser();
      mockUserFindOne.mockResolvedValue(user);
      mockBcryptCompare.mockResolvedValue(false);
      await expect(authService.authenticate(user.email, 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('register', () => {
    it('should register a new user, create session, and return tokens', async () => {
      const userData = {
        username: 'newbie',
        email: 'newbie@example.com',
        password: 'pass123',
      };
      const registeredUserId = ObjectId(); // Use mocked ObjectId
      const newSessionId = ObjectId(); // Use mocked ObjectId

      mockUserFindOne.mockResolvedValue(null); // No existing user

      mockUserCreate.mockImplementation(data => {
        const userInstance = User({
          // User is the mocked constructor
          ...data,
          _id: registeredUserId, // Assign the predetermined mock ID
        });
        // No need to mock save on userInstance here as authService.register doesn't call user.save()
        return Promise.resolve(userInstance);
      });

      Session.mockImplementation(sessionData => {
        const sessionInstance = {
          _id: newSessionId,
          userId: registeredUserId,
          ipAddress: sessionData.ipAddress,
          userAgent: sessionData.userAgent,
          deviceFingerprint: sessionData.deviceFingerprint,
          lastActiveAt: expect.any(Date),
          expiresAt: expect.any(Date),
          isActive: true,
          save: mockSessionInstanceSave.mockResolvedValue({
            _id: newSessionId,
            userId: registeredUserId,
            ...sessionData,
          }),
        };
        return sessionInstance;
      });

      const result = await authService.register(userData, '2.2.2.2', 'reg-agent', { data: 'fp2' });

      expect(mockUserFindOne).toHaveBeenCalledWith({ username: userData.username });
      expect(mockUserFindOne).toHaveBeenCalledWith({ email: userData.email });
      expect(mockUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          username: userData.username,
          email: userData.email,
          password: expect.any(String), // Password will be hashed by the service
        })
      );

      expect(Session).toHaveBeenCalledTimes(1);
      expect(mockSessionInstanceSave).toHaveBeenCalledTimes(1);

      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: registeredUserId,
          sessionId: newSessionId,
        }),
        'test-jwt-secret',
        expect.any(Object)
      );
      expect(result).toHaveProperty('token', 'mock-token');
      expect(result.user.username).toBe(userData.username);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error if username taken during registration', async () => {
      mockUserFindOne.mockResolvedValueOnce(getMockUser()); // Simulate username found
      await expect(
        authService.register({
          username: 'testuser',
          email: 'new@example.com',
          password: 'p',
        })
      ).rejects.toThrow('Username already taken');
    });

    it('should throw error if email taken during registration', async () => {
      mockUserFindOne.mockResolvedValueOnce(null); // Username not found
      mockUserFindOne.mockResolvedValueOnce(getMockUser()); // Email found
      await expect(
        authService.register({
          username: 'new',
          email: 'test@example.com',
          password: 'p',
        })
      ).rejects.toThrow('Email already in use');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      const userId = ObjectId().toString();
      const user = getMockUser({ _id: userId });
      const sessionId = ObjectId(); // Use mocked ObjectId
      const mockExistingSession = {
        _id: sessionId,
        userId: userId,
        isActive: true,
        save: mockSessionInstanceSave.mockResolvedValueThis(), // Simulates session.save()
        lastActiveAt: new Date(), // ensure this field exists
      };

      mockJwtVerify.mockReturnValue({
        id: userId,
        sessionId: sessionId.toString(),
      });
      mockUserFindById.mockResolvedValue(user);
      mockSessionFindById.mockResolvedValue(mockExistingSession);

      const result = await authService.refreshAccessToken('valid-refresh-token');

      expect(mockJwtVerify).toHaveBeenCalledWith('valid-refresh-token', 'test-jwt-refresh-secret');
      expect(mockUserFindById).toHaveBeenCalledWith(userId);
      expect(mockSessionFindById).toHaveBeenCalledWith(sessionId.toString());
      expect(mockSessionInstanceSave).toHaveBeenCalledTimes(1); // session.save() to update lastActiveAt
      expect(mockJwtSign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: userId,
          sessionId: sessionId,
          username: user.username,
          role: user.role,
        }),
        'test-jwt-secret',
        { expiresIn: `${15 * 60}s` }
      );
      expect(result).toHaveProperty('token', 'mock-token');
      expect(result).toHaveProperty('expiresIn', 15 * 60);
    });

    it('should throw error if session not found for refresh token', async () => {
      const user = getMockUser();
      mockJwtVerify.mockReturnValue({
        id: user._id.toString(),
        sessionId: 'non-existent-session',
      });
      mockUserFindById.mockResolvedValue(user);
      mockSessionFindById.mockResolvedValue(null);
      await expect(authService.refreshAccessToken('valid-refresh-token')).rejects.toThrow(
        'Active session not found for refresh token.'
      );
    });

    it('should throw error if session is inactive for refresh token', async () => {
      const user = getMockUser();
      const sessionId = ObjectId();
      const mockInactiveSession = {
        _id: sessionId,
        userId: user._id,
        isActive: false,
        save: mockSessionInstanceSave,
      };
      mockJwtVerify.mockReturnValue({
        id: user._id.toString(),
        sessionId: sessionId.toString(),
      });
      mockUserFindById.mockResolvedValue(user);
      mockSessionFindById.mockResolvedValue(mockInactiveSession);
      await expect(authService.refreshAccessToken('valid-refresh-token')).rejects.toThrow(
        'Active session not found for refresh token.'
      );
    });
  });

  describe('validateAccessToken', () => {
    it('should validate access token, update session, and return sanitized user', async () => {
      const userId = ObjectId().toString();
      const user = getMockUser({ _id: userId });
      const sessionId = ObjectId();
      const mockActiveSession = {
        _id: sessionId,
        userId: userId,
        isActive: true,
        save: mockSessionInstanceSave.mockResolvedValueThis(),
        lastActiveAt: new Date(),
      };

      mockJwtVerify.mockReturnValue({
        id: userId,
        sessionId: sessionId.toString(),
      });
      mockUserFindById.mockResolvedValue(user); // User.findById
      mockSessionFindById.mockResolvedValue(mockActiveSession); // Session.findById

      const result = await authService.validateAccessToken('valid-access-token');

      expect(mockJwtVerify).toHaveBeenCalledWith('valid-access-token', 'test-jwt-secret');
      expect(mockUserFindById).toHaveBeenCalledWith(userId);
      expect(mockSessionFindById).toHaveBeenCalledWith(sessionId.toString());
      expect(mockSessionInstanceSave).toHaveBeenCalledTimes(1);
      expect(result).not.toHaveProperty('password');
      expect(result.username).toBe(user.username);
      expect(mockUserInstanceToObject).toHaveBeenCalled();
    });

    it('should throw error if session is invalid or expired during access token validation', async () => {
      const user = getMockUser();
      mockJwtVerify.mockReturnValue({
        id: user._id.toString(),
        sessionId: 'invalid-session',
      });
      mockUserFindById.mockResolvedValue(user);
      mockSessionFindById.mockResolvedValue(null); // Session not found
      await expect(authService.validateAccessToken('valid-access-token')).rejects.toThrow(
        'Session is invalid or expired'
      );
    });

    it('should throw specific JWT errors if token verification fails', async () => {
      const { JsonWebTokenError, TokenExpiredError } = jest.requireActual('jsonwebtoken');

      mockJwtVerify.mockImplementation(() => {
        throw new TokenExpiredError('jwt expired', new Date());
      });
      await expect(authService.validateAccessToken('expired-token')).rejects.toThrow(
        TokenExpiredError
      );

      mockJwtVerify.mockImplementation(() => {
        throw new JsonWebTokenError('jwt malformed');
      });
      await expect(authService.validateAccessToken('malformed-token')).rejects.toThrow(
        JsonWebTokenError
      );
    });
  });

  describe('logout', () => {
    it('should invalidate session and blacklist token if session ID provided', async () => {
      const sessionId = ObjectId().toString();
      const accessToken = 'some-access-token';
      const decodedUserId = ObjectId().toString();
      const decodedUser = {
        id: decodedUserId,
        exp: Date.now() / 1000 + 3600,
      }; // exp is in seconds
      const mockSession = {
        _id: sessionId,
        isActive: true,
        save: mockSessionInstanceSave.mockResolvedValueThis(),
      };

      mockSessionFindById.mockResolvedValue(mockSession);
      mockJwtDecode.mockReturnValue(decodedUser); // For blacklisting if sessionID is present
      mockTokenBlacklistCreate.mockResolvedValue({});

      await authService.logout(accessToken, sessionId);

      expect(mockSessionFindById).toHaveBeenCalledWith(sessionId);
      expect(mockSession.isActive).toBe(false); // Check property on the mock object
      expect(mockSessionInstanceSave).toHaveBeenCalledTimes(1);
      expect(mockTokenBlacklistCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          token: accessToken,
          userId: decodedUserId, // from jwtDecode
          expiresAt: new Date(decodedUser.exp * 1000), // Convert exp to Date
        })
      );
      expect(mockJwtVerify).not.toHaveBeenCalled(); // Should not verify if sessionId is present
    });

    it('should derive session ID from token, invalidate session, and blacklist token if no session ID provided', async () => {
      const accessToken = 'token-with-session';
      const userId = ObjectId().toString();
      const sessionId = ObjectId().toString();
      const decodedPayload = {
        id: userId,
        sessionId: sessionId,
        exp: Date.now() / 1000 + 3600,
      };
      const mockSession = {
        _id: sessionId,
        isActive: true,
        save: mockSessionInstanceSave.mockResolvedValueThis(),
      };

      mockJwtVerify.mockReturnValue(decodedPayload); // Used to get sessionID and userID
      mockSessionFindById.mockResolvedValue(mockSession);
      mockTokenBlacklistCreate.mockResolvedValue({});

      await authService.logout(accessToken, null);

      expect(mockJwtVerify).toHaveBeenCalledWith(accessToken, 'test-jwt-secret');
      expect(mockSessionFindById).toHaveBeenCalledWith(sessionId);
      expect(mockSession.isActive).toBe(false);
      expect(mockSessionInstanceSave).toHaveBeenCalledTimes(1);
      expect(mockTokenBlacklistCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          token: accessToken,
          userId: userId, // from jwtVerify
          expiresAt: new Date(decodedPayload.exp * 1000),
        })
      );
    });

    it('should blacklist token using decode if token verification fails during logout (no session ID) and session not found', async () => {
      const accessToken = 'bad-verify-token';
      const fallbackUserId = ObjectId().toString();
      const decodedFallback = {
        id: fallbackUserId,
        exp: Math.floor(Date.now() / 1000) + 100,
      };

      mockJwtVerify.mockImplementation(() => {
        throw new Error('Verification failed');
      });
      mockJwtDecode.mockReturnValue(decodedFallback); // Fallback for blacklisting
      mockSessionFindById.mockResolvedValue(null); // Assume session not found
      mockTokenBlacklistCreate.mockResolvedValue({});

      await authService.logout(accessToken, null);

      expect(mockJwtVerify).toHaveBeenCalledWith(accessToken, 'test-jwt-secret');
      expect(mockTokenBlacklistCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          token: accessToken,
          userId: fallbackUserId,
          expiresAt: new Date(decodedFallback.exp * 1000), // Convert exp to Date
        })
      );
      expect(mockSessionInstanceSave).not.toHaveBeenCalled(); // No session to save
    });

    it('should still blacklist token if session not found (with session ID provided)', async () => {
      const sessionId = ObjectId().toString();
      const accessToken = 'token-for-no-session';
      const decodedUserId = ObjectId().toString();
      const decodedUser = {
        id: decodedUserId,
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockSessionFindById.mockResolvedValue(null); // Session not found
      mockJwtDecode.mockReturnValue(decodedUser); // For blacklisting
      mockTokenBlacklistCreate.mockResolvedValue({});

      await authService.logout(accessToken, sessionId);

      expect(mockSessionFindById).toHaveBeenCalledWith(sessionId);
      expect(mockSessionInstanceSave).not.toHaveBeenCalled(); // No session to save
      expect(mockTokenBlacklistCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          token: accessToken,
          userId: decodedUserId,
          expiresAt: new Date(decodedUser.exp * 1000), // Convert exp to Date
        })
      );
    });
  });
});

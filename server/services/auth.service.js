// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (auth.service)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // Already has .js, no change needed here
import Session from '../models/session.model.js'; // Import the Session model
import TokenBlacklist from '../models/token-blacklist.model.js'; // Import TokenBlacklist model
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { isDeepStrictEqual } from 'node:util';

class AuthService {
  /**
   * Generate access and refresh tokens for a user
   * @param {Object} user - User document from database
   * @param {string} sessionId - The ID of the active session
   * @returns {Object} Object containing tokens and expiration time
   */
  generateTokens(user, sessionId) {
    // Access token expires in 15 minutes
    const expiresIn = 15 * 60; // 15 minutes in seconds

    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username,
        sessionId: sessionId, // Include sessionId in the access token
      },
      process.env.JWT_SECRET,
      { expiresIn: `${expiresIn}s` }
    );

    // Refresh token expires in 7 days
    const refreshToken = jwt.sign(
      { id: user._id, sessionId: sessionId }, // Include sessionId in the refresh token
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token: accessToken,
      refreshToken,
      expiresIn,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Validate a refresh token and return the associated user
   * @param {string} token - Refresh token to validate
   * @returns {Promise<Object>} User document if token is valid
   */
  async validateRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      if (error.message === 'User not found') {
        throw error;
      }
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Authenticate a user with email/username and password
   * @param {string} identifier - Email or username
   * @param {string} password - User password
   * @param {string} ipAddress - IP address of the user
   * @param {string} userAgent - User agent string
   * @param {Object} deviceFingerprint - Device fingerprint data
   * @returns {Promise<Object>} Authentication response with tokens
   */
  async authenticate(identifier, password, ipAddress, userAgent, deviceFingerprint = {}) {
    // Check if identifier is email or username
    const isEmail = identifier.includes('@');

    const query = isEmail ? { email: identifier } : { username: identifier };

    const user = await User.findOne(query);

    if (!user) {
      throw new Error('User not found');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last active timestamp for user
    user.lastActive = new Date();

    // Update known IP addresses
    if (ipAddress && !user.knownIpAddresses.includes(ipAddress)) {
      user.knownIpAddresses.push(ipAddress);
    }

    // Update known device fingerprints
    // Initialize knownDeviceFingerprints if it doesn't exist
    if (!user.knownDeviceFingerprints) {
      user.knownDeviceFingerprints = [];
    }

    const fingerprintExists = user.knownDeviceFingerprints.some(fp =>
      isDeepStrictEqual(fp, deviceFingerprint)
    );

    if (deviceFingerprint && Object.keys(deviceFingerprint).length > 0 && !fingerprintExists) {
      user.knownDeviceFingerprints.push(deviceFingerprint);
    }

    await user.save();

    // Create a new session
    const session = new Session({
      userId: user._id,
      ipAddress,
      userAgent,
      deviceFingerprint, // Store the detailed fingerprint
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Example: 7 days expiry
      isActive: true,
    });
    await session.save();

    return this.generateTokens(user, session._id);
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} ipAddress - IP address of the user
   * @param {string} userAgent - User agent string
   * @param {Object} deviceFingerprint - Device fingerprint data
   * @returns {Promise<Object>} Authentication response with tokens
   */
  async register(userData, ipAddress, userAgent, deviceFingerprint = {}) {
    // Check if username already exists
    const existingUsername = await User.findOne({ username: userData.username });
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      throw new Error('Email already in use');
    }

    // Create new user
    const user = new User({
      username: userData.username,
      email: userData.email,
      password: userData.password, // Will be hashed by pre-save hook
      role: userData.role || 'user',
      knownIpAddresses: ipAddress ? [ipAddress] : [],
      knownDeviceFingerprints: Object.keys(deviceFingerprint).length > 0 ? [deviceFingerprint] : [],
    });

    await user.save();

    // Create a new session
    const session = new Session({
      userId: user._id,
      ipAddress,
      userAgent,
      deviceFingerprint,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Example: 7 days expiry
      isActive: true,
    });
    await session.save();

    return this.generateTokens(user, session._id);
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshTokenValue - Refresh token
   * @returns {Promise<Object>} New authentication response with tokens
   */
  async refreshAccessToken(refreshTokenValue) {
    try {
      const decoded = jwt.verify(refreshTokenValue, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new Error('User not found for refresh token');
      }

      const oldSession = await Session.findById(decoded.sessionId);
      if (!oldSession || !oldSession.isActive) {
        throw new Error('Active session not found for refresh token.');
      }

      oldSession.lastActiveAt = new Date();
      await oldSession.save();

      return this.generateTokens(user, oldSession._id);
    } catch (error) {
      if (
        error.message.startsWith('User not found') ||
        error.message.startsWith('Active session not found')
      ) {
        throw error;
      }
      console.error('Refresh token validation error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Alias for refreshAccessToken to maintain backward compatibility
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New authentication response with tokens
   */
  async refreshToken(refreshToken) {
    return this.refreshAccessToken(refreshToken);
  }

  /**
   * Validate an access token
   * @param {string} token - Access token to validate
   * @returns {Promise<Object>} Sanitized user document if token is valid
   */
  async validateAccessToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      // Validate session
      const session = await Session.findById(decoded.sessionId);
      if (!session || !session.isActive) {
        throw new Error('Session is invalid or expired');
      }

      // Update last active time for the session
      session.lastActiveAt = new Date();
      await session.save();

      return this.sanitizeUser(user);
    } catch (error) {
      if (
        error.message === 'User not found' ||
        error.message === 'Session is invalid or expired' ||
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw error;
      }
      if (process.env.NODE_ENV !== 'test') {
        console.error('Unexpected error during access token validation:', error);
      }
      throw new Error('Invalid access token');
    }
  }

  /**
   * Logout a user by invalidating the session and blacklisting the token
   * @param {string} token - The access token to blacklist
   * @param {string} sessionId - The ID of the session to invalidate
   * @returns {Promise<void>}
   */
  async logout(token, sessionId) {
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentSessionId = decoded.sessionId;
      } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
          console.error('Logout error during token verification:', error);
        }
        if (token) {
          const expiry = jwt.decode(token)?.exp;
          await TokenBlacklist.create({
            token,
            tokenType: 'access',
            userId: jwt.decode(token)?.id,
            reason: 'logout',
            expiresAt: expiry ? new Date(expiry * 1000) : new Date(Date.now() + 15 * 60 * 1000),
          });
        }
        throw new Error('Invalid session or token for logout.');
      }
    }

    if (currentSessionId) {
      const session = await Session.findById(currentSessionId);
      if (session) {
        session.isActive = false;
        session.logoutReason = 'user_logout';
        await session.save();
      } else {
        console.warn(
          `Logout attempt for non-existent or already invalidated session ID: ${currentSessionId}`
        );
      }
    }

    if (token) {
      const decodedToken = jwt.decode(token);
      const expiresAt =
        decodedToken && decodedToken.exp
          ? new Date(decodedToken.exp * 1000)
          : new Date(Date.now() + 15 * 60 * 1000);
      await TokenBlacklist.create({
        token,
        tokenType: 'access',
        userId: decodedToken?.id,
        reason: 'logout',
        expiresAt,
      });
    }
  }

  /**
   * Handle OAuth authentication
   * @param {string} provider - OAuth provider name
   * @param {Object} profile - User profile from OAuth provider
   * @param {string} ipAddress - IP address of the user
   * @param {string} userAgent - User agent string
   * @param {Object} deviceFingerprint - Device fingerprint data
   * @returns {Promise<Object>} Authentication response with tokens
   */
  async handleOAuth(provider, profile, ipAddress, userAgent, deviceFingerprint = {}) {
    const query = {};
    query[`socialProfiles.${provider}.id`] = profile.id;

    let user = await User.findOne(query);

    if (!user && profile.email) {
      user = await User.findOne({ email: profile.email });

      if (user) {
        if (!user.socialProfiles) {
          user.socialProfiles = {};
        }

        user.socialProfiles[provider] = { id: profile.id };
        await user.save();
      }
    }

    if (!user) {
      user = new User({
        username: profile.username || `${provider}_${profile.id}`,
        email: profile.email || `${profile.id}@${provider}.auth`,
        password: crypto.randomBytes(16).toString('hex'),
        socialProfiles: {
          [provider]: { id: profile.id },
        },
        knownIpAddresses: ipAddress ? [ipAddress] : [],
        knownDeviceFingerprints:
          Object.keys(deviceFingerprint).length > 0 ? [deviceFingerprint] : [],
      });

      await user.save();
    } else {
      if (ipAddress && !user.knownIpAddresses.includes(ipAddress)) {
        user.knownIpAddresses.push(ipAddress);
      }
      const fingerprintExists = user.knownDeviceFingerprints?.some(fp =>
        isDeepStrictEqual(fp, deviceFingerprint)
      );
      if (deviceFingerprint && Object.keys(deviceFingerprint).length > 0 && !fingerprintExists) {
        user.knownDeviceFingerprints.push(deviceFingerprint);
      }
      await user.save();
    }

    user.lastActive = new Date();
    await user.save();

    const session = new Session({
      userId: user._id,
      ipAddress,
      userAgent,
      deviceFingerprint,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    });
    await session.save();

    return this.generateTokens(user, session._id);
  }

  /**
   * Remove sensitive information from user object
   * @param {Object} user - User document from database
   * @returns {Object} Sanitized user object
   */
  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : { ...user };

    delete userObj.password;

    return userObj;
  }
}

const authService = new AuthService();
export default authService;

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
import bcrypt from 'bcrypt';
import crypto from 'crypto';

class AuthService {
  /**
   * Generate access and refresh tokens for a user
   * @param {Object} user - User document from database
   * @returns {Object} Object containing tokens and expiration time
   */
  generateTokens(user) {
    // Access token expires in 15 minutes
    const expiresIn = 15 * 60; // 15 minutes in seconds

    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: `${expiresIn}s` }
    );

    // Refresh token expires in 7 days
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

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
   * @returns {Promise<Object>} Authentication response with tokens
   */
  async authenticate(identifier, password) {
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

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    return this.generateTokens(user);
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Authentication response with tokens
   */
  async register(userData) {
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
    });

    await user.save();

    return this.generateTokens(user);
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New authentication response with tokens
   */
  async refreshAccessToken(refreshToken) {
    const user = await this.validateRefreshToken(refreshToken);
    return this.generateTokens(user);
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

      return this.sanitizeUser(user);
    } catch (error) {
      // Preserve specific errors like 'User not found'
      if (
        error.message === 'User not found' ||
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw error; // Re-throw JWT errors or 'User not found'
      }
      // Throw a generic error for other unexpected issues
      if (process.env.NODE_ENV !== 'test') {
        console.error('Unexpected error during access token validation:', error);
      }
      throw new Error('Invalid access token');
    }
  }

  /**
   * Handle OAuth authentication
   * @param {string} provider - OAuth provider name
   * @param {Object} profile - User profile from OAuth provider
   * @returns {Promise<Object>} Authentication response with tokens
   */
  async handleOAuth(provider, profile) {
    // Find user by OAuth provider ID
    const query = {};
    query[`socialProfiles.${provider}.id`] = profile.id;

    let user = await User.findOne(query);

    // If user doesn't exist, check if email exists
    if (!user && profile.email) {
      user = await User.findOne({ email: profile.email });

      if (user) {
        // Link this OAuth account to existing user
        if (!user.socialProfiles) {
          user.socialProfiles = {};
        }

        user.socialProfiles[provider] = { id: profile.id };
        await user.save();
      }
    }

    // If still no user, create a new one
    if (!user) {
      user = new User({
        username: profile.username || `${provider}_${profile.id}`,
        email: profile.email || `${profile.id}@${provider}.auth`,
        password: crypto.randomBytes(16).toString('hex'), // Random password
        socialProfiles: {
          [provider]: { id: profile.id },
        },
      });

      await user.save();
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    return this.generateTokens(user);
  }

  /**
   * Remove sensitive information from user object
   * @param {Object} user - User document from database
   * @returns {Object} Sanitized user object
   */
  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : { ...user };

    // Remove sensitive fields
    delete userObj.password;

    return userObj;
  }
}

const authService = new AuthService();
export default authService;

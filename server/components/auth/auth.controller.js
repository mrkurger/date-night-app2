// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (auth.controller)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../users/index.js';
import passport from 'passport';
import { formatServerUrl } from '../../utils/urlHelpers.js';

// Helper function to set token cookies
const setTokenCookies = (res, token, refreshToken) => {
  // Set access token in HttpOnly cookie
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // Set refresh token in HttpOnly cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Helper function to clear token cookies
const clearTokenCookies = res => {
  res.cookie('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
  });

  res.cookie('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
  });
};

const register = async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      role: ['user', 'advertiser'].includes(role) ? role : 'user',
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Generate refresh token with longer expiry
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set tokens in HttpOnly cookies
    setTokenCookies(res, token, refreshToken);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
      expiresIn: 86400, // 1 day in seconds
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!user) return res.status(401).json({ message: info.message });

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Generate refresh token with longer expiry
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last active status
      user.lastActive = new Date();
      user.online = true;
      user.save();

      // Set tokens in HttpOnly cookies
      setTokenCookies(res, token, refreshToken);

      res.json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          role: user.role,
        },
        expiresIn: 86400, // 1 day in seconds
      });
    })(req, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    // Update user status if authenticated
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        online: false,
        lastActive: new Date(),
      });

      // Blacklist the current token
      if (req.token) {
        const TokenBlacklist = (await import('../../models/token-blacklist.model.js')).default;

        // Get token expiration from decoded token
        const expiresAt = new Date(req.tokenDecoded.exp * 1000);

        // Add token to blacklist
        await TokenBlacklist.blacklist(req.token, 'access', req.user._id, 'logout', expiresAt);

        // Also blacklist refresh token if it exists
        if (req.cookies && req.cookies.refresh_token) {
          try {
            const refreshToken = req.cookies.refresh_token;
            const decoded = jwt.verify(
              refreshToken,
              process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
            );

            const refreshExpiresAt = new Date(decoded.exp * 1000);

            await TokenBlacklist.blacklist(
              refreshToken,
              'refresh',
              req.user._id,
              'logout',
              refreshExpiresAt
            );
          } catch (error) {
            // If refresh token is invalid, just continue
            console.error('Error blacklisting refresh token:', error.message);
          }
        }
      }
    }

    // Clear auth cookies
    clearTokenCookies(res);

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Social login handlers
const githubCallback = (req, res) => {
  const token = jwt.sign(
    { id: req.user._id, username: req.user.username, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  // Generate refresh token with longer expiry
  const refreshToken = jwt.sign(
    { id: req.user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set tokens in HttpOnly cookies
  setTokenCookies(res, token, refreshToken);

  // Redirect to frontend without exposing token in URL
  const clientUrl = formatServerUrl(process.env.CLIENT_URL, 'http://localhost:4200');
  res.redirect(`${clientUrl}/auth-callback`);
};

const googleCallback = githubCallback;
const redditCallback = githubCallback;
const appleCallback = githubCallback;

// Refresh token endpoint
const refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set new tokens in cookies
    setTokenCookies(res, newToken, newRefreshToken);

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
      expiresIn: 86400, // 1 day in seconds
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      clearTokenCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: err.message,
    });
  }
};

// Export the controller methods
export default {
  register,
  login,
  logout,
  githubCallback,
  googleCallback,
  redditCallback,
  appleCallback,
  refreshToken,
};

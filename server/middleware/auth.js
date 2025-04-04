const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware to authenticate users
exports.protect = exports.authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookie first (preferred method)
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }
    // Fallback to Authorization header for API clients
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Add user to request
    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Middleware for optional authentication
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookie first (preferred method)
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }
    // Fallback to Authorization header for API clients
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, continue without authentication
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id);

    if (user) {
      // Update last active timestamp
      user.lastActive = new Date();
      await user.save();

      // Add user to request
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
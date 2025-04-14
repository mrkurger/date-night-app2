
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for csrf settings
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const { doubleCsrf } = require('csrf-csrf');
const cookieParser = require('cookie-parser');

// CSRF protection configuration
const csrfProtectionConfig = {
  getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  },
  size: 64, // Token size in bytes
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => {
    // Check for token in headers, then in request body
    return req.headers['x-csrf-token'] || (req.body && req.body._csrf);
  }
};

// Initialize CSRF protection
// In test environment, use mock functions to bypass CSRF checks
const isTestEnvironment = process.env.NODE_ENV === 'test';

let generateToken, doubleCsrfProtection, validateRequest;

if (isTestEnvironment) {
  // Mock implementations for testing
  generateToken = (res) => 'test-csrf-token';
  doubleCsrfProtection = (req, res, next) => next();
  validateRequest = (req, res) => true;
} else {
  // Real implementations for production/development
  const csrfFunctions = doubleCsrf(csrfProtectionConfig);
  generateToken = csrfFunctions.generateToken;
  doubleCsrfProtection = csrfFunctions.doubleCsrfProtection;
  validateRequest = csrfFunctions.validateRequest;
}

// Middleware to handle CSRF errors
const handleCsrfError = (err, req, res, next) => {
  // Skip validation in test environment
  if (isTestEnvironment) {
    return next(err);
  }
  
  if (err && err.code === 'CSRF_INVALID') {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token. Please refresh the page and try again.'
    });
  }
  next(err);
};

// Middleware to send CSRF token to client
const sendCsrfToken = (req, res, next) => {
  // Generate a new CSRF token
  const csrfToken = generateToken(res);

  // Set token in a non-HttpOnly cookie for JavaScript access
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false, // Client-side JavaScript needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  next();
};

// Middleware to validate CSRF token
const validateCsrfToken = (req, res, next) => {
  // Skip validation in test environment
  if (isTestEnvironment) {
    return next();
  }
  
  try {
    validateRequest(req, res);
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token. Please refresh the page and try again.'
    });
  }
};

module.exports = {
  csrfProtection: doubleCsrfProtection,
  handleCsrfError,
  sendCsrfToken,
  validateCsrfToken,
  generateToken,
  csrfMiddleware: [cookieParser(), doubleCsrfProtection, handleCsrfError, sendCsrfToken]
};
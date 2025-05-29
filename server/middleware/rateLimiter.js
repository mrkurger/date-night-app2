// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for rateLimiter settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

/**
 * Create a rate limiter with the specified window and max requests
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Maximum number of requests per window
 * @param {string} message - Error message to return
 * @returns {Function} Express middleware
 */
const createLimiter = (windowMs, max, message = 'Too many requests, please try again later.') =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { success: false, error: message },
    // Log rate limit hits
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userId: req.user ? req.user.id : 'unauthenticated',
        correlationId: req.correlationId,
        rateLimit: {
          limit: options.max,
          current: req.rateLimit.current,
          remaining: req.rateLimit.remaining,
          resetTime: new Date(req.rateLimit.resetTime),
        },
      });

      res.status(options.statusCode).json(options.message);
    },
  });

/**
 * Create a user-based rate limiter
 * Uses user ID for authenticated users and IP for unauthenticated users
 * This function is defined for future use but not currently used in the application
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxAnonymous - Maximum requests for anonymous users
 * @param {number} maxAuthenticated - Maximum requests for authenticated users
 * @param {string} message - Error message to return
 * @returns {Function} Express middleware
 */
// eslint-disable-next-line no-unused-vars
const createUserLimiter = (
  windowMs,
  maxAnonymous,
  maxAuthenticated,
  message = 'Too many requests, please try again later.'
) => {
  const limiter = rateLimit({
    windowMs,
    max: req => {
      // Use higher limit for authenticated users
      return req.user ? maxAuthenticated : maxAnonymous;
    },
    // Use user ID as key for authenticated users, IP for anonymous
    keyGenerator: req => {
      return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
    },
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: message },
    // Log rate limit hits
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userId: req.user ? req.user.id : 'unauthenticated',
        correlationId: req.correlationId,
        rateLimit: {
          limit: options.max,
          current: req.rateLimit.current,
          remaining: req.rateLimit.remaining,
          resetTime: new Date(req.rateLimit.resetTime),
        },
      });

      res.status(options.statusCode).json(options.message);
    },
  });

  return limiter;
};

// General API limiter - 100 requests per 15 minutes
export const apiLimiter = createLimiter(15 * 60 * 1000, 100);

// Auth endpoints limiter - 5 attempts per hour
export const authLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  'Too many authentication attempts, please try again later.'
);

// Registration limiter - 3 accounts per day per IP
export const registrationLimiter = createLimiter(
  24 * 60 * 60 * 1000,
  3,
  'Too many accounts created from this IP, please try again after 24 hours.'
);

// Password reset limiter - 3 attempts per hour
export const passwordResetLimiter = createLimiter(
  60 * 60 * 1000,
  3,
  'Too many password reset attempts, please try again later.'
);

// Chat message limiter - 20 messages per minute
export const chatLimiter = createLimiter(
  60 * 1000,
  20,
  'You are sending messages too quickly, please slow down.'
);

// Ad creation limiter - 10 ads per day
export const adCreationLimiter = createLimiter(
  24 * 60 * 60 * 1000,
  10,
  'You have reached the maximum number of ads you can create in a day.'
);

// Media upload limiter - 50 uploads per hour
export const mediaUploadLimiter = createLimiter(
  60 * 60 * 1000,
  50,
  'Too many file uploads, please try again later.'
);

// Search limiter - 30 searches per minute
export const searchLimiter = createLimiter(
  60 * 1000,
  30,
  'Too many search requests, please try again later.'
);

// Profile update limiter - 10 updates per hour
export const profileUpdateLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  'Too many profile updates, please try again later.'
);

/**
 * Create a rate limiter with custom options
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // 100 requests per windowMs
    message = {
      success: false,
      status: 'error',
      message: 'Too many requests, please try again later.',
    },
    ...otherOptions
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message,
    ...otherOptions,
  });
};

// Default rate limiter - lazy initialization for testing
let _rateLimiter;
export const rateLimiter = (req, res, next) => {
  if (!_rateLimiter) {
    _rateLimiter = createRateLimiter();
  }
  return _rateLimiter(req, res, next);
};

// Reset function for testing
export const resetRateLimiter = () => {
  _rateLimiter = null;
};

// Default export
export default rateLimiter;

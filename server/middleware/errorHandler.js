/**
 * Custom error class for API errors
 */
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for errorHandler settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import { logger } from '../utils/logger.js';

export class AppError extends Error {
  constructor(message, statusCode, status = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = status || (`${statusCode}`.startsWith('4') ? 'fail' : 'error');
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle JWT token errors
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

/**
 * Handle JWT token expiration
 */
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

/**
 * Handle MongoDB duplicate key errors
 */
const handleDuplicateFieldsDB = err => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB validation errors
 */
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB cast errors
 */
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

/**
 * Handle path-to-regexp parsing errors
 */
const handlePathToRegexpError = err => {
  // Log the full error for debugging
  logger.debug('Path-to-regexp error:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  return new AppError('Invalid URL format. Please check the URL and try again.', 400);
};

// Logger is imported at the top of the file

/**
 * Send error response in development environment
 */
const sendErrorDev = (err, req, res) => {
  // Log error with request details
  logger.error(`${err.statusCode} - ${err.message}`, {
    error: err,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
    query: req.query,
    correlationId: req.correlationId,
    userId: req.user ? req.user.id : 'unauthenticated',
  });

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    correlationId: req.correlationId,
  });
};

/**
 * Send error response in production environment
 */
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    // Log operational errors
    logger.warn(`${err.statusCode} - ${err.message}`, {
      error: err.name,
      method: req.method,
      url: req.originalUrl,
      correlationId: req.correlationId,
      userId: req.user ? req.user.id : 'unauthenticated',
    });

    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      correlationId: req.correlationId,
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    // Log programming errors with full details
    logger.error(`500 - Unhandled Error: ${err.message}`, {
      error: err,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      correlationId: req.correlationId,
      userId: req.user ? req.user.id : 'unauthenticated',
    });

    // In test environment, pass through the original error message for easier testing
    // In production, use a generic message
    const message = process.env.NODE_ENV === 'test' ? err.message : 'Something went wrong';

    res.status(500).json({
      success: false,
      status: 'error',
      message,
      correlationId: req.correlationId,
    });
  }
};

/**
 * Sanitize URLs in error messages to prevent path-to-regexp parsing issues
 * @param {string} message - The error message to sanitize
 * @returns {string} - The sanitized error message
 */
const sanitizeErrorMessage = message => {
  if (typeof message !== 'string') return message;
  // Replace http:// and https:// with a pattern that won't trigger path-to-regexp
  return message.replace(/https?:\/\//g, 'https__//');
};

/**
 * Global error handling middleware
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} _next - Express next function (not used as this is the final handler)
 */

export default (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Sanitize error message to prevent path-to-regexp issues
  if (err.message) {
    err.message = sanitizeErrorMessage(err.message);
  }

  // Ensure correlation ID is available
  if (!req.correlationId) {
    // Import uuid dynamically
    import('uuid')
      .then(uuid => {
        req.correlationId = uuid.v4();
      })
      .catch(() => {
        req.correlationId = `fallback-${Date.now()}`;
      });
  }

  // Different error handling for development and production
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;
    error.name = err.name;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (
      error.message &&
      (error.message.includes('path-to-regexp') || error.message.includes('Missing parameter name'))
    ) {
      error = handlePathToRegexpError(error);
    }
    if (error.name === 'MulterError') {
      error = new AppError(`File upload error: ${error.message}`, 400);
    }
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      error = new AppError('Invalid JSON in request body', 400);
    }

    sendErrorProd(error, req, res);
  }
};

// Export the AppError class for use in other files
// AppError is exported at the top of the file

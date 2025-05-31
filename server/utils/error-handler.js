import { logger } from './logger.js';

/**
 * Custom error classes
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Error handler utility functions
 */
export class ErrorHandler {
  /**
   * Handle different types of errors
   */
  static handleError(error) {
    if (error.isOperational) {
      return this.handleOperationalError(error);
    }
    return this.handleProgrammerError(error);
  }

  /**
   * Handle operational errors (expected errors)
   */
  static handleOperationalError(error) {
    logger.error('Operational Error:', {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
    });

    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      ...(error.errors && { details: error.errors }),
    };
  }

  /**
   * Handle programmer errors (unexpected errors)
   */
  static handleProgrammerError(error) {
    logger.error('Programmer Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      error: 'Internal server error',
      statusCode: 500,
    };
  }

  /**
   * Handle MongoDB errors
   */
  static handleMongoError(error) {
    let appError;

    switch (error.code) {
      case 11000: {
        // Duplicate key error
        const field = Object.keys(error.keyValue)[0];
        appError = new ConflictError(`${field} already exists`);
        break;
      }
      case 11001:
        // Duplicate key error (alternative code)
        appError = new ConflictError('Duplicate key error');
        break;
      default:
        if (error.name === 'ValidationError') {
          const errors = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message,
          }));
          appError = new ValidationError('Validation failed', errors);
        } else if (error.name === 'CastError') {
          appError = new ValidationError(`Invalid ${error.path}: ${error.value}`);
        } else {
          appError = new AppError('Database error', 500);
        }
    }

    return this.handleError(appError);
  }

  /**
   * Handle JWT errors
   */
  static handleJWTError(error) {
    let appError;

    switch (error.name) {
      case 'JsonWebTokenError':
        appError = new AuthenticationError('Invalid token');
        break;
      case 'TokenExpiredError':
        appError = new AuthenticationError('Token expired');
        break;
      case 'NotBeforeError':
        appError = new AuthenticationError('Token not active');
        break;
      default:
        appError = new AuthenticationError('Token error');
    }

    return this.handleError(appError);
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error) {
    const errors =
      error.details?.map(detail => ({
        field: detail.path?.join('.') || detail.context?.key,
        message: detail.message,
      })) || [];

    const appError = new ValidationError('Validation failed', errors);
    return this.handleError(appError);
  }

  /**
   * Express error handler middleware
   */
  static expressErrorHandler() {
    return (error, req, res, _next) => {
      let handledError;

      // Handle different types of errors
      if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        handledError = this.handleMongoError(error);
      } else if (error.name?.includes('JWT') || error.name?.includes('Token')) {
        handledError = this.handleJWTError(error);
      } else if (error.name === 'ValidationError' && error.details) {
        handledError = this.handleValidationError(error);
      } else if (error instanceof AppError) {
        handledError = this.handleError(error);
      } else {
        handledError = this.handleProgrammerError(error);
      }

      // Send error response
      res.status(handledError.statusCode || 500).json(handledError);
    };
  }

  /**
   * Async wrapper for route handlers
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Create error response
   */
  static createErrorResponse(message, statusCode = 500, details = null) {
    return {
      success: false,
      error: message,
      statusCode,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    };
  }
}

// Export error classes and handler
export default AppError;

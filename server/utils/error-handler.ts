import { Request, Response, NextFunction } from 'express';

/**
 * Custom application error class
 */
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler configuration interface
 */
interface ErrorHandlerConfig {
  includeStackTrace?: boolean;
  logErrors?: boolean;
  defaultMessage?: string;
}

/**
 * Centralized error handler
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      includeStackTrace: process.env.NODE_ENV === 'development',
      logErrors: true,
      defaultMessage: 'Something went wrong',
      ...config
    };
  }

  /**
   * Main error handling middleware
   */
  handleError = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error in development
    if (this.config.logErrors && process.env.NODE_ENV === 'development') {
      console.error('Error:', {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode
      });
    }

    // Format error response
    const errorResponse: any = {
      success: false,
      status: err.status,
      message: err.message || this.config.defaultMessage
    };

    // Add stack trace in development
    if (this.config.includeStackTrace && process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
      errorResponse.error = err;
    }

    // Handle specific error types
    if (err.name === 'ValidationError' && err.errors) {
      err.statusCode = 400;
      errorResponse.errors = Object.values(err.errors).map((e: any) => ({
        field: e.path,
        message: e.message
      }));
    } else if (err.name === 'CastError') {
      err.statusCode = 400;
      errorResponse.message = `Invalid ${err.path}: ${err.value}`;
    } else if (err.code === 11000) { // Duplicate key error
      err.statusCode = 400;
      const field = Object.keys(err.keyValue)[0];
      errorResponse.message = `Duplicate field value: ${field}. Please use another value`;
    } else if (err.name === 'JsonWebTokenError') {
      err.statusCode = 401;
      errorResponse.message = 'Invalid token. Please log in again';
    } else if (err.name === 'TokenExpiredError') {
      err.statusCode = 401;
      errorResponse.message = 'Token expired. Please log in again';
    }

    // Send error response
    res.status(err.statusCode).json(errorResponse);
  };

  /**
   * Catch async errors
   */
  catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
    };
  };

  /**
   * Create a new AppError instance
   */
  createError = (message: string, statusCode: number) => {
    return new AppError(message, statusCode);
  };
}

// Create default error handler instance
const defaultErrorHandler = new ErrorHandler();

export const {
  handleError,
  catchAsync,
  createError
} = defaultErrorHandler;

export default defaultErrorHandler;

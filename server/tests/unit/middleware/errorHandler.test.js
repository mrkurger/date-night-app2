// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the errorHandler middleware
//
// COMMON CUSTOMIZATIONS:
// - MOCK_ERROR_HANDLING: Settings for error handling in tests
//   Related to: server/middleware/errorHandler.js
// ===================================================

import { jest } from '@jest/globals';
import { errorHandler, AppError } from '../../../middleware/errorHandler.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers.js';

// Mock dependencies
jest.mock('../../../utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Error Handler Middleware', () => {
  let req, res, next;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request, response, and next function
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
  });

  afterAll(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('AppError class', () => {
    it('should create an error with status code and isOperational flag', () => {
      const error = new AppError('Test error', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
    });

    it('should set status to error for 500 status codes', () => {
      const error = new AppError('Server error', 500);

      expect(error.status).toBe('error');
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 400);

      expect(error.stack).toBeDefined();
    });
  });

  describe('errorHandler middleware', () => {
    it('should handle operational errors', () => {
      const error = new AppError('Validation error', 400);

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Validation error',
      });
    });

    it('should handle programming errors in production', () => {
      // Set NODE_ENV to production
      process.env.NODE_ENV = 'production';

      const error = new Error('Programming error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'error',
        message: 'Something went wrong',
      });
    });

    it('should include error details in development', () => {
      // Set NODE_ENV to development
      process.env.NODE_ENV = 'development';

      const error = new Error('Programming error');
      error.stack = 'Error stack trace';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'error',
        message: 'Programming error',
        stack: 'Error stack trace',
        error: error,
      });
    });

    it('should handle mongoose validation errors', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        name: { message: 'Name is required' },
        email: { message: 'Email is invalid' },
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Validation failed: Name is required, Email is invalid',
      });
    });

    it('should handle mongoose cast errors', () => {
      const error = new Error('Cast to ObjectId failed');
      error.name = 'CastError';
      error.path = '_id';
      error.value = 'invalid-id';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Invalid _id: invalid-id',
      });
    });

    it('should handle mongoose duplicate key errors', () => {
      const error = new Error('Duplicate key error');
      error.name = 'MongoError';
      error.code = 11000;
      error.keyValue = { email: 'test@example.com' };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Duplicate field value: email. Please use another value',
      });
    });

    it('should handle JWT errors', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Invalid token. Please log in again',
      });
    });

    it('should handle JWT expiration errors', () => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Token expired. Please log in again',
      });
    });

    it('should handle multer file size errors', () => {
      const error = new Error('File too large');
      error.name = 'MulterError';
      error.code = 'LIMIT_FILE_SIZE';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'File too large. Maximum file size is 5MB',
      });
    });

    it('should handle other multer errors', () => {
      const error = new Error('Multer error');
      error.name = 'MulterError';
      error.code = 'LIMIT_UNEXPECTED_FILE';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Multer error: LIMIT_UNEXPECTED_FILE',
      });
    });

    it('should handle SyntaxError for JSON parsing', () => {
      const error = new SyntaxError('Unexpected token in JSON');
      error.status = 400;
      error.body = '{"invalid": json}';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Invalid JSON. Please check your request body',
      });
    });

    it('should handle errors with custom status codes', () => {
      const error = new Error('Not found');
      error.statusCode = 404;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Not found',
      });
    });

    it('should log errors', () => {
      const error = new Error('Test error');

      errorHandler(error, req, res, next);

      expect(require('../../../utils/logger.js').logger.error).toHaveBeenCalled();
    });
  });
});

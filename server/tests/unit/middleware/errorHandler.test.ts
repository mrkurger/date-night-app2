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
import errorHandler, { AppError } from '../../../middleware/errorHandler.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers.ts';

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
    req.correlationId = 'test-correlation-id'; // Add correlation ID for tests
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
        correlationId: 'test-correlation-id',
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
        correlationId: 'test-correlation-id',
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
        correlationId: 'test-correlation-id',
      });
    });

    it('should handle mongoose validation errors', () => {
      // Set NODE_ENV to production for this test
      process.env.NODE_ENV = 'production';

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
        message: 'Invalid input data. Name is required. Email is invalid',
        correlationId: 'test-correlation-id',
      });
    });

    it('should handle mongoose cast errors', () => {
      // Set NODE_ENV to production for this test
      process.env.NODE_ENV = 'production';

      const error = new Error('Cast to ObjectId failed');
      error.name = 'CastError';
      error.path = '_id';
      error.value = 'invalid-id';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Invalid _id: invalid-id.',
        correlationId: 'test-correlation-id',
      });
    });

    it('should handle mongoose duplicate key errors', () => {
      // Set NODE_ENV to production for this test
      process.env.NODE_ENV = 'production';

      const error = new Error(
        'E11000 duplicate key error collection: test.users index: email_1 dup key: { email: "test@example.com" }'
      );
      error.name = 'MongoError';
      error.code = 11000;
      error.keyValue = { email: 'test@example.com' };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Duplicate field value: "test@example.com". Please use another value.',
        correlationId: 'test-correlation-id',
      });
    });

    it('should handle JWT errors', () => {
      // Set NODE_ENV to production for this test
      process.env.NODE_ENV = 'production';

      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Invalid token. Please log in again.',
        correlationId: 'test-correlation-id',
      });
    });

    it('should handle JWT expiration errors', () => {
      // Set NODE_ENV to production for this test
      process.env.NODE_ENV = 'production';

      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Your token has expired. Please log in again.',
        correlationId: 'test-correlation-id',
      });
    });

    it('should handle multer file size errors', () => {
      // Set NODE_ENV to production for this test
      process.env.NODE_ENV = 'production';

      const error = new Error('File too large');
      error.name = 'MulterError';
      error.code = 'LIMIT_FILE_SIZE';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'File upload error: File too large',
        correlationId: 'test-correlation-id',
      });
    });

    it('should handle other multer errors', () => {
      // Set NODE_ENV to production for this test
      process.env.NODE_ENV = 'production';

      const error = new Error('Multer error');
      error.name = 'MulterError';
      error.code = 'LIMIT_UNEXPECTED_FILE';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'File upload error: Multer error',
        correlationId: 'test-correlation-id',
      });
    });

    it('should handle SyntaxError for JSON parsing', () => {
      // Set NODE_ENV to production for this test
      process.env.NODE_ENV = 'production';

      const error = new SyntaxError('Unexpected token in JSON');
      error.status = 400;
      error.body = '{"invalid": json}';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Invalid JSON in request body',
        correlationId: 'test-correlation-id',
      });
    });

    it('should handle errors with custom status codes', () => {
      // Set NODE_ENV to production for this test
      process.env.NODE_ENV = 'production';

      const error = new Error('Not found');
      error.statusCode = 404;
      error.status = 'fail'; // Set the status explicitly
      error.isOperational = true; // Make it operational so it gets handled properly

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Not found',
        correlationId: 'test-correlation-id',
      });
    });

    it('should log errors', () => {
      const error = new Error('Test error');

      errorHandler(error, req, res, next);

      expect(require('../../../utils/logger.js').logger.error).toHaveBeenCalled();
    });
  });
});

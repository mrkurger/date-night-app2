import { Request, Response, NextFunction } from 'express';
import { ErrorHandler, AppError } from '../../../utils/error-handler';

describe('Error Handler', () => {
  let errorHandler: ErrorHandler;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    errorHandler = new ErrorHandler({
      includeStackTrace: true,
      logErrors: false,
    });

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('Error Handling', () => {
    it('should handle operational errors', () => {
      const error = new AppError('Not found', 404);

      errorHandler.handleError(error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Not found',
        stack: expect.any(String),
        error: expect.any(AppError),
      });
    });

    it('should handle validation errors', () => {
      const error = {
        name: 'ValidationError',
        errors: {
          email: { path: 'email', message: 'Invalid email' },
          password: { path: 'password', message: 'Password too short' },
        },
      };

      errorHandler.handleError(error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: expect.any(String),
        errors: expect.arrayContaining([
          { field: 'email', message: 'Invalid email' },
          { field: 'password', message: 'Password too short' },
        ]),
        stack: expect.any(String),
        error: expect.any(Object),
      });
    });

    it('should handle duplicate key errors', () => {
      const error = {
        name: 'MongoError',
        code: 11000,
        keyValue: { email: 'test@example.com' },
      };

      errorHandler.handleError(error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Duplicate field value: email. Please use another value',
        stack: expect.any(String),
        error: expect.any(Object),
      });
    });

    it('should handle JWT errors', () => {
      const error = {
        name: 'JsonWebTokenError',
        message: 'Invalid token',
      };

      errorHandler.handleError(error, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'fail',
        message: 'Invalid token. Please log in again',
        stack: expect.any(String),
        error: expect.any(Object),
      });
    });
  });

  describe('Async Error Catching', () => {
    it('should catch async errors', async () => {
      const asyncFn = async () => {
        throw new Error('Async error');
      };

      const wrappedFn = errorHandler.catchAsync(asyncFn);
      await wrappedFn(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Error Creation', () => {
    it('should create AppError instances', () => {
      const error = errorHandler.createError('Custom error', 400);

      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail');
      expect(error.message).toBe('Custom error');
    });
  });
});

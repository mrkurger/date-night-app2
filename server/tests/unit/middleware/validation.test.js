// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains unit tests for the validation middleware
//
// COMMON CUSTOMIZATIONS:
// - VALIDATION_SCHEMAS: Validation schemas for different routes
//   Related to: server/middleware/validation.js
// ===================================================

import { jest } from '@jest/globals';
import { mockRequest, mockResponse, mockNext } from '../../helpers.js';
import { validateBody, validateQuery, validateParams } from '../../../middleware/validation.js';

describe('Validation Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    next.mockClear();
  });

  describe('validateBody', () => {
    it('should pass validation for valid request body', () => {
      const schema = {
        validate: jest.fn().mockReturnValue({ error: null }),
      };

      req.body = {
        name: 'Test User',
        email: 'test@example.com',
      };

      validateBody(schema)(req, res, next);

      expect(schema.validate).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject invalid request body', () => {
      const validationError = {
        details: [{ message: 'Name is required' }],
      };

      const schema = {
        validate: jest.fn().mockReturnValue({ error: validationError }),
      };

      req.body = {
        // Missing required name field
        email: 'test@example.com',
      };

      validateBody(schema)(req, res, next);

      expect(schema.validate).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Name is required'),
          statusCode: 400,
        })
      );
    });

    it('should handle empty request body', () => {
      const schema = {
        validate: jest.fn().mockReturnValue({ error: null }),
      };

      req.body = {};

      validateBody(schema)(req, res, next);

      expect(schema.validate).toHaveBeenCalledWith({});
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle undefined request body', () => {
      const schema = {
        validate: jest.fn().mockReturnValue({ error: null }),
      };

      req.body = undefined;

      validateBody(schema)(req, res, next);

      expect(schema.validate).toHaveBeenCalledWith({});
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('validateQuery', () => {
    it('should pass validation for valid query parameters', () => {
      const schema = {
        validate: jest.fn().mockReturnValue({ error: null }),
      };

      req.query = {
        page: '1',
        limit: '10',
      };

      validateQuery(schema)(req, res, next);

      expect(schema.validate).toHaveBeenCalledWith(req.query);
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject invalid query parameters', () => {
      const validationError = {
        details: [{ message: 'Page must be a number' }],
      };

      const schema = {
        validate: jest.fn().mockReturnValue({ error: validationError }),
      };

      req.query = {
        page: 'invalid',
        limit: '10',
      };

      validateQuery(schema)(req, res, next);

      expect(schema.validate).toHaveBeenCalledWith(req.query);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Page must be a number'),
          statusCode: 400,
        })
      );
    });

    it('should handle empty query parameters', () => {
      const schema = {
        validate: jest.fn().mockReturnValue({ error: null }),
      };

      req.query = {};

      validateQuery(schema)(req, res, next);

      expect(schema.validate).toHaveBeenCalledWith({});
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('validateParams', () => {
    it('should pass validation for valid route parameters', () => {
      const schema = {
        validate: jest.fn().mockReturnValue({ error: null }),
      };

      req.params = {
        id: '507f1f77bcf86cd799439011',
      };

      validateParams(schema)(req, res, next);

      expect(schema.validate).toHaveBeenCalledWith(req.params);
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject invalid route parameters', () => {
      const validationError = {
        details: [{ message: 'ID must be a valid MongoDB ObjectId' }],
      };

      const schema = {
        validate: jest.fn().mockReturnValue({ error: validationError }),
      };

      req.params = {
        id: 'invalid-id',
      };

      validateParams(schema)(req, res, next);

      expect(schema.validate).toHaveBeenCalledWith(req.params);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('ID must be a valid MongoDB ObjectId'),
          statusCode: 400,
        })
      );
    });

    it('should handle empty route parameters', () => {
      const schema = {
        validate: jest.fn().mockReturnValue({ error: null }),
      };

      req.params = {};

      validateParams(schema)(req, res, next);

      expect(schema.validate).toHaveBeenCalledWith({});
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Error Handling', () => {
    it('should format validation error messages correctly', () => {
      const validationError = {
        details: [{ message: 'Name is required' }, { message: 'Email must be valid' }],
      };

      const schema = {
        validate: jest.fn().mockReturnValue({ error: validationError }),
      };

      req.body = {
        // Invalid data
      };

      validateBody(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            expect.stringContaining('Name is required'),
            expect.stringContaining('Email must be valid'),
          ],
          statusCode: 400,
        })
      );
    });

    it('should handle unexpected validation errors gracefully', () => {
      const schema = {
        validate: jest.fn().mockImplementation(() => {
          throw new Error('Unexpected validation error');
        }),
      };

      req.body = {
        name: 'Test User',
      };

      validateBody(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('validation'),
          statusCode: 500,
        })
      );
    });
  });
});

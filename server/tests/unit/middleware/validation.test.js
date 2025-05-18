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
// Import the actual 'validate' function and express-validator functions
import { validate } from '../../../middleware/validation.js';
import { body, query, param, validationResult } from 'express-validator';

// Mock express-validator's validationResult
jest.mock('express-validator', () => ({
  ...jest.requireActual('express-validator'), // Import and retain default behavior
  validationResult: jest.fn(),
}));

// Mock the response utility
jest.mock('../../../utils/response.js', () => ({
  validationErrorResponse: jest.fn(errors => ({
    success: false,
    message: 'Validation failed',
    errors,
  })),
}));

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
    it('should pass validation for valid request body', async () => {
      const validations = [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
      ];
      req.body = { name: 'Test User', email: 'test@example.com' };
      validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
      await validate(validations)(req, res, next);
      expect(validationResult).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject invalid request body', async () => {
      const validations = [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
      ];
      req.body = { email: 'test@example.com' }; // Missing name
      const mockErrors = [{ path: 'name', msg: 'Name is required', value: undefined }];
      validationResult.mockReturnValue({ isEmpty: () => false, array: () => mockErrors });
      await validate(validations)(req, res, next);
      expect(validationResult).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: mockErrors,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateQuery', () => {
    it('should pass validation for valid request query', async () => {
      const validations = [
        query('page').isInt().withMessage('Page must be an integer'),
        query('limit').isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
      ];
      req.query = { page: '1', limit: '10' };
      validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
      await validate(validations)(req, res, next);
      expect(validationResult).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid request query', async () => {
      const validations = [query('page').isInt().withMessage('Page must be an integer')];
      req.query = { page: 'abc' }; // Invalid
      const mockErrors = [{ path: 'page', msg: 'Page must be an integer', value: 'abc' }];
      validationResult.mockReturnValue({ isEmpty: () => false, array: () => mockErrors });
      await validate(validations)(req, res, next);
      expect(validationResult).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: mockErrors,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateParams', () => {
    it('should pass validation for valid request params', async () => {
      const validations = [param('id').isUUID().withMessage('ID must be a valid UUID')];
      req.params = { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' };
      validationResult.mockReturnValue({ isEmpty: () => true, array: () => [] });
      await validate(validations)(req, res, next);
      expect(validationResult).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid request params', async () => {
      const validations = [param('id').isUUID().withMessage('ID must be a valid UUID')];
      req.params = { id: 'invalid-uuid' };
      const mockErrors = [{ path: 'id', msg: 'ID must be a valid UUID', value: 'invalid-uuid' }];
      validationResult.mockReturnValue({ isEmpty: () => false, array: () => mockErrors });
      await validate(validations)(req, res, next);
      expect(validationResult).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: mockErrors,
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      const validations = [body('name').notEmpty().withMessage('Name is required')];

      req.body = {
        name: 'Test User',
      };

      validationResult.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await validate(validations)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

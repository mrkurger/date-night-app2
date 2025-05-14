// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains unit tests for the requestValidator middleware
//
// COMMON CUSTOMIZATIONS:
// - VALIDATION_SCHEMAS: Validation schemas for different routes
//   Related to: server/middleware/requestValidator.js
// ===================================================

import { jest } from '@jest/globals';
import { mockRequest, mockResponse, mockNext } from '../../helpers.js';
import requestValidator from '../../../middleware/requestValidator.js';
import Joi from 'joi';

describe('Request Validator Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    next.mockClear();
  });

  describe('Schema Validation', () => {
    it('should validate request body against schema and pass if valid', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().integer().min(18).required(),
      });

      req.body = {
        name: 'Test User',
        age: 25,
      };

      requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject request with invalid body', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().integer().min(18).required(),
      });

      req.body = {
        name: 'Test User',
        age: 17, // Below minimum age
      };

      requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('age'),
          statusCode: 400,
        })
      );
    });

    it('should reject request with missing required fields', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().integer().min(18).required(),
      });

      req.body = {
        name: 'Test User',
        // Missing age field
      };

      requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('required'),
          statusCode: 400,
        })
      );
    });

    it('should validate query parameters if specified', () => {
      const schema = Joi.object({
        limit: Joi.number().integer().min(1).max(100),
        page: Joi.number().integer().min(1),
      });

      req.query = {
        limit: '20',
        page: '2',
      };

      requestValidator(schema, 'query')(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should validate params if specified', () => {
      const schema = Joi.object({
        id: Joi.string().length(24).hex().required(),
      });

      req.params = {
        id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId format
      };

      requestValidator(schema, 'params')(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle complex nested schemas', () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            zipCode: Joi.string()
              .pattern(/^\d{5}$/)
              .required(),
          }).required(),
        }).required(),
        preferences: Joi.array().items(Joi.string()).min(1).required(),
      });

      req.body = {
        user: {
          name: 'Test User',
          address: {
            street: '123 Main St',
            city: 'Oslo',
            zipCode: '12345',
          },
        },
        preferences: ['email', 'sms'],
      };

      requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle array validation', () => {
      const schema = Joi.object({
        items: Joi.array()
          .items(
            Joi.object({
              id: Joi.string().required(),
              quantity: Joi.number().integer().min(1).required(),
            })
          )
          .min(1)
          .required(),
      });

      req.body = {
        items: [
          { id: 'item1', quantity: 2 },
          { id: 'item2', quantity: 1 },
        ],
      };

      requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle conditional validation', () => {
      const schema = Joi.object({
        paymentType: Joi.string().valid('credit', 'bank').required(),
        creditCardNumber: Joi.when('paymentType', {
          is: 'credit',
          then: Joi.string().required(),
          otherwise: Joi.forbidden(),
        }),
        bankAccountNumber: Joi.when('paymentType', {
          is: 'bank',
          then: Joi.string().required(),
          otherwise: Joi.forbidden(),
        }),
      });

      req.body = {
        paymentType: 'credit',
        creditCardNumber: '4111111111111111',
      };

      requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should provide detailed error messages', () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).pattern(/[A-Z]/).pattern(/[0-9]/).required().messages({
          'string.min': 'Password must be at least 8 characters',
          'string.pattern.base':
            'Password must contain at least one uppercase letter and one number',
        }),
      });

      req.body = {
        email: 'not-an-email',
        password: 'weak',
      };

      requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('email'),
          statusCode: 400,
        })
      );
    });
  });
});

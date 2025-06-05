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
import { mockRequest, mockResponse, mockNext } from '../../helpers.ts.js';
import requestValidator from '../../../middleware/requestValidator.js';
import { z } from 'zod';

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
    it('should validate request body against schema and pass if valid', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().int().min(18),
      });

      req.body = {
        name: 'Test User',
        age: 25,
      };

      await requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject request with invalid body', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().int().min(18),
      });

      req.body = {
        name: 'Test User',
        age: 17, // Below minimum age
      };

      await requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Validation failed'),
          statusCode: 400,
        })
      );
    });

    it('should reject request with missing required fields', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().int().min(18),
      });

      req.body = {
        name: 'Test User',
        // Missing age field
      };

      await requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Validation failed'),
          statusCode: 400,
        })
      );
    });

    it('should validate query parameters if specified', async () => {
      const schema = z.object({
        limit: z.coerce.number().int().min(1).max(100),
        page: z.coerce.number().int().min(1),
      });

      req.query = {
        limit: '20',
        page: '2',
      };

      await requestValidator(schema, 'query')(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should validate params if specified', async () => {
      const schema = z.object({
        id: z
          .string()
          .length(24)
          .regex(/^[0-9a-fA-F]+$/),
      });

      req.params = {
        id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId format
      };

      await requestValidator(schema, 'params')(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle complex nested schemas', async () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          address: z.object({
            street: z.string(),
            city: z.string(),
            zipCode: z.string().regex(/^\d{5}$/),
          }),
        }),
        preferences: z.array(z.string()).min(1),
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

      await requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle array validation', async () => {
      const schema = z.object({
        items: z
          .array(
            z.object({
              id: z.string(),
              quantity: z.number().int().min(1),
            })
          )
          .min(1),
      });

      req.body = {
        items: [
          { id: 'item1', quantity: 2 },
          { id: 'item2', quantity: 1 },
        ],
      };

      await requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle conditional validation', async () => {
      const schema = z
        .object({
          paymentType: z.enum(['credit', 'bank']),
          creditCardNumber: z.string().optional(),
          bankAccountNumber: z.string().optional(),
        })
        .refine(
          data => {
            if (data.paymentType === 'credit') {
              return !!data.creditCardNumber && !data.bankAccountNumber;
            }
            if (data.paymentType === 'bank') {
              return !!data.bankAccountNumber && !data.creditCardNumber;
            }
            return false;
          },
          {
            message: 'Invalid payment method configuration',
          }
        );

      req.body = {
        paymentType: 'credit',
        creditCardNumber: '4111111111111111',
      };

      await requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should provide detailed error messages', async () => {
      const schema = z.object({
        email: z.string().email('Invalid email format'),
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
          .regex(/[0-9]/, 'Password must contain at least one number'),
      });

      req.body = {
        email: 'not-an-email',
        password: 'weak',
      };

      await requestValidator(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Validation failed'),
          statusCode: 400,
        })
      );
    });
  });
});

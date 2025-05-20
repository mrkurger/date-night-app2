import { Request, Response, NextFunction } from 'express';
import { ValidationUtils, zodSchemas } from '../../../utils/validation-utils';
import { body } from 'express-validator';
import Joi from 'joi';
import mongoose from 'mongoose';
import { z } from 'zod';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';

describe('Validation Utils', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis() as jest.MockedFunction<Response['status']>,
      json: jest.fn() as jest.MockedFunction<Response['json']>,
    };
    next = jest.fn();
  });

  describe('Express Validator Integration', () => {
    it('should pass validation for valid request body', async () => {
      const validations = [body('name').notEmpty(), body('email').isEmail()];

      req.body = {
        name: 'Test User',
        email: 'test@example.com',
      };

      await ValidationUtils.validate(validations)(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it('should fail validation for invalid request body', async () => {
      const validations = [body('name').notEmpty(), body('email').isEmail()];

      req.body = {
        name: '', // Empty name
        email: 'invalid-email', // Invalid email
      };

      await ValidationUtils.validate(validations)(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.any(String),
          }),
          expect.objectContaining({
            field: 'email',
            message: expect.any(String),
          }),
        ]),
      });
    });
  });

  describe('Joi Integration', () => {
    it('should validate using Joi schema', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().integer().min(18).required(),
      });

      req.body = {
        name: 'Test User',
        age: 25,
      };

      ValidationUtils.validateWithJoi(schema)(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it('should handle Joi validation errors', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().integer().min(18).required(),
      });

      req.body = {
        name: 'Test User',
        age: 17, // Under minimum age
      };

      ValidationUtils.validateWithJoi(schema)(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'age',
            message: expect.stringContaining('18'),
          }),
        ]),
      });
    });
  });

  describe('Common Validators', () => {
    it('should validate email addresses', () => {
      expect(ValidationUtils.validators.isEmail('test@example.com')).toBe(true);
      expect(ValidationUtils.validators.isEmail('invalid-email')).toBe(false);
    });

    it('should validate strong passwords', () => {
      expect(ValidationUtils.validators.isStrongPassword('Test123!')).toBe(true);
      expect(ValidationUtils.validators.isStrongPassword('weak')).toBe(false);
    });

    it('should validate dates', () => {
      expect(ValidationUtils.validators.isValidDate('2025-05-20')).toBe(true);
      expect(ValidationUtils.validators.isValidDate('invalid-date')).toBe(false);
    });

    it('should validate coordinates', () => {
      expect(ValidationUtils.validators.isValidLatitude(45)).toBe(true);
      expect(ValidationUtils.validators.isValidLatitude(91)).toBe(false);

      expect(ValidationUtils.validators.isValidLongitude(180)).toBe(true);
      expect(ValidationUtils.validators.isValidLongitude(181)).toBe(false);
    });

    it('should validate secure URLs', () => {
      expect(ValidationUtils.validators.isSecureUrl('https://example.com')).toBe(true);
      expect(ValidationUtils.validators.isSecureUrl('http://example.com')).toBe(false);
    });
  });

  describe('Zod Schema Validation', () => {
    describe('objectId', () => {
      it('should validate valid ObjectId', () => {
        const validId = new mongoose.Types.ObjectId().toString();
        expect(() => zodSchemas.objectId.parse(validId)).not.toThrow();
      });

      it('should reject invalid ObjectId', () => {
        expect(() => zodSchemas.objectId.parse('invalid-id')).toThrow();
      });
    });

    describe('email', () => {
      it('should validate valid email', () => {
        expect(() => zodSchemas.email.parse('test@example.com')).not.toThrow();
      });

      it('should reject invalid email', () => {
        expect(() => zodSchemas.email.parse('invalid-email')).toThrow();
      });
    });

    describe('password', () => {
      it('should validate valid password', () => {
        expect(() => zodSchemas.password.parse('ValidPass1!')).not.toThrow();
      });

      it('should reject password without uppercase', () => {
        expect(() => zodSchemas.password.parse('validpass1!')).toThrow();
      });

      it('should reject password without lowercase', () => {
        expect(() => zodSchemas.password.parse('VALIDPASS1!')).toThrow();
      });

      it('should reject password without number', () => {
        expect(() => zodSchemas.password.parse('ValidPass!')).toThrow();
      });
    });

    describe('norwegianPhone', () => {
      it('should validate valid Norwegian phone', () => {
        expect(() => zodSchemas.norwegianPhone.parse('+4745678901')).not.toThrow();
        expect(() => zodSchemas.norwegianPhone.parse('45678901')).not.toThrow();
      });

      it('should reject invalid Norwegian phone', () => {
        expect(() => zodSchemas.norwegianPhone.parse('+1234567890')).toThrow();
        expect(() => zodSchemas.norwegianPhone.parse('123')).toThrow();
      });
    });

    describe('norwegianPostalCode', () => {
      it('should validate valid Norwegian postal code', () => {
        expect(() => zodSchemas.norwegianPostalCode.parse('0123')).not.toThrow();
      });

      it('should reject invalid Norwegian postal code', () => {
        expect(() => zodSchemas.norwegianPostalCode.parse('123')).toThrow();
        expect(() => zodSchemas.norwegianPostalCode.parse('12345')).toThrow();
      });
    });

    describe('coordinates', () => {
      it('should validate valid coordinates', () => {
        expect(() =>
          zodSchemas.coordinates.parse({
            type: 'Point',
            coordinates: [10.5, 59.9],
          })
        ).not.toThrow();
      });

      it('should reject invalid coordinates', () => {
        expect(() =>
          zodSchemas.coordinates.parse({
            type: 'Point',
            coordinates: [200, 100],
          })
        ).toThrow();
      });
    });
  });
});

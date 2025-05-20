import { Request, Response, NextFunction } from 'express';
import { ValidationUtils, zodSchemas } from '../../../utils/validation-utils';
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

  describe('Zod Validation', () => {
    const userSchema = z.object({
      name: z.string().min(1),
      email: zodSchemas.email,
      password: zodSchemas.password,
    });

    it('should pass validation for valid request body', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      await ValidationUtils.validateWithZod(userSchema)(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should fail validation for invalid request body', async () => {
      req.body = {
        name: '',
        email: 'invalid-email',
        password: 'weak',
      };

      await ValidationUtils.validateWithZod(userSchema)(req as Request, res as Response, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      });
    });
  });

  describe('ObjectId Validation', () => {
    it('should validate correct MongoDB ObjectId', () => {
      const validId = new mongoose.Types.ObjectId().toString();
      expect(ValidationUtils.validateObjectId(validId)).toBe(true);
    });

    it('should reject invalid MongoDB ObjectId', () => {
      const invalidId = 'invalid-id';
      expect(ValidationUtils.validateObjectId(invalidId)).toBe(false);
    });
  });

  describe('Norwegian Phone Validation', () => {
    it('should validate correct Norwegian phone numbers', () => {
      expect(ValidationUtils.isValidNorwegianPhone('+4799999999')).toBe(true);
      expect(ValidationUtils.isValidNorwegianPhone('99999999')).toBe(true);
    });

    it('should reject invalid Norwegian phone numbers', () => {
      expect(ValidationUtils.isValidNorwegianPhone('12345')).toBe(false);
      expect(ValidationUtils.isValidNorwegianPhone('+1234567890')).toBe(false);
    });
  });

  describe('Norwegian Postal Code Validation', () => {
    it('should validate correct Norwegian postal codes', () => {
      expect(ValidationUtils.isValidNorwegianPostalCode('0001')).toBe(true);
      expect(ValidationUtils.isValidNorwegianPostalCode('9999')).toBe(true);
    });

    it('should reject invalid Norwegian postal codes', () => {
      expect(ValidationUtils.isValidNorwegianPostalCode('123')).toBe(false);
      expect(ValidationUtils.isValidNorwegianPostalCode('12345')).toBe(false);
      expect(ValidationUtils.isValidNorwegianPostalCode('abcd')).toBe(false);
    });
  });

  describe('Zod Common Schemas', () => {
    it('should validate shortString schema', () => {
      const result = zodSchemas.shortString.safeParse('Valid string');
      expect(result.success).toBe(true);

      const emptyResult = zodSchemas.shortString.safeParse('');
      expect(emptyResult.success).toBe(false);

      const longString = 'a'.repeat(256);
      const longResult = zodSchemas.shortString.safeParse(longString);
      expect(longResult.success).toBe(false);
    });

    it('should validate email schema', () => {
      const result = zodSchemas.email.safeParse('test@example.com');
      expect(result.success).toBe(true);

      const invalidResult = zodSchemas.email.safeParse('invalid-email');
      expect(invalidResult.success).toBe(false);
    });

    it('should validate password schema', () => {
      const result = zodSchemas.password.safeParse('Password123!');
      expect(result.success).toBe(true);

      const weakResult = zodSchemas.password.safeParse('weak');
      expect(weakResult.success).toBe(false);
    });

    it('should validate coordinates schema', () => {
      const result = zodSchemas.coordinates.safeParse([10.5, 45.3]);
      expect(result.success).toBe(true);

      const invalidResult = zodSchemas.coordinates.safeParse([200, 100]);
      expect(invalidResult.success).toBe(false);
    });

    it('should validate pagination schema', () => {
      const result = zodSchemas.pagination.safeParse({
        page: 1,
        limit: 10,
        sort: 'name',
        order: 'asc',
      });
      expect(result.success).toBe(true);

      const invalidResult = zodSchemas.pagination.safeParse({
        page: 0,
        limit: 1000,
      });
      expect(invalidResult.success).toBe(false);
    });
  });
});

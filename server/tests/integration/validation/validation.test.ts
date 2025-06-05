import { describe, expect, test } from '@jest/globals';
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import request from 'supertest';
import { z } from 'zod';
import { ValidationMiddleware } from '../../../middleware/validation/middleware.js';
import { zodSchemas } from '../../../utils/validation-utils.js';

const app = express();
app.use(express.json());

const validateRequestBody =
  (schema: z.ZodType): RequestHandler =>
  (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({
          success: false,
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };

const validateRequestQuery =
  (schema: z.ZodType): RequestHandler =>
  (req, res, next) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({
          success: false,
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };

const validateRequestParams =
  (schema: z.ZodType): RequestHandler =>
  (req, res, next) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(422).json({
          success: false,
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };

const sendSuccess: RequestHandler = (req, res) => {
  res.json({ success: true });
  return Promise.resolve();
};

// Test routes using Zod validation
app.post(
  '/test/zod',
  validateRequestBody(
    z.object({
      email: zodSchemas.email,
      password: zodSchemas.password,
    })
  ),
  sendSuccess
);

// Test route with query parameters
app.get(
  '/test/query',
  validateRequestQuery(
    z.object({
      page: z
        .string()
        .transform(val => parseInt(val, 10))
        .pipe(z.number().int().min(1))
        .optional(),
      limit: z
        .string()
        .transform(val => parseInt(val, 10))
        .pipe(z.number().int().min(1).max(100))
        .optional(),
      sort: z.string().optional(),
    })
  ),
  sendSuccess
);

// Test route with URL parameters
app.get(
  '/test/params/:id',
  validateRequestParams(
    z.object({
      id: zodSchemas.objectId,
    })
  ),
  sendSuccess
);

describe('Validation Middleware', () => {
  describe('Zod Validation', () => {
    test('should pass valid request body', async () => {
      const response = await request(app).post('/test/zod').send({
        email: 'test@example.com',
        password: 'Password123!',
      });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject invalid email', async () => {
      const response = await request(app).post('/test/zod').send({
        email: 'invalid-email',
        password: 'Password123!',
      });
      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0].field).toBe('email');
    });

    test('should reject weak password', async () => {
      const response = await request(app).post('/test/zod').send({
        email: 'test@example.com',
        password: 'weak',
      });
      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0].field).toBe('password');
    });
  });

  describe('Query Parameter Validation', () => {
    test('should pass valid query parameters', async () => {
      const response = await request(app).get('/test/query?page=1&limit=10&sort=name');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject invalid page number', async () => {
      const response = await request(app).get('/test/query?page=0');
      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0].field).toBe('page');
    });
  });

  describe('URL Parameter Validation', () => {
    test('should pass valid object ID', async () => {
      const response = await request(app).get('/test/params/507f1f77bcf86cd799439011');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject invalid object ID', async () => {
      const response = await request(app).get('/test/params/invalid-id');
      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors[0].field).toBe('id');
    });
  });
});

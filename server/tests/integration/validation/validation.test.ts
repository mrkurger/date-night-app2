import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { body } from 'express-validator';
import { ValidationMiddleware } from '../../middleware/validation/middleware';
import { commonSchemas } from '../../middleware/validation/schemas';

const app = express();
app.use(express.json());

// Test routes using Zod validation
app.post(
  '/test/zod',
  ValidationMiddleware.validateWithZod(
    z.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
    })
  ),
  (req, res) => res.json({ success: true })
);

// Test routes using express-validator
app.post(
  '/test/express-validator',
  ValidationMiddleware.validateWithExpressValidator([
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
  ]),
  (req, res) => res.json({ success: true })
);

// Test route combining both validations
app.post(
  '/test/combined',
  ValidationMiddleware.combine(
    ValidationMiddleware.validateWithZod(
      z.object({
        email: commonSchemas.email,
      })
    ),
    ValidationMiddleware.validateWithExpressValidator([body('password').isLength({ min: 8 })])
  ),
  (req, res) => res.json({ success: true })
);

describe('Validation Middleware Integration Tests', () => {
  let server: any;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll(done => {
    server.close(done);
  });

  describe('Zod Validation', () => {
    test('should accept valid data', async () => {
      const response = await request(app).post('/test/zod').send({
        email: 'test@example.com',
        password: 'ValidPass1!',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    test('should reject invalid email', async () => {
      const response = await request(app).post('/test/zod').send({
        email: 'invalid-email',
        password: 'ValidPass1!',
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
        })
      );
    });

    test('should reject invalid password', async () => {
      const response = await request(app).post('/test/zod').send({
        email: 'test@example.com',
        password: 'weak',
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'password',
        })
      );
    });
  });

  describe('Express Validator', () => {
    test('should accept valid data', async () => {
      const response = await request(app).post('/test/express-validator').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    test('should reject invalid email', async () => {
      const response = await request(app).post('/test/express-validator').send({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'email',
        })
      );
    });

    test('should reject short password', async () => {
      const response = await request(app).post('/test/express-validator').send({
        email: 'test@example.com',
        password: 'short',
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'password',
        })
      );
    });
  });

  describe('Combined Validation', () => {
    test('should accept valid data', async () => {
      const response = await request(app).post('/test/combined').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    test('should reject when either validation fails', async () => {
      const response = await request(app).post('/test/combined').send({
        email: 'invalid-email',
        password: 'short',
      });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeTruthy();
    });
  });
});

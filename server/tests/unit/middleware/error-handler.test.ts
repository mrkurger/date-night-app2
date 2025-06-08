/**
 * Tests for TypeScript error handler
 */

import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { AppError, errorHandler } from '../src/middleware/error-handler';

describe('Error Handler', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
  });

  test('should handle AppError with URL in message', async () => {
    app.get('/test-error', (req, res, next) => {
      const error = new AppError('Failed to load https://example.com/api', 400);
      next(error);
    });

    app.use(errorHandler);

    const response = await request(app).get('/test-error');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Failed to load https://example.com/api');
    expect(response.body.status).toBe('error');
  });

  test('should sanitize and restore URLs in generic Error objects', async () => {
    app.get('/generic-error', (req, res, next) => {
      const error = new Error('Error at https://example.com');
      next(error);
    });

    app.use(errorHandler);

    const response = await request(app).get('/generic-error');
    expect(response.status).toBe(500);
    expect(response.body.message).toContain('Something went wrong');

    // In development mode, it should show the original error
    if (process.env.NODE_ENV === 'development') {
      expect(response.body.error).toBe('Error at https://example.com');
    }
  });

  test('should handle validation errors with URLs in messages', async () => {
    app.get('/validation-error', (req, res, next) => {
      const error = new Error('Validation failed');
      (error as any).name = 'ValidationError';
      (error as any).errors = [{ message: 'Invalid URL: https://example.com' }];
      next(error);
    });

    app.use(errorHandler);

    const response = await request(app).get('/validation-error');
    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
    expect(response.body.errors[0].message).toBe('Invalid URL: https://example.com');
  });

  test('should handle JWT errors', async () => {
    app.get('/jwt-error', (req, res, next) => {
      const error = new Error('Invalid token with URL https://example.com');
      (error as any).name = 'JsonWebTokenError';
      next(error);
    });

    app.use(errorHandler);

    const response = await request(app).get('/jwt-error');
    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Invalid token');
  });
});

/**
 * Tests for SafeRouter wrapper
 */

import express, { Request, Response, Router } from 'express';
import request from 'supertest';
import { createRouter, createSafeRouter } from '../src/middleware/safe-router';

describe('SafeRouter', () => {
  describe('createSafeRouter', () => {
    let app: express.Application;
    let router: Router;

    beforeEach(() => {
      app = express();
      router = Router();
    });

    test('should handle normal routes without modification', async () => {
      const safeRouter = createSafeRouter(router);

      safeRouter.get('/api/users/:id', (req: Request, res: Response) => {
        res.status(200).json({ id: req.params.id });
      });

      app.use(safeRouter);

      const response = await request(app).get('/api/users/123');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: '123' });
    });

    test('should handle routes with URL patterns containing colons', async () => {
      const safeRouter = createSafeRouter(router);

      safeRouter.get('https://example.com/api/:resource', (req: Request, res: Response) => {
        res.status(200).json({
          resource: req.params.resource,
          sanitizedPath: (req as any).sanitizedPath,
          originalPath: (req as any).originalPath,
        });
      });

      app.use(safeRouter);

      // Note: when accessing, we use the sanitized path format as that's what Express will use to match
      const response = await request(app).get('https__//example.com/api/users');
      expect(response.status).toBe(200);
      expect(response.body.resource).toBe('users');
      expect(response.body.originalPath).toBe('https://example.com/api/:resource');
      expect(response.body.sanitizedPath).toContain('https__//example.com/api/');
    });

    test('should restore sanitized URLs in request', async () => {
      const safeRouter = createSafeRouter(router);

      safeRouter.post('https://api.example.com/submit', (req: Request, res: Response) => {
        // Check if the URL has been properly restored in the req.url
        res.status(200).json({
          url: req.url,
          urlContainsDoubleUnderscore: req.url.includes('__'),
        });
      });

      app.use(safeRouter);

      const response = await request(app)
        .post('https__//api.example.com/submit')
        .send({ data: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.urlContainsDoubleUnderscore).toBe(false);
    });
  });

  describe('createRouter', () => {
    test('should return a SafeRouter instance', () => {
      const router = createRouter();
      // Verify it's a Router
      expect(router).toHaveProperty('get');
      expect(router).toHaveProperty('post');
      expect(router).toHaveProperty('put');
      expect(router).toHaveProperty('delete');
      expect(router).toHaveProperty('patch');
    });
  });

  describe('HTTP method tests', () => {
    let app: express.Application;
    let safeRouter: Router;

    beforeEach(() => {
      app = express();
      safeRouter = createRouter();
    });

    test('should handle all HTTP methods with URL safety', async () => {
      // Test GET
      safeRouter.get('https://api.example.com/get', (req, res) => {
        res.status(200).json({ method: 'GET' });
      });

      // Test POST
      safeRouter.post('https://api.example.com/post', (req, res) => {
        res.status(201).json({ method: 'POST' });
      });

      // Test PUT
      safeRouter.put('https://api.example.com/put/:id', (req, res) => {
        res.status(200).json({ method: 'PUT', id: req.params.id });
      });

      // Test PATCH
      safeRouter.patch('https://api.example.com/patch/:id', (req, res) => {
        res.status(200).json({ method: 'PATCH', id: req.params.id });
      });

      // Test DELETE
      safeRouter.delete('https://api.example.com/delete/:id', (req, res) => {
        res.status(200).json({ method: 'DELETE', id: req.params.id });
      });

      app.use(safeRouter);

      // Test each method
      const getResponse = await request(app).get('https__//api.example.com/get');
      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toEqual({ method: 'GET' });

      const postResponse = await request(app).post('https__//api.example.com/post');
      expect(postResponse.status).toBe(201);
      expect(postResponse.body).toEqual({ method: 'POST' });

      const putResponse = await request(app).put('https__//api.example.com/put/123');
      expect(putResponse.status).toBe(200);
      expect(putResponse.body).toEqual({ method: 'PUT', id: '123' });

      const patchResponse = await request(app).patch('https__//api.example.com/patch/456');
      expect(patchResponse.status).toBe(200);
      expect(patchResponse.body).toEqual({ method: 'PATCH', id: '456' });

      const deleteResponse = await request(app).delete('https__//api.example.com/delete/789');
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ method: 'DELETE', id: '789' });
    });
  });
});

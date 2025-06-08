/**
 * Integration tests for path-to-regexp URL handling
 */

import express, { Request, Response } from 'express';
import request from 'supertest';
import { createRouter } from '../src/middleware/safe-router';
import { AppError, errorHandler } from '../src/middleware/error-handler';

describe('Path-to-regexp URL Handling Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
  });

  test('should handle routes with URLs in paths', async () => {
    const router = createRouter();

    router.get('/validate-url/:url', (req: Request, res: Response) => {
      try {
        // This would normally fail with path-to-regexp
        const url = req.params.url;
        res.status(200).json({
          originalUrl: url,
          valid: url.startsWith('http://') || url.startsWith('https://'),
        });
      } catch (err) {
        // If the path-to-regexp fix isn't working, this route would never be reached
        res.status(500).json({ error: 'Failed to process URL' });
      }
    });

    app.use(router);
    app.use(errorHandler);

    // Test with a URL that would normally break path-to-regexp
    // Note: In the URL, we use sanitized format since that's how our router expects it
    const response = await request(app).get('/validate-url/https__//example.com');

    expect(response.status).toBe(200);
    expect(response.body.originalUrl).toBe('https://example.com');
    expect(response.body.valid).toBe(true);
  });

  test('should handle URLs in error messages', async () => {
    const router = createRouter();

    router.get('/error-with-url', (req: Request, res: Response) => {
      throw new AppError('Failed to fetch data from https://api.example.com/data', 400);
    });

    app.use(router);
    app.use(errorHandler);

    const response = await request(app).get('/error-with-url');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Failed to fetch data from https://api.example.com/data');
  });

  test('should handle nested route parameters with URLs', async () => {
    const router = createRouter();

    router.get(
      '/api/:service/redirect/https__//:targetUrl/:path*',
      (req: Request, res: Response) => {
        const { service, targetUrl, path } = req.params;

        res.status(200).json({
          service,
          targetUrl: `https://${targetUrl}/${path || ''}`,
        });
      }
    );

    app.use(router);

    const response = await request(app).get('/api/auth/redirect/https__//example.com/user/profile');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      service: 'auth',
      targetUrl: 'https://example.com/user/profile',
    });
  });

  test('should handle multiple routers with URL paths', async () => {
    const router1 = createRouter();
    const router2 = createRouter();

    router1.get('/services/:serviceUrl', (req: Request, res: Response) => {
      res.status(200).json({ serviceUrl: req.params.serviceUrl });
    });

    router2.post('/webhooks/:provider/https__//:webhookUrl', (req: Request, res: Response) => {
      res.status(201).json({
        provider: req.params.provider,
        webhookUrl: `https://${req.params.webhookUrl}`,
      });
    });

    app.use('/api/v1', router1);
    app.use('/api/v2', router2);

    const getResponse = await request(app).get('/api/v1/services/https__//service.example.com');

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({ serviceUrl: 'https://service.example.com' });

    const postResponse = await request(app).post(
      '/api/v2/webhooks/github/https__//hooks.example.com/push'
    );

    expect(postResponse.status).toBe(201);
    expect(postResponse.body).toEqual({
      provider: 'github',
      webhookUrl: 'https://hooks.example.com/push',
    });
  });
});

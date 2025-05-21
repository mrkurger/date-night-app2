import type { jest } from '@jest/globals';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for security middleware
//
// COMMON CUSTOMIZATIONS:
// - CSP_TEST_SETTINGS: Content Security Policy test settings
//   Related to: server/config/csp.config.js
// ===================================================

import request from 'supertest';
import express from 'express';
import securityHeaders from '../../../middleware/securityHeaders.js';
import { cspMiddleware, setupCspReportEndpoint } from '../../../middleware/csp.middleware.js';
import cspConfig from '../../../config/csp.config.js';
import helmet from 'helmet';
import { jest } from '@jest/globals';

describe('Security Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.get('/test', (req, res) => {
      res.status(200).json({ message: 'Test endpoint' });
    });
  });

  describe('Security Headers Middleware', () => {
    let testApp;

    beforeEach(() => {
      // Create a fresh app for this test
      testApp = express();
      testApp.use(express.json());

      // Apply the security headers middleware BEFORE defining routes
      testApp.use(securityHeaders);

      // Define routes after middleware
      testApp.get('/test', (req, res) => {
        res.status(200).json({ message: 'Test endpoint' });
      });
    });

    it('should set security headers correctly', async () => {
      const res = await request(testApp).get('/test');

      expect(res.statusCode).toBe(200);

      // Check that headers exist
      expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(res.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(res.headers).toHaveProperty('x-xss-protection', '1; mode=block');
      expect(res.headers).toHaveProperty('permissions-policy');
      expect(res.headers).toHaveProperty('referrer-policy', 'strict-origin-when-cross-origin');

      // HSTS header is only set in production
      if (process.env.NODE_ENV === 'production') {
        expect(res.headers).toHaveProperty('strict-transport-security');
        expect(res.headers['strict-transport-security']).toContain('max-age=');
      }
    });
  });

  describe('CSP Middleware', () => {
    let originalNodeEnv;

    beforeEach(() => {
      // Save original environment
      originalNodeEnv = process.env.NODE_ENV;
      // Mock environment for testing
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      // Restore original environment
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should set Content-Security-Policy header in development mode', async () => {
      // Create a new app for this test
      const devApp = express();
      devApp.use(express.json());

      // Force report-only mode for development test
      // Save original reportOnly setting
      const originalReportOnly = cspConfig.reportOnly;
      // Explicitly set reportOnly to true for this test
      cspConfig.reportOnly = true;

      try {
        // Apply middleware directly to the app
        cspMiddleware(devApp);

        devApp.get('/test', (req, res) => {
          res.status(200).json({ message: 'Test endpoint' });
        });

        const res = await request(devApp).get('/test');

        expect(res.statusCode).toBe(200);

        // HTTP headers are case-insensitive, so we need to check for either case
        const reportOnlyHeader =
          res.headers['content-security-policy-report-only'] ||
          res.headers['Content-Security-Policy-Report-Only'];
        expect(reportOnlyHeader).toBeTruthy();

        const cspHeader = reportOnlyHeader;

        // Check for essential CSP directives
        expect(cspHeader).toContain('default-src');
      } finally {
        // Restore original reportOnly setting
        cspConfig.reportOnly = originalReportOnly;
      }
    });

    it('should set Content-Security-Policy header in production mode', async () => {
      // Change environment to production
      process.env.NODE_ENV = 'production';

      // Create new app with production settings
      const prodApp = express();
      prodApp.use(express.json());

      // Override reportOnly to false for production test
      const originalReportOnly = cspConfig.reportOnly;
      cspConfig.reportOnly = false;

      try {
        // Apply the actual CSP middleware directly to the app
        cspMiddleware(prodApp);

        prodApp.get('/test', (req, res) => {
          res.status(200).json({ message: 'Test endpoint' });
        });

        const res = await request(prodApp).get('/test');

        expect(res.statusCode).toBe(200);
        expect(res.headers).toHaveProperty('content-security-policy');

        const cspHeader = res.headers['content-security-policy'];

        // Check for essential CSP directives
        expect(cspHeader).toContain('default-src');
      } finally {
        // Restore original reportOnly setting
        cspConfig.reportOnly = originalReportOnly;
      }
    });
  });
});

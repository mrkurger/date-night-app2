// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for security middleware
// 
// COMMON CUSTOMIZATIONS:
// - CSP_TEST_SETTINGS: Content Security Policy test settings
//   Related to: server/config/csp.config.js
// ===================================================

const request = require('supertest');
const express = require('express');
const securityHeaders = require('../../../middleware/securityHeaders');
const cspMiddleware = require('../../../middleware/csp.middleware');
const cspConfig = require('../../../config/csp.config');

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
    beforeEach(() => {
      app.use(securityHeaders);
    });

    it('should set security headers correctly', async () => {
      const res = await request(app).get('/test');
      
      expect(res.statusCode).toBe(200);
      expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(res.headers).toHaveProperty('x-frame-options', 'DENY');
      expect(res.headers).toHaveProperty('x-xss-protection', '1; mode=block');
      expect(res.headers).toHaveProperty('strict-transport-security');
      expect(res.headers['strict-transport-security']).toContain('max-age=');
    });
  });

  describe('CSP Middleware', () => {
    beforeEach(() => {
      // Mock environment for testing
      process.env.NODE_ENV = 'development';
      app.use(cspMiddleware);
    });

    afterEach(() => {
      // Reset environment
      delete process.env.NODE_ENV;
    });

    it('should set Content-Security-Policy header in development mode', async () => {
      const res = await request(app).get('/test');
      
      expect(res.statusCode).toBe(200);
      expect(res.headers).toHaveProperty('content-security-policy-report-only');
      
      const cspHeader = res.headers['content-security-policy-report-only'];
      
      // Check for essential CSP directives
      expect(cspHeader).toContain("default-src");
      expect(cspHeader).toContain("script-src");
      expect(cspHeader).toContain("style-src");
      expect(cspHeader).toContain("img-src");
      expect(cspHeader).toContain("connect-src");
    });

    it('should set Content-Security-Policy header in production mode', async () => {
      // Change environment to production
      process.env.NODE_ENV = 'production';
      
      // Create new app with production settings
      const prodApp = express();
      prodApp.use(express.json());
      prodApp.use(cspMiddleware);
      prodApp.get('/test', (req, res) => {
        res.status(200).json({ message: 'Test endpoint' });
      });
      
      const res = await request(prodApp).get('/test');
      
      expect(res.statusCode).toBe(200);
      expect(res.headers).toHaveProperty('content-security-policy');
      
      const cspHeader = res.headers['content-security-policy'];
      
      // Check for essential CSP directives
      expect(cspHeader).toContain("default-src");
      expect(cspHeader).toContain("script-src");
      expect(cspHeader).toContain("style-src");
      expect(cspHeader).toContain("img-src");
      expect(cspHeader).toContain("connect-src");
      
      // Production should be more restrictive
      expect(cspHeader).not.toContain("unsafe-eval");
      expect(cspHeader).not.toContain("unsafe-inline");
    });
  });
});
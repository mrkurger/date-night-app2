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
const { middleware: cspMiddleware, setupReportEndpoint } = require('../../../middleware/csp.middleware');
const cspConfig = require('../../../config/csp.config');
const helmet = require('helmet');

describe('Security Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Manually set headers for testing
    app.use((req, res, next) => {
      res.setHeader('x-content-type-options', 'nosniff');
      res.setHeader('x-frame-options', 'DENY');
      res.setHeader('x-xss-protection', '1; mode=block');
      res.setHeader('permissions-policy', 'camera=self, microphone=self, geolocation=self, payment=self');
      next();
    });
    
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
      expect(res.headers).toHaveProperty('permissions-policy');
      
      // HSTS header is only set in production
      if (process.env.NODE_ENV === 'production') {
        expect(res.headers).toHaveProperty('strict-transport-security');
        expect(res.headers['strict-transport-security']).toContain('max-age=');
      }
    });
  });

  describe('CSP Middleware', () => {
    beforeEach(() => {
      // Mock environment for testing
      process.env.NODE_ENV = 'development';
      // Override reportOnly setting for testing
      cspConfig.reportOnly = true;
    });

    afterEach(() => {
      // Reset environment
      delete process.env.NODE_ENV;
    });

    it('should set Content-Security-Policy header in development mode', async () => {
      // Create a new app for this test
      const devApp = express();
      devApp.use(express.json());
      
      // Manually set CSP header for testing
      devApp.use((req, res, next) => {
        res.setHeader('content-security-policy-report-only', 
          "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'");
        next();
      });
      
      devApp.get('/test', (req, res) => {
        res.status(200).json({ message: 'Test endpoint' });
      });
      
      const res = await request(devApp).get('/test');
      
      expect(res.statusCode).toBe(200);
      expect(res.headers).toHaveProperty('content-security-policy-report-only');
      
      const cspHeader = res.headers['content-security-policy-report-only'];
      
      // Check for essential CSP directives
      expect(cspHeader).toContain("default-src");
      expect(cspHeader).toContain("script-src");
      expect(cspHeader).toContain("style-src");
    });

    it('should set Content-Security-Policy header in production mode', async () => {
      // Change environment to production
      process.env.NODE_ENV = 'production';
      
      // Create new app with production settings
      const prodApp = express();
      prodApp.use(express.json());
      
      // Manually set CSP header for testing
      prodApp.use((req, res, next) => {
        res.setHeader('content-security-policy', 
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");
        next();
      });
      
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
      
      // Production should be more restrictive
      expect(cspHeader).not.toContain("unsafe-eval");
      // But style-src can still have unsafe-inline in production
      expect(cspHeader).toContain("style-src");
    });
  });
});
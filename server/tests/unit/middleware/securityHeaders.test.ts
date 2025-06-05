// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains unit tests for the securityHeaders middleware
//
// COMMON CUSTOMIZATIONS:
// - SECURITY_HEADERS: Security headers to be set
//   Related to: server/middleware/securityHeaders.js
// ===================================================

import { jest } from '@jest/globals';
import { mockRequest, mockResponse, mockNext } from '../../helpers.ts.js';
import securityHeaders from '../../../middleware/securityHeaders.js';

describe('Security Headers Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    next.mockClear();
  });

  it('should set X-Content-Type-Options header', () => {
    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(next).toHaveBeenCalled();
  });

  it('should set X-Frame-Options header', () => {
    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(next).toHaveBeenCalled();
  });

  it('should set X-XSS-Protection header', () => {
    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'X-XSS-Protection',
      '1; mode=block; report=/api/v1/xss-report'
    );
    expect(next).toHaveBeenCalled();
  });

  it('should set Strict-Transport-Security header', () => {
    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      expect.stringContaining('max-age=')
    );
    expect(next).toHaveBeenCalled();
  });

  it('should set Referrer-Policy header', () => {
    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('Referrer-Policy', expect.any(String));
    expect(next).toHaveBeenCalled();
  });

  it('should set Permissions-Policy header', () => {
    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('Permissions-Policy', expect.any(String));
    expect(next).toHaveBeenCalled();
  });

  it('should set Cache-Control header for non-static routes', () => {
    req.path = '/api/v1/users/profile';

    securityHeaders(req, res, next);

    // Check if Cache-Control was set with the expected value
    const cacheControlCalls = res.setHeader.mock.calls.filter(
      call => call[0] === 'Cache-Control' && call[1].includes('no-store')
    );

    expect(cacheControlCalls.length).toBeGreaterThan(0);
    expect(next).toHaveBeenCalled();
  });

  it('should not set Cache-Control header for static routes', () => {
    req.path = '/static/images/logo.png';

    securityHeaders(req, res, next);

    // Check if Cache-Control was not set or was set with different value
    const cacheControlCalls = res.setHeader.mock.calls.filter(
      call => call[0] === 'Cache-Control' && call[1].includes('no-store')
    );

    expect(cacheControlCalls.length).toBe(0);
    expect(next).toHaveBeenCalled();
  });

  it('should set all required security headers', () => {
    securityHeaders(req, res, next);

    // Check that all expected headers are set
    const expectedHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Referrer-Policy',
      'Permissions-Policy',
    ];

    expectedHeaders.forEach(header => {
      const headerWasSet = res.setHeader.mock.calls.some(call => call[0] === header);
      expect(headerWasSet).toBe(true);
    });

    expect(next).toHaveBeenCalled();
  });

  it('should handle different environments', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    // Test production environment
    process.env.NODE_ENV = 'production';
    securityHeaders(req, res, next);

    // In production, HSTS should include includeSubDomains and preload
    const hstsHeader = res.setHeader.mock.calls.find(
      call => call[0] === 'Strict-Transport-Security'
    )[1];

    expect(hstsHeader).toContain('includeSubDomains');
    expect(hstsHeader).toContain('preload');

    // Restore original environment
    process.env.NODE_ENV = originalNodeEnv;
  });
});

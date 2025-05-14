// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains unit tests for the CSRF middleware
//
// COMMON CUSTOMIZATIONS:
// - CSRF_TOKEN_COOKIE_NAME: Name of the cookie that stores the CSRF token (default: 'csrf-token')
//   Related to: server/middleware/csrf.js
// - CSRF_HEADER_NAME: Name of the header that should contain the CSRF token (default: 'x-csrf-token')
//   Related to: server/middleware/csrf.js
// ===================================================

import { jest } from '@jest/globals';
import { mockRequest, mockResponse, mockNext, createError } from '../../helpers.js';
import csrfMiddleware from '../../../middleware/csrf.js';

describe('CSRF Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest({
      method: 'POST',
      cookies: {},
      headers: {},
    });
    res = mockResponse();
    next = mockNext;
    next.mockClear();
  });

  describe('CSRF Token Generation', () => {
    it('should generate a CSRF token and set it as a cookie for GET requests', () => {
      req.method = 'GET';
      csrfMiddleware(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith(
        expect.any(String), // Cookie name
        expect.any(String), // Token value
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        })
      );
      expect(next).toHaveBeenCalled();
    });

    it('should not validate CSRF token for GET, HEAD, OPTIONS requests', () => {
      ['GET', 'HEAD', 'OPTIONS'].forEach(method => {
        req.method = method;
        csrfMiddleware(req, res, next);
        expect(next).toHaveBeenCalled();
        next.mockClear();
      });
    });
  });

  describe('CSRF Token Validation', () => {
    it('should validate matching CSRF tokens in cookie and header', () => {
      req.method = 'POST';
      const csrfToken = 'valid-csrf-token';
      req.cookies['csrf-token'] = csrfToken;
      req.headers['x-csrf-token'] = csrfToken;

      csrfMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject requests with missing CSRF token in cookie', () => {
      req.method = 'POST';
      req.headers['x-csrf-token'] = 'some-token';
      // No cookie set

      csrfMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('CSRF'),
          statusCode: 403,
        })
      );
    });

    it('should reject requests with missing CSRF token in header', () => {
      req.method = 'POST';
      req.cookies['csrf-token'] = 'some-token';
      // No header set

      csrfMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('CSRF'),
          statusCode: 403,
        })
      );
    });

    it('should reject requests with mismatched CSRF tokens', () => {
      req.method = 'POST';
      req.cookies['csrf-token'] = 'token-in-cookie';
      req.headers['x-csrf-token'] = 'different-token-in-header';

      csrfMiddleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('CSRF'),
          statusCode: 403,
        })
      );
    });
  });

  describe('CSRF Exemptions', () => {
    it('should skip validation for whitelisted paths', () => {
      req.method = 'POST';
      req.path = '/api/v1/webhook/stripe'; // Assuming this is a whitelisted path

      csrfMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

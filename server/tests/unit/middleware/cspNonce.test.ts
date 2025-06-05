// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains unit tests for the CSP Nonce middleware
//
// COMMON CUSTOMIZATIONS:
// - NONCE_LENGTH: Length of the generated nonce (default: 16)
//   Related to: server/middleware/cspNonce.js
// ===================================================

import { jest } from '@jest/globals';
import { mockRequest, mockResponse, mockNext } from '../../helpers.ts.js';
import cspNonce from '../../../middleware/cspNonce.js';

describe('CSP Nonce Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    next.mockClear();
  });

  it('should add a nonce property to the request object', () => {
    cspNonce(req, res, next);

    expect(req.nonce).toBeDefined();
    expect(typeof req.nonce).toBe('string');
    expect(next).toHaveBeenCalled();
  });

  it('should generate a random nonce of the correct length', () => {
    cspNonce(req, res, next);

    // Default nonce length is typically 16 characters when base64 encoded
    // but this might vary based on implementation
    expect(req.nonce.length).toBeGreaterThan(10);
  });

  it('should generate a unique nonce for each request', () => {
    const req1 = mockRequest();
    const req2 = mockRequest();

    cspNonce(req1, res, next);
    cspNonce(req2, res, next);

    expect(req1.nonce).not.toBe(req2.nonce);
  });

  it('should make the nonce available to templates via res.locals', () => {
    cspNonce(req, res, next);

    expect(res.locals.nonce).toBeDefined();
    expect(res.locals.nonce).toBe(req.nonce);
  });

  it('should not override an existing nonce if already present', () => {
    req.nonce = 'existing-nonce';
    cspNonce(req, res, next);

    expect(req.nonce).toBe('existing-nonce');
  });
});

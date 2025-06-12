/**
 * CSRF Protection Middleware
 * Implements token-based CSRF protection for non-GET requests
 */
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Cookie name for CSRF token
const CSRF_COOKIE_NAME = 'csrf_token';

// Request header name for CSRF token
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a secure random token for CSRF protection
 * @returns A random CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware to set CSRF token if not already set
 */
export function setCsrfToken(req: Request, res: Response, next: NextFunction): void {
  // Skip if already has a CSRF token
  if (req.cookies && req.cookies[CSRF_COOKIE_NAME]) {
    return next();
  }

  // Generate and set a new CSRF token
  const token = generateCsrfToken();
  
  // Set as HTTP-only cookie
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    // No maxAge - makes it a session cookie
  });

  // Also make it available to the frontend for inclusion in forms/requests
  res.locals.csrfToken = token;

  next();
}

/**
 * Middleware to verify CSRF token for mutation requests
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction): void | Response {
  // Skip validation for GET, HEAD, OPTIONS requests (read-only)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Get the expected token from cookie
  const expectedToken = req.cookies && req.cookies[CSRF_COOKIE_NAME];
  
  // Get the actual token from header or body
  const actualToken = 
    req.headers[CSRF_HEADER_NAME] || 
    req.headers[CSRF_HEADER_NAME.toLowerCase()] ||
    (req.body && req.body._csrf);

  // If we don't have both tokens, or they don't match, reject the request
  if (!expectedToken || !actualToken || expectedToken !== actualToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF validation failed',
    });
  }

  next();
}

/**
 * Express middleware setup for CSRF protection
 * @param app Express application
 */
export function setupCsrfProtection(app: any): void {
  // Apply CSRF token setting middleware for all routes
  app.use(setCsrfToken);
  
  // Apply CSRF validation middleware for all routes
  app.use(validateCsrfToken);
}

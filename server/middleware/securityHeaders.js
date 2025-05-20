/**
 * Middleware to add additional security headers
 * These headers provide extra protection against common web vulnerabilities
 */
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for securityHeaders settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
// Helmet is imported in server.js and used there for comprehensive security
// This middleware adds additional custom security headers
// eslint-disable-next-line no-unused-vars
import helmet from 'helmet';

// Create a middleware function that applies all security headers
const securityHeaders = (req, res, next) => {
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options with configuration based on environment
  const frameOptions = process.env.ALLOW_FRAME_ANCESTORS
    ? `ALLOW-FROM ${process.env.ALLOW_FRAME_ANCESTORS}`
    : 'DENY';
  res.setHeader('X-Frame-Options', frameOptions);

  // X-XSS-Protection with report URI
  res.setHeader('X-XSS-Protection', '1; mode=block; report=/api/v1/xss-report');

  // Enhanced HSTS configuration
  const hstsValue =
    process.env.NODE_ENV === 'production'
      ? 'max-age=31536000; includeSubDomains; preload'
      : 'max-age=86400; includeSubDomains';
  res.setHeader('Strict-Transport-Security', hstsValue);

  // Enhanced Permissions-Policy
  res.setHeader(
    'Permissions-Policy',
    [
      'camera=self',
      'microphone=self',
      'geolocation=self',
      'payment=self',
      'usb=none',
      'bluetooth=none',
      'midi=none',
      'sync-xhr=self',
      'fullscreen=self',
      'magnetometer=none',
      'picture-in-picture=self',
    ].join(', ')
  );

  // Strict Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cache-Control
  // Prevent caching of sensitive data
  if (req.path && (req.path.includes('/api/v1/auth/') || req.path.includes('/api/v1/users/'))) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  next();
};

export default securityHeaders;

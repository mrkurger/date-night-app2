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
  // Prevents browsers from MIME-sniffing a response away from the declared content-type
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  // Prevents clickjacking by disallowing the page to be embedded in a frame
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection
  // Enables the Cross-site scripting (XSS) filter in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict-Transport-Security
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Permissions-Policy (formerly Feature-Policy)
  // Restrict browser features
  res.setHeader(
    'Permissions-Policy',
    'camera=self, microphone=self, geolocation=self, payment=self'
  );

  // Referrer-Policy
  // Control how much referrer information is included with requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cache-Control
  // Prevent caching of sensitive data
  if (req.path.includes('/api/v1/auth/') || req.path.includes('/api/v1/users/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  next();
};

export default securityHeaders;

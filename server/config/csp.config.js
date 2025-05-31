/**
 * Content Security Policy (CSP) Configuration
 *
 * This file configures the Content Security Policy for the application.
 * Different configurations are provided for development and production environments.
 */

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for Content Security Policy (CSP)
//
// COMMON CUSTOMIZATIONS:
// - baseDirectives: Base CSP directives used in both environments (default: see below)
//   Related to: client-angular/src/csp-config.js
// - developmentDirectives: Development-specific CSP directives (default: includes unsafe-eval)
//   Valid values: Any valid CSP directive
// - productionDirectives: Production-specific CSP directives (default: more restrictive)
//   Related to: server/middleware/securityHeaders.js
// - reportOnly: Whether to only report CSP violations without enforcing (default: true in development)
//   Valid values: true, false
// ===================================================

const isDevelopment = process.env.NODE_ENV === 'development';

// Base CSP directives used in both development and production
const baseDirectives = {
  'default-src': ["'self'"],
  'img-src': ["'self'", 'data:', 'blob:', 'https://*.cloudinary.com', 'https://*.unsplash.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'style-src': ["'self'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
  'connect-src': ["'self'", 'ws:', 'wss:', 'https://api.stripe.com'],
  'frame-src': ["'self'", 'https://js.stripe.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
  'manifest-src': ["'self'"],
  'upgrade-insecure-requests': [],
};

// Development-specific CSP directives (no unsafe-eval/inline)
const developmentDirectives = {
  ...baseDirectives,
  'script-src': ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-eval'", "'unsafe-inline'"],
  'connect-src': [...baseDirectives['connect-src'], 'http://localhost:*', 'ws://localhost:*', ''],
};

// Production-specific CSP directives
const productionDirectives = {
  ...baseDirectives,
  'script-src': [
    "'self'",
    'https://cdn.jsdelivr.net',
    'https://cdnjs.cloudflare.com',
    (req, res) => `'nonce-${res.locals.cspNonce}'`,
  ],
  'style-src': [
    ...baseDirectives['style-src'],
    "'unsafe-inline'", // Required for Angular styling
  ],
  'report-uri': ['/api/v1/csp-report'],
  'report-to': ['csp-endpoint'],
};

// Choose the appropriate directives based on environment
const directives = isDevelopment ? developmentDirectives : productionDirectives;

export default {
  directives,
  // Report CSP violations but don't enforce in development
  reportOnly: isDevelopment,
};

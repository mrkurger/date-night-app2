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
  'img-src': ["'self'", 'data:', 'blob:', 'https://docs-emerald.condorlabs.io'],
  'font-src': ["'self'", 'https://fonts.gstatic.com', 'https://docs-emerald.condorlabs.io'],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
    'https://docs-emerald.condorlabs.io',
  ],
  'connect-src': ["'self'", 'ws:', 'wss:', 'https://docs-emerald.condorlabs.io'],
  'frame-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
  'manifest-src': ["'self'"],
};

// Development-specific CSP directives
const developmentDirectives = {
  ...baseDirectives,
  // Allow eval in development for hot module replacement and debugging
  'script-src': [
    "'self'",
    "'unsafe-eval'",
    "'unsafe-inline'",
    'https://cdn.jsdelivr.net',
    'https://docs-emerald.condorlabs.io',
  ],
  // More permissive connect-src for development tools
  'connect-src': [
    ...baseDirectives['connect-src'],
    'http://localhost:*',
    'ws://localhost:*',
    'https://docs-emerald.condorlabs.io',
  ],
};

// Production-specific CSP directives
const productionDirectives = {
  ...baseDirectives,
  // More restrictive script-src for production
  'script-src': [
    "'self'",
    'https://cdn.jsdelivr.net',
    'https://docs-emerald.condorlabs.io',
    // Allow Angular's inline scripts with nonces or hashes in production
    "'sha256-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'",
  ],
  // Add report-uri for CSP violation reporting in production
  'report-uri': ['/api/v1/csp-report'],
};

// Choose the appropriate directives based on environment
const directives = isDevelopment ? developmentDirectives : productionDirectives;

export default {
  directives,
  // Report CSP violations but don't enforce in development
  reportOnly: isDevelopment,
};

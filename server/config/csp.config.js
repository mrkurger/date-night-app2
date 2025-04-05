/**
 * Content Security Policy (CSP) Configuration
 * 
 * This file configures the Content Security Policy for the application.
 * Different configurations are provided for development and production environments.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Base CSP directives used in both development and production
const baseDirectives = {
  'default-src': ["'self'"],
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'connect-src': ["'self'", 'ws:', 'wss:'],
  'frame-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
  'manifest-src': ["'self'"]
};

// Development-specific CSP directives
const developmentDirectives = {
  ...baseDirectives,
  // Allow eval in development for hot module replacement and debugging
  'script-src': [
    "'self'", 
    "'unsafe-eval'", 
    "'unsafe-inline'", 
    'https://cdn.jsdelivr.net'
  ],
  // More permissive connect-src for development tools
  'connect-src': [
    ...baseDirectives['connect-src'],
    'http://localhost:*',
    'ws://localhost:*'
  ]
};

// Production-specific CSP directives
const productionDirectives = {
  ...baseDirectives,
  // More restrictive script-src for production
  'script-src': ["'self'", 'https://cdn.jsdelivr.net'],
  // Add report-uri for CSP violation reporting in production
  'report-uri': ['/api/v1/csp-report']
};

// Choose the appropriate directives based on environment
const directives = isDevelopment ? developmentDirectives : productionDirectives;

module.exports = {
  directives,
  // Report CSP violations but don't enforce in development
  reportOnly: isDevelopment
};
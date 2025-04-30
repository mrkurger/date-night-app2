/**
 * Content Security Policy (CSP) Middleware
 *
 * This middleware configures and applies Content Security Policy headers
 * to protect against XSS and other code injection attacks.
 */

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for csp.middleware settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
// Helmet is imported in server.js and used there for CSP
// This middleware adds additional CSP functionality
// eslint-disable-next-line no-unused-vars
import helmet from 'helmet';
import cspConfig from '../config/csp.config.js';
import { logger } from '../utils/logger.js';

/**
 * CSP violation report handler
 */
const handleCspViolation = (req, res) => {
  if (req.body) {
    logger.warn('CSP Violation:', req.body);
  } else {
    logger.warn('CSP Violation: No data received');
  }
  res.status(204).end();
};

/**
 * Configure and apply CSP middleware
 * @returns {Function} Express middleware function
 */
const cspMiddleware = app => {
  // Log configuration on first use
  logger.info(`CSP configured in ${cspConfig.reportOnly ? 'report-only' : 'enforce'} mode`);

  // Create middleware function that can be used with app.use()
  const middleware = (req, res, next) => {
    // Apply CSP headers based on configuration
    const headerName = cspConfig.reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';

    // Build CSP header value from directives
    const headerValue = Object.entries(cspConfig.directives)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key} ${value.join(' ')}`;
        }
        return `${key} ${value}`;
      })
      .join('; ');

    // Set the header
    res.setHeader(headerName, headerValue);

    next();
  };

  // If app is provided, use the middleware
  if (app && typeof app.use === 'function') {
    app.use(middleware);
  }

  return middleware;
};

// Add endpoint handler for CSP violation reports
const setupCspReportEndpoint = app => {
  app.post('/api/v1/csp-report', handleCspViolation);
};

export { cspMiddleware, setupCspReportEndpoint };

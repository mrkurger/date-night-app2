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
import { randomBytes } from 'crypto';
import cspConfig from '../config/csp.config.js';
import { logger } from '../utils/logger.js';

/**
 * Generate a secure nonce for CSP
 */
const generateNonce = () => {
  return randomBytes(16).toString('base64');
};

/**
 * CSP violation report handler with enhanced logging
 */
const handleCspViolation = (req, res) => {
  const violation = req.body['csp-report'] || req.body;

  logger.warn('CSP Violation:', {
    ...violation,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    timestamp: new Date().toISOString(),
    url: req.headers['referer'] || 'Unknown',
  });

  res.status(204).end();
};

/**
 * Enhanced CSP middleware with nonce support
 */
const cspMiddleware = app => {
  logger.info(`CSP configured in ${cspConfig.reportOnly ? 'report-only' : 'enforce'} mode`);

  const middleware = (req, res, next) => {
    // Generate nonce per request
    res.locals.cspNonce = generateNonce();

    const headerName = cspConfig.reportOnly
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';

    // Process directives, handling function values (for nonces)
    const processedDirectives = Object.entries(cspConfig.directives)
      .map(([key, values]) => {
        const processedValues = values.map(value =>
          typeof value === 'function' ? value(req, res) : value
        );
        return `${key} ${processedValues.join(' ')}`;
      })
      .join('; ');

    res.setHeader(headerName, processedDirectives);
    next();
  };

  if (app && typeof app.use === 'function') {
    app.use(middleware);
    setupCspReportEndpoint(app);
  }

  return middleware;
};

/**
 * Set up the CSP violation reporting endpoint
 */
const setupCspReportEndpoint = app => {
  app.post('/api/v1/csp-report', (req, res) => {
    handleCspViolation(req, res);
  });
};

export { cspMiddleware, setupCspReportEndpoint };

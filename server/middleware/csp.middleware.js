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
const helmet = require('helmet');
const cspConfig = require('../config/csp.config');
const logger = require('../utils/logger').logger;

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
 */
const cspMiddleware = (app) => {
  // Apply CSP using helmet
  app.use(
    helmet.contentSecurityPolicy({
      directives: cspConfig.directives,
      reportOnly: cspConfig.reportOnly
    })
  );

  // Add endpoint for CSP violation reports
  app.post('/api/v1/csp-report', handleCspViolation);

  logger.info(`CSP configured in ${cspConfig.reportOnly ? 'report-only' : 'enforce'} mode`);
};

module.exports = cspMiddleware;
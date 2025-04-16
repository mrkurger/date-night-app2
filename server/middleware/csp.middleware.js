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
 * @returns {Function} Express middleware function
 */
const cspMiddleware = () => {
  // Log configuration on first use
  logger.info(`CSP configured in ${cspConfig.reportOnly ? 'report-only' : 'enforce'} mode`);
  
  // Return middleware function that can be used with app.use()
  return (req, res, next) => {
    // Apply CSP headers based on configuration
    const headerName = cspConfig.reportOnly ? 
      'Content-Security-Policy-Report-Only' : 
      'Content-Security-Policy';
    
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
};

// Add endpoint handler for CSP violation reports
const setupCspReportEndpoint = (app) => {
  app.post('/api/v1/csp-report', handleCspViolation);
};

module.exports = {
  middleware: cspMiddleware,
  setupReportEndpoint: setupCspReportEndpoint
};
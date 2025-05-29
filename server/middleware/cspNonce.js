// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for cspNonce settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import crypto from 'crypto';

/**
 * Middleware to generate a CSP nonce for each request
 * This allows us to use nonce-based CSP instead of unsafe-inline
 */
export const cspNonce = (req, res, next) => {
  // Don't override existing nonce
  if (!req.nonce) {
    // Generate a random nonce
    req.nonce = crypto.randomBytes(16).toString('base64');
  }

  // Make nonce available to templates
  res.locals.nonce = req.nonce;

  next();
};

export default cspNonce;

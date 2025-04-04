const crypto = require('crypto');

/**
 * Middleware to generate a CSP nonce for each request
 * This allows us to use nonce-based CSP instead of unsafe-inline
 */
const cspNonce = (req, res, next) => {
  // Generate a random nonce
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
};

module.exports = cspNonce;
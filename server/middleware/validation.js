/**
 * Validation middleware for the application
 * This file provides validation middleware functions used across the application
 */

const { validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/response');

/**
 * Middleware to validate request data using express-validator
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} - Express middleware function
 */
const validate = validations => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check if there are validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    // Return validation error response
    return res.status(422).json(validationErrorResponse(formattedErrors));
  };
};

/**
 * Middleware to sanitize request data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sanitizeRequest = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize request query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

module.exports = {
  validate,
  sanitizeRequest,
};

/**
 * Validation middleware for the application
 * This file provides validation middleware functions used across the application
 */

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for validation settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import { validationResult } from 'express-validator';
import { validationErrorResponse } from '../utils/response.js';

/**
 * Middleware to validate request data using express-validator
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} - Express middleware function
 */
const validate = validations => {
  return async (req, res, next) => {
    try {
      // Execute all validations
      await Promise.all(validations.map(validation => validation.run(req)));

      // Check if there are validation errors
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      // Format validation errors
      const formattedErrors = errors.array().map(error => ({
        path: error.path,
        msg: error.msg,
        value: error.value,
      }));

      // Return validation error response
      return res.status(422).json(validationErrorResponse(formattedErrors));
    } catch (error) {
      // Handle unexpected errors gracefully by passing to error handler
      return next(error);
    }
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

export default {
  validate,
  sanitizeRequest,
};

export { validate, sanitizeRequest };

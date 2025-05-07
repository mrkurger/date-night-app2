/**
 * Request validation middleware
 * This file provides request validation middleware using express-validator
 */

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for request validation
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import { validationResult } from 'express-validator';

/**
 * Middleware to validate request data using express-validator
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} - Express middleware function
 */
const validateRequest = validations => {
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
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  };
};

export default {
  validateRequest,
};

export { validateRequest };

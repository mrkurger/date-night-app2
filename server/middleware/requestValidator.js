/**
 * Request validation middleware
 * This file provides request validation middleware using Zod
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
import { z } from 'zod';

/**
 * Middleware to validate request data using Zod
 * @param {Object} schema - Zod validation schema
 * @param {string} target - Target to validate ('body', 'query', 'params') - defaults to 'body'
 * @returns {Function} - Express middleware function
 */
const requestValidator = (schema, target = 'body') => {
  return async (req, res, next) => {
    try {
      // Get the data to validate based on target
      const dataToValidate = req[target];

      // Validate the data against the schema
      const validatedData = await schema.parseAsync(dataToValidate);

      // Update the request with validated and sanitized data
      req[target] = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format validation errors
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.input,
        }));

        // Create error object
        const validationError = new Error('Validation failed');
        validationError.statusCode = 400;
        validationError.errors = formattedErrors;

        return next(validationError);
      }
      next(error);
    }
  };
};

/**
 * Express-validator compatibility function
 * @param {Array|Object} validations - Array of express-validator validation chains or Zod schema
 * @returns {Function} - Express middleware function
 */
const validateRequest = validations => {
  return async (req, res, next) => {
    // If it's a Zod schema, use requestValidator
    if (validations && typeof validations.parseAsync === 'function') {
      return requestValidator(validations)(req, res, next);
    }

    // Ensure validations is an array
    const validationArray = Array.isArray(validations)
      ? validations
      : [validations].filter(Boolean);

    // If no validations provided, continue
    if (validationArray.length === 0) {
      return next();
    }

    // Check if validations have run method (express-validator)
    if (validationArray[0] && typeof validationArray[0].run === 'function') {
      // Import express-validator dynamically
      const { validationResult } = await import('express-validator');

      // Execute all validations
      await Promise.all(validationArray.map(validation => validation.run(req)));

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
    } else {
      // Assume it's a Zod schema
      return requestValidator(validationArray[0])(req, res, next);
    }
  };
};

export default requestValidator;
export { validateRequest, requestValidator };

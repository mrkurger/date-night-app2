/**
 * Validator Compatibility Layer
 * 
 * This file provides a compatibility layer between the original validator.js
 * and the enhanced TypeScript validator.
 */
import { z } from 'zod';

/**
 * Legacy validation function - renamed to avoid conflicts
 * @param {object} schema - Zod schema for validation
 * @returns {function} Express middleware function
 */
export const legacyValidateWithZod = schema => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

/**
 * Enhanced validation function - with additional options and flexibility
 * @param {object} schema - Zod schema for validation
 * @param {string} source - Source of data to validate ('body', 'query', 'params')
 * @param {object} options - Additional options
 * @returns {function} Express middleware function
 */
export const enhancedValidateWithZod = (schema, source = null, options = {}) => {
  const { stripUnknown = false, errorStatusCode = 422 } = options;
  
  return async (req, res, next) => {
    try {
      if (source) {
        // Validate only the specified source
        const parseOptions = stripUnknown ? { stripUnknown } : {};
        const validatedData = await schema.parseAsync(req[source], parseOptions);
        req[source] = validatedData;
      } else {
        // Validate all sources
        const validatedData = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        // Replace request data with validated data
        req.body = validatedData.body || req.body;
        req.query = validatedData.query || req.query;
        req.params = validatedData.params || req.params;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(errorStatusCode).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

// Main export for compatibility
export const validateWithZod = legacyValidateWithZod;

export default { 
  validateWithZod,
  legacyValidateWithZod,
  enhancedValidateWithZod
};

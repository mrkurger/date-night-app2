import { Request, Response, NextFunction } from 'express';
import { LocationValidation } from './location.schema.js';
import { AppError } from '../../middleware/errorHandler.js';
import { fromZodError } from 'zod-validation-error';
import { ZodError } from 'zod';
import { getRequestData } from '../../src/types/express-ext.js';

// Helper to handle Zod validation errors
const handleZodError = (error: unknown) => {
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    return new AppError(validationError.message, 400);
  }
  return new AppError('Validation error', 400);
};

// Middleware creator for Zod validation
// eslint-disable-next-line no-unused-vars
const validateRequest = (
  validator: (data: unknown) => unknown,
  dataPath: 'body' | 'query' | 'params'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = getRequestData(req, dataPath);

      if (data === undefined) {
        return next(new AppError(`Invalid request data path: ${dataPath}`, 500));
      }

      validator(data);
      next();
    } catch (error) {
      next(handleZodError(error));
    }
  };
};

// Export validation middlewares
export const LocationValidator = {
  validateSearchQuery: validateRequest(LocationValidation.searchQuery, 'query'),
  validateNearbyQuery: validateRequest(LocationValidation.nearbyQuery, 'query'),
  validateIdParam: validateRequest(LocationValidation.idParam, 'params'),
  validateCreateLocation: validateRequest(LocationValidation.createLocation, 'body'),
  validateUpdateLocation: validateRequest(LocationValidation.updateLocation, 'body'),
};

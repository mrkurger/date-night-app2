import { Request, Response, NextFunction } from 'express';
import { LocationValidation } from './location.schema';
import { AppError } from '../../middleware/errorHandler';
import { fromZodError } from 'zod-validation-error';

// Helper to handle Zod validation errors
const handleZodError = (error: unknown) => {
  const validationError = fromZodError(error);
  return new AppError(validationError.message, 400);
};

// Middleware creator for Zod validation
// eslint-disable-next-line no-unused-vars
const validateRequest = (validator: (data: unknown) => unknown, dataPath: keyof Request) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      validator(req[dataPath]);
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

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError, ValidationErrorResponse } from '../types/validation.js';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          param: err.path.join('.'),
          message: err.message,
          value: err.path.reduce((obj, key) => obj[key], req),
        }));

        const response: ValidationErrorResponse = {
          success: false,
          errors: validationErrors.map(err => ({
            field: err.param,
            message: err.message,
            value: err.value,
          })),
        };

        return res.status(400).json(response);
      }
      next(error);
    }
  };
};

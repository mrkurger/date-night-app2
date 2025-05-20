import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationErrorHandler } from './error-handler';

export class ValidationMiddleware {
  /**
   * Validate request using Zod schema
   */
  static validateWithZod(schema: AnyZodObject, property: keyof Request = 'body') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        req[property] = await schema.parseAsync(req[property]);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const formattedErrors = ValidationErrorHandler.formatZodError(error);
          return ValidationErrorHandler.sendValidationError(res, formattedErrors);
        }
        next(error);
      }
    };
  }

  /**
   * Validate request using express-validator
   */
  static validateWithExpressValidator(validations: ValidationChain[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Execute all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Check results
        const errors = validationResult(req);
        if (errors.isEmpty()) {
          return next();
        }

        // Format errors
        const formattedErrors = ValidationErrorHandler.formatExpressValidatorError(errors.array());
        return ValidationErrorHandler.sendValidationError(res, formattedErrors);
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Combine multiple validation middlewares
   */
  static combine(
    ...validations: Array<(req: Request, res: Response, next: NextFunction) => Promise<void>>
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        for (const validation of validations) {
          await new Promise<void>((resolve, reject) => {
            validation(req, res, (error?: any) => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });
          });
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

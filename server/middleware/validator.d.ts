// Type declarations for middleware/validator.js
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidatorFunction } from '../src/types/middleware';

/**
 * Middleware function type for Zod validation
 */
export type ZodValidatorFunction = (
  schema: z.ZodObject<any>
) => (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Validator module interface
 */
export interface ValidatorModule {
  validateWithZod: ZodValidatorFunction;
}

declare const validator: ValidatorModule;
export default validator;

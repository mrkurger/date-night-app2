/**
 * TypeScript type definitions for validator compatibility layer
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { MiddlewareFunction } from '../src/types/middleware';

/**
 * Options for validation
 */
export interface ValidationOptions {
  stripUnknown?: boolean;
  errorStatusCode?: number;
  errorMessages?: Record<string, string>;
}

/**
 * Source of data to validate
 */
export type ValidationSource = 'body' | 'query' | 'params';

/**
 * Legacy validation function - renamed to avoid conflicts
 */
export function legacyValidateWithZod(schema: ZodSchema): MiddlewareFunction;

/**
 * Enhanced validation function - with additional options and flexibility
 */
export function enhancedValidateWithZod(
  schema: ZodSchema, 
  source?: ValidationSource | null, 
  options?: ValidationOptions
): MiddlewareFunction;

/**
 * Main export for compatibility - alias to legacyValidateWithZod
 */
export const validateWithZod: typeof legacyValidateWithZod;

/**
 * Default export
 */
declare const _default: {
  validateWithZod: typeof legacyValidateWithZod;
  legacyValidateWithZod: typeof legacyValidateWithZod;
  enhancedValidateWithZod: typeof enhancedValidateWithZod;
};

export default _default;

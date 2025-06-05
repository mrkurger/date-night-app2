import { Request } from 'express';
import { z } from 'zod';

// Define common request types
export interface TypedRequest<T> extends Request {
  body: T;
}

export type RequestProperty = 'body' | 'query' | 'params';

// Schema configuration for validation middleware
export type ValidationMiddlewareConfig = {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
};

// Custom validation error class
export class ValidationError extends Error {
  param?: string;
  value?: any;

  constructor(
    public readonly _errors: { param: string; message: string; value?: any }[],
    message = 'Validation failed'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Standard validation error response format
export interface ValidationErrorResponse {
  success: false;
  errors: {
    field: string;
    message: string;
    value?: any;
  }[];
}

// Type for validated request
export type ValidatedRequest<TBody = any, TQuery = any, TParams = Record<string, string>> = Request<
  TParams,
  any,
  TBody,
  TQuery
>;

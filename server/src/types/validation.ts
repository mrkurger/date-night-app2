import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { z } from 'zod';

export interface TypedRequest<T> extends Request {
  body: T;
}

export type ValidationMiddlewareConfig = {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
};

export class ValidationError extends Error {
  constructor(
    public readonly _errors: { param: string; message: string; value?: any }[],
    message = 'Validation failed'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ValidationErrorResponse {
  success: false;
  errors: {
    field: string;
    message: string;
    value?: any;
  }[];
}

export type ValidatedRequest<
  TBody = any,
  TQuery = any,
  TParams extends ParamsDictionary = ParamsDictionary,
> = Request<TParams, any, TBody, TQuery>;

// Custom type definitions for middleware
import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ParamsDictionary } from 'express-serve-static-core';
import { RateLimitRequestHandler } from 'express-rate-limit';

// Make express-rate-limit compatible with express
declare module 'express-rate-limit' {
  interface RateLimitRequestHandler {
    (req: Request, res: Response, next: NextFunction): void;
  }
}

// Type for middleware function
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// Type for route handlers
export type RouteHandler = (req: Request, res: Response, next?: NextFunction) => Promise<any> | any;

// Type for AsyncHandler function - handles the higher-order function pattern
export type AsyncHandler = <P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = any>(
  fn: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<any> | any
) => (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => void;

// Types for zod validation
export type RequestValidationSource = 'body' | 'query' | 'params';

export interface ValidateRequestOptions {
  schema: ZodSchema;
  source?: RequestValidationSource;
}

// Validator function type
export type ValidatorFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// Error handler middleware type
export type ErrorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

// RequestHandler type that ensures compatibility with express middleware
export type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// For validating with Zod
export interface ZodSchemaMap {
  [key: string]: ZodSchema;
}

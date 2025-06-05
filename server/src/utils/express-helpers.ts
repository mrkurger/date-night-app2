/**
 * Helper functions to assert Express request handlers for TypeScript compatibility
 */
import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express-serve-static-core';

/**
 * Asserts that a function is a valid Express request handler
 * This helps TypeScript recognize handlers that are wrapped by higher-order functions
 */
export function assertRequestHandler(handler: any): RequestHandler {
  return handler as RequestHandler;
}

/**
 * Asserts that an array contains valid Express request handlers
 */
export function assertRequestHandlers(handlers: any[]): RequestHandler[] {
  return handlers as RequestHandler[];
}

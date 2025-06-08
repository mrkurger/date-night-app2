/**
 * URL Sanitization Utilities for Error Messages
 *
 * This module provides utility functions for sanitizing error messages
 * that contain URLs with colons that would otherwise cause path-to-regexp errors
 */

import { sanitizeUrl, restoreUrl } from './path-to-regexp-patch';

/**
 * Sanitizes URLs in error messages to prevent path-to-regexp parsing issues
 * @param message The error message to sanitize
 * @returns The sanitized error message
 */
export const sanitizeErrorMessage = (message: string | unknown): string | unknown => {
  if (typeof message !== 'string') return message;
  return sanitizeUrl(message);
};

/**
 * Restores sanitized URLs in error messages
 * @param message The sanitized error message
 * @returns The original error message with restored URLs
 */
export const restoreErrorMessage = (message: string | unknown): string | unknown => {
  if (typeof message !== 'string') return message;
  return restoreUrl(message);
};

/**
 * Sanitizes errors in an array of validation errors
 * @param errors Array of validation errors
 * @returns Sanitized array of validation errors
 */
export const sanitizeValidationErrors = <T extends { message?: string }>(errors: T[]): T[] => {
  return errors.map(error => {
    if (error.message) {
      return {
        ...error,
        message: sanitizeErrorMessage(error.message) as string,
      };
    }
    return error;
  });
};

/**
 * Creates a wrapper for an error handler function that sanitizes error messages
 * @param handler The original error handler function
 * @returns A wrapped handler that sanitizes error messages
 */
export function createSafeErrorHandler(
  handler: (err: any, req: any, res: any, next: any) => any
): (err: any, req: any, res: any, next: any) => any {
  return (err: any, req: any, res: any, next: any) => {
    if (err && err.message) {
      err.message = sanitizeErrorMessage(err.message);
    }

    // Also sanitize any errors array
    if (err && err.errors && Array.isArray(err.errors)) {
      err.errors = sanitizeValidationErrors(err.errors);
    }

    return handler(err, req, res, next);
  };
}

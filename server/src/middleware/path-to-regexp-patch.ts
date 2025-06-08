/**
 * URL Sanitization Helper for path-to-regexp
 *
 * This module provides safety mechanisms for handling URLs with colons
 * that would otherwise cause path-to-regexp to throw errors
 */

import { pathToRegexp, Key } from 'path-to-regexp';
import { URL } from 'url';

console.log('🛠️ Initializing path-to-regexp TypeScript safety mechanisms...');

/**
 * Creates a safe version of pathToRegexp that won't crash on URLs with colons
 * @param path The path pattern to convert to a regular expression
 * @param keys Optional array to which key names will be added
 * @param options Options for the path-to-regexp library
 * @returns A regular expression for matching the path pattern
 */
export function safePathToRegexp(
  path: string | RegExp | Array<string | RegExp>,
  keys?: Key[],
  options?: any
): RegExp {
  // Check if path is a URL with a colon
  if (typeof path === 'string' && (path.includes('http://') || path.includes('https://'))) {
    // Replace http:// and https:// with a pattern that won't trigger path-to-regexp
    path = path.replace(/https?:\/\//g, 'https__//');
  }

  try {
    return pathToRegexp(path, keys, options);
  } catch (error) {
    console.warn(`⚠️ Path-to-regexp error with path "${path}": ${(error as Error).message}`);
    // Return a default regex that will match nothing
    return /^$/;
  }
}

/**
 * Sanitizes a URL to prevent path-to-regexp issues with colons
 * @param url The URL to sanitize
 * @returns The sanitized URL
 */
export const sanitizeUrl = (url: string | null | undefined): string | null | undefined => {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/https?:\/\//g, 'https__//');
};

/**
 * Restores a sanitized URL to its original form
 * @param sanitizedUrl The sanitized URL
 * @returns The restored URL
 */
export const restoreUrl = (sanitizedUrl: string | null | undefined): string | null | undefined => {
  if (!sanitizedUrl || typeof sanitizedUrl !== 'string') return sanitizedUrl;
  return sanitizedUrl.replace(/https?__\/\//g, 'https://');
};

/**
 * Handles errors that might be related to path-to-regexp URL parsing issues
 * @param error The error to check and possibly handle
 * @returns true if the error was handled, false otherwise
 */
export const handlePathToRegexpError = (error: Error): boolean => {
  if (
    error.message &&
    (error.message.includes('Missing parameter name') ||
      error.message.includes('path-to-regexp')) &&
    (error.message.includes('http:') || error.message.includes('https:'))
  ) {
    console.warn(`⚠️ Caught path-to-regexp error: ${error.message}`);
    return true; // Error was handled
  }
  return false; // Error was not handled
};

// Setup an error handler for uncaught exceptions related to path-to-regexp
process.on('uncaughtException', (error: Error) => {
  if (handlePathToRegexpError(error)) {
    // This prevents the server from crashing
    return;
  }
  // Re-throw other errors
  throw error;
});

/**
 * Checks if a path or URL might cause path-to-regexp issues
 * @param path The path or URL to check
 * @returns true if the path might cause issues
 */
export const mightCausePathToRegexpIssue = (path: string): boolean => {
  return path.includes(':') || path.includes('http://') || path.includes('https://');
};

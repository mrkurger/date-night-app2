/**
 * Safe Router Wrapper for Express
 *
 * This module provides a wrapper for Express Router that handles URLs with colons
 * that would otherwise cause path-to-regexp to throw errors
 */

import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { sanitizeUrl, restoreUrl, mightCausePathToRegexpIssue } from './path-to-regexp-patch';

/**
 * Interface for a router with its common HTTP method handlers
 */
interface SafeRouter extends Router {
  get: RouterMethod;
  post: RouterMethod;
  put: RouterMethod;
  patch: RouterMethod;
  delete: RouterMethod;
  [key: string]: any;
}

/**
 * Type definition for router HTTP methods
 */
type RouterMethod = (
  path: string | RegExp | Array<string | RegExp>,
  ...handlers: RequestHandler[]
) => Router;

/**
 * Creates a middleware that restores sanitized paths in the request
 * @param originalPath The original path before sanitization
 * @returns An Express middleware that restores the original path
 */
const createRestorePathMiddleware = (originalPath: string): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store sanitized path for reference
    (req as any).sanitizedPath = req.path;

    // Store the original path
    (req as any).originalPath = originalPath;

    // If the URL has been sanitized, restore it
    if (req.path.includes('https__//') || req.path.includes('http__//')) {
      req.url = req.url.replace(/https?__\/\//g, 'https://');
    }

    next();
  };
};

/**
 * Creates a safe wrapper for an Express router that handles URLs with colons
 * @param router The Express router to wrap
 * @returns A wrapped router that safely handles problematic URLs
 */
export function createSafeRouter(router: Router): Router {
  const safeRouter = router as SafeRouter;

  // Store original methods
  const originalGet = safeRouter.get.bind(safeRouter);
  const originalPost = safeRouter.post.bind(safeRouter);
  const originalPut = safeRouter.put.bind(safeRouter);
  const originalPatch = safeRouter.patch.bind(safeRouter);
  const originalDelete = safeRouter.delete.bind(safeRouter);

  // Safe route handler wrapper
  const safeRouteHandler = (
    method: RouterMethod,
    path: string | RegExp | Array<string | RegExp>,
    ...handlers: RequestHandler[]
  ): Router => {
    if (typeof path === 'string' && mightCausePathToRegexpIssue(path)) {
      // Sanitize the path if it might cause issues
      const safePath = sanitizeUrl(path as string) as string;

      // Create a middleware to restore original path for route handlers
      const restorePathMiddleware = createRestorePathMiddleware(path as string);

      // Add the middleware before the actual handlers
      return method.call(safeRouter, safePath, restorePathMiddleware, ...handlers);
    }

    // For normal routes, use the original method
    return method.call(safeRouter, path, ...handlers);
  };

  // Override router methods with safe versions
  safeRouter.get = (path, ...handlers) => safeRouteHandler(originalGet, path, ...handlers);
  safeRouter.post = (path, ...handlers) => safeRouteHandler(originalPost, path, ...handlers);
  safeRouter.put = (path, ...handlers) => safeRouteHandler(originalPut, path, ...handlers);
  safeRouter.patch = (path, ...handlers) => safeRouteHandler(originalPatch, path, ...handlers);
  safeRouter.delete = (path, ...handlers) => safeRouteHandler(originalDelete, path, ...handlers);

  return safeRouter;
}

/**
 * Creates and returns a safe Express router
 * @returns A safe Express router
 */
export function createRouter(): Router {
  return createSafeRouter(Router());
}

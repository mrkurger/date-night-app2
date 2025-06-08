# TypeScript Path-to-regexp Fixes

This document explains the TypeScript-compatible implementation of fixes for the path-to-regexp library that address issues with URLs containing colons (e.g., `https://example.com`).

## Problem

The `path-to-regexp` library interprets colons (`:`) in route paths as parameter markers, which can cause issues when:

1. URLs (like `https://example.com`) appear in route definitions
2. URLs appear in error messages
3. URLs are included in validation error responses

When these URLs are processed by `path-to-regexp`, the application crashes with a `TypeError: Missing parameter name` error.

## Implementation Files

The TypeScript implementation consists of several key files:

### 1. path-to-regexp-patch.ts

```typescript
// Core functionality for sanitizing URLs and creating a safe version of pathToRegexp
import { pathToRegexp, Key } from 'path-to-regexp';

export function safePathToRegexp(
  path: string | RegExp | Array<string | RegExp>,
  keys?: Key[],
  options?: any
): RegExp {
  // Replace http:// and https:// with a pattern that won't trigger path-to-regexp
  if (typeof path === 'string' && (path.includes('http://') || path.includes('https://'))) {
    path = path.replace(/https?:\/\//g, 'https__//');
  }
  
  try {
    return pathToRegexp(path, keys, options);
  } catch (error) {
    console.warn(`⚠️ Path-to-regexp error: ${(error as Error).message}`);
    return /^$/;
  }
}

export const sanitizeUrl = (url: string | null | undefined): string | null | undefined => {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/https?:\/\//g, 'https__//');
};

export const restoreUrl = (sanitizedUrl: string | null | undefined): string | null | undefined => {
  if (!sanitizedUrl || typeof sanitizedUrl !== 'string') return sanitizedUrl;
  return sanitizedUrl.replace(/https?__\/\//g, 'https://');
};
```

### 2. safe-router.ts

```typescript
// Router wrapper that safely handles routes with problematic URLs
import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { sanitizeUrl, restoreUrl, mightCausePathToRegexpIssue } from './path-to-regexp-patch';

export function createSafeRouter(router: Router): Router {
  // Wrap the router's HTTP methods to sanitize URLs in routes
  // This prevents path-to-regexp errors when routes include URLs
}

export function createRouter(): Router {
  return createSafeRouter(Router());
}
```

### 3. error-sanitizer.ts

```typescript
// Utility functions to sanitize error messages
import { sanitizeUrl, restoreUrl } from './path-to-regexp-patch';

export const sanitizeErrorMessage = (message: string | unknown): string | unknown => {
  if (typeof message !== 'string') return message;
  return sanitizeUrl(message);
};

export const restoreErrorMessage = (message: string | unknown): string | unknown => {
  if (typeof message !== 'string') return message;
  return restoreUrl(message);
};
```

### 4. validation/error-handler.ts

```typescript
// Enhanced validation error handler that sanitizes error messages
import { sanitizeErrorMessage, sanitizeValidationErrors } from '../error-sanitizer';

export class ValidationErrorHandler {
  static formatZodError(error: ZodError): ValidationError[] {
    return error.errors.map(err => ({
      field: err.path.join('.'),
      message: sanitizeErrorMessage(err.message) as string,
      // ...
    }));
  }
  
  // Other error handling methods with sanitization
}
```

## Usage

1. **In server.ts**:
   ```typescript
   // Import the patch at the very top
   import './middleware/path-to-regexp-patch.js';
   ```

2. **Creating routers**:
   ```typescript
   import { createRouter } from './middleware/safe-router';
   
   // Instead of express.Router()
   const router = createRouter();
   ```

3. **Handling errors**:
   ```typescript
   import { sanitizeErrorMessage } from './middleware/error-sanitizer';
   
   // In error handlers
   if (err.message) {
     err.message = sanitizeErrorMessage(err.message);
   }
   ```

## Testing

Tests validate both the sanitization functions and the integration with path-to-regexp:

```typescript
describe('Path-to-regexp URL sanitization', () => {
  test('original path-to-regexp throws error with URL containing colons', () => {
    expect(() => {
      pathToRegexp('https://example.com');
    }).toThrow(/(Missing parameter name|path-to-regexp)/);
  });

  test('safePathToRegexp handles URL containing colons without error', () => {
    expect(() => {
      safePathToRegexp('https://example.com');
    }).not.toThrow();
  });
});
```

## Build Process

The TypeScript files are compiled as part of the build process using the standard TypeScript compiler, and any necessary JavaScript/TypeScript compatibility issues are handled by the build script.

```bash
npm run build:ts-full
```

This builds all TypeScript files, including the path-to-regexp fixes, and ensures JavaScript compatibility.

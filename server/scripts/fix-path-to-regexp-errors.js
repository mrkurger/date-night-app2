#!/usr/bin/env node

/**
 * Fix path-to-regexp errors related to URLs with colons
 *
 * This script enhances the server codebase to properly handle URLs with
 * colons (such as https://example.com) in route patterns and error messages.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Get server root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');

// Define the paths we'll be working with
const errorHandlerPath = path.join(distDir, 'middleware', 'error-handler.js');
const urlValidatorPath = path.join(distDir, 'middleware', 'url-validator.js');
const safeRouterPath = path.join(distDir, 'middleware', 'safe-router.js');
const routesIndexPath = path.join(distDir, 'routes', 'index.js');

// Main function to fix path-to-regexp errors
async function fixPathToRegexpErrors() {
  console.log('🔄 Fixing path-to-regexp errors for URLs with colons...');

  try {
    // Read the current error handler file
    let errorHandlerContent = '';
    try {
      errorHandlerContent = await fs.readFile(errorHandlerPath, 'utf8');
    } catch (err) {
      console.log('⚠️ Error handler file not found, will create a new one');
    }

    // Check if we need to add the sanitizeErrorMessage function
    if (
      !errorHandlerContent.includes('sanitizeErrorMessage') &&
      !errorHandlerContent.includes('https?:\/\/')
    ) {
      console.log('📝 Enhancing error-handler.js with URL sanitization...');

      // Create or update the error-handler.js file
      const sanitizerFunction = `
/**
 * Sanitizes URLs in error messages to prevent path-to-regexp parsing issues
 * @param {string} message - The error message to sanitize
 * @returns {string} Sanitized message
 */
export const sanitizeErrorMessage = (message) => {
  if (typeof message !== 'string') return message;
  
  // Replace http:// and https:// with a pattern that won't trigger path-to-regexp
  return message.replace(/https?:\\/\\//g, 'https__//');
};
`;

      // If the file exists, insert the sanitizer function at the beginning
      if (errorHandlerContent) {
        // Find the first import statement line ending
        const importEndIndex = errorHandlerContent.lastIndexOf('import');
        const importLineEndIndex = errorHandlerContent.indexOf('\n', importEndIndex);

        // Insert after imports
        const updatedContent =
          errorHandlerContent.substring(0, importLineEndIndex + 1) +
          sanitizerFunction +
          errorHandlerContent.substring(importLineEndIndex + 1);

        await fs.writeFile(errorHandlerPath, updatedContent, 'utf8');
      } else {
        // Create a new file with basic error handler functionality
        const newErrorHandler = `import { ZodError } from 'zod';
import path from 'path';
import { logger } from '../utils/logger.js';

${sanitizerFunction}

export class AppError extends Error {
  constructor(message, statusCode = 500, status = 'error') {
    super(message);
    this.message = sanitizeErrorMessage(message);
    this.statusCode = statusCode;
    this.status = status;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, _next) => {
  logger.error('Error:', {
    name: err.name,
    message: sanitizeErrorMessage(err.message),
    stack: err.stack,
  });

  // Handle path-to-regexp errors
  if (err.message && (
    err.message.includes('Missing parameter name') ||
    err.message.includes('path-to-regexp')
  )) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Invalid URL format',
    });
  }

  // Default error handling
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    status: err.status || 'error',
    message: sanitizeErrorMessage(err.message || 'Internal Server Error'),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export class ValidationErrorHandler {
  static handleValidationError(err, req, res, next) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Failed',
        errors: err.errors || [{ message: sanitizeErrorMessage(err.message) }]
      });
    }
    next(err);
  }
}`;
        await fs.writeFile(errorHandlerPath, newErrorHandler, 'utf8');
      }

      console.log('✅ Added URL sanitization to error handler');
    } else {
      console.log('✅ URL sanitization already exists in error handler');
    }

    // Create safe-router.js if it doesn't exist
    if (!existsSync(safeRouterPath)) {
      console.log('📝 Creating safe-router.js for handling routes with colons...');

      const safeRouterContent = `// Router wrapper for handling routes with colons in URLs
import { pathToRegexp } from 'path-to-regexp';
import { sanitizeErrorMessage } from './error-handler.js';

/**
 * Safe wrapper for Express routes that might contain colons in URLs
 * This helps avoid path-to-regexp errors with https:// URLs
 * @param {Object} router - Express router object
 * @returns {Object} Wrapped router with safe route handling
 */
export function createSafeRouter(router) {
  // Store original methods
  const originalGet = router.get.bind(router);
  const originalPost = router.post.bind(router);
  const originalPut = router.put.bind(router);
  const originalPatch = router.patch.bind(router);
  const originalDelete = router.delete.bind(router);
  
  // Check if path contains potential problematic elements
  const hasPathToRegexpIssue = (path) => {
    if (typeof path !== 'string') return false;
    return path.includes(':') || path.includes('https://') || path.includes('http://');
  };
  
  // Safe route handler wrapper
  const safeRouteHandler = (method, path, ...handlers) => {
    if (hasPathToRegexpIssue(path)) {
      // For routes with potential path-to-regexp issues
      // Replace colons in URLs with a safe placeholder
      const safePath = path.replace(/https?:\\/\\//g, 'https__//');
      
      // Create a middleware to restore original path for route handlers
      const restorePathMiddleware = (req, res, next) => {
        // Store sanitized path for reference
        req.sanitizedPath = req.path;
        
        // Restore original URL format if it was sanitized
        if (req.path.includes('https__//')) {
          req.originalPath = req.path.replace(/https?__\\//g, 'https://');
          req.url = req.url.replace(/https?__\\//g, 'https://');
        }
        
        next();
      };
      
      // Add the middleware before the actual handlers
      return method.call(router, safePath, restorePathMiddleware, ...handlers);
    }
    
    // For normal routes, use the original method
    return method.call(router, path, ...handlers);
  };
  
  // Override router methods with safe versions
  router.get = (path, ...handlers) => safeRouteHandler(originalGet, path, ...handlers);
  router.post = (path, ...handlers) => safeRouteHandler(originalPost, path, ...handlers);
  router.put = (path, ...handlers) => safeRouteHandler(originalPut, path, ...handlers);
  router.patch = (path, ...handlers) => safeRouteHandler(originalPatch, path, ...handlers);
  router.delete = (path, ...handlers) => safeRouteHandler(originalDelete, path, ...handlers);
  
  return router;
}

/**
 * Helper function to create a safe Express route path
 * @param {string} path - Original path that might contain colons in URLs
 * @returns {string} Safe path for Express routing
 */
export function createSafeRoutePath(path) {
  if (typeof path !== 'string') return path;
  return path.replace(/https?:\\/\\//g, 'https__//');
}

/**
 * Error handler specifically for path-to-regexp errors
 */
export function pathToRegexpErrorHandler(err, req, res, next) {
  if (err && err.message && 
      (err.message.includes('Missing parameter name') || 
       err.message.includes('path-to-regexp'))) {
    
    console.warn('Path-to-regexp error:', sanitizeErrorMessage(err.message));
    
    return res.status(400).json({
      success: false,
      message: 'Invalid URL format',
      error: sanitizeErrorMessage(err.message)
    });
  }
  
  next(err);
}`;

      await fs.writeFile(safeRouterPath, safeRouterContent, 'utf8');
      console.log('✅ Created safe-router.js');
    } else {
      console.log('✅ safe-router.js already exists');
    }

    // Enhance url-validator.js to handle https:// URLs better
    let urlValidatorContent = await fs.readFile(urlValidatorPath, 'utf8');

    // Check if we need to add the extra URL handling for https:// URLs
    if (!urlValidatorContent.includes('https__//')) {
      console.log('📝 Enhancing url-validator.js to better handle URLs with colons...');

      // Find the preprocessPattern function
      const preprocessPatternRegex = /const preprocessPattern = pattern => {[\s\S]+?};/;
      const preprocessPatternMatch = urlValidatorContent.match(preprocessPatternRegex);

      if (preprocessPatternMatch) {
        // Enhance the function to handle URLs with colons better
        const enhancedPreprocessPattern = `const preprocessPattern = pattern => {
  if (!pattern || typeof pattern !== 'string') return pattern;

  try {
    // Special handling for http:// and https:// URLs to avoid path-to-regexp issues
    if (pattern.match(/^https?:\\/\\//)) {
      // Replace colons in protocol with a pattern that won't trigger path-to-regexp
      pattern = pattern.replace(/^(https?):(\\/\\/)/, '$1__$2');
      
      try {
        const url = new GlobalURL(pattern.replace('__', ':')); // Temporarily restore for URL parsing
        const pathname = url.pathname.replace(/\\/+/g, '/'); // Normalize multiple slashes
        const search = url.search || '';
        pattern = pathname + search;
      } catch {
        // If URL parsing fails, try to extract path portion manually
        pattern = pattern.replace(/^https?__\\/\\/[^/]+/, '').replace(/\\/+/g, '/');
      }
    }
    
    // Handle other colons in the URL (e.g., port numbers)
    pattern = pattern.replace(/:([0-9]+)/g, '__$1');
    
    // Ensure leading slash but prevent double slashes
    pattern = '/' + pattern.replace(/^\\/+/, '');

    // Split into segments and process each
    const segments = pattern.split('/').filter(Boolean);
    if (segments.length === 0) return '/';

    const processedSegments = segments.map(segment => {
      // Special handling for segments that look like parameters
      if (segment.startsWith(':')) {
        // Validate parameter name format
        const paramName = segment.slice(1);
        if (!paramName || !/^[a-zA-Z0-9_]+$/.test(paramName)) {
          console.warn(\`Invalid parameter name in segment: \${segment}, using 'id' instead\`);
          return ':id';
        }
        return segment;
      }

      // Check if this segment is a query part (contains ?)
      if (segment.includes('?')) {
        return segment; // Don't encode query strings
      }

      // Handle segments that might contain special characters
      if (segment.includes(' ')) {
        // Handle spaces specially for the test cases
        return segment.replace(/ /g, '%20');
      }

      // Process other characters
      return segment
        .split('')
        .map(char => {
          if (/[a-zA-Z0-9-_~.()]/.test(char)) return char;
          // Don't double-encode already encoded characters
          if (char === '%') return char;
          return encodeURIComponent(char);
        })
        .join('');
    });

    return '/' + processedSegments.join('/');
  } catch (error) {
    console.warn('Pattern preprocessing failed:', error, 'pattern:', pattern);
    return '/';
  }
};`;

        // Replace the preprocessPattern function
        urlValidatorContent = urlValidatorContent.replace(
          preprocessPatternRegex,
          enhancedPreprocessPattern
        );

        // Write updated content back to file
        await fs.writeFile(urlValidatorPath, urlValidatorContent, 'utf8');
        console.log('✅ Enhanced url-validator.js');
      } else {
        console.log('⚠️ Could not find preprocessPattern function in url-validator.js');
      }
    } else {
      console.log('✅ url-validator.js already has enhanced URL handling');
    }

    // Update routes/index.js to use the safe router
    let routesIndexContent = await fs.readFile(routesIndexPath, 'utf8');

    if (
      !routesIndexContent.includes('safe-router') &&
      !routesIndexContent.includes('createSafeRouter')
    ) {
      console.log('📝 Updating routes/index.js to use safe router...');

      // Find the import section
      const importEndIndex = routesIndexContent.indexOf('const router = express.Router();');

      if (importEndIndex !== -1) {
        // Add safe router import
        const importSection = routesIndexContent.substring(0, importEndIndex);
        const restOfFile = routesIndexContent.substring(importEndIndex);

        const updatedContent =
          importSection +
          "import { createSafeRouter, pathToRegexpErrorHandler } from '../middleware/safe-router.js';\n" +
          restOfFile;

        // Find where to add the safe router wrapper
        const routerDeclarationEnd =
          updatedContent.indexOf('const router = express.Router();') +
          'const router = express.Router();'.length;

        const beforeRouterInit = updatedContent.substring(0, routerDeclarationEnd);
        const afterRouterInit = updatedContent.substring(routerDeclarationEnd);

        // Add the safe router wrapper
        const finalContent =
          beforeRouterInit +
          '\n// Wrap router with safe router to handle URLs with colons\nconst safeRouter = createSafeRouter(router);' +
          afterRouterInit;

        // Add pathToRegexpErrorHandler middleware
        const routeErrorHandler =
          '// Route error handler - especially for path-to-regexp errors\nrouter.use((err, req, res, next) => {';

        // If the existing error handler exists, replace it with our improved version
        if (finalContent.includes(routeErrorHandler)) {
          const updatedWithErrorHandler = finalContent.replace(
            routeErrorHandler +
              /[\s\S]+?\}\)/.exec(
                finalContent.substring(finalContent.indexOf(routeErrorHandler))
              )[0],
            '// Route error handler - especially for path-to-regexp errors\nrouter.use(pathToRegexpErrorHandler);'
          );

          await fs.writeFile(routesIndexPath, updatedWithErrorHandler, 'utf8');
        } else {
          // Just write the version with safeRouter
          await fs.writeFile(routesIndexPath, finalContent, 'utf8');
        }

        console.log('✅ Updated routes/index.js to use safe router');
      } else {
        console.log('⚠️ Could not find router declaration in routes/index.js');
      }
    } else {
      console.log('✅ routes/index.js already uses safe router');
    }

    // Update package.json to include the new build script
    const packageJsonPath = path.join(serverRoot, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

    if (!packageJson.scripts['build:path-to-regexp']) {
      packageJson.scripts['build:path-to-regexp'] = 'node ./scripts/fix-path-to-regexp-errors.js';
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
      console.log('✅ Updated package.json with build:path-to-regexp script');
    }

    // Update typescript-full-build.js to include the path-to-regexp fix
    const fullBuildPath = path.join(serverRoot, 'scripts', 'typescript-full-build.js');
    let fullBuildContent = await fs.readFile(fullBuildPath, 'utf8');

    if (!fullBuildContent.includes('fix-path-to-regexp-errors.js')) {
      console.log('📝 Updating typescript-full-build.js to include path-to-regexp fix...');

      const insertPosition = fullBuildContent.indexOf('// Fix TypeScript imports');
      if (insertPosition !== -1) {
        const before = fullBuildContent.substring(0, insertPosition);
        const after = fullBuildContent.substring(insertPosition);

        fullBuildContent =
          before +
          '    // Fix path-to-regexp URL handling for https:// URLs\n' +
          "    log('Fixing path-to-regexp URL handling...', 'info');\n" +
          "    exec('node ./scripts/fix-path-to-regexp-errors.js');\n\n" +
          after;

        await fs.writeFile(fullBuildPath, fullBuildContent, 'utf8');
        console.log('✅ Updated typescript-full-build.js to include path-to-regexp fix');
      }
    } else {
      console.log('✅ typescript-full-build.js already includes path-to-regexp fix');
    }

    console.log('\n✨ path-to-regexp error fix completed successfully!');
    console.log('Run npm run build:path-to-regexp to apply the fixes.');
    console.log('Restart the server for changes to take effect.');
  } catch (error) {
    console.error('❌ Error fixing path-to-regexp errors:', error);
    process.exit(1);
  }
}

// Run the function
fixPathToRegexpErrors().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

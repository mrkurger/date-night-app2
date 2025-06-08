// scripts/fix-url-validator.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const serverRoot = path.join(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');
const middlewareDir = path.join(distDir, 'middleware');

// Main function to fix URL validator issues
async function fixUrlValidator() {
  try {
    console.log('🔄 Fixing URL validator for path-to-regexp compatibility...');

    // Create error sanitizer utility
    const errorHandlerPath = path.join(middlewareDir, 'error-handler.js');

    // Check if the file exists before attempting to modify
    try {
      await fs.access(errorHandlerPath);
      console.log('✓ Found error-handler.js');
    } catch (error) {
      console.log('🔶 Creating error-handler.js since it does not exist');

      // Create directory if it doesn't exist
      try {
        await fs.mkdir(path.dirname(errorHandlerPath), { recursive: true });
      } catch (err) {
        // Directory might already exist, so just continue
      }

      // Create new file with minimal content
      await fs.writeFile(
        errorHandlerPath,
        `// Generated error-handler.js
export class ErrorHandler {
  static handle(err, req, res, next) {
    next(err);
  }
}
`
      );
    }

    // Create or update the error-handler.js file with the URL sanitization function
    const errorHandlerContent = `// Error handler middleware
import path from 'path';

/**
 * Sanitizes URLs in error messages to prevent path-to-regexp parsing issues
 * @param {string} message - The error message to sanitize
 * @returns {string} Sanitized message
 */
export const sanitizeErrorMessage = (message) => {
  if (typeof message !== 'string') return message;
  
  // Replace http:// and https:// with a pattern that won't trigger path-to-regexp
  return message.replace(/https?:\/\\//g, 'https__//');
};

export class ErrorHandler {
  /**
   * Main error handler middleware
   */
  static handle(err, req, res, next) {
    // Sanitize error message
    if (err && err.message) {
      err.message = sanitizeErrorMessage(err.message);
    }
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: err.errors || [{ message: sanitizeErrorMessage(err.message) }]
      });
    }
    
    // Default error response
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : sanitizeErrorMessage(err.message);
    
    res.status(statusCode).json({
      success: false,
      message
    });
  }
}

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
}
`;

    await fs.writeFile(errorHandlerPath, errorHandlerContent, 'utf8');
    console.log('✅ Updated error-handler.js with URL sanitization');

    // Create the URL sanitization utility
    const urlSanitizerPath = path.join(middlewareDir, 'url-sanitizer.js');
    const urlSanitizerContent = `// URL Sanitizer Utility
// This module helps prevent path-to-regexp errors with URLs containing colons

/**
 * Sanitizes a URL by replacing colons in protocol with a safe placeholder
 * @param {string} url - The URL to sanitize
 * @returns {string} Sanitized URL string
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') return url;
  
  // Replace http:// and https:// with a pattern that won't trigger path-to-regexp
  return url.replace(/https?:\/\\//g, 'https__//');
}

/**
 * Restores a sanitized URL back to its original form
 * @param {string} sanitizedUrl - The sanitized URL
 * @returns {string} Original URL
 */
export function restoreUrl(sanitizedUrl) {
  if (typeof sanitizedUrl !== 'string') return sanitizedUrl;
  
  // Restore http:// and https:// from the placeholder
  return sanitizedUrl.replace(/https?__\\//g, 'https://');
}

/**
 * Middleware to sanitize URLs in request and error objects
 */
export function urlSanitizerMiddleware(req, res, next) {
  // Store original URL for reference
  req.originalRawUrl = req.url;
  
  // Create helper method to get original URL
  req.getOriginalUrl = () => req.originalRawUrl;
  
  // Continue with sanitized URL if needed
  next();
}
`;

    await fs.writeFile(urlSanitizerPath, urlSanitizerContent, 'utf8');
    console.log('✅ Created url-sanitizer.js utility');

    // Update package.json to include the new build script
    const packageJsonPath = path.join(serverRoot, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

    if (!packageJson.scripts['build:url-validator']) {
      packageJson.scripts['build:url-validator'] = 'node ./scripts/fix-url-validator.js';
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
      console.log('✅ Updated package.json with build:url-validator script');
    }

    // Update typescript-full-build.js to include the URL validator fix
    const fullBuildPath = path.join(serverRoot, 'scripts', 'typescript-full-build.js');
    let fullBuildContent = await fs.readFile(fullBuildPath, 'utf8');

    if (!fullBuildContent.includes('fix-url-validator.js')) {
      const insertPosition = fullBuildContent.indexOf('// Fix TypeScript imports');
      if (insertPosition !== -1) {
        const before = fullBuildContent.substring(0, insertPosition);
        const after = fullBuildContent.substring(insertPosition);
        fullBuildContent =
          before +
          '    // Fix URL validator for path-to-regexp compatibility\n' +
          "    log('Fixing URL validator...', 'info');\n" +
          "    exec('node ./scripts/fix-url-validator.js');\n\n" +
          after;

        await fs.writeFile(fullBuildPath, fullBuildContent, 'utf8');
        console.log('✅ Updated typescript-full-build.js to include URL validator fix');
      }
    }

    console.log('\n✨ URL validator fix completed successfully!');
    console.log('Run npm run build:url-validator to apply the fixes.');
  } catch (error) {
    console.error('❌ Error fixing URL validator:', error);
    process.exit(1);
  }
}

// Run the function
fixUrlValidator().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

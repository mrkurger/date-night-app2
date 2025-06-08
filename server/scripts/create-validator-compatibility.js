#!/usr/bin/env node

/**
 * Enhanced Validator Fix Script
 *
 * This script creates a compatibility layer between the original validator.js
 * and the enhanced TypeScript validator, allowing both implementations to coexist.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverRoot = path.join(__dirname, '..');
const middlewareDir = path.join(serverRoot, 'middleware');
const distDir = path.join(serverRoot, 'dist');
const distMiddlewareDir = path.join(distDir, 'middleware');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(`❌ Failed to create directory: ${error.message}`);
      throw error;
    }
  }
}

async function createValidatorCompat() {
  console.log('🚀 Creating enhanced validator compatibility layer...');

  try {
    // Ensure middleware directories exist
    await ensureDir(middlewareDir);
    await ensureDir(distMiddlewareDir);

    // Create the validator compatibility file
    const validatorCompatPath = path.join(middlewareDir, 'validator-compat.js');
    const validatorCompatContent = `/**
 * Validator Compatibility Layer
 * 
 * This file provides a compatibility layer between the original validator.js
 * and the enhanced TypeScript validator.
 */
import { z } from 'zod';

/**
 * Legacy validation function - renamed to avoid conflicts
 * @param {object} schema - Zod schema for validation
 * @returns {function} Express middleware function
 */
export const legacyValidateWithZod = schema => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

/**
 * Enhanced validation function - with additional options and flexibility
 * @param {object} schema - Zod schema for validation
 * @param {string} source - Source of data to validate ('body', 'query', 'params')
 * @param {object} options - Additional options
 * @returns {function} Express middleware function
 */
export const enhancedValidateWithZod = (schema, source = null, options = {}) => {
  const { stripUnknown = false, errorStatusCode = 422 } = options;
  
  return async (req, res, next) => {
    try {
      if (source) {
        // Validate only the specified source
        const parseOptions = stripUnknown ? { stripUnknown } : {};
        const validatedData = await schema.parseAsync(req[source], parseOptions);
        req[source] = validatedData;
      } else {
        // Validate all sources
        const validatedData = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        // Replace request data with validated data
        req.body = validatedData.body || req.body;
        req.query = validatedData.query || req.query;
        req.params = validatedData.params || req.params;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(errorStatusCode).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

// Main export for compatibility
export const validateWithZod = legacyValidateWithZod;

export default { 
  validateWithZod,
  legacyValidateWithZod,
  enhancedValidateWithZod
};
`;

    await fs.writeFile(validatorCompatPath, validatorCompatContent);
    console.log(`✅ Created validator compatibility file at ${validatorCompatPath}`);

    // Create TypeScript declaration file for the validator compatibility layer
    const validatorDtsPath = path.join(middlewareDir, 'validator-compat.d.ts');
    const validatorDtsContent = `/**
 * TypeScript type definitions for validator compatibility layer
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { MiddlewareFunction } from '../src/types/middleware';

/**
 * Options for validation
 */
export interface ValidationOptions {
  stripUnknown?: boolean;
  errorStatusCode?: number;
  errorMessages?: Record<string, string>;
}

/**
 * Source of data to validate
 */
export type ValidationSource = 'body' | 'query' | 'params';

/**
 * Legacy validation function - renamed to avoid conflicts
 */
export function legacyValidateWithZod(schema: ZodSchema): MiddlewareFunction;

/**
 * Enhanced validation function - with additional options and flexibility
 */
export function enhancedValidateWithZod(
  schema: ZodSchema, 
  source?: ValidationSource | null, 
  options?: ValidationOptions
): MiddlewareFunction;

/**
 * Main export for compatibility - alias to legacyValidateWithZod
 */
export const validateWithZod: typeof legacyValidateWithZod;

/**
 * Default export
 */
declare const _default: {
  validateWithZod: typeof legacyValidateWithZod;
  legacyValidateWithZod: typeof legacyValidateWithZod;
  enhancedValidateWithZod: typeof enhancedValidateWithZod;
};

export default _default;
`;

    await fs.writeFile(validatorDtsPath, validatorDtsContent);
    console.log(`✅ Created TypeScript declarations for validator compat at ${validatorDtsPath}`);

    // Replace existing validator.js with a wrapper to the compat version
    const validatorPath = path.join(middlewareDir, 'validator.js');
    const validatorContent = `/**
 * Validator wrapper to ensure backward compatibility
 */
import { validateWithZod, legacyValidateWithZod, enhancedValidateWithZod } from './validator-compat.js';

// Export all functions, maintaining backward compatibility
export { validateWithZod, legacyValidateWithZod, enhancedValidateWithZod };

export default { validateWithZod };
`;

    // Only replace if it's been changed from original
    try {
      const currentContent = await fs.readFile(validatorPath, 'utf8');

      if (
        !currentContent.includes('validator-compat') &&
        currentContent.includes('export const validateWithZod')
      ) {
        await fs.writeFile(validatorPath, validatorContent);
        console.log(`✅ Updated validator.js to use compat layer at ${validatorPath}`);
      } else {
        console.log('⏭️ validator.js already updated to use compat layer');
      }
    } catch (error) {
      // If file doesn't exist or other error
      console.error(`❌ Error updating validator.js: ${error.message}`);
    }

    // Create updated enhanced-validator.ts that uses the compatibility layer properly
    const enhancedValidatorPath = path.join(middlewareDir, 'enhanced-validator.ts');
    const enhancedValidatorContent = `/**
 * Enhanced validation middleware with TypeScript support
 * This file provides improved validation capabilities with TypeScript compatibility
 */
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidatorFunction } from '../src/types/middleware.js';

/**
 * Source properties for validation
 */
export type RequestValidationSource = 'body' | 'query' | 'params';

/**
 * Validation options
 */
export interface ValidationOptions {
  /**
   * Strip unknown properties if true
   */
  stripUnknown?: boolean;

  /**
   * Custom error messages
   */
  errorMessages?: Record<string, string>;

  /**
   * HTTP status code to return on validation failure
   */
  errorStatusCode?: number;
}

/**
 * Enhanced middleware to validate request data using Zod schema
 * with TypeScript support and improved error handling
 *
 * @param schema - Zod schema for validation
 * @param source - Optional source of data to validate (body, query, params)
 * @param options - Additional options for validation
 * @returns Express middleware function
 */
export function validateWithZod(
  schema: ZodSchema,
  source?: RequestValidationSource,
  options: ValidationOptions = {}
): ValidatorFunction {
  const { stripUnknown = false, errorStatusCode = 422 } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (source) {
        // Validate only the specified source
        const parseOptions = stripUnknown ? { stripUnknown } : {};
        const validatedData = await schema.parseAsync(req[source as keyof Request], parseOptions);
        req[source as keyof Request] = validatedData;
      } else {
        // Validate all sources
        const validatedData = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        // Replace request data with validated data
        req.body = validatedData.body || req.body;
        req.query = validatedData.query || req.query;
        req.params = validatedData.params || req.params;
      }

      // Store validation success flag for error handling middleware
      (req as any).isValidated = true;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(errorStatusCode).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Helper to format validation errors for consistent API responses
 *
 * @param error - Validation error object
 * @returns Formatted error object
 */
export function formatValidationError(error: ZodError) {
  return {
    success: false,
    status: 'error',
    message: 'Validation failed',
    errors: error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  };
}

/**
 * Export the compatibility layer version for backward compatibility
 * @deprecated Use validateWithZod directly
 */
export const enhancedValidateWithZod = validateWithZod;

export default { validateWithZod, formatValidationError, enhancedValidateWithZod };
`;

    await fs.writeFile(enhancedValidatorPath, enhancedValidatorContent);
    console.log(`✅ Updated enhanced validator at ${enhancedValidatorPath}`);

    // Create a master script that combines all validator fixes
    const masterScriptPath = path.join(serverRoot, 'scripts', 'fix-validator-integration.js');
    const masterScriptContent = `#!/usr/bin/env node

/**
 * Validator Integration Script
 * 
 * This script combines all validator fixes into one comprehensive solution.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverRoot = path.join(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
    console.log(\`✅ Created directory: \${dir}\`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(\`❌ Failed to create directory: \${error.message}\`);
      throw error;
    }
  }
}

async function fixValidatorImports() {
  console.log('🔍 Finding and fixing validator imports in compiled JavaScript...');
  
  // Find all JS files in dist
  const files = await glob(\`\${distDir}/**/*.js\`, { ignore: '**/node_modules/**' });
  let fixedFiles = 0;
  
  for (const file of files) {
    try {
      // Skip validator files themselves
      if (file.endsWith('validator.js') && 
         (file.includes('/middleware/validator.js') || 
          file.includes('/middleware/validator-compat.js') || 
          file.includes('/middleware/enhanced-validator.js'))) {
        continue;
      }
      
      const content = await fs.readFile(file, 'utf8');
      let modifiedContent = content;
      
      // Fix direct imports from validator.js
      modifiedContent = modifiedContent.replace(
        /import\s*{\s*validateWithZod\s*}\s*from\s*['"]([\.\/]+)middleware\/validator\.js['"]/g,
        (match, path) => \`import { legacyValidateWithZod as validateWithZod } from '\${path}middleware/validator-compat.js'\`
      );
      
      // Fix imports from enhanced-validator.ts
      modifiedContent = modifiedContent.replace(
        /import\s*{\s*validateWithZod\s*}\s*from\s*['"]([\.\/]+)middleware\/enhanced-validator\.js['"]/g,
        (match, path) => \`import { enhancedValidateWithZod as validateWithZod } from '\${path}middleware/validator-compat.js'\`
      );
      
      // Fix named validators
      const validatorImports = [
        'UserValidator', 
        'AdValidator', 
        'AuthValidator', 
        'PaymentValidator',
        'TravelValidator',
        'ReviewValidator',
        'LocationValidator',
        'SafetyValidator'
      ];
      
      for (const validatorName of validatorImports) {
        modifiedContent = modifiedContent.replace(
          new RegExp(\`\${validatorName}\\.validateWithZod\\b\`, 'g'),
          \`\${validatorName}.legacyValidateWithZod\`
        );
      }
      
      // Only write if changes were made
      if (modifiedContent !== content) {
        await fs.writeFile(file, modifiedContent);
        console.log(\`✅ Updated imports in: \${path.relative(serverRoot, file)}\`);
        fixedFiles++;
      }
    } catch (error) {
      console.error(\`❌ Failed to process file: \${file} - \${error.message}\`);
    }
  }
  
  console.log(\`✅ Fixed imports in \${fixedFiles} files\`);
}

// Copy the compatibility files to the dist directory
async function copyCompatFilesToDist() {
  console.log('📁 Copying compatibility files to dist...');
  
  try {
    // Ensure middleware directory exists in dist
    await ensureDir(path.join(distDir, 'middleware'));
    
    // Copy validator-compat.js
    const validatorCompatSrc = path.join(serverRoot, 'middleware', 'validator-compat.js');
    const validatorCompatDest = path.join(distDir, 'middleware', 'validator-compat.js');
    
    await fs.copyFile(validatorCompatSrc, validatorCompatDest);
    console.log(\`✅ Copied validator-compat.js to \${validatorCompatDest}\`);
    
    // Copy validator.js
    const validatorSrc = path.join(serverRoot, 'middleware', 'validator.js');
    const validatorDest = path.join(distDir, 'middleware', 'validator.js');
    
    await fs.copyFile(validatorSrc, validatorDest);
    console.log(\`✅ Copied validator.js to \${validatorDest}\`);
    
    return true;
  } catch (error) {
    console.error(\`❌ Failed to copy compatibility files: \${error.message}\`);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Starting validator integration...');
    
    // Copy compatibility files to dist
    await copyCompatFilesToDist();
    
    // Fix validator imports
    await fixValidatorImports();
    
    console.log('✅ Validator integration completed successfully!');
  } catch (error) {
    console.error(\`❌ Validator integration failed: \${error.message}\`);
    process.exit(1);
  }
}

// Run the script
main();
`;

    await fs.writeFile(masterScriptPath, masterScriptContent);
    console.log(`✅ Created validator integration script at ${masterScriptPath}`);

    console.log('✅ Enhanced validator compatibility layer created successfully!');
    return true;
  } catch (error) {
    console.error(`❌ Failed to create validator compat layer: ${error.message}`);
    return false;
  }
}

// Run the function
createValidatorCompat().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});

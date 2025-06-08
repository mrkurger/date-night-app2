#!/usr/bin/env node

/**
 * Validation Compatibility Resolver Script
 *
 * This script resolves naming conflicts between different validation implementations
 * by creating compatibility shims.
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

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
};

console.log(`${colors.blue}🔧${colors.reset} Starting validation compatibility fixes...`);

// Create a shim for enhanced validator to avoid naming conflicts
async function createEnhancedValidatorShim() {
  console.log(`${colors.yellow}📝${colors.reset} Creating enhanced validator shim...`);

  const shimPath = path.join(distDir, 'middleware', 'enhanced-validator.js');

  const content = `/**
 * Enhanced validator shim
 * This file renames the validateWithZod function to enhance to avoid naming conflicts
 */
import { z } from 'zod';
import { ValidatorFunction } from '../src/types/middleware.js';

// Export types
export const RequestValidationSource = 'body' | 'query' | 'params';

/**
 * Enhanced validation with a different name to avoid conflicts
 */
export const enhanceWithZod = (schema, source = 'body', options = {}) => {
  const { stripUnknown = false, errorStatusCode = 422 } = options;
  
  return async (req, res, next) => {
    try {
      let data;
      
      // Get data from the appropriate source
      if (source === 'body') {
        data = req.body;
      } else if (source === 'query') {
        data = req.query;
      } else if (source === 'params') {
        data = req.params;
      } else {
        // Default to validating the entire request object
        data = {
          body: req.body,
          query: req.query,
          params: req.params
        };
      }

      // Validate the data
      const validatedData = await schema.parseAsync(data);
      
      // Replace the source with validated data
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'query') {
        req.query = validatedData;
      } else if (source === 'params') {
        req.params = validatedData;
      } else {
        // Replace each property separately
        if (validatedData.body) req.body = validatedData.body;
        if (validatedData.query) req.query = validatedData.query;
        if (validatedData.params) req.params = validatedData.params;
      }
      
      next();
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'validation_error'
        }));
        
        return res.status(errorStatusCode).json({
          success: false,
          errors: formattedErrors
        });
      }
      
      // Pass other errors to the next error handler
      next(error);
    }
  };
};

// Alias for backward compatibility
export const validateWithZod = enhanceWithZod;

// Default export
export default {
  enhanceWithZod,
  validateWithZod: enhanceWithZod
};
`;

  try {
    await fs.writeFile(shimPath, content);
    console.log(
      `${colors.green}✓${colors.reset} Created enhanced validator shim at: ${path.relative(serverRoot, shimPath)}`
    );
  } catch (error) {
    console.error(
      `${colors.red}✗${colors.reset} Failed to create enhanced validator shim: ${error.message}`
    );
  }
}

// Fix imports to use the enhanced validator
async function fixValidatorImports() {
  console.log(`${colors.yellow}🔍${colors.reset} Fixing validator imports...`);

  // Find files that import validator
  const files = await glob(`${distDir}/**/*.js`, { ignore: '**/node_modules/**' });
  let fixedFiles = 0;

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf8');

      // Skip files that don't import validator
      if (!content.includes('validateWithZod') || file.includes('validator.js')) continue;

      let modifiedContent = content;

      // Update import statements to use enhanced-validator
      modifiedContent = modifiedContent.replace(
        /import\s+{\s*validateWithZod\s*}\s+from\s+['"]\.\.\/middleware\/validator\.js['"]/g,
        `import { enhanceWithZod as validateWithZod } from '../middleware/enhanced-validator.js'`
      );

      // Update import statements (alternate version)
      modifiedContent = modifiedContent.replace(
        /import\s+{\s*validateWithZod\s*}\s+from\s+['"]\.\.\/\.\.\/middleware\/validator\.js['"]/g,
        `import { enhanceWithZod as validateWithZod } from '../../middleware/enhanced-validator.js'`
      );

      // Only write if changes were made
      if (modifiedContent !== content) {
        await fs.writeFile(file, modifiedContent);
        console.log(
          `${colors.green}✓${colors.reset} Fixed validator imports in: ${path.relative(serverRoot, file)}`
        );
        fixedFiles++;
      }
    } catch (error) {
      console.error(
        `${colors.red}✗${colors.reset} Failed to fix validator imports in: ${file} - ${error.message}`
      );
    }
  }

  console.log(`${colors.green}✓${colors.reset} Fixed validator imports in ${fixedFiles} files`);
}

async function main() {
  try {
    await createEnhancedValidatorShim();
    await fixValidatorImports();
    console.log(
      `${colors.green}✅${colors.reset} Validation compatibility fixes completed successfully!`
    );
  } catch (error) {
    console.error(
      `${colors.red}❌${colors.reset} Failed to fix validation compatibility: ${error.message}`
    );
    process.exit(1);
  }
}

main();

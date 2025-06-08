#!/usr/bin/env node

/**
 * Fix Validator Conflicts Script
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.join(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');

// Create a patched validator.js file
async function createPatchedValidator() {
  console.log('Creating patched validator.js...');
  const validatorPath = path.join(distDir, 'middleware', 'validator.js');

  // Original validator.js content without the validateWithZod function
  const content = `// Patched validator.js without naming conflicts
import { z } from 'zod';

/**
 * Resolver that maps validation errors to a standardized format
 * @param {object} error - Zod validation error
 * @returns {object} Formatted error object
 */
export const zodErrorResolver = (error) => {
  return error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
    code: 'invalid_input'
  }));
};

/**
 * Legacy validation function - renamed to avoid conflicts
 */
export const legacyValidateWithZod = (schema) => {
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
          errors: zodErrorResolver(error)
        });
      }
      next(error);
    }
  };
};

// Export for backward compatibility
export default { legacyValidateWithZod };
`;

  try {
    await fs.writeFile(validatorPath, content);
    console.log(`✅ Created patched validator.js at ${validatorPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create patched validator.js: ${error.message}`);
    return false;
  }
}

// Update files that import from validator.js
async function updateImports() {
  console.log('Updating validator imports...');

  // Files that need to be updated
  const filesToUpdate = [
    // Travel validator
    {
      path: path.join(distDir, 'middleware', 'validators', 'travel.validator.js'),
      importPattern: /import\s*{\s*validateWithZod\s*}\s*from\s*['"]\.\.\/validator\.js['"]/g,
      replacement: `import { legacyValidateWithZod as validateWithZod } from '../validator.js'`,
    },
    // Users validator
    {
      path: path.join(distDir, 'components', 'users', 'users.validator.js'),
      importPattern:
        /import\s*{\s*validateWithZod\s*}\s*from\s*['"]\.\.\/\.\.\/middleware\/validator\.js['"]/g,
      replacement: `import { legacyValidateWithZod as validateWithZod } from '../../middleware/validator.js'`,
    },
  ];

  for (const file of filesToUpdate) {
    try {
      const content = await fs.readFile(file.path, 'utf8');
      const updatedContent = content.replace(file.importPattern, file.replacement);

      await fs.writeFile(file.path, updatedContent);
      console.log(`✅ Updated imports in ${file.path}`);
    } catch (error) {
      // File might not exist yet
      console.error(`⚠️ Could not update ${file.path}: ${error.message}`);
    }
  }

  return true;
}

async function main() {
  try {
    await createPatchedValidator();
    await updateImports();
    console.log('✅ Fixed validator conflicts successfully');
  } catch (error) {
    console.error(`❌ Failed to fix validator conflicts: ${error.message}`);
    process.exit(1);
  }
}

main();

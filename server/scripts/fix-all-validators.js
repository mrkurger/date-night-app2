#!/usr/bin/env node

/**
 * Fix All Validators Script
 *
 * This script fixes all validator imports in the codebase to ensure compatibility
 * between different validation implementations.
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

console.log('🔧 Starting validation fixes...');

// Create a patched validator.js file
async function createPatchedValidator() {
  console.log('📄 Creating patched validator.js...');
  const validatorPath = path.join(distDir, 'middleware', 'validator.js');

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
    console.log(`✅ Created patched validator.js at ${path.relative(serverRoot, validatorPath)}`);
  } catch (error) {
    console.error(`❌ Failed to create patched validator.js: ${error.message}`);
    throw error;
  }
}

// Update all validator imports in the codebase
async function updateValidatorImports() {
  console.log('🔍 Finding and updating validator imports...');

  // Find all JS files in dist
  const files = await glob(`${distDir}/**/*.js`, { ignore: '**/node_modules/**' });
  let fixedFiles = 0;

  for (const file of files) {
    try {
      // Skip the validator.js file itself
      if (file.endsWith('validator.js') && file.includes('/middleware/validator.js')) {
        continue;
      }

      const content = await fs.readFile(file, 'utf8');
      let modifiedContent = content;

      // Fix direct imports from validator.js
      modifiedContent = modifiedContent.replace(
        /import\s*{\s*validateWithZod\s*}\s*from\s*['"]([\.\/]+)middleware\/validator\.js['"]/g,
        (match, path) =>
          `import { legacyValidateWithZod as validateWithZod } from '${path}middleware/validator.js'`
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
        'SafetyValidator',
      ];

      for (const validatorName of validatorImports) {
        modifiedContent = modifiedContent.replace(
          new RegExp(`${validatorName}\\.validateWithZod`, 'g'),
          `${validatorName}.legacyValidateWithZod`
        );
      }

      // Only write if changes were made
      if (modifiedContent !== content) {
        await fs.writeFile(file, modifiedContent);
        console.log(`✅ Updated imports in: ${path.relative(serverRoot, file)}`);
        fixedFiles++;
      }
    } catch (error) {
      console.error(`❌ Failed to process file: ${file} - ${error.message}`);
    }
  }

  console.log(`✅ Fixed imports in ${fixedFiles} files`);
}

// Create compatibility stub for users.validator.js
async function createUsersValidatorStub() {
  console.log('📄 Creating users.validator.js stub...');

  const stubPath = path.join(distDir, 'components', 'users', 'users.validator.js');
  const content = `// Users validator compatibility stub
import { legacyValidateWithZod } from '../../middleware/validator.js';
import { z } from 'zod';

// Common schemas
const emailSchema = z.string().email('Invalid email format');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const UserValidator = {
  validateRegistration: legacyValidateWithZod(
    z.object({
      body: z.object({
        email: emailSchema,
        password: passwordSchema,
        name: z.string().min(2, 'Name must be at least 2 characters'),
      })
    })
  ),
  
  validateLogin: legacyValidateWithZod(
    z.object({
      body: z.object({
        email: emailSchema,
        password: z.string(),
      })
    })
  ),
  
  // Use the renamed function instead
  legacyValidateWithZod
};

export default UserValidator;
`;

  try {
    await fs.writeFile(stubPath, content);
    console.log(`✅ Created users.validator.js stub at ${path.relative(serverRoot, stubPath)}`);
  } catch (error) {
    console.error(`❌ Failed to create users.validator.js stub: ${error.message}`);
  }
}

async function main() {
  try {
    await createPatchedValidator();
    await createUsersValidatorStub();
    await updateValidatorImports();
    console.log('✅ All validator fixes completed successfully!');
  } catch (error) {
    console.error(`❌ Validator fixes failed: ${error.message}`);
    process.exit(1);
  }
}

main();

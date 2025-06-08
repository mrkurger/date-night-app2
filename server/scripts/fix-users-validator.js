/**
 * Script to fix users validator compatibility issues
 *
 * This script creates and modifies necessary files to ensure proper compatibility
 * between JavaScript and TypeScript users validator implementations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get server root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');

// Path to users validator in dist
const usersValidatorPath = path.join(distDir, 'components', 'users', 'users.validator.js');

function fixUsersValidator() {
  console.log('Fixing users validator exports...');

  const usersValidatorContent = `/**
 * Users validator compatibility layer
 */

import { z } from 'zod';
import { zodSchemas } from '../../utils/validation-utils.js';

// Validation schemas
export const userSchemas = {
  passwordChange: z.object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100)
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  }),
  
  userUpdate: z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
    bio: z.string().max(500).optional(),
    preferences: z.object({}).passthrough().optional()
  })
};

// Legacy named exports
export const validatePasswordChange = (req, res, next) => {
  try {
    const result = userSchemas.passwordChange.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        errors: result.error.errors 
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const validateUserUpdate = (req, res, next) => {
  try {
    const result = userSchemas.userUpdate.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        errors: result.error.errors 
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Named export object for TypeScript compatibility
export const UsersValidator = {
  validatePasswordChange,
  validateUserUpdate,
  schemas: userSchemas
};

// Default export for compatibility
export default UsersValidator;
`;

  // Create directory if it doesn't exist
  const usersDir = path.dirname(usersValidatorPath);
  if (!fs.existsSync(usersDir)) {
    fs.mkdirSync(usersDir, { recursive: true });
  }

  // Write the users validator
  fs.writeFileSync(usersValidatorPath, usersValidatorContent, 'utf8');
  console.log(`Created/updated ${usersValidatorPath}`);
}

// Main function to run all fixes
function main() {
  console.log('Fixing users validator compatibility issues...');

  fixUsersValidator();

  console.log('Users validator compatibility fixes completed!');
}

main();

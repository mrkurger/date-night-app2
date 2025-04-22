#!/usr/bin/env node

/**
 * This script updates the ESLint configuration to be more lenient with 'any' types
 * and unused variables in the client-angular project.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the ESLint configuration file
const eslintConfigPath = path.join(__dirname, '..', 'client-angular', '.eslintrc.json');

// Read the current ESLint configuration
let eslintConfig;
try {
  const configContent = fs.readFileSync(eslintConfigPath, 'utf8');
  eslintConfig = JSON.parse(configContent);
} catch (error) {
  console.error(`Error reading ESLint config: ${error.message}`);
  process.exit(1);
}

// Update the rules to be more lenient with 'any' types and unused variables
if (!eslintConfig.rules) {
  eslintConfig.rules = {};
}

// Set the 'no-explicit-any' rule to 'warn' instead of 'error'
eslintConfig.rules['@typescript-eslint/no-explicit-any'] = 'warn';

// Set the 'no-unused-vars' rule to 'warn' instead of 'error'
eslintConfig.rules['@typescript-eslint/no-unused-vars'] = 'warn';

// Set the 'no-console' rule to 'warn' instead of 'error'
eslintConfig.rules['no-console'] = 'warn';

// Add overrides for test files to be more lenient
if (!eslintConfig.overrides) {
  eslintConfig.overrides = [];
}

// Add an override for test files
eslintConfig.overrides.push({
  files: ['*.spec.ts', '*.test.ts', '**/testing/**/*.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-console': 'off',
  },
});

// Add an override for interceptor files
eslintConfig.overrides.push({
  files: ['**/interceptors/**/*.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
  },
});

// Write the updated ESLint configuration back to the file
try {
  fs.writeFileSync(eslintConfigPath, JSON.stringify(eslintConfig, null, 2), 'utf8');
  console.log('ESLint configuration updated successfully!');
} catch (error) {
  console.error(`Error writing ESLint config: ${error.message}`);
  process.exit(1);
}

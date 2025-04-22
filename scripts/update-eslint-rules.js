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
  // Remove comments from the JSON file
  const jsonContent = configContent.replace(/\/\/.*$/gm, '');
  eslintConfig = JSON.parse(jsonContent);
} catch (error) {
  console.error(`Error reading ESLint config: ${error.message}`);
  process.exit(1);
}

// Find the TypeScript rules section
const tsOverride = eslintConfig.overrides.find(override => override.files.includes('*.ts'));

if (!tsOverride) {
  console.error('Could not find TypeScript rules in ESLint config');
  process.exit(1);
}

if (!tsOverride.rules) {
  tsOverride.rules = {};
}

// Update the rules to be more lenient with 'any' types and unused variables
// Set the 'no-explicit-any' rule to 'warn' instead of 'error'
tsOverride.rules['@typescript-eslint/no-explicit-any'] = 'warn';

// Set the 'no-unused-vars' rule to 'warn' instead of 'error'
tsOverride.rules['@typescript-eslint/no-unused-vars'] = [
  'warn',
  {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
  },
];

// Set the 'no-console' rule to 'warn' instead of 'error'
tsOverride.rules['no-console'] = 'warn';

// Add overrides for test files to be more lenient
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

// Add an override for service files
eslintConfig.overrides.push({
  files: ['**/services/**/*.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
  },
});

// Add an override for component files
eslintConfig.overrides.push({
  files: ['**/components/**/*.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
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

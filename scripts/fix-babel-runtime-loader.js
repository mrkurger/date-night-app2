#!/usr/bin/env node

/**
 * This script creates a custom module loader to handle the missing @babel/runtime/helpers/asyncToGenerator.js issue
 */

import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Source file path (where the file actually exists)
const sourceFile = path.join(
  rootDir,
  'node_modules',
  '@babel',
  'runtime',
  'helpers',
  'asyncToGenerator.js',
);

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
  console.error(`Error: Source file not found at ${sourceFile}`);
  process.exit(1);
}

// Create a custom module loader in the client-angular directory
const loaderFile = path.join(rootDir, 'client-angular', 'src', 'babel-runtime-loader.cjs');

// Create the loader file content
const loaderContent = `
// This is a custom module loader to handle the missing @babel/runtime/helpers/asyncToGenerator.js
// It intercepts require calls for the missing module and returns the actual implementation

const Module = require('module');
const path = require('path');
const fs = require('fs');

// Store the original require function
const originalRequire = Module.prototype.require;

// The path to the actual implementation
const actualImplementationPath = path.resolve(__dirname, '../../node_modules/@babel/runtime/helpers/asyncToGenerator.js');

// The path that tests are trying to load
const missingModulePath = '/Users/oivindlund/date-night-app/node_modules/@angular-devkit/build-angular/node_modules/@babel/runtime/helpers/asyncToGenerator.js';

// Override the require function
Module.prototype.require = function(id) {
  // If the requested module is the missing one, return the actual implementation
  if (id === missingModulePath) {
    console.log('Intercepted request for missing Babel runtime helper, redirecting to actual implementation');
    return originalRequire.call(this, actualImplementationPath);
  }
  
  // Otherwise, use the original require function
  return originalRequire.call(this, id);
};

// Log that the loader is active
console.log('Babel runtime helper loader is active');
`;

// Write the loader file
try {
  fs.writeFileSync(loaderFile, loaderContent);
  console.log(`Created custom module loader at ${loaderFile}`);
} catch (error) {
  console.error(`Error creating loader file: ${error.message}`);
  process.exit(1);
}

// Create a script to run tests with the loader
const testScriptFile = path.join(rootDir, 'client-angular', 'run-tests-with-loader.cjs');

const testScriptContent = `
// This script runs the tests with the custom module loader

// Load the custom module loader
require('./src/babel-runtime-loader.cjs');

// Run the tests
require('@angular/cli/bin/ng');
`;

try {
  fs.writeFileSync(testScriptFile, testScriptContent);
  console.log(`Created test script at ${testScriptFile}`);
} catch (error) {
  console.error(`Error creating test script: ${error.message}`);
  process.exit(1);
}

// Update the package.json to include a script to run tests with the loader
const packageJsonFile = path.join(rootDir, 'client-angular', 'package.json');

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));

  // Add a script to run tests with the loader
  packageJson.scripts['test:with-loader'] =
    'node run-tests-with-loader.cjs test client-angular --no-watch --no-progress';

  fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2));
  console.log(`Updated package.json with test:with-loader script`);
} catch (error) {
  console.error(`Error updating package.json: ${error.message}`);
  process.exit(1);
}

console.log('Babel runtime helper loader fix completed successfully');
console.log('Run tests with: cd client-angular && npm run test:with-loader');

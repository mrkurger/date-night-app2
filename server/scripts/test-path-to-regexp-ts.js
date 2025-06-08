#!/usr/bin/env node

/**
 * TypeScript Path-to-Regexp Tests
 *
 * This script runs tests for the TypeScript implementation of the path-to-regexp patch
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get server root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');

// Log helper
function log(message, type = 'info') {
  const prefix =
    {
      info: '📄',
      error: '❌',
      success: '✅',
      warning: '⚠️',
    }[type] || '📄';

  console.log(`${prefix} ${message}`);
}

// Execute a command
function exec(command, options = {}) {
  try {
    log(`Running: ${command}`);
    return execSync(command, {
      stdio: 'inherit',
      cwd: serverRoot,
      ...options,
    });
  } catch (error) {
    log(`Test failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Main function
async function runTests() {
  try {
    log('Starting TypeScript path-to-regexp patch tests...', 'info');

    // Make sure the TypeScript code is built
    log('Building TypeScript code...', 'info');
    exec('npm run build:ts');

    // Run unit tests
    log('Running unit tests...', 'info');
    exec('npm test -- --testPathPattern=tests/unit/middleware/path-to-regexp-patch');
    exec('npm test -- --testPathPattern=tests/unit/middleware/safe-router');
    exec('npm test -- --testPathPattern=tests/unit/middleware/error-sanitizer');
    exec('npm test -- --testPathPattern=tests/unit/middleware/error-handler');

    // Run integration tests
    log('Running integration tests...', 'info');
    exec('npm test -- --testPathPattern=tests/integration/path-to-regexp-url-handling');

    log('All TypeScript path-to-regexp patch tests passed!', 'success');
  } catch (error) {
    log(`Test script failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the tests
runTests();

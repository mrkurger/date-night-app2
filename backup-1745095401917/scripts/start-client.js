#!/usr/bin/env node

/**
 * Script to start the Angular client
 * This script ensures the correct project is specified when running ng serve
 */

const { execSync } = require('child_process');
const path = require('path');

// Define the client directory
const clientDir = path.join(__dirname, '..', 'client-angular');

console.log('Starting Angular client...');

try {
  // Change to client directory
  process.chdir(clientDir);

  // Start the Angular client with the correct project and increased memory
  execSync('NODE_OPTIONS=--max_old_space_size=8192 npx ng serve client-angular --open', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max_old_space_size=8192',
    },
  });
} catch (error) {
  console.error('Error starting Angular client:', error.message);
  process.exit(1);
}

/**
 * Script to start the Angular client from the server directory
 * This script ensures the correct project is specified when running ng serve
 */

import { execSync } from 'child_process';
import path from 'path';

// Define the client directory
const clientDir = path.join(__dirname, '..', '..', 'client-angular');

console.log('Starting Angular client from server directory...');

try {
  // Change to client directory
  process.chdir(clientDir);

  // Start the Angular client with the correct project
  execSync('ng serve client-angular --open', {
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }, // Increase memory limit
  });
} catch (error) {
  console.error('Error starting Angular client:', error.message);
  throw error;
}

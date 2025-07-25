#!/usr/bin/env node

/**
 * Script to start the Angular client
 * This script ensures the correct project is specified when running ng serve
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define paths - ES module compatible way
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the client directory
const clientDir = path.join(__dirname, '..', 'client-angular');

console.log('Starting Angular client...');

try {
  // Change to client directory
  process.chdir(clientDir);

  // Start the Angular client with the correct project, increased memory, and WebSocket configuration
  execSync(
    'NODE_OPTIONS=--max_old_space_size=8192 npx ng serve client-angular --host=localhost --disable-host-check --no-hmr --live-reload',
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max_old_space_size=8192',
      },
    },
  );
} catch (error) {
  console.error('Error starting Angular client:', error.message);
  process.exit(1);
}

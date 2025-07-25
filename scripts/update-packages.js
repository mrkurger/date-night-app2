#!/usr/bin/env node

/**
 * Script to update packages in all project components
 * This script runs npm update in the root, server, and client directories
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { fileURLToPath } from 'url';

// Define paths using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories
const rootDir = path.join(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client-angular');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}Date Night App - Package Updater${colors.reset}`);
console.log(`${colors.cyan}===============================${colors.reset}\n`);

// Function to update packages in a directory
async function updatePackages(dir, name) {
  console.log(`${colors.magenta}Updating packages in ${name}...${colors.reset}`);

  try {
    await fsPromises.access(path.join(dir, 'package.json'));
  } catch (error) {
    console.log(`${colors.yellow}No package.json found in ${name}, skipping...${colors.reset}`);
    return;
  }

  try {
    process.chdir(dir);
    console.log(`${colors.blue}Running npm update in ${name}...${colors.reset}`);
    execSync('npm update', { stdio: 'inherit' });
    console.log(`${colors.green}Successfully updated packages in ${name}!${colors.reset}\n`);
  } catch (error) {
    console.error(
      `${colors.red}Error updating packages in ${name}: ${error.message}${colors.reset}\n`,
    );
  }
}

// Main async function
async function main() {
  // Update packages in each directory
  await updatePackages(rootDir, 'root project');
  await updatePackages(serverDir, 'server');
  await updatePackages(clientDir, 'client');

  console.log(`${colors.green}Package update process completed!${colors.reset}`);
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});

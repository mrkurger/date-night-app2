#!/usr/bin/env node

/**
 * Script to update packages in all project components
 * This script runs npm update in the root, server, and client directories
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}Date Night App - Package Updater${colors.reset}`);
console.log(`${colors.cyan}===============================${colors.reset}\n`);

// Function to update packages in a directory
function updatePackages(dir, name) {
  console.log(`${colors.magenta}Updating packages in ${name}...${colors.reset}`);
  
  if (!fs.existsSync(path.join(dir, 'package.json'))) {
    console.log(`${colors.yellow}No package.json found in ${name}, skipping...${colors.reset}`);
    return;
  }
  
  try {
    process.chdir(dir);
    console.log(`${colors.blue}Running npm update in ${name}...${colors.reset}`);
    execSync('npm update', { stdio: 'inherit' });
    console.log(`${colors.green}Successfully updated packages in ${name}!${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}Error updating packages in ${name}: ${error.message}${colors.reset}\n`);
  }
}

// Update packages in each directory
updatePackages(rootDir, 'root project');
updatePackages(serverDir, 'server');
updatePackages(clientDir, 'client');

console.log(`${colors.green}Package update process completed!${colors.reset}`);
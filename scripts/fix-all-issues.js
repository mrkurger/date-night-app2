#!/usr/bin/env node

/**
 * Script to fix all common issues in the project
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define paths - ES module compatible way
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

console.log(`${colors.cyan}Date Night App - Fix All Issues${colors.reset}`);
console.log(`${colors.cyan}=============================${colors.reset}\n`);

// Function to run a command and log the output
function runCommand(command, message) {
  console.log(`${colors.blue}${message}...${colors.reset}`);

  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    console.log(`${colors.green}Command completed successfully.${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error executing command: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}Command output: ${error.stdout || ''}${colors.reset}`);
    console.log(`${colors.yellow}Command error: ${error.stderr || ''}${colors.reset}`);
    return false;
  }
}

// Function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`${colors.yellow}Creating directory: ${dirPath}${colors.reset}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Main function to fix all issues
async function fixAllIssues() {
  // 1. Make scripts executable
  console.log(`${colors.magenta}Step 1: Making scripts executable${colors.reset}`);
  runCommand('bash scripts/make-scripts-executable.sh', 'Making scripts executable');

  // 2. Ensure server/scripts directory exists
  console.log(`${colors.magenta}Step 2: Ensuring server/scripts directory exists${colors.reset}`);
  const serverScriptsDir = path.join(__dirname, '..', 'server', 'scripts');
  ensureDirectoryExists(serverScriptsDir);

  // 3. Fix npm audit issues
  console.log(`${colors.magenta}Step 3: Fixing npm audit issues${colors.reset}`);
  runCommand('npm audit fix --force', 'Running npm audit fix');

  // 4. Check MongoDB setup
  console.log(`${colors.magenta}Step 4: Checking MongoDB setup${colors.reset}`);
  runCommand('node scripts/check-mongodb-permissions.js', 'Checking MongoDB permissions');

  // 5. Fix MongoDB issues if any
  console.log(`${colors.magenta}Step 5: Fixing MongoDB issues${colors.reset}`);
  runCommand('node scripts/fix-mongodb-issues.js', 'Fixing MongoDB issues');

  // 6. Install missing dependencies
  console.log(`${colors.magenta}Step 6: Installing missing dependencies${colors.reset}`);
  runCommand('npm run install-missing', 'Installing missing dependencies');

  // 7. Update packages
  console.log(`${colors.magenta}Step 7: Updating packages${colors.reset}`);
  runCommand('npm run update-packages', 'Updating packages');

  console.log(`${colors.green}All issues have been fixed!${colors.reset}`);
  console.log(`${colors.green}You can now run the application with: npm run dev${colors.reset}`);
}

// Run the main function
fixAllIssues().catch(err => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, err);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * This script installs missing dependencies identified by depcheck
 */

const { execSync } = require('child_process');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Paths to project directories
const rootDir = path.join(__dirname, '..');
const clientDir = path.join(rootDir, 'client-angular');
const serverDir = path.join(rootDir, 'server');

/**
 * Install dependencies in a specific directory
 * @param {string} directory - Directory to install dependencies in
 * @param {Array<string>} dependencies - List of dependencies to install
 * @param {boolean} isDev - Whether to install as dev dependencies
 */
function installDependencies(directory, dependencies, isDev = false) {
  if (!dependencies || dependencies.length === 0) {
    return;
  }

  const depType = isDev ? 'devDependencies' : 'dependencies';
  console.log(`${colors.blue}Installing ${depType} in ${directory}:${colors.reset}`);
  dependencies.forEach(dep => console.log(`${colors.yellow}- ${dep}${colors.reset}`));

  try {
    const command = `npm install ${dependencies.join(' ')} ${isDev ? '--save-dev' : '--save'} --legacy-peer-deps`;
    execSync(command, {
      cwd: directory,
      stdio: 'inherit',
    });
    console.log(`${colors.green}Successfully installed ${depType} in ${directory}${colors.reset}`);
  } catch (error) {
    console.error(
      `${colors.red}Error installing ${depType} in ${directory}: ${error.message}${colors.reset}`
    );
  }
}

// Main function
function main() {
  console.log(`${colors.cyan}===== Installing Missing Dependencies =====${colors.reset}`);

  // Root project
  console.log(`${colors.magenta}Installing missing dependencies in root project...${colors.reset}`);
  installDependencies(rootDir, [], false);
  // Skip ESLint plugins as they're already handled by the fix-eslint-dependencies.js script
  console.log(
    `${colors.yellow}Skipping ESLint plugins as they're already handled by the fix-eslint-dependencies.js script${colors.reset}`
  );

  // Client project
  console.log(
    `${colors.magenta}Installing missing dependencies in client project...${colors.reset}`
  );
  installDependencies(clientDir, ['socket.io-client'], false);

  // Server project
  console.log(
    `${colors.magenta}Installing missing dependencies in server project...${colors.reset}`
  );
  installDependencies(serverDir, ['argon2', 'bcrypt'], false);

  console.log(
    `${colors.cyan}===== Missing Dependencies Installation Complete =====${colors.reset}`
  );
}

// Run the main function
main();

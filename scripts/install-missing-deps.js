#!/usr/bin/env node

/**
 * Enhanced script to install missing dependencies for the Date Night App
 * This script checks for and installs commonly missing dependencies for all components
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

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

console.log(`${colors.cyan}Date Night App - Dependency Checker${colors.reset}`);
console.log(`${colors.cyan}==================================${colors.reset}\n`);

// List of dependencies to check and install if missing
const dependencies = {
  server: {
    prod: [
      'express',
      'mongoose',
      'dotenv',
      'helmet@8.1.0',
      'compression',
      'cors',
      'body-parser',
      'jsonwebtoken',
      'bcrypt',
      'socket.io',
      'express-validator',
      'express-rate-limit',
      'express-mongo-sanitize',
      'winston',
      'winston-daily-rotate-file',
      'multer',
      'passport',
      'passport-jwt',
      'passport-local',
      'csrf-csrf',
      'cookie-parser',
      'uuid',
      'node-cache',
      'xss-clean',
      'hpp',
      'argon2',
      'stripe',
      'node-cron'
    ],
    dev: [
      'nodemon',
      'jest'
    ]
  },
  client: {
    prod: [
      '@angular/common',
      '@angular/core',
      '@angular/forms',
      '@angular/platform-browser',
      '@angular/router',
      'rxjs',
      'zone.js',
      'ngx-socket-io'
    ],
    dev: [
      '@angular/cli',
      '@angular-devkit/build-angular',
      'typescript',
      'jasmine-core',
      'karma'
    ]
  },
  root: {
    prod: [
      'dotenv',
      'mongoose',
      'helmet@8.1.0',
      'semver',
      'fs-extra'
    ],
    dev: [
      'concurrently',
      'jest'
    ]
  }
};

// Function to check if package.json exists
function checkPackageJson(dir) {
  const packageJsonPath = path.join(dir, 'package.json');
  return fs.existsSync(packageJsonPath);
}

// Function to get installed dependencies from package.json
function getInstalledDependencies(dir) {
  try {
    const packageJsonPath = path.join(dir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    return {
      prod: packageJson.dependencies || {},
      dev: packageJson.devDependencies || {}
    };
  } catch (error) {
    console.error(`${colors.red}Error reading package.json in ${dir}: ${error.message}${colors.reset}`);
    return { prod: {}, dev: {} };
  }
}

// Function to install missing dependencies
function installMissingDependencies(dir, deps, type) {
  if (deps.length === 0) {
    console.log(`${colors.green}All ${type} dependencies are already installed in ${path.basename(dir)}!${colors.reset}`);
    return;
  }

  console.log(`${colors.yellow}Installing missing ${type} dependencies in ${path.basename(dir)}: ${deps.join(', ')}${colors.reset}`);

  try {
    // Change to directory
    process.chdir(dir);

    // Install missing dependencies
    const installCmd = type === 'production'
      ? `npm install --save ${deps.join(' ')}`
      : `npm install --save-dev ${deps.join(' ')}`;

    execSync(installCmd, { stdio: 'inherit' });

    console.log(`${colors.green}Dependencies installed successfully in ${path.basename(dir)}!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error installing dependencies in ${path.basename(dir)}: ${error.message}${colors.reset}`);
  }
}

// Function to check and install dependencies for a component
function checkAndInstallForComponent(dir, componentName, componentDeps) {
  console.log(`\n${colors.magenta}Checking ${componentName} dependencies...${colors.reset}`);

  if (!checkPackageJson(dir)) {
    console.error(`${colors.red}Error: package.json not found in ${dir}${colors.reset}`);
    return;
  }

  const installed = getInstalledDependencies(dir);

  // Check production dependencies
  const missingProd = componentDeps.prod.filter(dep => {
    const depName = dep.split('@')[0]; // Handle version specifiers
    return !installed.prod[depName];
  });

  // Check development dependencies
  const missingDev = componentDeps.dev.filter(dep => {
    const depName = dep.split('@')[0]; // Handle version specifiers
    return !installed.dev[depName];
  });

  // Install missing dependencies
  installMissingDependencies(dir, missingProd, 'production');
  installMissingDependencies(dir, missingDev, 'development');
}

// Check and install dependencies for each component
checkAndInstallForComponent(rootDir, 'Root project', dependencies.root);
checkAndInstallForComponent(serverDir, 'Server', dependencies.server);
checkAndInstallForComponent(clientDir, 'Client', dependencies.client);

// Update package.json scripts to include this utility
const rootPackageJsonPath = path.join(rootDir, 'package.json');
try {
  const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));

  // Add the script if it doesn't exist
  if (!packageJson.scripts['install-missing']) {
    packageJson.scripts['install-missing'] = 'node scripts/install-missing-deps.js';

    // Write the updated package.json
    fs.writeFileSync(
      rootPackageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf8'
    );

    console.log(`\n${colors.green}Added "install-missing" script to package.json${colors.reset}`);
  }
} catch (error) {
  console.error(`\n${colors.red}Error updating package.json: ${error.message}${colors.reset}`);
}

console.log(`\n${colors.green}Dependency check and installation completed!${colors.reset}`);
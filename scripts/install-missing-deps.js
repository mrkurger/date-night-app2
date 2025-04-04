#!/usr/bin/env node

/**
 * Script to install missing dependencies for the Date Night App
 * This script checks for and installs commonly missing dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define the server directory
const serverDir = path.join(__dirname, '..', 'server');

// List of dependencies to check and install if missing
const dependencies = [
  'csrf-csrf',
  'winston',
  'winston-daily-rotate-file',
  'express-validator',
  'helmet',
  'compression',
  'mongoose',
  'socket.io',
  'jsonwebtoken',
  'bcrypt',
  'multer',
  'cors',
  'dotenv',
  'express-rate-limit',
  'express-mongo-sanitize',
  'xss-clean',
  'hpp',
  'cookie-parser',
  'uuid'
];

console.log('Checking for missing dependencies...');

// Function to check if a module is installed
function isModuleInstalled(moduleName) {
  try {
    require.resolve(moduleName, { paths: [serverDir] });
    return true;
  } catch (e) {
    return false;
  }
}

// Check and install missing dependencies
const missingDeps = dependencies.filter(dep => !isModuleInstalled(dep));

if (missingDeps.length === 0) {
  console.log('All dependencies are already installed!');
} else {
  console.log(`Installing missing dependencies: ${missingDeps.join(', ')}`);
  
  try {
    // Change to server directory
    process.chdir(serverDir);
    
    // Install missing dependencies
    execSync(`npm install ${missingDeps.join(' ')} --save`, { stdio: 'inherit' });
    
    console.log('Dependencies installed successfully!');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    process.exit(1);
  }
}

// Update package.json scripts to include this utility
const rootPackageJsonPath = path.join(__dirname, '..', 'package.json');
try {
  const packageJson = require(rootPackageJsonPath);
  
  // Add the script if it doesn't exist
  if (!packageJson.scripts['install-missing']) {
    packageJson.scripts['install-missing'] = 'node scripts/install-missing-deps.js';
    
    // Write the updated package.json
    fs.writeFileSync(
      rootPackageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf8'
    );
    
    console.log('Added "install-missing" script to package.json');
  }
} catch (error) {
  console.error('Error updating package.json:', error.message);
}

console.log('Done!');
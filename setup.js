#!/usr/bin/env node

/**
 * Setup script for DateNight.io application
 * This script will set up the entire application without relying on npm scripts
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

// Define directories
const rootDir = __dirname;
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client-angular');
const scriptsDir = path.join(rootDir, 'scripts');

console.log('Starting DateNight.io setup...');

// Make scripts executable
try {
  console.log('\n📋 Making scripts executable...');
  if (process.platform !== 'win32') {
    execSync(`chmod +x ${scriptsDir}/*.js`, { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Error making scripts executable:', error.message);
}

// Check Node.js version
try {
  console.log('\n📋 Checking Node.js version...');
  
  // Get current Node.js version
  const currentVersion = process.version;
  console.log(`Current Node.js version: ${currentVersion}`);
  
  // Check if it's an odd-numbered version
  const major = parseInt(currentVersion.slice(1).split('.')[0]);
  if (major % 2 !== 0) {
    console.warn('\x1b[33m%s\x1b[0m', `WARNING: You are using Node.js ${currentVersion}, which is an odd-numbered version.`);
    console.warn('\x1b[33m%s\x1b[0m', 'Odd-numbered versions are not LTS (Long Term Support) and are not recommended for production.');
    console.warn('\x1b[33m%s\x1b[0m', 'Consider switching to an even-numbered LTS version like 18.x, 20.x, or 22.x.');
  }
} catch (error) {
  console.error('Error checking Node.js version:', error.message);
}

// Install dependencies
try {
  console.log('\n📋 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: rootDir });
  
  console.log('\n📋 Installing server dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: serverDir });
  
  console.log('\n📋 Installing client dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: clientDir });
} catch (error) {
  console.error('Error installing dependencies:', error.message);
}

// Install missing dependencies
try {
  console.log('\n📋 Installing missing dependencies...');
  
  // Define the server directory
  const serverDir = path.join(__dirname, 'server');
  
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
    'argon2',
    'multer',
    'cors',
    'dotenv',
    'express-rate-limit',
    'express-mongo-sanitize',
    'xss-clean',
    'hpp',
    'cookie-parser',
    'uuid',
    'node-cache'
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
    }
  }
} catch (error) {
  console.error('Error installing missing dependencies:', error.message);
}

// Update Angular client package.json
try {
  console.log('\n📋 Updating Angular client package.json...');
  
  const clientPackageJsonPath = path.join(clientDir, 'package.json');
  const clientPackageJson = require(clientPackageJsonPath);
  
  // Update scripts to specify project name
  clientPackageJson.scripts.start = 'ng serve client-angular';
  clientPackageJson.scripts.build = 'ng build client-angular';
  clientPackageJson.scripts.watch = 'ng build client-angular --watch --configuration development';
  clientPackageJson.scripts.test = 'ng test client-angular';
  
  // Write the updated package.json
  fs.writeFileSync(
    clientPackageJsonPath,
    JSON.stringify(clientPackageJson, null, 2),
    'utf8'
  );
  
  console.log('Angular client package.json updated successfully!');
} catch (error) {
  console.error('Error updating Angular client package.json:', error.message);
}

console.log('\n✅ Setup completed successfully!');
console.log('\nTo start the application, run:');
console.log('  npm run dev');
console.log('\nOr start the server and client separately:');
console.log('  npm run start:server');
console.log('  npm run start:client');
#!/usr/bin/env node

/**
 * Setup script for DateNight.io application
 * This script will set up the entire application without relying on npm scripts
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Define __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories
const rootDir = __dirname;
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client-angular');
const scriptsDir = path.join(rootDir, 'scripts');

console.log('Starting DateNight.io setup...');

async function mainSetup() {
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
      console.warn(
        '\x1b[33m%s\x1b[0m',
        `WARNING: You are using Node.js ${currentVersion}, which is an odd-numbered version.`,
      );
      console.warn(
        '\x1b[33m%s\x1b[0m',
        'Odd-numbered versions are not LTS (Long Term Support) and are not recommended for production.',
      );
      console.warn(
        '\x1b[33m%s\x1b[0m',
        'Consider switching to an even-numbered LTS version like 18.x, 20.x, or 22.x.',
      );
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
      'node-cache',
    ];

    console.log('Checking for missing dependencies...');

    // Function to check if a module is installed by checking its directory
    async function isModuleInstalled(moduleName, checkDir) {
      try {
        await fs.access(path.join(checkDir, 'node_modules', moduleName));
        return true;
      } catch (e) {
        return false;
      }
    }

    // Check and install missing dependencies
    const missingDeps = [];
    for (const dep of dependencies) {
      if (!(await isModuleInstalled(dep, serverDir))) {
        missingDeps.push(dep);
      }
    }

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
        // Change back to root directory if necessary, or ensure subsequent paths are absolute/relative to rootDir
        process.chdir(rootDir);
      } catch (error) {
        console.error('Error installing dependencies:', error.message);
        process.chdir(rootDir); // Ensure we are back in rootDir even if error occurs
      }
    }
  } catch (error) {
    console.error('Error installing missing dependencies:', error.message);
  }

  // Update Angular client package.json
  try {
    console.log('\n📋 Updating Angular client package.json...');

    const clientPackageJsonPath = path.join(clientDir, 'package.json');
    const clientPackageJsonContent = await fs.readFile(clientPackageJsonPath, 'utf8');
    const clientPackageJson = JSON.parse(clientPackageJsonContent);

    // Update scripts to specify project name
    clientPackageJson.scripts.start = 'ng serve client-angular';
    clientPackageJson.scripts.build = 'ng build client-angular';
    clientPackageJson.scripts.watch = 'ng build client-angular --watch --configuration development';
    clientPackageJson.scripts.test = 'ng test client-angular';

    // Write the updated package.json
    await fs.writeFile(clientPackageJsonPath, JSON.stringify(clientPackageJson, null, 2), 'utf8');

    console.log('Angular client package.json updated successfully!');
  } catch (error) {
    console.error('Error updating Angular client package.json:', error.message);
  }

  // Run code migration scripts (assumed to be idempotent)
  try {
    console.log('\n📋 Running code migration scripts...');

    console.log('  Applying standalone component fixes...');
    execSync(`node ${path.join(rootDir, 'fix-standalone-components.js')}`, {
      stdio: 'inherit',
      cwd: rootDir,
    });

    console.log('  Replacing Material with Nebular components...');
    execSync(`node ${path.join(rootDir, 'replace-material-with-nebular.js')}`, {
      stdio: 'inherit',
      cwd: rootDir,
    });

    console.log('Code migration scripts completed successfully.');
  } catch (error) {
    console.error('Error running code migration scripts:', error.message);
    // Depending on the importance, you might want to make the setup fail here
    // For now, it will log the error and continue.
  }

  console.log('\n✅ Setup completed successfully!');
  console.log('\nTo start the application, run:');
  console.log('  npm run dev');
  console.log('\nOr start the server and client separately:');
  console.log('  npm run start:server');
  console.log('  npm run start:client');
}

mainSetup().catch(err => {
  console.error('Setup script failed:', err);
  process.exit(1);
});

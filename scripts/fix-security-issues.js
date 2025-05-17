#!/usr/bin/env node

/**
 * This script fixes security issues by:
 * 1. Adding @babel/runtime override to the root package.json
 * 2. Generating a package-lock.json file in the client-angular directory
 * 3. Running npm audit fix
 */

import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientAngularDir = path.join(rootDir, 'client-angular');
const serverDir = path.join(rootDir, 'server');

console.log('Starting security issues fix...');

// Step 1: Update the root package.json to add an override for @babel/runtime
try {
  console.log('\nUpdating root package.json overrides...');

  const rootPackageJsonPath = path.join(rootDir, 'package.json');
  const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));

  if (!rootPackageJson.overrides) {
    rootPackageJson.overrides = {};
  }

  rootPackageJson.overrides['@babel/runtime'] = '7.27.1';

  fs.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));
  console.log('Successfully updated root package.json with @babel/runtime override');
} catch (error) {
  console.error(`Error updating root package.json: ${error.message}`);
}

// Step 2: Update client-angular package.json
try {
  console.log('\nUpdating client-angular package.json...');

  const clientPackageJsonPath = path.join(clientAngularDir, 'package.json');
  const clientPackageJson = JSON.parse(fs.readFileSync(clientPackageJsonPath, 'utf8'));

  if (!clientPackageJson.overrides) {
    clientPackageJson.overrides = {};
  }

  clientPackageJson.overrides['@babel/runtime'] = '7.27.1';

  fs.writeFileSync(clientPackageJsonPath, JSON.stringify(clientPackageJson, null, 2));
  console.log('Successfully updated client-angular package.json with @babel/runtime override');
} catch (error) {
  console.error(`Error updating client-angular package.json: ${error.message}`);
}

// Step 3: Generate package-lock.json files
try {
  console.log('\nGenerating package-lock.json files...');

  // Root directory
  console.log('Generating package-lock.json in root directory...');
  execSync('npm install --package-lock-only', {
    cwd: rootDir,
    stdio: 'inherit',
  });

  // Client-angular directory
  console.log('\nGenerating package-lock.json in client-angular directory...');
  execSync('npm install --package-lock-only', {
    cwd: clientAngularDir,
    stdio: 'inherit',
  });

  // Server directory
  console.log('\nGenerating package-lock.json in server directory...');
  execSync('npm install --package-lock-only', {
    cwd: serverDir,
    stdio: 'inherit',
  });

  console.log('\nSuccessfully generated package-lock.json files');
} catch (error) {
  console.error(`Error generating package-lock.json files: ${error.message}`);
}

// Step 4: Run npm audit fix
try {
  console.log('\nRunning npm audit fix...');

  // Root directory
  console.log('Running npm audit fix in root directory...');
  execSync('npm audit fix', {
    cwd: rootDir,
    stdio: 'inherit',
  });

  // Client-angular directory
  console.log('\nRunning npm audit fix in client-angular directory...');
  execSync('npm audit fix', {
    cwd: clientAngularDir,
    stdio: 'inherit',
  });

  // Server directory
  console.log('\nRunning npm audit fix in server directory...');
  execSync('npm audit fix', {
    cwd: serverDir,
    stdio: 'inherit',
  });

  console.log('\nSuccessfully ran npm audit fix');
} catch (error) {
  console.error(`Error running npm audit fix: ${error.message}`);
}

console.log('\nSecurity issues fix completed');
console.log('Run "npm run analyze:security" to verify the fixes');

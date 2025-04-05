#!/usr/bin/env node

/**
 * Script to check Node.js version and provide guidance
 */

const semver = require('semver');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get current Node.js version
const currentVersion = process.version;
console.log(`Current Node.js version: ${currentVersion}`);

// Check if it's an odd-numbered version
const major = semver.major(currentVersion);
if (major % 2 !== 0) {
  console.warn('\x1b[33m%s\x1b[0m', `WARNING: You are using Node.js ${currentVersion}, which is an odd-numbered version.`);
  console.warn('\x1b[33m%s\x1b[0m', 'Odd-numbered versions are not LTS (Long Term Support) and are not recommended for production.');
  console.warn('\x1b[33m%s\x1b[0m', 'Consider switching to an even-numbered LTS version like 18.x, 20.x, or 22.x.');
  
  // Check if nvm is installed
  try {
    execSync('command -v nvm', { stdio: 'ignore' });
    console.log('\x1b[32m%s\x1b[0m', '\nYou can use nvm to install and switch to an LTS version:');
    console.log('  nvm install --lts');
    console.log('  nvm use --lts');
  } catch (error) {
    console.log('\x1b[32m%s\x1b[0m', '\nTo install an LTS version, visit: https://nodejs.org/en/download/');
  }
}

// Check if the required dependencies for the version check are installed
const rootPackageJsonPath = path.join(__dirname, '..', 'package.json');
try {
  const packageJson = require(rootPackageJsonPath);
  
  // Add semver as a dependency if it doesn't exist
  if (!packageJson.dependencies.semver && !packageJson.devDependencies.semver) {
    console.log('Adding semver to package.json dependencies...');
    
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    packageJson.dependencies.semver = '^7.5.4';
    
    // Write the updated package.json
    fs.writeFileSync(
      rootPackageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf8'
    );
    
    console.log('Added semver to package.json. Run "npm install" to install it.');
  }
  
  // Add the script if it doesn't exist
  if (!packageJson.scripts['check-node']) {
    console.log('Adding check-node script to package.json...');
    
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    packageJson.scripts['check-node'] = 'node scripts/check-node-version.js';
    
    // Write the updated package.json
    fs.writeFileSync(
      rootPackageJsonPath,
      JSON.stringify(packageJson, null, 2),
      'utf8'
    );
    
    console.log('Added "check-node" script to package.json');
  }
} catch (error) {
  console.error('Error updating package.json:', error.message);
}
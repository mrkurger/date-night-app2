#!/usr/bin/env node

/**
 * Script to update package.json with missing dependencies
 */

import fs from 'fs/promises';
import path from 'path';

// Define the server directory and package.json path
const serverDir = path.join(__dirname, '..', 'server');
const packageJsonPath = path.join(serverDir, 'package.json');

// Read the current package.json
const packageJson = require(packageJsonPath);

// Define the dependencies to add
const dependenciesToAdd = {
  'csrf-csrf': '^4.0.1',
  'winston': '^3.11.0',
  'winston-daily-rotate-file': '^4.7.1',
  'express-validator': '^7.0.1',
  'node-cache': '^5.1.2'
};

// Add the dependencies if they don't exist
let dependenciesAdded = false;
for (const [dep, version] of Object.entries(dependenciesToAdd)) {
  if (!packageJson.dependencies[dep]) {
    packageJson.dependencies[dep] = version;
    console.log(`Added ${dep}@${version} to dependencies`);
    dependenciesAdded = true;
  }
}

if (!dependenciesAdded) {
  console.log('All dependencies already exist in package.json');
  process.exit(0);
}

// Write the updated package.json
fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJson, null, 2),
  'utf8'
);

console.log('Updated package.json successfully');
console.log('Run "npm install" in the server directory to install the new dependencies');
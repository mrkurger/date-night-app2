#!/usr/bin/env node

/**
 * This script disables husky in CI environments by creating a .huskyrc file
 * that exits early when CI environment variable is set.
 */

const fs = require('fs');
const path = require('path');

const huskyrcPath = path.join(__dirname, '..', '.huskyrc');
const huskyrcContent = `#!/bin/sh
# Skip husky hooks in CI environments
if [ -n "$CI" ]; then
  exit 0
fi
`;

// Create .huskyrc file
fs.writeFileSync(huskyrcPath, huskyrcContent, 'utf8');
console.log('.huskyrc file created to disable husky in CI environments');

// Make it executable
try {
  fs.chmodSync(huskyrcPath, '755');
  console.log('.huskyrc file made executable');
} catch (error) {
  console.warn('Could not make .huskyrc executable:', error.message);
}

// Update package.json to run this script before install
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = require(packageJsonPath);

if (!packageJson.scripts.preinstall) {
  packageJson.scripts.preinstall = 'node scripts/disable-husky-in-ci.js';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('Added preinstall script to package.json');
}

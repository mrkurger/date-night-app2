#!/usr/bin/env node

/**
 * This script disables husky in CI environments by creating a .huskyrc file
 * that sets the HUSKY environment variable to 0.
 *
 * It's used in the preinstall script in package.json to ensure Husky doesn't
 * run in CI environments, which can cause issues with Git hooks.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const huskyrcPath = path.join(__dirname, '..', '.huskyrc');
const huskyrcContent = `#!/bin/sh
# Skip husky hooks in CI environments
export HUSKY=0
`;

// Create .huskyrc file
await fs.writeFile(huskyrcPath, huskyrcContent, 'utf8');
console.log('.huskyrc file created to disable husky in CI environments');

// Make it executable
try {
  await fs.chmod(huskyrcPath, '755');
  console.log('.huskyrc file made executable');
} catch (error) {
  console.warn('Could not make .huskyrc executable:', error.message);
}

// Update package.json to run this script before install
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

if (!packageJson.scripts.preinstall) {
  packageJson.scripts.preinstall = 'node scripts/disable-husky-in-ci.js';
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('Added preinstall script to package.json');
}

// Update prepare script to skip husky in CI environments
if (!packageJson.scripts.prepare || !packageJson.scripts.prepare.includes('[ -n "$CI" ]')) {
  packageJson.scripts.prepare = '[ -n "$CI" ] || husky';
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('Updated prepare script to skip husky in CI environments');
}

#!/usr/bin/env node

/**
 * This script fixes the compatibility issue between Karma 6.4.x and rimraf 5.x
 * Karma expects rimraf to be a function, but in rimraf 5.x it's an object with methods
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Path to the Karma temp_dir.js file
const tempDirPath = path.join(
  rootDir,
  'client-angular',
  'node_modules',
  'karma',
  'lib',
  'temp_dir.js',
);

// Check if the file exists
if (!fs.existsSync(tempDirPath)) {
  console.error(`Error: Could not find ${tempDirPath}`);
  process.exit(1);
}

// Read the current content
const content = fs.readFileSync(tempDirPath, 'utf8');

// Replace the rimraf call with the new API
const updatedContent = content.replace(
  'rimraf(path, done)',
  'typeof rimraf === "function" ? rimraf(path, done) : rimraf.rimraf(path, done)',
);

// Write the updated content back
fs.writeFileSync(tempDirPath, updatedContent);

console.log('Successfully patched Karma to work with rimraf 5.x');

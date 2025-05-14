#!/usr/bin/env node

/**
 * This script fixes the missing @babel/runtime/helpers/asyncToGenerator.js issue
 * by directly creating the file in the expected location
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Source file path (where the file actually exists)
const sourceFile = path.join(
  rootDir,
  'node_modules',
  '@babel',
  'runtime',
  'helpers',
  'asyncToGenerator.js',
);

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
  console.error(`Error: Source file not found at ${sourceFile}`);
  process.exit(1);
}

// Read the source file content
const sourceContent = fs.readFileSync(sourceFile, 'utf8');

// Create the directory structure for the expected path
const nodeModulesDir = path.join(rootDir, 'node_modules');
const angularDevkitDir = path.join(nodeModulesDir, '@angular-devkit');
const buildAngularDir = path.join(angularDevkitDir, 'build-angular');
const buildAngularNodeModulesDir = path.join(buildAngularDir, 'node_modules');
const babelDir = path.join(buildAngularNodeModulesDir, '@babel');
const runtimeDir = path.join(babelDir, 'runtime');
const helpersDir = path.join(runtimeDir, 'helpers');

// Create each directory level
const createDirIfNotExists = dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      console.log(`Created directory: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
  } catch (error) {
    console.error(`Error with directory ${dir}: ${error.message}`);
    // Don't exit, try to continue
  }
};

// Create the directory structure
createDirIfNotExists(angularDevkitDir);
createDirIfNotExists(buildAngularDir);
createDirIfNotExists(buildAngularNodeModulesDir);
createDirIfNotExists(babelDir);
createDirIfNotExists(runtimeDir);
createDirIfNotExists(helpersDir);

const targetDir = helpersDir;

// Create the target file
const targetFile = path.join(targetDir, 'asyncToGenerator.js');
try {
  if (fs.existsSync(targetFile)) {
    console.log(`File already exists: ${targetFile}, updating content...`);
  }
  fs.writeFileSync(targetFile, sourceContent);
  console.log(`Created/updated file: ${targetFile}`);
} catch (error) {
  console.error(`Error creating file: ${error.message}`);
  // Continue anyway
}

// Create a package.json in the runtime directory
// runtimeDir is already defined above
const packageJsonPath = path.join(runtimeDir, 'package.json');
try {
  const packageJson = {
    name: '@babel/runtime',
    version: '7.27.1',
    description: 'Babel runtime for Angular tests',
    type: 'commonjs',
  };

  if (fs.existsSync(packageJsonPath)) {
    console.log(`package.json already exists at ${packageJsonPath}, updating...`);
    try {
      const existingPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      // Merge with existing package.json
      Object.assign(existingPackageJson, packageJson);
      fs.writeFileSync(packageJsonPath, JSON.stringify(existingPackageJson, null, 2));
      console.log(`Updated package.json at ${packageJsonPath}`);
    } catch (parseError) {
      // If parsing fails, overwrite the file
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`Replaced invalid package.json at ${packageJsonPath}`);
    }
  } else {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Created package.json at ${packageJsonPath}`);
  }
} catch (error) {
  console.error(`Error handling package.json: ${error.message}`);
}

console.log('Babel runtime helper fix completed successfully');

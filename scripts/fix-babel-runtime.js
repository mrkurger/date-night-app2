#!/usr/bin/env node

/**
 * This script fixes the missing @babel/runtime/helpers/asyncToGenerator.js issue
 * by creating a symbolic link or copying the file from the root node_modules to the expected location
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

// Target directory path (where Angular is looking for it)
const targetDir = path.join(
  rootDir,
  'node_modules',
  '@angular-devkit',
  'build-angular',
  'node_modules',
  '@babel',
  'runtime',
  'helpers',
);

// Target file path
const targetFile = path.join(targetDir, 'asyncToGenerator.js');

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
  console.error(`Error: Source file not found at ${sourceFile}`);
  process.exit(1);
}

// Check if @angular-devkit directory exists
const angularDevkitDir = path.join(rootDir, 'node_modules', '@angular-devkit');
if (!fs.existsSync(angularDevkitDir)) {
  console.log(`Creating directory: ${angularDevkitDir}`);
  fs.mkdirSync(angularDevkitDir, { recursive: true });
}

// Check if @angular-devkit/build-angular exists
const buildAngularDir = path.join(angularDevkitDir, 'build-angular');
if (!fs.existsSync(buildAngularDir)) {
  console.log(`Creating directory: ${buildAngularDir}`);
  fs.mkdirSync(buildAngularDir, { recursive: true });

  // Create a minimal package.json for build-angular
  const buildAngularPackageJson = {
    name: '@angular-devkit/build-angular',
    version: '19.2.10',
    description: 'Angular Devkit Build Angular package for tests',
  };

  fs.writeFileSync(
    path.join(buildAngularDir, 'package.json'),
    JSON.stringify(buildAngularPackageJson, null, 2),
  );
}

// Create node_modules directory in build-angular
const buildAngularNodeModules = path.join(buildAngularDir, 'node_modules');
if (!fs.existsSync(buildAngularNodeModules)) {
  console.log(`Creating directory: ${buildAngularNodeModules}`);
  fs.mkdirSync(buildAngularNodeModules, { recursive: true });
}

// Create @babel directory
const babelDir = path.join(buildAngularNodeModules, '@babel');
if (!fs.existsSync(babelDir)) {
  console.log(`Creating directory: ${babelDir}`);
  fs.mkdirSync(babelDir, { recursive: true });
}

// Create runtime directory
const runtimeDir = path.join(babelDir, 'runtime');
if (!fs.existsSync(runtimeDir)) {
  console.log(`Creating directory: ${runtimeDir}`);
  fs.mkdirSync(runtimeDir, { recursive: true });

  // Create a package.json for runtime
  const runtimePackageJson = {
    name: '@babel/runtime',
    version: '7.27.1',
    description: 'Babel runtime for Angular tests',
  };

  fs.writeFileSync(
    path.join(runtimeDir, 'package.json'),
    JSON.stringify(runtimePackageJson, null, 2),
  );
}

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  console.log(`Creating directory: ${targetDir}`);
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy the file to the target location
try {
  const content = fs.readFileSync(sourceFile, 'utf8');
  fs.writeFileSync(targetFile, content);
  console.log(`Successfully copied Babel runtime helper to ${targetFile}`);
} catch (error) {
  console.error(`Error copying file: ${error.message}`);
  process.exit(1);
}

// Check if we need to update the package.json to include type: 'commonjs'
const packageJsonPath = path.join(runtimeDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.type) {
      packageJson.type = 'commonjs';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`Updated package.json at ${packageJsonPath} to include type: commonjs`);
    }
  } catch (error) {
    console.error(`Error updating package.json: ${error.message}`);
  }
}

console.log('Babel runtime helper fix completed successfully');

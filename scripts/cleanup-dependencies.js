#!/usr/bin/env node

/**
 * This script removes unused dependencies based on depcheck analysis
 * while being cautious about build/test tools that might be used indirectly.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Paths to package.json files
const rootPackageJsonPath = path.join(__dirname, '..', 'package.json');
const clientPackageJsonPath = path.join(__dirname, '..', 'client-angular', 'package.json');
const serverPackageJsonPath = path.join(__dirname, '..', 'server', 'package.json');

// Dependencies to keep even if they appear unused (they might be used indirectly)
const keepDependencies = [
  // Root project
  'helmet', // Security package, might be used in server setup
  'path', // Node.js built-in, might be used in scripts
  'child_process', // Node.js built-in, might be used in scripts
  '@testing-library/jest-dom', // Testing library, might be used in test setup
  'lint-staged', // Used with husky for pre-commit hooks

  // Client project
  '@angular/compiler', // Required for Angular AOT compilation
  'bootstrap', // CSS framework, might be used in styles
  'tslib', // Required for TypeScript helpers
  '@angular-eslint/template-parser', // Used for linting Angular templates

  // Server project
  'express-session', // Might be used for session management
  'jest-extended', // Might be used in test setup
  'jest-junit', // Might be used for CI integration
];

/**
 * Remove unused dependencies from package.json
 * @param {string} packageJsonPath - Path to package.json
 * @param {Array<string>} unusedDeps - List of unused dependencies
 * @param {Array<string>} unusedDevDeps - List of unused dev dependencies
 */
function removeUnusedDependencies(packageJsonPath, unusedDeps, unusedDevDeps) {
  try {
    console.log(`${colors.blue}Processing ${packageJsonPath}...${colors.reset}`);

    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Filter out dependencies to keep
    const depsToRemove = unusedDeps.filter(dep => !keepDependencies.includes(dep));
    const devDepsToRemove = unusedDevDeps.filter(dep => !keepDependencies.includes(dep));

    // Remove unused dependencies
    let depsRemoved = 0;
    if (packageJson.dependencies) {
      depsToRemove.forEach(dep => {
        if (packageJson.dependencies[dep]) {
          console.log(`${colors.yellow}Removing dependency: ${dep}${colors.reset}`);
          delete packageJson.dependencies[dep];
          depsRemoved++;
        }
      });
    }

    // Remove unused devDependencies
    let devDepsRemoved = 0;
    if (packageJson.devDependencies) {
      devDepsToRemove.forEach(dep => {
        if (packageJson.devDependencies[dep]) {
          console.log(`${colors.yellow}Removing devDependency: ${dep}${colors.reset}`);
          delete packageJson.devDependencies[dep];
          devDepsRemoved++;
        }
      });
    }

    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(`${colors.green}Successfully updated ${packageJsonPath}${colors.reset}`);
    console.log(
      `${colors.green}Removed ${depsRemoved} dependencies and ${devDepsRemoved} devDependencies${colors.reset}`
    );

    return true;
  } catch (error) {
    console.error(
      `${colors.red}Error updating ${packageJsonPath}: ${error.message}${colors.reset}`
    );
    return false;
  }
}

/**
 * Run npm install to update node_modules
 * @param {string} directory - Directory to run npm install in
 */
function runNpmInstall(directory) {
  try {
    console.log(`${colors.blue}Running npm install in ${directory}...${colors.reset}`);
    execSync('npm install --legacy-peer-deps', {
      cwd: directory,
      stdio: 'inherit',
    });
    console.log(`${colors.green}Successfully ran npm install in ${directory}${colors.reset}`);
    return true;
  } catch (error) {
    console.error(
      `${colors.red}Error running npm install in ${directory}: ${error.message}${colors.reset}`
    );
    return false;
  }
}

// Main function
function main() {
  console.log(`${colors.cyan}===== Dependency Cleanup Tool =====${colors.reset}`);

  // Root project
  console.log(`${colors.magenta}Cleaning up root project dependencies...${colors.reset}`);
  removeUnusedDependencies(rootPackageJsonPath, ['@popperjs/core'], ['npm-check', 'xml2js']);

  // Client project
  console.log(`${colors.magenta}Cleaning up client project dependencies...${colors.reset}`);
  removeUnusedDependencies(
    clientPackageJsonPath,
    ['@fortawesome/fontawesome-free'],
    ['eslint-plugin-import', 'typescript-eslint']
  );

  // Server project
  console.log(`${colors.magenta}Cleaning up server project dependencies...${colors.reset}`);
  removeUnusedDependencies(serverPackageJsonPath, [], ['@eslint/js']);

  // Run npm install to update node_modules
  runNpmInstall(path.join(__dirname, '..'));

  console.log(`${colors.cyan}===== Dependency Cleanup Complete =====${colors.reset}`);
  console.log(
    `${colors.yellow}Note: Some dependencies were kept even though they appeared unused because they might be used indirectly.${colors.reset}`
  );
  console.log(
    `${colors.yellow}The following dependencies were kept: ${keepDependencies.join(', ')}${colors.reset}`
  );
}

// Run the main function
main();

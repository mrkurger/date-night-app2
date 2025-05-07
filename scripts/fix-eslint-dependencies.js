#!/usr/bin/env node

/**
 * This script fixes ESLint dependency conflicts by adding appropriate overrides
 * to package.json files.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

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

// Define paths using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to package.json files
const rootPackageJsonPath = path.join(__dirname, '..', 'package.json');
const clientPackageJsonPath = path.join(__dirname, '..', 'client-angular', 'package.json');
const serverPackageJsonPath = path.join(__dirname, '..', 'server', 'package.json');

/**
 * Add overrides to package.json
 * @param {string} packageJsonPath - Path to package.json
 */
function addOverrides(packageJsonPath) {
  try {
    console.log(`${colors.blue}Processing ${packageJsonPath}...${colors.reset}`);

    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Initialize overrides if it doesn't exist
    if (!packageJson.overrides) {
      packageJson.overrides = {};
    }

    // Update ESLint version in dependencies and devDependencies
    if (packageJson.dependencies && packageJson.dependencies.eslint) {
      packageJson.dependencies.eslint = '^9.0.0';
      console.log(`${colors.green}Updated eslint in dependencies to ^9.0.0${colors.reset}`);
    }

    if (packageJson.devDependencies && packageJson.devDependencies.eslint) {
      packageJson.devDependencies.eslint = '^9.0.0';
      console.log(`${colors.green}Updated eslint in devDependencies to ^9.0.0${colors.reset}`);
    }

    // Update TypeScript ESLint packages in devDependencies
    if (packageJson.devDependencies) {
      if (packageJson.devDependencies['@typescript-eslint/parser']) {
        packageJson.devDependencies['@typescript-eslint/parser'] = '^8.0.0';
        console.log(
          `${colors.green}Updated @typescript-eslint/parser in devDependencies to ^8.0.0${colors.reset}`
        );
      }

      if (packageJson.devDependencies['@typescript-eslint/eslint-plugin']) {
        packageJson.devDependencies['@typescript-eslint/eslint-plugin'] = '^8.0.0';
        console.log(
          `${colors.green}Updated @typescript-eslint/eslint-plugin in devDependencies to ^8.0.0${colors.reset}`
        );
      }
    }

    // Add ESLint overrides for any remaining conflicts
    packageJson.overrides = {
      ...packageJson.overrides,
      eslint: '^9.0.0',
      '@typescript-eslint/parser': '^8.0.0',
      '@typescript-eslint/eslint-plugin': '^8.0.0',
    };

    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(`${colors.green}Successfully updated ${packageJsonPath}${colors.reset}`);

    return true;
  } catch (error) {
    console.error(
      `${colors.red}Error updating ${packageJsonPath}: ${error.message}${colors.reset}`
    );
    return false;
  }
}

/**
 * Run npm install to apply overrides
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
  console.log(`${colors.cyan}===== ESLint Dependency Conflict Fixer =====${colors.reset}`);

  // Add overrides to package.json files
  const rootSuccess = addOverrides(rootPackageJsonPath);
  const clientSuccess = addOverrides(clientPackageJsonPath);
  const serverSuccess = addOverrides(serverPackageJsonPath);

  // Run npm install to apply overrides
  if (rootSuccess) {
    runNpmInstall(path.join(__dirname, '..'));
  }

  console.log(`${colors.cyan}===== ESLint Dependency Conflict Fixer Complete =====${colors.reset}`);
}

// Run the main function
main();

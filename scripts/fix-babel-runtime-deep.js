#!/usr/bin/env node

/**
 * This script fixes the @babel/runtime vulnerability by:
 * 1. Finding all instances of @babel/runtime in node_modules
 * 2. Updating each package.json to version 7.27.1
 * 3. Updating the root package.json with an override
 */

import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('Starting deep fix for @babel/runtime vulnerability...');

// Function to find all @babel/runtime package.json files
function findBabelRuntimePackages() {
  try {
    console.log('Finding all instances of @babel/runtime in node_modules...');

    // Use find command to locate all @babel/runtime package.json files
    const findCommand = `find ${rootDir} -path "*/@babel/runtime/package.json" -type f`;
    console.log(`Running command: ${findCommand}`);

    const output = execSync(findCommand, { encoding: 'utf8' });
    const packageJsonPaths = output.trim().split('\n').filter(Boolean);

    console.log(`Found ${packageJsonPaths.length} instances of @babel/runtime package.json`);
    return packageJsonPaths;
  } catch (error) {
    console.error(`Error finding @babel/runtime instances: ${error.message}`);
    return [];
  }
}

// Function to update a package.json file
function updatePackageJson(packageJsonPath) {
  try {
    console.log(`\nUpdating ${packageJsonPath}`);

    // Read the current package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Get the current version
    const currentVersion = packageJson.version;
    console.log(`Current version: ${currentVersion}`);

    // Update to the required version (7.26.10 or higher)
    if (currentVersion < '7.26.10') {
      packageJson.version = '7.27.1';
      console.log(`Updating to version 7.27.1`);

      // Write the updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`Successfully updated package.json`);
      return true;
    } else {
      console.log(`Version ${currentVersion} is already >= 7.26.10, no update needed`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating ${packageJsonPath}: ${error.message}`);
    return false;
  }
}

// Function to update the root package.json with an override
function updateRootPackageJson() {
  try {
    console.log('\nUpdating root package.json with @babel/runtime override...');

    const rootPackageJsonPath = path.join(rootDir, 'package.json');
    const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));

    if (!rootPackageJson.overrides) {
      rootPackageJson.overrides = {};
    }

    rootPackageJson.overrides['@babel/runtime'] = '7.27.1';

    fs.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));
    console.log('Successfully updated root package.json with @babel/runtime override');
    return true;
  } catch (error) {
    console.error(`Error updating root package.json: ${error.message}`);
    return false;
  }
}

// Function to update client-angular package.json with an override
function updateClientPackageJson() {
  try {
    console.log('\nUpdating client-angular package.json with @babel/runtime override...');

    const clientPackageJsonPath = path.join(rootDir, 'client-angular', 'package.json');
    const clientPackageJson = JSON.parse(fs.readFileSync(clientPackageJsonPath, 'utf8'));

    if (!clientPackageJson.overrides) {
      clientPackageJson.overrides = {};
    }

    clientPackageJson.overrides['@babel/runtime'] = '7.27.1';

    // Also update the direct dependency if it exists
    if (clientPackageJson.dependencies && clientPackageJson.dependencies['@babel/runtime']) {
      clientPackageJson.dependencies['@babel/runtime'] = '7.27.1';
    }

    if (clientPackageJson.devDependencies && clientPackageJson.devDependencies['@babel/runtime']) {
      clientPackageJson.devDependencies['@babel/runtime'] = '7.27.1';
    }

    fs.writeFileSync(clientPackageJsonPath, JSON.stringify(clientPackageJson, null, 2));
    console.log('Successfully updated client-angular package.json with @babel/runtime override');
    return true;
  } catch (error) {
    console.error(`Error updating client-angular package.json: ${error.message}`);
    return false;
  }
}

// Function to run npm install to update dependencies
function runNpmInstall() {
  try {
    console.log('\nRunning npm install to update dependencies...');

    // Root directory
    console.log('Running npm install in root directory...');
    execSync('npm install', {
      cwd: rootDir,
      stdio: 'inherit',
    });

    // Client-angular directory
    console.log('\nRunning npm install in client-angular directory...');
    execSync('npm install', {
      cwd: path.join(rootDir, 'client-angular'),
      stdio: 'inherit',
    });

    console.log('\nSuccessfully ran npm install');
    return true;
  } catch (error) {
    console.error(`Error running npm install: ${error.message}`);
    return false;
  }
}

// Function to run npm dedupe to remove duplicate dependencies
function runNpmDedupe() {
  try {
    console.log('\nRunning npm dedupe to remove duplicate dependencies...');

    // Root directory
    console.log('Running npm dedupe in root directory...');
    execSync('npm dedupe', {
      cwd: rootDir,
      stdio: 'inherit',
    });

    // Client-angular directory
    console.log('\nRunning npm dedupe in client-angular directory...');
    execSync('npm dedupe', {
      cwd: path.join(rootDir, 'client-angular'),
      stdio: 'inherit',
    });

    console.log('\nSuccessfully ran npm dedupe');
    return true;
  } catch (error) {
    console.error(`Error running npm dedupe: ${error.message}`);
    return false;
  }
}

// Function to run npm audit fix
function runNpmAuditFix() {
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
      cwd: path.join(rootDir, 'client-angular'),
      stdio: 'inherit',
    });

    console.log('\nSuccessfully ran npm audit fix');
    return true;
  } catch (error) {
    console.error(`Error running npm audit fix: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  // Step 1: Find all @babel/runtime package.json files
  const packageJsonPaths = findBabelRuntimePackages();

  // Step 2: Update each package.json file
  let updatedCount = 0;
  for (const packageJsonPath of packageJsonPaths) {
    if (updatePackageJson(packageJsonPath)) {
      updatedCount++;
    }
  }

  console.log(
    `\nUpdated ${updatedCount} out of ${packageJsonPaths.length} @babel/runtime package.json files`,
  );

  // Step 3: Update the root package.json with an override
  updateRootPackageJson();

  // Step 4: Update the client-angular package.json with an override
  updateClientPackageJson();

  // Step 5: Run npm install to update dependencies
  runNpmInstall();

  // Step 6: Run npm dedupe to remove duplicate dependencies
  runNpmDedupe();

  // Step 7: Run npm audit fix
  runNpmAuditFix();

  console.log('\nDeep fix for @babel/runtime vulnerability completed');
  console.log('Run "npm run analyze:security" to verify the fixes');
}

// Run the main function
main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

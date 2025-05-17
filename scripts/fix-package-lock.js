#!/usr/bin/env node

/**
 * This script fixes the @babel/runtime vulnerability by updating the package-lock.json
 * to ensure all references to @babel/runtime are at version 7.27.1 or higher.
 */

import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientAngularDir = path.join(rootDir, 'client-angular');

// Path to the package-lock.json
const packageLockPath = path.join(clientAngularDir, 'package-lock.json');

console.log(`Checking for package-lock.json at ${packageLockPath}`);

// Check if the file exists
if (!fs.existsSync(packageLockPath)) {
  console.error(`Error: package-lock.json not found at ${packageLockPath}`);
  process.exit(1);
}

try {
  // Read the package-lock.json
  const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));

  console.log('Scanning package-lock.json for @babel/runtime references...');

  let updatedCount = 0;

  // Function to recursively update @babel/runtime versions
  function updateBabelRuntime(obj) {
    if (!obj || typeof obj !== 'object') return;

    // Check if this is a dependency object with a name property
    if (obj.name === '@babel/runtime' && obj.version && obj.version < '7.26.10') {
      console.log(`Found @babel/runtime with version ${obj.version}, updating to 7.27.1`);
      obj.version = '7.27.1';
      updatedCount++;
    }

    // Check dependencies object
    if (obj.dependencies) {
      if (
        obj.dependencies['@babel/runtime'] &&
        obj.dependencies['@babel/runtime'].version &&
        obj.dependencies['@babel/runtime'].version < '7.26.10'
      ) {
        console.log(
          `Found @babel/runtime in dependencies with version ${obj.dependencies['@babel/runtime'].version}, updating to 7.27.1`,
        );
        obj.dependencies['@babel/runtime'].version = '7.27.1';
        updatedCount++;
      }

      // Recursively check all dependencies
      for (const dep in obj.dependencies) {
        updateBabelRuntime(obj.dependencies[dep]);
      }
    }

    // Check packages object (for npm v7+ package-lock.json format)
    if (obj.packages) {
      for (const pkg in obj.packages) {
        if (
          pkg.includes('@babel/runtime') &&
          obj.packages[pkg].version &&
          obj.packages[pkg].version < '7.26.10'
        ) {
          console.log(`Found ${pkg} with version ${obj.packages[pkg].version}, updating to 7.27.1`);
          obj.packages[pkg].version = '7.27.1';
          updatedCount++;
        }

        // Also check dependencies within each package
        updateBabelRuntime(obj.packages[pkg]);
      }
    }
  }

  // Start the recursive update
  updateBabelRuntime(packageLock);

  console.log(`\nUpdated ${updatedCount} references to @babel/runtime in package-lock.json`);

  if (updatedCount > 0) {
    // Write the updated package-lock.json
    fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2));
    console.log('Successfully updated package-lock.json');
  } else {
    console.log('No updates needed in package-lock.json');
  }

  console.log('\nNow updating the root package.json overrides...');

  // Update the root package.json to add an override for @babel/runtime
  const rootPackageJsonPath = path.join(rootDir, 'package.json');
  const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));

  if (!rootPackageJson.overrides) {
    rootPackageJson.overrides = {};
  }

  rootPackageJson.overrides['@babel/runtime'] = '7.27.1';

  fs.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));
  console.log('Successfully updated root package.json with @babel/runtime override');

  console.log('\nVulnerability fix completed successfully');
} catch (error) {
  console.error(`Error updating package-lock.json: ${error.message}`);
  process.exit(1);
}

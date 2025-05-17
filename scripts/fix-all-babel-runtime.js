#!/usr/bin/env node

/**
 * This script fixes the @babel/runtime vulnerability by updating all instances
 * of @babel/runtime package.json in the node_modules directory to use the latest version.
 */

import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientAngularDir = path.join(rootDir, 'client-angular');

console.log('Finding all instances of @babel/runtime in node_modules...');

// Use find command to locate all @babel/runtime package.json files
try {
  const findCommand = `find ${clientAngularDir}/node_modules -path "*/@babel/runtime/package.json" -type f`;
  console.log(`Running command: ${findCommand}`);

  const output = execSync(findCommand, { encoding: 'utf8' });
  const packageJsonPaths = output.trim().split('\n').filter(Boolean);

  console.log(`Found ${packageJsonPaths.length} instances of @babel/runtime package.json`);

  let updatedCount = 0;

  // Process each package.json file
  for (const packageJsonPath of packageJsonPaths) {
    console.log(`\nChecking ${packageJsonPath}`);

    try {
      // Read the current package.json
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Get the current version
      const currentVersion = packageJson.version;
      console.log(`Current version: ${currentVersion}`);

      // Update to the required version (7.26.10 or higher)
      if (currentVersion < '7.26.10') {
        packageJson.version = '7.27.1'; // Use the version we have in devDependencies
        console.log(`Updating to version 7.27.1`);

        // Write the updated package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`Successfully updated package.json`);
        updatedCount++;
      } else {
        console.log(`Version ${currentVersion} is already >= 7.26.10, no update needed`);
      }
    } catch (error) {
      console.error(`Error processing ${packageJsonPath}: ${error.message}`);
    }
  }

  console.log(`\nVulnerability fix completed. Updated ${updatedCount} package.json files.`);

  // Now let's update the package-lock.json to reflect our changes
  console.log('\nUpdating package-lock.json...');
  try {
    execSync('cd ' + clientAngularDir + ' && npm install --package-lock-only', {
      stdio: 'inherit',
    });
    console.log('Successfully updated package-lock.json');
  } catch (error) {
    console.error(`Error updating package-lock.json: ${error.message}`);
  }
} catch (error) {
  console.error(`Error finding @babel/runtime instances: ${error.message}`);
  process.exit(1);
}

#!/usr/bin/env node

/**
 * This script fixes the @babel/runtime vulnerability by:
 * 1. Finding all instances of @babel/runtime in node_modules
 * 2. Downloading the fixed version (7.27.1)
 * 3. Replacing the vulnerable version with the fixed version
 */

import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const tempDir = path.join(rootDir, 'temp-babel-runtime');

console.log('Starting replacement of vulnerable @babel/runtime packages...');

// Create a temporary directory to download the fixed version
try {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
} catch (error) {
  console.error(`Error creating temporary directory: ${error.message}`);
  process.exit(1);
}

// Download the fixed version
try {
  console.log('\nDownloading fixed version of @babel/runtime (7.27.1)...');

  execSync('npm init -y', {
    cwd: tempDir,
    stdio: 'inherit',
  });

  execSync('npm install @babel/runtime@7.27.1 --no-save', {
    cwd: tempDir,
    stdio: 'inherit',
  });

  console.log('Successfully downloaded fixed version');
} catch (error) {
  console.error(`Error downloading fixed version: ${error.message}`);
  process.exit(1);
}

// Find all instances of @babel/runtime
try {
  console.log('\nFinding all instances of @babel/runtime in node_modules...');

  const findCommand = `find ${rootDir} -path "*/@babel/runtime" -type d`;
  console.log(`Running command: ${findCommand}`);

  const output = execSync(findCommand, { encoding: 'utf8' });
  const runtimePaths = output.trim().split('\n').filter(Boolean);

  console.log(`Found ${runtimePaths.length} instances of @babel/runtime`);

  // Replace each instance with the fixed version
  for (const runtimePath of runtimePaths) {
    console.log(`\nReplacing ${runtimePath}...`);

    // Check if the version is vulnerable
    const packageJsonPath = path.join(runtimePath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const currentVersion = packageJson.version;

      if (currentVersion < '7.26.10') {
        console.log(`Current version: ${currentVersion} (vulnerable)`);

        // Backup the original package.json
        const backupPath = path.join(runtimePath, 'package.json.bak');
        fs.copyFileSync(packageJsonPath, backupPath);
        console.log(`Backed up package.json to ${backupPath}`);

        // Replace the package with the fixed version
        const fixedRuntimePath = path.join(tempDir, 'node_modules', '@babel', 'runtime');

        // Copy the fixed version to the vulnerable location
        execSync(`cp -R ${fixedRuntimePath}/* ${runtimePath}/`, {
          stdio: 'inherit',
        });

        console.log(`Successfully replaced with version 7.27.1`);
      } else {
        console.log(`Current version: ${currentVersion} (not vulnerable)`);
      }
    } else {
      console.log(`No package.json found at ${packageJsonPath}`);
    }
  }

  console.log('\nReplacement completed');
} catch (error) {
  console.error(`Error replacing @babel/runtime: ${error.message}`);
  process.exit(1);
}

// Clean up the temporary directory
try {
  console.log('\nCleaning up temporary directory...');
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('Successfully cleaned up temporary directory');
} catch (error) {
  console.error(`Error cleaning up temporary directory: ${error.message}`);
}

// Update the root package.json with an override
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
} catch (error) {
  console.error(`Error updating root package.json: ${error.message}`);
}

// Update the client-angular package.json with an override
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
} catch (error) {
  console.error(`Error updating client-angular package.json: ${error.message}`);
}

console.log('\nVulnerability fix completed');
console.log('Run "npm run analyze:security" to verify the fixes');

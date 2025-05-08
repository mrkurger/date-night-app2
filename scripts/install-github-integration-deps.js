/**
 * Install GitHub Integration Dependencies
 *
 * This script installs the necessary dependencies for GitHub integration features:
 * - xml2js: For parsing XML test results
 * - npm-check: For generating dependency status reports
 * - eslint, @typescript-eslint/parser, @typescript-eslint/eslint-plugin: For linting TypeScript code
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Define dependencies to install
const dependencies = [
  'xml2js',
  'npm-check',
  'eslint@^9.0.0',
  '@typescript-eslint/parser@^8.0.0',
  '@typescript-eslint/eslint-plugin@^8.0.0',
];

const overrides = {
  eslint: '^9.0.0',
  '@typescript-eslint/parser': '^8.0.0',
  '@typescript-eslint/eslint-plugin': '^8.0.0',
};

function installDependencies() {
  console.log('Installing GitHub integration dependencies...');

  try {
    // Check if package.json exists in the root directory
    const rootPackageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(rootPackageJsonPath)) {
      console.error('Error: package.json not found in the root directory.');
      process.exit(1);
    }

    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));

    // Check if dependencies are already installed
    const devDependencies = packageJson.devDependencies || {};
    const missingDependencies = dependencies.filter(dep => {
      const [name, version] = dep.split('@');
      return !devDependencies[name] || !devDependencies[name].startsWith(version);
    });

    if (missingDependencies.length === 0) {
      console.log('All required dependencies are already installed.');
      return;
    }

    // Install missing dependencies
    console.log(`Installing missing dependencies: ${missingDependencies.join(', ')}`);
    execSync(`npm install --save-dev ${missingDependencies.join(' ')}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('Dependencies installed successfully.');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    process.exit(1);
  }
}

installDependencies();

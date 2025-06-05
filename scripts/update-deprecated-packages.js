/**
 * This script adds overrides for deprecated packages to the root package.json
 * to ensure that the project uses newer, non-deprecated versions.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define paths - ES module compatible way
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the root package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');

try {
  // Read the package.json file
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Define the deprecated packages to override
  const deprecatedPackages = {
    inflight: '^2.0.0', // Replace with newer version or alternative
    rimraf: '^5.0.5', // Update to v5+
    abab: '^2.0.6', // Latest version
    glob: '^10.3.10', // Update to v9+
    domexception: '^4.0.0', // Latest version
    '@humanwhocodes/config-array': '^0.11.14', // Will be replaced by @eslint/config-array
    '@humanwhocodes/object-schema': '^2.0.3', // Will be replaced by @eslint/object-schema
    '@eslint/config-array': '^0.1.2', // New replacement
    '@eslint/object-schema': '^0.1.1', // New replacement
  };

  // Add or update the overrides
  if (!packageJson.overrides) {
    packageJson.overrides = {};
  }

  // Add the deprecated packages to the overrides
  Object.entries(deprecatedPackages).forEach(([pkg, version]) => {
    packageJson.overrides[pkg] = version;
  });

  // Write the updated package.json back to the file
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log('✅ Successfully added overrides for deprecated packages');
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
}

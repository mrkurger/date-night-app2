#!/usr/bin/env node

/**
 * This script fixes the missing @babel/runtime/helpers/asyncToGenerator.js issue
 * by creating a symbolic link from the existing file to the location where tests are looking for it
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

// Create a patch file that will be loaded instead of the missing file
const patchFile = path.join(rootDir, 'client-angular', 'src', 'babel-runtime-patch.js');

// Create the patch file content
const patchContent = `
// This is a patch file to fix the missing @babel/runtime/helpers/asyncToGenerator.js issue
// It re-exports the actual implementation from the correct location

export { default } from '${sourceFile.replace(/\\/g, '\\\\')}';
export * from '${sourceFile.replace(/\\/g, '\\\\')}';
`;

// Write the patch file
try {
  fs.writeFileSync(patchFile, patchContent);
  console.log(`Created patch file at ${patchFile}`);
} catch (error) {
  console.error(`Error creating patch file: ${error.message}`);
  process.exit(1);
}

// Now create a webpack.config.js file in the client-angular directory to alias the imports
const webpackConfigPath = path.join(rootDir, 'client-angular', 'webpack.config.js');

const webpackConfigContent = `
module.exports = {
  resolve: {
    alias: {
      '/Users/oivindlund/date-night-app/node_modules/@angular-devkit/build-angular/node_modules/@babel/runtime/helpers/asyncToGenerator.js': '${patchFile.replace(/\\/g, '\\\\')}'
    }
  }
};
`;

try {
  fs.writeFileSync(webpackConfigPath, webpackConfigContent);
  console.log(`Created webpack.config.js at ${webpackConfigPath}`);
} catch (error) {
  console.error(`Error creating webpack config: ${error.message}`);
  process.exit(1);
}

console.log('Babel runtime helper fix completed successfully');

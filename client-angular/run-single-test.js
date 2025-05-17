/**
 * Script to run a single test file in isolation
 * This helps avoid compilation errors from other files
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory (ESM equivalent of __dirname)
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);

// Get the test file path from command line arguments
const testFilePath = process.argv[2];

if (!testFilePath) {
  console.error('Please provide a test file path');
  process.exit(1);
}

// Create a temporary tsconfig file for just this test
const tempTsConfigPath = path.join(currentDirPath, 'temp-tsconfig.json');
const originalTsConfigPath = path.join(currentDirPath, 'tsconfig.json');

// Read the original tsconfig
const originalTsConfig = JSON.parse(fs.readFileSync(originalTsConfigPath, 'utf8'));

// Create a modified tsconfig that only includes the test file and its dependencies
const tempTsConfig = {
  ...originalTsConfig,
  include: [
    testFilePath.replace(/\.spec\.ts$/, '.ts'), // The implementation file
    testFilePath, // The test file
    'src/test.ts', // Test setup
  ],
  exclude: [
    'node_modules',
    '**/*.spec.ts', // Exclude all other spec files
  ],
};

// Write the temporary tsconfig
fs.writeFileSync(tempTsConfigPath, JSON.stringify(tempTsConfig, null, 2));

try {
  // Run the test with the temporary tsconfig
  console.log(`Running test: ${testFilePath}`);
  execSync(`npx ng test --include=${testFilePath} --no-watch --no-progress`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      TS_NODE_PROJECT: tempTsConfigPath,
    },
  });
} catch (_) {
  console.error('Test execution failed');
} finally {
  // Clean up the temporary tsconfig
  fs.unlinkSync(tempTsConfigPath);
}

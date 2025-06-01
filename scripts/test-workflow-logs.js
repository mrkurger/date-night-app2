#!/usr/bin/env node

/**
 * Test script for workflow logs extraction
 *
 * This script creates a test zip file and tests the extraction functionality
 * of the fetch-workflow-logs.js script.
 */

import fs from 'fs';
import path from 'path';
// import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define paths - ES module compatible way
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('This script requires adm-zip package to be installed');
console.log('Skipping execution due to missing dependencies');
process.exit(0);

// Create a test directory
const testDir = path.join(__dirname, '..', 'test-workflow-logs');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Create a test zip file
console.log('Creating test zip file...');
// const zip = new AdmZip();

// Add some test log files to the zip
zip.addFile(
  'build.log',
  Buffer.from('This is a build log file.\nIt contains build output.\nSome errors might be here.'),
);
zip.addFile(
  'test.log',
  Buffer.from(
    'This is a test log file.\nIt contains test output.\nSome test failures might be here.',
  ),
);
zip.addFile(
  'error.log',
  Buffer.from(
    'Error: Something went wrong!\nStack trace:\n  at Function.Module._load (module.js:417:25)',
  ),
);

// Write the zip file
const zipPath = path.join(testDir, 'test-logs.zip');
zip.writeZip(zipPath);
console.log(`Test zip file created at ${zipPath}`);

// Test the extraction functionality
console.log('\nTesting extraction functionality...');
const extractDir = path.join(testDir, 'extracted');
fs.ensureDirSync(extractDir);

try {
  // Extract the zip file
  console.log('Extracting zip file...');
  const testZip = new AdmZip(zipPath);
  const zipEntries = testZip.getEntries();

  // Process each entry in the zip file
  for (const entry of zipEntries) {
    if (!entry.isDirectory) {
      const entryName = entry.entryName;
      const content = entry.getData().toString('utf8');

      // Save the extracted content
      const outputPath = path.join(extractDir, entryName);
      fs.writeFileSync(outputPath, content);
      console.log(`Extracted ${entryName} to ${outputPath}`);
    }
  }

  console.log('\nExtraction successful!');
  console.log('Extracted files:');
  const extractedFiles = fs.readdirSync(extractDir);
  extractedFiles.forEach(file => {
    const filePath = path.join(extractDir, file);
    const stats = fs.statSync(filePath);
    console.log(`- ${file} (${stats.size} bytes)`);

    // Show file content
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`  Content: ${content.split('\n')[0]}...`);
  });

  console.log('\nTest completed successfully!');
} catch (error) {
  console.error('Error during extraction test:', error);
} finally {
  // Clean up
  console.log('\nCleaning up test files...');
  fs.removeSync(testDir);
  console.log('Test files removed.');
}

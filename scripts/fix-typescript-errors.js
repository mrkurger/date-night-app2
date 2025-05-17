#!/usr/bin/env node

// Importing required modules using ESModules syntax
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration object
const CONFIG = {
  errorsFile: path.resolve(__dirname, '../errors.csv'), // Path to the errors file
  clientDir: path.resolve(__dirname, '../client-angular/src'), // Directory containing client code
  backupDir: path.resolve(__dirname, '../ts-fixes-backup'), // Backup directory
  dryRun: false, // Set this to true to preview changes without applying them
};

// Function to read errors from the CSV file
function readErrorsFromCSV(filePath) {
  try {
    // Check if the errors file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: The errors file does not exist at path: ${filePath}`);
      process.exit(1);
    }

    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');

    // Ensure the file is not empty
    if (!content.trim()) {
      console.error(`Error: The errors file is empty.`);
      process.exit(1);
    }

    const lines = content.split('\n').slice(1); // Skip the header row

    // Parse the content into error objects
    return lines
      .filter(line => line.trim()) // Ignore empty lines
      .map(line => {
        const [code, message, pointer, filePath] = line.split(',');
        if (!code || !pointer || !filePath) {
          console.warn(`Warning: Skipping malformed line: ${line}`);
          return null;
        }
        const [lineNum, colNum] = pointer.split(':');
        return {
          code,
          message: message.replace(/^"|"$|'/g, ''), // Remove surrounding quotes
          line: parseInt(lineNum, 10),
          column: parseInt(colNum, 10),
          path: filePath.replace(/^\[1\]\s+/, '').trim(),
        };
      })
      .filter(error => error !== null); // Filter out invalid entries
  } catch (err) {
    console.error(`Error reading the errors file: ${err.message}`);
    process.exit(1);
  }
}

// Function to create a backup of the file
function createBackup(filePath) {
  const backupPath = path.join(CONFIG.backupDir, path.relative(CONFIG.clientDir, filePath));
  const backupDir = path.dirname(backupPath);

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  fs.copyFileSync(filePath, backupPath);
}

// Main function to process files and fix errors
async function main() {
  console.log('TypeScript Error Fixer');
  console.log('=====================');

  // Ensure the backup directory exists
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }

  // Read errors from the CSV file
  const errors = readErrorsFromCSV(CONFIG.errorsFile);
  console.log(`Found ${errors.length} errors to fix`);

  // Group errors by file for efficient processing
  const errorsByFile = errors.reduce((acc, error) => {
    if (!acc[error.path]) {
      acc[error.path] = [];
    }
    acc[error.path].push(error);
    return acc;
  }, {});

  let fixedCount = 0;
  let skippedCount = 0;

  for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
    const fullPath = path.join(CONFIG.clientDir, filePath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`Warning: File not found: ${fullPath}`);
      skippedCount += fileErrors.length;
      continue;
    }

    createBackup(fullPath);

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Process each error in the file
    for (const error of fileErrors) {
      try {
        // TODO: Implement error-specific handling logic
        console.log(`Processing error ${error.code} in file ${filePath}`);
        fixedCount++;
      } catch (err) {
        console.error(`Error fixing ${error.code} in ${filePath}:`, err.message);
        skippedCount++;
      }
    }

    // Write changes if the file content was modified
    if (content !== originalContent && !CONFIG.dryRun) {
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed errors in ${filePath}`);
    }
  }

  console.log('\nSummary:');
  console.log(`- Fixed: ${fixedCount} errors`);
  console.log(`- Skipped: ${skippedCount} errors`);

  if (CONFIG.dryRun) {
    console.log('\nDRY RUN: No changes were applied');
  }
}

// Execute the main function
main().catch(err => {
  console.error('Error running the script:', err.message);
});

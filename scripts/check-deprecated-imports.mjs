#!/usr/bin/env node

/**
 * SCSS Deprecated Import Checker
 *
 * This script scans all SCSS files in the Angular client for deprecated @import statements
 * and reports them without making any changes.
 *
 * Usage:
 *   node scripts/check-deprecated-imports.mjs
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CLIENT_DIR = path.join(__dirname, '..', 'client-angular');
const SCSS_GLOB = 'src/**/*.scss';
const IMPORT_PATTERN = /@import\s+['"]([^'"]+)['"]\s*;/g;

// Statistics
let stats = {
  scanned: 0,
  withImports: 0,
  totalImports: 0,
};

/**
 * Find all SCSS files in the client directory
 * @returns {string[]} Array of file paths
 */
function findScssFiles() {
  try {
    const result = execSync(`find ${CLIENT_DIR}/${SCSS_GLOB} -type f`, { encoding: 'utf8' });
    return result.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding SCSS files:', error.message);
    return [];
  }
}

/**
 * Check for imports in a single file
 * @param {string} filePath Path to the SCSS file
 * @returns {object} Object with import information
 */
function checkImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    stats.scanned++;

    // Check if the file contains @import statements
    const imports = [];
    let match;

    // Reset the regex lastIndex
    IMPORT_PATTERN.lastIndex = 0;

    while ((match = IMPORT_PATTERN.exec(content)) !== null) {
      imports.push(match[1]);
    }

    if (imports.length > 0) {
      stats.withImports++;
      stats.totalImports += imports.length;

      return {
        path: filePath,
        imports: imports,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
function main() {
  console.log('SCSS Deprecated Import Checker');
  console.log('=============================');

  const files = findScssFiles();
  console.log(`Found ${files.length} SCSS files to scan\n`);

  const filesWithImports = [];

  files.forEach(file => {
    const result = checkImportsInFile(file);
    if (result) {
      filesWithImports.push(result);
    }
  });

  if (filesWithImports.length > 0) {
    console.log('Files with deprecated @import statements:');
    filesWithImports.forEach(file => {
      const relativePath = path.relative(CLIENT_DIR, file.path);
      console.log(`\n${relativePath}:`);
      file.imports.forEach(importPath => {
        console.log(`  @import '${importPath}';`);
      });
    });
  } else {
    console.log('No deprecated @import statements found!');
  }

  console.log('\nSummary:');
  console.log(`- Scanned: ${stats.scanned} files`);
  console.log(`- Files with @import: ${stats.withImports} files`);
  console.log(`- Total @import statements: ${stats.totalImports}`);
}

main();

#!/usr/bin/env node

/**
 * SCSS Import Fixer
 *
 * This script scans all SCSS files in the Angular client for incorrect import paths
 * and fixes them to use the correct design system import path.
 *
 * Usage:
 *   node scripts/fix-scss-imports.mjs
 *
 * Options:
 *   --dry-run  Only report issues without making changes
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
const OLD_IMPORT_PATTERN = /@use\s+['"]src\/app\/core\/design\/main['"]\s+as\s+(\w+);/g;
const NEW_IMPORT_PATH = 'src/styles/design-system';

// Command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

// Statistics
let stats = {
  scanned: 0,
  fixed: 0,
  errors: 0,
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
 * Fix imports in a single file
 * @param {string} filePath Path to the SCSS file
 * @returns {boolean} True if file was modified
 */
function fixImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    stats.scanned++;

    // Check if the file contains the old import pattern
    if (!OLD_IMPORT_PATTERN.test(content)) {
      return false;
    }

    // Reset the regex lastIndex
    OLD_IMPORT_PATTERN.lastIndex = 0;

    // Replace the old import with the new one
    const updatedContent = content.replace(OLD_IMPORT_PATTERN, (match, namespace) => {
      return `@use '${NEW_IMPORT_PATH}' as ${namespace};`;
    });

    if (content !== updatedContent) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    stats.errors++;
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('SCSS Import Fixer');
  console.log('================');

  if (DRY_RUN) {
    console.log('Running in dry-run mode (no changes will be made)\n');
  }

  const files = findScssFiles();
  console.log(`Found ${files.length} SCSS files to scan\n`);

  const fixedFiles = [];

  files.forEach(file => {
    const wasFixed = fixImportsInFile(file);
    if (wasFixed) {
      stats.fixed++;
      fixedFiles.push(file);
    }
  });

  console.log('\nSummary:');
  console.log(`- Scanned: ${stats.scanned} files`);
  console.log(`- Fixed: ${stats.fixed} files`);
  console.log(`- Errors: ${stats.errors}`);

  if (fixedFiles.length > 0) {
    console.log('\nFixed files:');
    fixedFiles.forEach(file => {
      console.log(`- ${path.relative(process.cwd(), file)}`);
    });
  }

  if (DRY_RUN && stats.fixed > 0) {
    console.log('\nRun without --dry-run to apply these changes');
  }
}

main();

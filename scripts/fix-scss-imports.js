#!/usr/bin/env node

/**
 * SCSS Import Fixer
 *
 * This script scans all SCSS files in the Angular client for incorrect import paths
 * and fixes them to use the correct design system import path.
 *
 * Usage:
 *   node scripts/fix-scss-imports.js
 *
 * Options:
 *   --dry-run  Only report issues without making changes
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CLIENT_DIR = path.join(__dirname, '..', 'client-angular');
const SCSS_GLOB = 'src/**/*.scss';
const OLD_IMPORT_PATTERN = /@use\s+['"]src\/app\/core\/design\/main['"]\s+as\s+(\w+);/g;
const NEW_IMPORT_PATH = 'src/styles/design-system';

// Pattern for absolute path imports
const ABSOLUTE_IMPORT_PATTERN = /@use\s+['"]src\/styles\/design-system\/index['"]\s+as\s+(\w+);/g;

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
 * Calculate relative path from file to target
 * @param {string} filePath Source file path
 * @param {string} targetPath Target path
 * @returns {string} Relative path with forward slashes
 */
function calculateRelativePath(filePath, targetPath) {
  const fileDir = path.dirname(filePath);
  const relativePath = path.relative(fileDir, path.join(CLIENT_DIR, targetPath));
  return relativePath.replace(/\\/g, '/'); // Ensure forward slashes for SCSS
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
    let wasModified = false;
    let updatedContent = content;

    // Check and fix old core/design/main imports
    if (OLD_IMPORT_PATTERN.test(content)) {
      // Reset the regex lastIndex
      OLD_IMPORT_PATTERN.lastIndex = 0;

      // Replace the old import with the new one
      updatedContent = updatedContent.replace(OLD_IMPORT_PATTERN, (match, namespace) => {
        return `@use '${NEW_IMPORT_PATH}' as ${namespace};`;
      });
      wasModified = true;
    }

    // Check and fix absolute path imports
    if (ABSOLUTE_IMPORT_PATTERN.test(updatedContent)) {
      // Reset the regex lastIndex
      ABSOLUTE_IMPORT_PATTERN.lastIndex = 0;

      // Calculate the relative path to the design system
      const designSystemPath = 'src/styles/design-system/index';
      const relativePath = calculateRelativePath(filePath, designSystemPath);

      // Replace the absolute import with a relative one
      updatedContent = updatedContent.replace(ABSOLUTE_IMPORT_PATTERN, (match, namespace) => {
        return `@use '${relativePath}' as ${namespace};`;
      });
      wasModified = true;
    }

    if (wasModified && content !== updatedContent) {
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

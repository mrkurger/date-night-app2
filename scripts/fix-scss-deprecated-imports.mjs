#!/usr/bin/env node

/**
 * SCSS Deprecated Import Fixer
 *
 * This script scans all SCSS files in the Angular client for deprecated @import statements
 * and converts them to modern @use statements.
 *
 * Usage:
 *   node scripts/fix-scss-deprecated-imports.mjs
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
const IMPORT_PATTERN = /@import\s+['"]([^'"]+)['"]\s*;/g;

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
 * Generate a namespace from a path
 * @param {string} importPath The import path
 * @returns {string} A suitable namespace
 */
function generateNamespace(importPath) {
  // Extract the last part of the path without extension
  const basename = path.basename(importPath, path.extname(importPath));

  // Handle special cases
  if (basename.includes('design-tokens')) return 'ds';
  if (basename.includes('variables')) return 'vars';
  if (basename.includes('mixins')) return 'mix';
  if (basename.includes('utilities')) return 'utils';
  if (basename.includes('components')) return 'components';
  if (basename.includes('animations')) return 'anim';

  // Default: use the basename as namespace
  return basename.replace(/[^a-zA-Z0-9]/g, '');
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

    // Check if the file contains @import statements
    if (!IMPORT_PATTERN.test(content)) {
      return false;
    }

    // Reset the regex lastIndex
    IMPORT_PATTERN.lastIndex = 0;

    // Track imports to avoid duplicates
    const imports = new Set();

    // Replace @import with @use
    let updatedContent = content.replace(IMPORT_PATTERN, (match, importPath) => {
      // Skip if already processed
      if (imports.has(importPath)) return '';
      imports.add(importPath);

      // Generate a namespace
      const namespace = generateNamespace(importPath);

      // Special case for design-tokens
      if (importPath.includes('design-tokens')) {
        return `@use 'src/styles/design-system' as ${namespace};`;
      }

      // Convert relative paths to absolute when possible
      let newPath = importPath;
      if (importPath.startsWith('../') || importPath.startsWith('./')) {
        // Try to convert to src-based path
        const absolutePath = path.resolve(path.dirname(filePath), importPath);
        const relativePath = path.relative(CLIENT_DIR, absolutePath);
        if (!relativePath.startsWith('..')) {
          newPath = 'src/' + relativePath;
        }
      }

      return `@use '${newPath}' as ${namespace};`;
    });

    // Add sass:color module if needed
    if (
      updatedContent.includes('darken(') ||
      updatedContent.includes('lighten(') ||
      updatedContent.includes('adjust-hue(')
    ) {
      if (!updatedContent.includes("@use 'sass:color'")) {
        updatedContent = "@use 'sass:color';\n" + updatedContent;
      }
    }

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
  console.log('SCSS Deprecated Import Fixer');
  console.log('===========================');

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

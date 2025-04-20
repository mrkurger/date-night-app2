#!/usr/bin/env node

/**
 * SCSS Import Path Checker
 *
 * This script scans all SCSS files in the Angular client for import paths
 * and reports any issues with the paths.
 *
 * Usage:
 *   node scripts/check-scss-imports.mjs
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
const USE_PATTERN = /@use\s+['"]([^'"]+)['"]\s+as\s+([^;]+);/g;
const FORWARD_PATTERN = /@forward\s+['"]([^'"]+)['"]\s*;/g;

// Statistics
let stats = {
  scanned: 0,
  withUseStatements: 0,
  withForwardStatements: 0,
  withIssues: 0,
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
 * Check if a file exists
 * @param {string} filePath Path to check
 * @returns {boolean} True if the file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Resolve an import path to an absolute path
 * @param {string} importPath The import path
 * @param {string} sourceFile The file containing the import
 * @returns {string} The resolved path
 */
function resolveImportPath(importPath, sourceFile) {
  // Handle absolute paths (starting with src/)
  if (importPath.startsWith('src/')) {
    return path.join(CLIENT_DIR, importPath);
  }

  // Handle relative paths
  const sourceDir = path.dirname(sourceFile);
  return path.resolve(sourceDir, importPath);
}

/**
 * Check imports in a single file
 * @param {string} filePath Path to the SCSS file
 * @returns {object} Object with import information
 */
function checkImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    stats.scanned++;

    const issues = [];
    const imports = [];
    let match;

    // Check @use statements
    USE_PATTERN.lastIndex = 0;
    while ((match = USE_PATTERN.exec(content)) !== null) {
      const importPath = match[1];
      const namespace = match[2].trim();

      imports.push({
        type: 'use',
        path: importPath,
        namespace: namespace,
      });

      // Check if the imported file exists
      const resolvedPath = resolveImportPath(importPath, filePath);
      if (!fileExists(resolvedPath) && !fileExists(resolvedPath + '.scss')) {
        issues.push({
          type: 'missing',
          statement: 'use',
          path: importPath,
          resolvedPath: resolvedPath,
        });
      }
    }

    // Check @forward statements
    FORWARD_PATTERN.lastIndex = 0;
    while ((match = FORWARD_PATTERN.exec(content)) !== null) {
      const importPath = match[1];

      imports.push({
        type: 'forward',
        path: importPath,
      });

      // Check if the imported file exists
      const resolvedPath = resolveImportPath(importPath, filePath);
      if (!fileExists(resolvedPath) && !fileExists(resolvedPath + '.scss')) {
        issues.push({
          type: 'missing',
          statement: 'forward',
          path: importPath,
          resolvedPath: resolvedPath,
        });
      }
    }

    if (imports.some(imp => imp.type === 'use')) {
      stats.withUseStatements++;
    }

    if (imports.some(imp => imp.type === 'forward')) {
      stats.withForwardStatements++;
    }

    if (issues.length > 0) {
      stats.withIssues++;
      return {
        path: filePath,
        imports: imports,
        issues: issues,
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
  console.log('SCSS Import Path Checker');
  console.log('=======================');

  const files = findScssFiles();
  console.log(`Found ${files.length} SCSS files to scan\n`);

  const filesWithIssues = [];

  files.forEach(file => {
    const result = checkImportsInFile(file);
    if (result) {
      filesWithIssues.push(result);
    }
  });

  if (filesWithIssues.length > 0) {
    console.log('Files with import issues:');
    filesWithIssues.forEach(file => {
      const relativePath = path.relative(CLIENT_DIR, file.path);
      console.log(`\n${relativePath}:`);
      file.issues.forEach(issue => {
        if (issue.type === 'missing') {
          console.log(`  ${issue.statement} '${issue.path}' - File not found`);
        }
      });
    });
  } else {
    console.log('No import issues found!');
  }

  console.log('\nSummary:');
  console.log(`- Scanned: ${stats.scanned} files`);
  console.log(`- Files with @use: ${stats.withUseStatements} files`);
  console.log(`- Files with @forward: ${stats.withForwardStatements} files`);
  console.log(`- Files with issues: ${stats.withIssues} files`);
}

main();

#!/usr/bin/env node

/**
 * Documentation Audit Script
 *
 * This script audits the existing documentation and maps it to code folders.
 * It creates a report of documentation files and their corresponding code folders.
 *
 * Usage:
 *   node audit_documentation.js [--output <output_file>]
 *
 * Example:
 *   node audit_documentation.js --output /docs/DOCUMENTATION_AUDIT.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
let outputFile = null;

// Check for output file
const outputIndex = args.indexOf('--output');
if (outputIndex !== -1 && args.length > outputIndex + 1) {
  outputFile = path.resolve(args[outputIndex + 1]);
}

// Configuration
const config = {
  // Root directory of the repository
  rootDir: path.resolve(__dirname, '..'),

  // Documentation directories
  docDirs: ['docs', 'server/docs', 'client-angular/src/app/docs'],

  // Code directories
  codeDirs: [
    // Angular features
    'client-angular/src/app/features',
    // Shared components
    'client-angular/src/app/shared/components',
    // Core services
    'client-angular/src/app/core/services',
    // Server modules
    'server/components',
    'server/controllers',
    'server/models',
    'server/services',
    'server/middleware',
    'server/routes',
  ],

  // Mapping of documentation files to code folders
  // This is a manual mapping for files that can't be automatically mapped
  manualMapping: {
    'docs/AILESSONS.MD': 'global',
    'docs/CHANGELOG.MD': 'global',
    'docs/ARCHITECTURE.MD': 'global',
    'docs/SETUP.MD': 'global',
    'docs/TESTING_GUIDE.MD': 'global',
    'docs/SECURITY_BEST_PRACTICES.MD': 'global',
    'docs/COMPONENT_LIBRARY.MD': 'client-angular/src/app/shared/components',
    'docs/EMERALD_COMPONENTS.MD': 'client-angular/src/app/shared/emerald',
    'docs/USER_PREFERENCES.MD': 'client-angular/src/app/core/services',
    'docs/THEME_TOGGLE_IMPLEMENTATION.MD': 'client-angular/src/app/shared/components/theme-toggle',
    'docs/ERRORHANDLINGTELEMETRY.MD': 'client-angular/src/app/core/error-handling',
    'server/docs/api.md': 'server',
    'server/docs/travel-module.md': 'server/components/travel',
  },
};

/**
 * Scans a directory recursively for documentation files
 * @param {string} dir - The directory to scan
 * @returns {string[]} - Array of file paths
 */
function scanDocumentation(dir) {
  let results = [];

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        results = results.concat(scanDocumentation(itemPath));
      } else if (
        stat.isFile() &&
        (path.extname(itemPath).toLowerCase() === '.md' ||
          path.extname(itemPath).toLowerCase() === '.markdown')
      ) {
        results.push(itemPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

  return results;
}

/**
 * Scans code directories to build a map of code folders
 * @returns {Object} - Map of code folder names to paths
 */
function scanCodeFolders() {
  const codeFolders = {};

  for (const codeDir of config.codeDirs) {
    const fullPath = path.join(config.rootDir, codeDir);

    if (!fs.existsSync(fullPath)) {
      console.log(`Directory not found: ${fullPath}`);
      continue;
    }

    // Get subdirectories
    const items = fs.readdirSync(fullPath);
    for (const item of items) {
      const itemPath = path.join(fullPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        codeFolders[item] = itemPath;
      }
    }
  }

  return codeFolders;
}

/**
 * Maps a documentation file to a code folder
 * @param {string} filePath - Path to the documentation file
 * @param {Object} codeFolders - Map of code folder names to paths
 * @returns {string|null} - Path to the code folder or null if not found
 */
function mapDocumentationToCode(filePath, codeFolders) {
  // Check manual mapping first
  const relativePath = path.relative(config.rootDir, filePath);
  if (config.manualMapping[relativePath]) {
    return config.manualMapping[relativePath];
  }

  // Extract the file name without extension
  const fileName = path.basename(filePath, path.extname(filePath));

  // Convert to lowercase for case-insensitive matching
  const fileNameLower = fileName.toLowerCase();

  // Check if the file name matches a code folder name
  for (const folderName in codeFolders) {
    if (
      fileNameLower === folderName.toLowerCase() ||
      fileNameLower.includes(folderName.toLowerCase()) ||
      folderName.toLowerCase().includes(fileNameLower)
    ) {
      return codeFolders[folderName];
    }
  }

  // Check file content for references to code folders
  const content = fs.readFileSync(filePath, 'utf8');

  for (const folderName in codeFolders) {
    if (content.toLowerCase().includes(folderName.toLowerCase())) {
      return codeFolders[folderName];
    }
  }

  return null;
}

/**
 * Generates a documentation audit report
 * @param {Object[]} mappings - Array of documentation-to-code mappings
 * @returns {string} - Markdown report
 */
function generateReport(mappings) {
  let report = `# Documentation Audit Report

This report maps existing documentation files to their corresponding code folders.

## Summary

- Total documentation files: ${mappings.length}
- Mapped to code folders: ${mappings.filter(m => m.codeFolder !== null).length}
- Unmapped: ${mappings.filter(m => m.codeFolder === null).length}

## Mappings

| Documentation File | Code Folder | Status |
|-------------------|-------------|--------|
`;

  // Sort mappings by code folder
  mappings.sort((a, b) => {
    if (a.codeFolder === null && b.codeFolder !== null) return 1;
    if (a.codeFolder !== null && b.codeFolder === null) return -1;
    if (a.codeFolder === null && b.codeFolder === null) {
      return a.docFile.localeCompare(b.docFile);
    }
    return a.codeFolder.localeCompare(b.codeFolder);
  });

  // Add mappings to the report
  for (const mapping of mappings) {
    const docFile = path.relative(config.rootDir, mapping.docFile);
    const codeFolder = mapping.codeFolder
      ? path.relative(config.rootDir, mapping.codeFolder)
      : 'N/A';
    const status = mapping.codeFolder ? '✅ Mapped' : '❌ Unmapped';

    report += `| ${docFile} | ${codeFolder} | ${status} |\n`;
  }

  report += `
## Next Steps

1. Review unmapped documentation files and determine appropriate code folders
2. Create HTML templates for CHANGELOG.html, AILESSONS.html, and GLOSSARY.html
3. Convert Markdown to HTML using established templates
4. Move documentation to appropriate code folders
5. Update internal links to point to new locations
`;

  return report;
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    console.log('Starting documentation audit...');

    // Scan documentation directories
    const docFiles = [];
    for (const docDir of config.docDirs) {
      const fullPath = path.join(config.rootDir, docDir);

      if (!fs.existsSync(fullPath)) {
        console.log(`Directory not found: ${fullPath}`);
        continue;
      }

      const files = scanDocumentation(fullPath);
      docFiles.push(...files);
    }

    console.log(`Found ${docFiles.length} documentation files`);

    // Scan code folders
    const codeFolders = scanCodeFolders();
    console.log(`Found ${Object.keys(codeFolders).length} code folders`);

    // Map documentation to code folders
    const mappings = [];
    for (const docFile of docFiles) {
      const codeFolder = mapDocumentationToCode(docFile, codeFolders);
      mappings.push({
        docFile,
        codeFolder,
      });
    }

    // Generate report
    const report = generateReport(mappings);

    // Output report
    if (outputFile) {
      fs.writeFileSync(outputFile, report);
      console.log(`Report written to ${outputFile}`);
    } else {
      console.log('\nDocumentation Audit Report:');
      console.log(report);
    }
  } catch (error) {
    console.error('Error auditing documentation:', error);
    process.exit(1);
  }
}

// Execute the script
main();

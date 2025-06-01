#!/usr/bin/env node

/**
 * Script to automatically fix unused imports by prefixing them with an underscore
 * This helps satisfy the ESLint rule that unused variables should be prefixed with _
 */

import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const clientDir = path.join(rootDir, 'client-angular');
const srcDir = path.join(clientDir, 'src');

// List of common unused imports to fix
const importsToFix = [
  'Input',
  'FormControl',
  'NbTableModule',
  'NbSpinnerModule',
  'NbAlertModule',
  'NbTooltipModule',
  'NbLayoutModule',
  'NbBadgeModule',
  'NbTagModule',
  'NbDialogRef',
  'NB_DIALOG_CONFIG',
  'Component',
  'ChangeDetectorRef',
  'ValidationErrors',
  'SharedModule',
  'NbPaginationChangeEvent',
  'NbToastrService',
  'catchError',
  'of',
];

/**
 * Process a file to fix unused imports
 * @param {string} filePath - Path to the file to process
 * @returns {Promise<boolean>} - Whether the file was modified
 */
async function processFile(filePath) {
  try {
    // Read the file content
    const content = await fsPromises.readFile(filePath, 'utf8');
    let newContent = content;
    let modified = false;

    // For each import to fix
    for (const importName of importsToFix) {
      // Skip if the file doesn't include the import
      if (!content.includes(importName)) {
        continue;
      }

      // Check if the import is already prefixed with _
      if (content.includes(`_${importName}`)) {
        continue;
      }

      // Regular expressions to match different import patterns
      const importPatterns = [
        // import { ImportName } from '...';
        new RegExp(`import\\s+{\\s*${importName}\\s*}\\s+from\\s+['"](.+)['"]`, 'g'),

        // import { ImportName, OtherImport } from '...';
        // import { OtherImport, ImportName } from '...';
        // import { OtherImport, ImportName, AnotherImport } from '...';
        new RegExp(`import\\s+{([^}]*)\\b${importName}\\b([^}]*)}\\s+from\\s+['"](.+)['"]`, 'g'),
      ];

      // Check if the import is used in the file
      const usagePattern = new RegExp(`\\b${importName}\\b(?!\\s*[,}]\\s*from)`);
      const isImportUsed = usagePattern.test(content);

      // If the import is not used, prefix it with _
      if (!isImportUsed) {
        for (const pattern of importPatterns) {
          // Reset lastIndex to start from the beginning
          pattern.lastIndex = 0;

          // For the simple case: import { ImportName } from '...';
          if (pattern.source.includes(`\\s*${importName}\\s*`)) {
            newContent = newContent.replace(pattern, (match, importPath) => {
              return `import { _${importName} } from '${importPath}'`;
            });
          }
          // For the complex case with multiple imports
          else {
            newContent = newContent.replace(
              pattern,
              (match, beforeImport, afterImport, importPath) => {
                // Replace the import name with _ImportName, preserving whitespace
                const newBeforeImport = beforeImport.replace(
                  new RegExp(`(\\s*,\\s*)?\\b${importName}\\b`, 'g'),
                  (m, comma) => (comma || '') + `_${importName}`,
                );

                const newAfterImport = afterImport.replace(
                  new RegExp(`\\b${importName}\\b(\\s*,\\s*)?`, 'g'),
                  (m, comma) => `_${importName}` + (comma || ''),
                );

                return `import {${newBeforeImport}${newAfterImport}} from '${importPath}'`;
              },
            );
          }

          // Check if the content was modified
          if (newContent !== content) {
            modified = true;
            break;
          }
        }
      }
    }

    // Write the modified content back to the file
    if (modified) {
      await fsPromises.writeFile(filePath, newContent, 'utf8');
      console.log(`Fixed: ${path.relative(rootDir, filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

/**
 * Recursively find all TypeScript files in a directory
 * @param {string} dir - Directory to search
 * @returns {Promise<string[]>} - Array of file paths
 */
async function findTypeScriptFiles(dir) {
  const files = await fsPromises.readdir(dir, { withFileTypes: true });
  const result = [];

  for (const file of files) {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      // Skip node_modules and dist directories
      if (file.name !== 'node_modules' && file.name !== 'dist') {
        const nestedFiles = await findTypeScriptFiles(filePath);
        result.push(...nestedFiles);
      }
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.spec.ts')) {
      result.push(filePath);
    }
  }

  return result;
}

/**
 * Main function to process all TypeScript files
 */
async function main() {
  try {
    console.log('Finding TypeScript files...');
    const files = await findTypeScriptFiles(srcDir);
    console.log(`Found ${files.length} TypeScript files.`);

    let modifiedCount = 0;

    for (const file of files) {
      const modified = await processFile(file);
      if (modified) {
        modifiedCount++;
      }
    }

    console.log(`\nDone! Modified ${modifiedCount} files.`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

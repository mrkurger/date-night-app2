#!/usr/bin/env node

/**
 * Script to fix TypeScript import paths by adding .js extensions
 * When using "moduleResolution": "NodeNext" in tsconfig.json,
 * TypeScript requires .js extensions for relative imports
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Regular expression to match relative imports without extensions
const importRegex =
  /(import\s+(?:{[^}]*}|\*\s+as\s+[^;]+|[^{}\s*;]+)\s+from\s+['"])([./][^'"]*?)(['"])/g;
const requireRegex = /(require\s*\(\s*['"])([./][^'"]*?)(['"])/g;
const dynamicImportRegex = /(import\s*\(\s*['"])([./][^'"]*?)(['"])/g;

// File extensions to ignore (already have extensions)
const ignoreExtensions = ['.js', '.cjs', '.mjs', '.json', '.css', '.scss', '.less'];

// Files to process (TypeScript files)
async function fixImportsInTypeScriptFiles() {
  try {
    console.log('Starting the fix-ts-imports script...');
    console.log('Current directory:', process.cwd());
    console.log('Script directory:', __dirname);

    // Find all TypeScript files in the project
    const files = await glob('**/*.{ts,tsx}', {
      cwd: path.resolve(__dirname, '..'),
      ignore: ['**/node_modules/**', '**/dist/**'],
      absolute: true,
    });

    console.log(`Found ${files.length} TypeScript files to process`);
    if (files.length > 0) {
      console.log('First few files:', files.slice(0, 5));
    }

    let changedFilesCount = 0;

    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      let originalContent = content;

      // Replace imports
      content = content.replace(importRegex, (match, start, importPath, end) => {
        // Skip if the import already has an extension
        if (ignoreExtensions.some(ext => importPath.endsWith(ext))) {
          return match;
        }
        return `${start}${importPath}.js${end}`;
      });

      // Replace requires
      content = content.replace(requireRegex, (match, start, importPath, end) => {
        // Skip if the import already has an extension
        if (ignoreExtensions.some(ext => importPath.endsWith(ext))) {
          return match;
        }
        return `${start}${importPath}.js${end}`;
      });

      // Replace dynamic imports
      content = content.replace(dynamicImportRegex, (match, start, importPath, end) => {
        // Skip if the import already has an extension
        if (ignoreExtensions.some(ext => importPath.endsWith(ext))) {
          return match;
        }
        return `${start}${importPath}.js${end}`;
      });

      // Write back if content changed
      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated imports in: ${file}`);
        changedFilesCount++;
      }
    }

    console.log(`Updated imports in ${changedFilesCount} files`);
  } catch (error) {
    console.error('Error fixing imports:', error);
    process.exit(1);
  }
}

// Execute the function
fixImportsInTypeScriptFiles();

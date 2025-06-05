#!/usr/bin/env node

/**
 * Script to fix import paths in the dist folder by replacing .ts with .js extensions
 * When using "moduleResolution": "NodeNext" in tsconfig.json,
 * TypeScript requires .js extensions for relative imports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Regular expression to match .ts extensions in import statements
const tsExtRegex = /from\s+['"]([^'"]+)\.ts['"]/g;

async function fixTsExtensionsInDistFiles() {
  try {
    console.log('Starting the fix-dist-imports script...');
    console.log('Current directory:', process.cwd());
    console.log('Script directory:', __dirname);

    // Find all JavaScript files in the dist folder
    const files = await glob('dist/**/*.js', {
      cwd: path.resolve(__dirname),
      ignore: ['**/node_modules/**'],
      absolute: true,
    });

    console.log(`Found ${files.length} JavaScript files to process in dist folder`);
    if (files.length > 0) {
      console.log('First few files:', files.slice(0, 5));
    }

    let changedFilesCount = 0;

    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      let originalContent = content;

      // Replace .ts extensions with .js in import statements
      content = content.replace(tsExtRegex, (match, importPath) => {
        return `from "${importPath}.js"`;
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

fixTsExtensionsInDistFiles();

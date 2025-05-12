#!/usr/bin/env node

/**
 * This script automatically fixes common syntax errors in Angular components:
 * 1. Removes erroneous commas in component decorators
 * 2. Fixes import syntax errors
 * 3. Fixes CSS syntax errors in theme files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client-angular');

// Utility functions
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

/**
 * Recursively find all files with specific extensions
 */
async function findFiles(dir, extensions) {
  const files = await fs.promises.readdir(dir);
  const result = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await stat(filePath);

    if (stats.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
      result.push(...(await findFiles(filePath, extensions)));
    } else if (stats.isFile() && extensions.includes(path.extname(filePath))) {
      result.push(filePath);
    }
  }

  return result;
}

/**
 * Fix erroneous commas in component decorators
 */
async function fixComponentDecorators(filePath) {
  try {
    let content = await readFile(filePath, 'utf8');
    let modified = false;

    // Fix pattern: ],\n  schemas: [
    const pattern1 = /],\s*,\s*schemas:/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, '],\n  schemas:');
      modified = true;
    }

    // Fix pattern: imports: [...],\n,\n  schemas:
    const pattern2 = /(imports\s*:\s*\[[^\]]*\],)\s*,\s*(schemas\s*:)/g;
    if (pattern2.test(content)) {
      content = content.replace(pattern2, '$1\n  $2');
      modified = true;
    }

    // Fix pattern: template: `...`,\n,\n  schemas:
    const pattern3 = /(template\s*:\s*`[^`]*`,)\s*,\s*(schemas\s*:)/g;
    if (pattern3.test(content)) {
      content = content.replace(pattern3, '$1\n  $2');
      modified = true;
    }

    // Fix pattern: styleUrls: [...],\n,\n  schemas:
    const pattern4 = /(styleUrls\s*:\s*\[[^\]]*\],)\s*,\s*(schemas\s*:)/g;
    if (pattern4.test(content)) {
      content = content.replace(pattern4, '$1\n  $2');
      modified = true;
    }

    // Fix pattern: standalone: true,\n  imports: [...],\n,\n  schemas:
    const pattern5 = /(standalone\s*:\s*true,\s*imports\s*:\s*\[[^\]]*\],)\s*,\s*(schemas\s*:)/g;
    if (pattern5.test(content)) {
      content = content.replace(pattern5, '$1\n  $2');
      modified = true;
    }

    // Fix pattern: OnDestroy,\n, CUSTOM_ELEMENTS_SCHEMA
    const pattern6 = /(OnDestroy),\s*,\s*(CUSTOM_ELEMENTS_SCHEMA)/g;
    if (pattern6.test(content)) {
      content = content.replace(pattern6, '$1,\n  $2');
      modified = true;
    }

    if (modified) {
      await writeFile(filePath, content, 'utf8');
      console.log(`Fixed component decorator in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing component decorator in ${filePath}:`, error);
    return false;
  }
}

/**
 * Fix theme.scss file
 */
async function fixThemeScss(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');

    // Check if the file contains the problematic pattern
    if (content.includes('$nb-themes: nb-register-theme((')) {
      const fixedContent = content.replace(
        /\$nb-themes: nb-register-theme\(\(([^)]*)\), default, default\);/g,
        `$nb-themes: nb-register-theme(\n  (\n    $1\n  ),\n  default,\n  default\n);`,
      );

      await writeFile(filePath, fixedContent, 'utf8');
      console.log(`Fixed theme.scss in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing theme.scss in ${filePath}:`, error);
    return false;
  }
}

/**
 * Fix HTML syntax errors in AILESSONS.html files
 */
async function fixHtmlSyntax(filePath) {
  try {
    let content = await readFile(filePath, 'utf8');
    let modified = false;

    // Fix unclosed code tags
    const pattern = /}<\/code><\/pre>/g;
    if (pattern.test(content)) {
      content = content.replace(pattern, '}\n</code></pre>');
      modified = true;
    }

    if (modified) {
      await writeFile(filePath, content, 'utf8');
      console.log(`Fixed HTML syntax in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing HTML syntax in ${filePath}:`, error);
    return false;
  }
}

/**
 * Main function to fix all issues
 */
async function fixAllIssues() {
  try {
    console.log('Starting to fix Angular syntax issues...');

    // Find all TypeScript files
    const tsFiles = await findFiles(clientDir, ['.ts']);
    console.log(`Found ${tsFiles.length} TypeScript files to check`);

    // Find all SCSS files
    const scssFiles = await findFiles(clientDir, ['.scss']);
    console.log(`Found ${scssFiles.length} SCSS files to check`);

    // Find all HTML files
    const htmlFiles = await findFiles(clientDir, ['.html']);
    console.log(`Found ${htmlFiles.length} HTML files to check`);

    // Fix component decorators in TypeScript files
    let tsFixCount = 0;
    for (const file of tsFiles) {
      const fixed = await fixComponentDecorators(file);
      if (fixed) tsFixCount++;
    }
    console.log(`Fixed ${tsFixCount} TypeScript files`);

    // Fix theme.scss files
    let scssFixCount = 0;
    for (const file of scssFiles) {
      if (file.includes('theme.scss')) {
        const fixed = await fixThemeScss(file);
        if (fixed) scssFixCount++;
      }
    }
    console.log(`Fixed ${scssFixCount} SCSS files`);

    // Fix HTML syntax errors
    let htmlFixCount = 0;
    for (const file of htmlFiles) {
      if (file.includes('AILESSONS.html')) {
        const fixed = await fixHtmlSyntax(file);
        if (fixed) htmlFixCount++;
      }
    }
    console.log(`Fixed ${htmlFixCount} HTML files`);

    console.log('All fixes completed!');

    // Now run prettier on the fixed files
    console.log('Running prettier on fixed files...');
    try {
      await execAsync(
        'cd ' +
          rootDir +
          ' && npm run prettier -- "client-angular/src/**/*.{ts,html,scss,css,json}"',
      );
      console.log('Prettier completed successfully!');
    } catch (error) {
      console.log('Prettier encountered some errors, but fixes were still applied.');
      console.log('You may need to fix remaining issues manually.');
    }

    console.log('\nNext steps:');
    console.log('1. Run "npm run lint:client:fix" to fix remaining linting issues');
    console.log('2. If there are still errors, you may need to fix them manually');
  } catch (error) {
    console.error('Error in fixAllIssues:', error);
  }
}

// Run the main function
fixAllIssues();

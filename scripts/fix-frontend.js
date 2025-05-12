#!/usr/bin/env node

/**
 * Master script to fix all frontend syntax issues and run linting/formatting
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('=== FRONTEND SYNTAX FIX UTILITY ===');
console.log('This script will:');
console.log('1. Fix common syntax errors in Angular components');
console.log('2. Fix the theme.scss file');
console.log('3. Run the comprehensive syntax fixer');
console.log('4. Run prettier on the fixed files');
console.log('5. Run ESLint to fix remaining issues');
console.log('\nStarting the fix process...\n');

try {
  // Step 1: Fix Angular components
  console.log('\n=== STEP 1: Fixing Angular components ===');
  execSync('node ' + path.join(__dirname, 'fix-angular-components.js'), { stdio: 'inherit' });

  // Step 2: Fix theme.scss
  console.log('\n=== STEP 2: Fixing theme.scss ===');
  execSync('node ' + path.join(__dirname, 'fix-theme-scss.js'), { stdio: 'inherit' });

  // Step 3: Run the comprehensive syntax fixer
  console.log('\n=== STEP 3: Running comprehensive syntax fixer ===');
  execSync('node ' + path.join(__dirname, 'fix-angular-syntax.js'), { stdio: 'inherit' });

  // Step 4: Run prettier
  console.log('\n=== STEP 4: Running prettier ===');
  try {
    execSync(
      'cd ' + rootDir + ' && npm run prettier -- "client-angular/src/**/*.{ts,html,scss,css,json}"',
      { stdio: 'inherit' },
    );
    console.log('✅ Prettier completed successfully');
  } catch (error) {
    console.log('⚠️ Prettier encountered some errors, but fixes were still applied');
    console.log('You may need to fix remaining issues manually');
  }

  // Step 5: Run ESLint
  console.log('\n=== STEP 5: Running ESLint ===');
  execSync('cd ' + rootDir + ' && npm run lint:client:fix:safe', { stdio: 'inherit' });
  console.log('✅ ESLint fixes applied (warnings may remain)');

  console.log('\n=== FRONTEND FIX PROCESS COMPLETED ===');
  console.log('Most common syntax errors should now be fixed.');
  console.log('If there are still errors, you may need to fix them manually.');
} catch (error) {
  console.error('\n❌ An error occurred during the fix process:', error);
  console.log('Please check the error message and try to fix the issue manually.');
}

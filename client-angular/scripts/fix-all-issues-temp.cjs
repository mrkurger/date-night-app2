#!/usr/bin/env node
// @ts-check

/**
 * This script runs all the fix scripts in sequence
 * (except for index.html and chat-message-interface which we fixed manually)
 */

const { execSync } = require('child_process');
const path = require('path');

// Get the project root directory
const scriptsDir = __dirname;

console.log(
  '🔧 Running all fix scripts in sequence (skipping index.html and chat-message-interface)...',
);

try {
  // 1. Fix CSS paths
  console.log('\n📄 Running fix-css-paths.cjs...');
  execSync(`node ${path.join(scriptsDir, 'fix-css-paths.cjs')}`, { stdio: 'inherit' });

  // 2. Fix styles.scss
  console.log('\n📄 Running fix-styles.cjs...');
  execSync(`node ${path.join(scriptsDir, 'fix-styles.cjs')}`, { stdio: 'inherit' });

  // 3. Fix Nebular imports
  console.log('\n📄 Running fix-nebular-imports.cjs...');
  execSync(`node ${path.join(scriptsDir, 'fix-nebular-imports.cjs')}`, { stdio: 'inherit' });

  // 4. Fix remaining Nebular issues
  console.log('\n📄 Running fix-remaining-nebular-issues.cjs...');
  execSync(`node ${path.join(scriptsDir, 'fix-remaining-nebular-issues.cjs')}`, {
    stdio: 'inherit',
  });

  console.log('\n✅ All issues fixed successfully!');
  console.log('\n🚀 You can now run the application with:');
  console.log('   npm run dev');
} catch (error) {
  console.error('\n❌ Error fixing issues:', error);
  process.exit(1);
}

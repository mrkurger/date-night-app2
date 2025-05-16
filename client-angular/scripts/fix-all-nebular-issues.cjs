#!/usr/bin/env node
// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * This script fixes all Nebular-related issues in the Angular client
 * It runs all the individual fix scripts in sequence
 */

const { execSync } = require('child_process');
const path = require('path');

// Get the project root directory
const scriptsDir = __dirname;
const projectRoot = path.resolve(__dirname, '..');

console.log('🔧 Running all Nebular issue fixes...');

try {
  // 1. Fix CSS paths
  console.log('\n📄 Running fix-css-paths.cjs...');
  execSync(`node ${path.join(scriptsDir, 'fix-css-paths.cjs')}`, { stdio: 'inherit' });

  // 2. Fix index.html
  console.log('\n📄 Running fix-index-html.cjs...');
  execSync(`node ${path.join(scriptsDir, 'fix-index-html.cjs')}`, { stdio: 'inherit' });

  // 3. Fix Nebular imports
  console.log('\n📄 Running fix-nebular-imports.cjs...');
  execSync(`node ${path.join(scriptsDir, 'fix-nebular-imports.cjs')}`, { stdio: 'inherit' });

  console.log('\n✅ All Nebular issues fixed successfully!');
  console.log('\n🚀 You can now run the application with:');
  console.log('   npm run dev');
} catch (error) {
  console.error('\n❌ Error fixing Nebular issues:', error);
  process.exit(1);
}

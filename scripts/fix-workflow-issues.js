/**
 * This script runs all the fixes for the workflow issues:
 * 1. Updates deprecated packages
 * 2. Increases Node.js heap memory for Angular tests
 * 3. Reinstalls dependencies to apply the overrides
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Starting workflow issues fix script...');

try {
  // Run the update-deprecated-packages.js script
  console.log('\n📦 Updating deprecated packages...');
  require('./update-deprecated-packages');

  // Run the increase-node-memory.js script
  console.log('\n💾 Increasing Node.js heap memory for Angular tests...');
  require('./increase-node-memory');

  // Reinstall dependencies to apply the overrides
  console.log('\n🔄 Reinstalling dependencies to apply overrides...');

  // Change to the project root directory
  const rootDir = path.join(__dirname, '..');
  process.chdir(rootDir);

  // Run npm install with --legacy-peer-deps to handle ESLint compatibility issues
  console.log('\n⚠️ Using --legacy-peer-deps to handle ESLint compatibility issues');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

  console.log('\n✅ All fixes have been applied successfully!');
  console.log('\nPlease run the following command to verify the fixes:');
  console.log('npm run analyze:security');
} catch (error) {
  console.error('\n❌ Error applying fixes:', error.message);
  process.exit(1);
}

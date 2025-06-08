#!/usr/bin/env node

/**
 * Enhanced build script for the date-night-app server
 *
 * This script:
 * 1. Creates the dist directory
 * 2. Copies the enhanced server.js as the main build output
 * 3. Copies utility files needed by the server
 * 4. Creates a proper package.json for the dist
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const serverRoot = path.join(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');
const enhancedServerJs = path.join(serverRoot, 'server.enhanced.js');
const serverJs = path.join(distDir, 'server.js');

// Ensure directory exists
async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

// Copy a file with proper permissions
async function copyFile(src, dest) {
  await fs.copyFile(src, dest);
  const stats = await fs.stat(dest);
  await fs.chmod(dest, stats.mode | 0o111); // Add execute permission
}

async function main() {
  console.log('🚀 Building date-night-app server (enhanced build)...');

  // 1. Create dist directory and structure
  await ensureDir(distDir);
  await ensureDir(path.join(distDir, 'src'));
  await ensureDir(path.join(distDir, 'src/utils'));
  console.log('✅ Directory structure created');

  // 2. Copy enhanced server as main server
  try {
    await copyFile(enhancedServerJs, serverJs);
    console.log('✅ Enhanced server copied as main server.js');
  } catch (err) {
    console.error('❌ Error copying server file:', err);
    process.exit(1);
  }

  // 3. Copy utility files
  try {
    await copyFile(
      path.join(serverRoot, 'src/utils/express-compatibility.js'),
      path.join(distDir, 'src/utils/express-compatibility.js')
    );
    console.log('✅ Utility files copied');
  } catch (err) {
    console.error('⚠️ Warning: Could not copy utility files:', err);
    // Continue despite errors
  }

  // 4. Create a package.json for the dist directory
  try {
    const packageJson = JSON.parse(
      await fs.readFile(path.join(serverRoot, 'package.json'), 'utf-8')
    );

    const distPackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description + ' (Enhanced build)',
      main: 'server.js',
      type: 'module',
      scripts: {
        start: 'node server.js',
      },
      dependencies: packageJson.dependencies,
    };

    await fs.writeFile(
      path.join(distDir, 'package.json'),
      JSON.stringify(distPackageJson, null, 2)
    );
    console.log('✅ Created package.json in dist');
  } catch (err) {
    console.error('⚠️ Warning: Could not create package.json:', err);
    // Continue despite this error
  }

  console.log('\n✅ Enhanced build completed successfully!');
  console.log('\nYou can run the server with:');
  console.log('  cd dist && node server.js');
}

main().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});

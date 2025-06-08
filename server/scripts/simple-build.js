#!/usr/bin/env node

/**
 * Simplified build script for the date-night-app server
 *
 * This script:
 * 1. Generates TypeScript declarations for JS files
 * 2. Creates the dist directory
 * 3. Copies the simplified server.js as the main build output
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
const simpleServerJs = path.join(serverRoot, 'server.simple.js');
const serverJs = path.join(distDir, 'server.js');

async function main() {
  console.log('🚀 Building date-night-app server (simplified build)...');

  // 1. Create dist directory
  await fs.mkdir(distDir, { recursive: true });
  console.log('✅ Dist directory created or already exists');

  // 2. Copy simple server as main server
  try {
    await fs.copyFile(simpleServerJs, serverJs);
    console.log('✅ Simple server copied as main server.js');

    // Make server.js executable
    const stats = await fs.stat(serverJs);
    await fs.chmod(serverJs, stats.mode | 0o111); // Add execute permission
    console.log('✅ Made server.js executable');
  } catch (err) {
    console.error('❌ Error copying server file:', err);
    process.exit(1);
  }

  // 3. Create a simplified package.json for the dist directory
  try {
    const packageJson = JSON.parse(
      await fs.readFile(path.join(serverRoot, 'package.json'), 'utf-8')
    );

    const distPackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description + ' (Built with simplified build)',
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
    console.log('✅ Created simplified package.json in dist');
  } catch (err) {
    console.error('⚠️ Warning: Could not create package.json:', err);
    // Continue despite this error
  }

  console.log('\n✅ Simple build completed successfully!');
  console.log('\nYou can run the server with:');
  console.log('  cd dist && node server.js');
}

main().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Full-featured build script for the date-night-app server
 *
 * This script:
 * 1. Creates the dist directory
 * 2. Copies the full-featured server.js as the main build output
 * 3. Copies all necessary middleware and utility files
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
const fullServerJs = path.join(serverRoot, 'server.full.js');
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

// Directory structure to create
const directories = [
  'dist',
  'dist/src',
  'dist/src/utils',
  'dist/middleware',
  'dist/middleware/validators',
  'dist/middleware/validation',
  'dist/middleware/security',
  'dist/components',
  'dist/components/auth',
  'dist/components/users',
  'dist/components/ads',
  'dist/components/chat',
  'dist/routes',
  'dist/models',
  'dist/utils',
  'dist/config',
];

// Function to copy a directory recursively
async function copyDirectory(src, dest) {
  try {
    // For macOS compatibility
    execSync(`mkdir -p "${dest}"`);

    // Get all files in the source directory
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and dist
        if (entry.name === 'node_modules' || entry.name === 'dist') {
          continue;
        }

        // Recursively copy the directory
        await ensureDir(destPath);
        await copyDirectory(srcPath, destPath);
      } else if (entry.isFile()) {
        // Copy the file
        await copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    console.warn(`Warning: Could not copy directory ${src}: ${err.message}`);
  }
}

async function main() {
  console.log('🚀 Building date-night-app server (full-featured build)...');

  // 1. Create directory structure
  for (const dir of directories) {
    const fullDir = path.join(serverRoot, dir.replace('dist/', ''));
    const fullDistDir = path.join(serverRoot, dir);

    await ensureDir(fullDistDir);
    console.log(`✅ Created directory: ${dir}`);
  }
  console.log('✅ Directory structure created');

  // 2. Copy server.full.js as server.js
  try {
    await copyFile(fullServerJs, serverJs);
    console.log('✅ Full-featured server copied as main server.js');
  } catch (err) {
    console.error('❌ Error copying server file:', err);
    process.exit(1);
  }

  // 3. Copy middleware directories
  try {
    await copyDirectory(path.join(serverRoot, 'middleware'), path.join(distDir, 'middleware'));
    console.log('✅ Middleware files copied');

    await copyDirectory(path.join(serverRoot, 'components'), path.join(distDir, 'components'));
    console.log('✅ Component files copied');

    await copyDirectory(path.join(serverRoot, 'routes'), path.join(distDir, 'routes'));
    console.log('✅ Route files copied');

    await copyDirectory(path.join(serverRoot, 'models'), path.join(distDir, 'models'));
    console.log('✅ Model files copied');

    await copyDirectory(path.join(serverRoot, 'utils'), path.join(distDir, 'utils'));
    console.log('✅ Utility files copied');

    await copyDirectory(path.join(serverRoot, 'src'), path.join(distDir, 'src'));
    console.log('✅ Source files copied');

    await copyDirectory(path.join(serverRoot, 'config'), path.join(distDir, 'config'));
    console.log('✅ Config files copied');
  } catch (err) {
    console.error('⚠️ Warning: Error copying directories:', err);
    console.log('Continuing with partial copy...');
  }

  // 4. Create a package.json for the dist directory
  try {
    const packageJson = JSON.parse(
      await fs.readFile(path.join(serverRoot, 'package.json'), 'utf-8')
    );

    const distPackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description + ' (Full-featured build)',
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
  }

  // 5. Copy .env file if it exists
  try {
    await copyFile(path.join(serverRoot, '.env'), path.join(distDir, '.env'));
    console.log('✅ Copied .env file');
  } catch (err) {
    console.warn('⚠️ Warning: Could not copy .env file. You may need to create one manually.');
  }

  console.log('\n✅ Full-featured build completed successfully!');
  console.log('\nYou can run the server with:');
  console.log('  cd dist && node server.js');
}

main().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Simple build script for the date-night-app server
 *
 * This script:
 * 1. Compiles server.ts with more permissive TypeScript options
 * 2. Makes the compiled server.js executable
 * 3. Copies necessary files to dist directory
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const serverRoot = path.join(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');
const serverTs = path.join(serverRoot, 'server.ts');
const serverJs = path.join(distDir, 'server.js');

// Ensure dist directory exists
async function ensureDistDir() {
  try {
    await fs.mkdir(distDir, { recursive: true });
    console.log('✅ Dist directory created or already exists');
  } catch (err) {
    console.error('❌ Error creating dist directory:', err);
    process.exit(1);
  }
}

// Compile server.ts with TypeScript
function compileServerTs() {
  try {
    console.log('🔄 Compiling server.ts...');

    // Use TypeScript to compile just server.ts with allowJs and skipLibCheck
    execSync(
      'npx tsc server.ts --outDir dist --allowJs --skipLibCheck --esModuleInterop ' +
        '--resolveJsonModule --target ES2022 --module NodeNext --moduleResolution NodeNext',
      { stdio: 'inherit', cwd: serverRoot }
    );

    console.log('✅ Compiled server.ts successfully');
  } catch (err) {
    console.error('❌ Error compiling server.ts:', err);
    process.exit(1);
  }
}

// Make server.js executable
async function makeServerJsExecutable() {
  try {
    const stats = await fs.stat(serverJs);
    await fs.chmod(serverJs, stats.mode | 0o111); // Add execute permission
    console.log('✅ Made server.js executable');
  } catch (err) {
    console.error('❌ Error making server.js executable:', err);
    process.exit(1);
  }
}

// Copy source files to dist (JS and TS files)
async function copySourceFiles() {
  try {
    console.log('🔄 Copying source files to dist directory...');

    // Use shell copy to preserve directory structure
    execSync(
      'find . -type f \\( -name "*.js" -o -name "*.ts" \\) ' +
        '-not -path "./node_modules/*" ' +
        '-not -path "./dist/*" ' +
        '-not -path "./.git/*" ' +
        '-not -name "*.test.*" | ' +
        'while read file; do ' +
        '  mkdir -p "dist/$(dirname "$file")"; ' +
        '  cp "$file" "dist/$file"; ' +
        'done',
      { stdio: 'inherit', cwd: serverRoot }
    );

    console.log('✅ Source files copied to dist');
  } catch (err) {
    console.error('❌ Error copying source files:', err);
    process.exit(1);
  }
}

// Copy package.json and other important files
async function copyConfigFiles() {
  try {
    console.log('🔄 Copying config files...');

    // Files to copy to dist root
    const filesToCopy = ['package.json', 'package-lock.json', '.env', '.env.example', 'README.md'];

    for (const file of filesToCopy) {
      const src = path.join(serverRoot, file);
      const dest = path.join(distDir, file);

      try {
        await fs.copyFile(src, dest);
        console.log(`  ✓ Copied ${file}`);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
        console.log(`  ℹ Skipped ${file} (not found)`);
      }
    }

    console.log('✅ Config files copied');
  } catch (err) {
    console.error('❌ Error copying config files:', err);
    process.exit(1);
  }
}

// Main function
async function main() {
  console.log('🚀 Building date-night-app server...');

  await ensureDistDir();
  compileServerTs();
  await makeServerJsExecutable();
  await copySourceFiles();
  await copyConfigFiles();

  console.log('✅ Build completed successfully!');
  console.log('\nYou can run the server with:');
  console.log('  cd dist && node server.js');
}

// Run the script
main().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});

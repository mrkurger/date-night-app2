#!/usr/bin/env node

/**
 * Fix path-to-regexp errors related to URLs with colons
 *
 * This TypeScript script enhances the server codebase to properly handle URLs with
 * colons (such as https://example.com) in route patterns and error messages.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Get server root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');
const srcDir = path.join(serverRoot, 'src');

// Define the paths we'll be working with
const srcPatchPath = path.join(srcDir, 'middleware', 'path-to-regexp-patch.ts');
const srcSafeRouterPath = path.join(srcDir, 'middleware', 'safe-router.ts');
const srcErrorSanitizerPath = path.join(srcDir, 'middleware', 'error-sanitizer.ts');
const srcErrorHandlerPath = path.join(srcDir, 'middleware', 'error-handler.ts');
const srcValidationErrorHandlerPath = path.join(
  srcDir,
  'middleware',
  'validation',
  'error-handler.ts'
);

const distPatchPath = path.join(distDir, 'middleware', 'path-to-regexp-patch.js');
const distSafeRouterPath = path.join(distDir, 'middleware', 'safe-router.js');
const distErrorSanitizerPath = path.join(distDir, 'middleware', 'error-sanitizer.js');
const distErrorHandlerPath = path.join(distDir, 'middleware', 'error-handler.js');
const distValidationErrorHandlerPath = path.join(
  distDir,
  'middleware',
  'validation',
  'error-handler.js'
);

// Main function to fix path-to-regexp errors
async function fixPathToRegexpErrorsTS() {
  console.log('🔄 Setting up TypeScript-compatible path-to-regexp error fixes...');

  try {
    // Ensure the directory structure exists
    await ensureDirectoryExists(path.dirname(srcPatchPath));
    await ensureDirectoryExists(path.dirname(srcValidationErrorHandlerPath));
    await ensureDirectoryExists(path.dirname(distPatchPath));
    await ensureDirectoryExists(path.dirname(distValidationErrorHandlerPath));

    // Check if the server.js file needs to be modified to import the patch
    const serverJsPath = path.join(distDir, 'server.js');
    if (existsSync(serverJsPath)) {
      const serverContent = await fs.readFile(serverJsPath, 'utf8');
      if (!serverContent.includes('path-to-regexp-patch.js')) {
        console.log('📝 Updating server.js to load path-to-regexp patch early...');

        // Find the first import statement
        const importIndex = serverContent.indexOf('import ');
        if (importIndex !== -1) {
          const newServerContent =
            serverContent.substring(0, importIndex) +
            '// Apply path-to-regexp patch first to avoid URL parsing issues with colons\n' +
            "import './middleware/path-to-regexp-patch.js';\n\n" +
            serverContent.substring(importIndex);

          await fs.writeFile(serverJsPath, newServerContent);
          console.log('✅ Updated server.js to load path-to-regexp patch');
        }
      }
    }

    console.log('✅ TypeScript-compatible path-to-regexp error fixes are set up');
  } catch (error) {
    console.error('❌ Error setting up TypeScript-compatible path-to-regexp error fixes:', error);
    process.exit(1);
  }
}

// Helper function to ensure a directory exists
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Ignore directory already exists errors
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

// Run the fix
fixPathToRegexpErrorsTS().catch(err => {
  console.error('Failed to run TypeScript fixes:', err);
  process.exit(1);
});

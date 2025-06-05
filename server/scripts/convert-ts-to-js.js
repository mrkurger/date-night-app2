#!/usr/bin/env node

/**
 * This script converts TypeScript files to JavaScript files
 * to make the server runnable while we fix TypeScript errors.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverRoot = path.resolve(__dirname, '..');

// Function to convert TypeScript files to JavaScript
async function convertTsToJs() {
  try {
    // Find all TypeScript files
    const tsFiles = await glob('**/*.ts', {
      cwd: serverRoot,
      ignore: ['node_modules/**', 'dist/**', 'scripts/**', '**/tests/**', '**/*.d.ts'],
    });

    console.log(`Found ${tsFiles.length} TypeScript files to convert`);

    for (const tsFile of tsFiles) {
      const fullPath = path.join(serverRoot, tsFile);
      const jsFilePath = fullPath.replace(/\.ts$/, '.js');

      // Read the TypeScript file
      let content = fs.readFileSync(fullPath, 'utf-8');

      // Keep a backup of the original TypeScript file
      fs.writeFileSync(`${fullPath}.backup`, content, 'utf-8');

      // Remove type annotations and TypeScript-specific syntax
      // This is a simplified approach - a proper conversion would use babel or ts-node
      content = content
        // Remove import type statements
        .replace(/import\s+type\s+.*?;/g, '')
        // Remove type annotations (: Type)
        .replace(/:\s*([A-Za-z0-9_<>[\].,|\s]+)(\s*[,)])/g, '$2')
        // Remove interface declarations
        .replace(/interface\s+[A-Za-z0-9_]+(\s*extends\s+[A-Za-z0-9_]+)?\s*\{[\s\S]*?\}/g, '')
        // Remove type declarations
        .replace(/type\s+[A-Za-z0-9_]+(\s*=\s*[\s\S]*?;)/g, '')
        // Remove generics
        .replace(/<[A-Za-z0-9_,\s]+>/g, '')
        // Remove export type statements
        .replace(/export\s+type\s+.*?;/g, '')
        // Change .ts extensions to .js in imports
        .replace(/from\s+['"](.+?)\.ts['"]/g, "from '$1.js'");

      // Write the converted JavaScript file
      fs.writeFileSync(jsFilePath, content, 'utf-8');
      console.log(`Converted ${tsFile} to JavaScript`);
    }

    console.log('TypeScript to JavaScript conversion completed');
  } catch (error) {
    console.error('Error during conversion:', error);
    process.exit(1);
  }
}

convertTsToJs();

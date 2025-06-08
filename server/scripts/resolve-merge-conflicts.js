#!/usr/bin/env node

/**
 * A script to resolve merge conflicts in TypeScript files.
 * This script chooses the changes from HEAD by default.
 */
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');

async function resolveConflicts(filePath) {
  console.log(`Resolving conflicts in ${filePath}...`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Process content to keep HEAD changes
    // This pattern matches Git merge conflict markers
    const resolvedContent = content.replace(
      /<<<<<<< HEAD.*?\n([\s\S]*?)=====.*?\n[\s\S]*?>>>>>>> .*?\n/g,
      '$1'
    );

    // Write the resolved content back
    await fs.writeFile(filePath, resolvedContent, 'utf-8');

    console.log(`✅ Conflicts resolved in ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error resolving conflicts in ${path.basename(filePath)}:`, error);
    return false;
  }
}

async function main() {
  try {
    // Find files with merge conflicts
    const files = await glob('**/*.{ts,js}', {
      cwd: serverRoot,
      ignore: ['node_modules/**', 'dist/**', 'scripts/**'],
    });

    let conflictFiles = [];

    for (const file of files) {
      const filePath = path.join(serverRoot, file);
      const content = await fs.readFile(filePath, 'utf-8');

      // Check for merge conflict markers
      if (
        content.includes('<<<<<<< HEAD') ||
        content.includes('=======') ||
        content.includes('>>>>>>> ')
      ) {
        conflictFiles.push(filePath);
      }
    }

    if (conflictFiles.length === 0) {
      console.log('No files with merge conflicts found.');
      return;
    }

    console.log(`Found ${conflictFiles.length} files with merge conflicts.`);

    // Resolve conflicts in each file
    for (const filePath of conflictFiles) {
      await resolveConflicts(filePath);
    }

    console.log('✅ All merge conflicts resolved.');
  } catch (error) {
    console.error('❌ Error resolving merge conflicts:', error);
    process.exit(1);
  }
}

main();

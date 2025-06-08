#!/usr/bin/env node

/**
 * Script to fix verification schema path issues
 *
 * This script ensures the verification schema is properly created in the dist directory
 * to avoid module resolution issues.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.join(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');

// Paths for verification schema
const sourceSchemaDir = path.join(serverRoot, 'routes', 'components', 'verification');
const sourceSchemaFile = path.join(sourceSchemaDir, 'verification.schema.js');
const targetSchemaDir = path.join(distDir, 'routes', 'components', 'verification');
const targetSchemaFile = path.join(targetSchemaDir, 'verification.schema.js');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

async function ensureDirectoryExists(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
    console.log(`${colors.green}✓${colors.reset} Directory created: ${dir}`);
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to create directory: ${dir}`, error);
    throw error;
  }
}

async function copyFile(source, target) {
  try {
    await fs.copyFile(source, target);
    console.log(`${colors.green}✓${colors.reset} File copied: ${target}`);
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to copy file: ${target}`, error);
    throw error;
  }
}

async function main() {
  try {
    console.log(`${colors.yellow}⚠${colors.reset} Fixing verification schema paths...`);

    // Create the target directory structure
    await ensureDirectoryExists(targetSchemaDir);

    // Copy the verification schema file
    await copyFile(sourceSchemaFile, targetSchemaFile);

    console.log(`${colors.green}✓${colors.reset} Verification schema fix completed successfully!`);
  } catch (error) {
    console.error(`${colors.red}✗${colors.reset} Failed to fix verification schema:`, error);
    process.exit(1);
  }
}

main();

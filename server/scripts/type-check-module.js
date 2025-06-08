#!/usr/bin/env node

/**
 * Type Check Module Script
 *
 * This script performs isolated type checking on specific modules
 * to help diagnose TypeScript errors and isolate compatibility issues.
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Parse command line arguments
const args = process.argv.slice(2);
const modulePath = args[0];
const verbose = args.includes('--verbose') || args.includes('-v');

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
${colors.blue}Type Check Module Script${colors.reset}

Usage:
  node scripts/type-check-module.js <module-path> [options]

Arguments:
  module-path             Path to the module to type check (relative to server root)

Options:
  --verbose, -v           Show verbose output
  --help, -h              Show this help message

Examples:
  node scripts/type-check-module.js controllers/travel.controller.ts
  node scripts/type-check-module.js middleware/validators/travel.validator.ts --verbose
`);
}

// Show help if requested
if (args.includes('--help') || args.includes('-h') || !modulePath) {
  printUsage();
  process.exit(0);
}

/**
 * Create a temporary tsconfig file for type checking
 */
async function createTemporaryTsConfig(filePath) {
  const tmpDir = path.join(serverRoot, 'tmp');
  const tmpTsConfigPath = path.join(tmpDir, 'tsconfig.typecheck.json');

  try {
    // Ensure tmp directory exists
    await fs.mkdir(tmpDir, { recursive: true });

    // Create a specialized tsconfig for this file
    const tsConfig = {
      extends: '../tsconfig.json',
      compilerOptions: {
        noEmit: true,
        skipLibCheck: true,
        isolatedModules: true,
      },
      include: [filePath],
    };

    await fs.writeFile(tmpTsConfigPath, JSON.stringify(tsConfig, null, 2));
    return tmpTsConfigPath;
  } catch (error) {
    console.error(
      `${colors.red}❌${colors.reset} Failed to create temporary tsconfig: ${error.message}`
    );
    return null;
  }
}

/**
 * Type check a single file
 */
async function typeCheckFile(filePath) {
  const absolutePath = path.resolve(serverRoot, filePath);

  try {
    // Check if file exists
    await fs.access(absolutePath);
  } catch (error) {
    console.error(`${colors.red}❌${colors.reset} File not found: ${filePath}`);
    return false;
  }

  console.log(`${colors.blue}🔍${colors.reset} Type checking: ${filePath}`);

  // Create temporary tsconfig
  const tmpTsConfigPath = await createTemporaryTsConfig(filePath);
  if (!tmpTsConfigPath) return false;

  try {
    // Run TypeScript compiler for type checking
    const tscCommand = `npx tsc --project ${tmpTsConfigPath} ${verbose ? '--diagnostics --listEmittedFiles --traceResolution' : ''}`;
    console.log(`${colors.cyan}⚙️${colors.reset} Running: ${tscCommand}`);

    const output = execSync(tscCommand, {
      cwd: serverRoot,
      stdio: verbose ? 'inherit' : 'pipe',
      encoding: 'utf-8',
    });

    if (verbose && output) {
      console.log(output);
    }

    console.log(`${colors.green}✅${colors.reset} Type check passed for ${filePath}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}❌${colors.reset} Type check failed for ${filePath}`);

    if (!verbose) {
      console.log(
        `${colors.yellow}ℹ️${colors.reset} Re-run with --verbose for detailed error information.`
      );
    } else if (error.stdout) {
      console.error(error.stdout.toString());
    }

    return false;
  } finally {
    // Clean up
    try {
      await fs.unlink(tmpTsConfigPath);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    if (!modulePath.endsWith('.ts')) {
      console.warn(
        `${colors.yellow}⚠️${colors.reset} Warning: File doesn't have .ts extension, adding it.`
      );
      modulePath = modulePath.endsWith('.js')
        ? modulePath.replace('.js', '.ts')
        : `${modulePath}.ts`;
    }

    const success = await typeCheckFile(modulePath);
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`${colors.red}❌${colors.reset} Unhandled error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();

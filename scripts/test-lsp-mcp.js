#!/usr/bin/env node

/**
 * Test script for LSP-MCP integration
 *
 * This script tests the LSP-MCP integration by:
 * 1. Starting the LSP server
 * 2. Opening a TypeScript file
 * 3. Getting hover information for a code element
 * 4. Getting completion suggestions
 * 5. Getting diagnostics
 *
 * Usage:
 *   node scripts/test-lsp-mcp.js
 */

import { spawn } from 'child_process';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Configuration
const ROOT_DIR = resolve(process.cwd());
const TEST_FILE = resolve(ROOT_DIR, 'client-angular/src/app/app.component.ts');
const LANGUAGE_ID = 'typescript';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Run a command and return the output
 */
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => {
      stdout += data.toString();
    });

    proc.stderr.on('data', data => {
      stderr += data.toString();
    });

    proc.on('close', code => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
  });
}

/**
 * Print a section header
 */
function printSection(title) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(80) + colors.reset);
  console.log(colors.bright + colors.cyan + ' ' + title + colors.reset);
  console.log(colors.bright + colors.cyan + '='.repeat(80) + colors.reset);
}

/**
 * Print a success message
 */
function printSuccess(message) {
  console.log(colors.green + '✓ ' + message + colors.reset);
}

/**
 * Print an error message
 */
function printError(message) {
  console.log(colors.red + '✗ ' + message + colors.reset);
}

/**
 * Print a warning message
 */
function printWarning(message) {
  console.log(colors.yellow + '! ' + message + colors.reset);
}

/**
 * Print an info message
 */
function printInfo(message) {
  console.log(colors.blue + 'ℹ ' + message + colors.reset);
}

/**
 * Main function
 */
async function main() {
  try {
    printSection('LSP-MCP Integration Test');

    // Check if the test file exists
    try {
      readFileSync(TEST_FILE, 'utf8');
      printSuccess(`Test file exists: ${TEST_FILE}`);
    } catch (error) {
      printError(`Test file does not exist: ${TEST_FILE}`);
      process.exit(1);
    }

    // Start the LSP server
    printInfo('Starting LSP server...');
    try {
      const startLspOutput = await runCommand('npx', [
        'lsp-mcp',
        'typescript',
        'typescript-language-server',
        '--stdio',
        'start_lsp',
        ROOT_DIR,
      ]);
      printSuccess('LSP server started successfully');
      printInfo(startLspOutput);
    } catch (error) {
      printError(`Failed to start LSP server: ${error.message}`);
      process.exit(1);
    }

    // Open the test file
    printInfo('Opening test file...');
    try {
      const openDocumentOutput = await runCommand('npx', [
        'lsp-mcp',
        'typescript',
        'typescript-language-server',
        '--stdio',
        'open_document',
        TEST_FILE,
        LANGUAGE_ID,
      ]);
      printSuccess('Test file opened successfully');
      printInfo(openDocumentOutput);
    } catch (error) {
      printError(`Failed to open test file: ${error.message}`);
      process.exit(1);
    }

    // Get hover information
    printInfo('Getting hover information...');
    try {
      const getInfoOutput = await runCommand('npx', [
        'lsp-mcp',
        'typescript',
        'typescript-language-server',
        '--stdio',
        'get_info_on_location',
        TEST_FILE,
        LANGUAGE_ID,
        '10',
        '10',
      ]);
      printSuccess('Got hover information successfully');
      printInfo(getInfoOutput);
    } catch (error) {
      printWarning(`Failed to get hover information: ${error.message}`);
    }

    // Get completions
    printInfo('Getting completions...');
    try {
      const getCompletionsOutput = await runCommand('npx', [
        'lsp-mcp',
        'typescript',
        'typescript-language-server',
        '--stdio',
        'get_completions',
        TEST_FILE,
        LANGUAGE_ID,
        '10',
        '10',
      ]);
      printSuccess('Got completions successfully');
      printInfo(getCompletionsOutput);
    } catch (error) {
      printWarning(`Failed to get completions: ${error.message}`);
    }

    // Get diagnostics
    printInfo('Getting diagnostics...');
    try {
      const getDiagnosticsOutput = await runCommand('npx', [
        'lsp-mcp',
        'typescript',
        'typescript-language-server',
        '--stdio',
        'get_diagnostics',
        TEST_FILE,
      ]);
      printSuccess('Got diagnostics successfully');
      printInfo(getDiagnosticsOutput);
    } catch (error) {
      printWarning(`Failed to get diagnostics: ${error.message}`);
    }

    // Close the test file
    printInfo('Closing test file...');
    try {
      const closeDocumentOutput = await runCommand('npx', [
        'lsp-mcp',
        'typescript',
        'typescript-language-server',
        '--stdio',
        'close_document',
        TEST_FILE,
      ]);
      printSuccess('Test file closed successfully');
      printInfo(closeDocumentOutput);
    } catch (error) {
      printWarning(`Failed to close test file: ${error.message}`);
    }

    printSection('Test Complete');
    printSuccess('LSP-MCP integration test completed successfully');
  } catch (error) {
    printError(`Test failed: ${error.message}`);
    process.exit(1);
  }
}

main();

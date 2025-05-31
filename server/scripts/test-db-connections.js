/**
 * Database Connection Test Script
 *
 * This script tests the connections to both the main and secondary databases.
 * It can be used to verify that the database configuration is working correctly.
 *
 * Usage:
 *   node test-db-connections.js
 */

import 'dotenv/config';
import dbService from '../config/db.js';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Display a formatted header
 * @param {string} text - Header text
 */
function printHeader(text) {
  console.log('\n' + colors.bright + colors.cyan + '='.repeat(60) + colors.reset);
  console.log(colors.bright + colors.cyan + ` ${text} ` + colors.reset);
  console.log(colors.bright + colors.cyan + '='.repeat(60) + colors.reset + '\n');
}

/**
 * Display a success message
 * @param {string} message - Success message
 */
function printSuccess(message) {
  console.log(colors.green + '✓ ' + message + colors.reset);
}

/**
 * Display an error message
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
function printError(message, error) {
  console.log(colors.red + '✗ ' + message + colors.reset);
  if (error) {
    console.log(colors.red + '  Error: ' + error.message + colors.reset);
  }
}

/**
 * Display an info message
 * @param {string} message - Info message
 */
function printInfo(message) {
  console.log(colors.blue + 'ℹ ' + message + colors.reset);
}

/**
 * Test the database connections
 */
async function testConnections() {
  printHeader('Database Connection Test');

  try {
    // Print environment variables (sanitized)
    printInfo('Environment Variables:');
    console.log(`  MONGODB_URI: ${process.env.MONGODB_URI ? '********' : 'Not set'}`);
    console.log(`  DATABASE1_URI: ${process.env.DATABASE1_URI ? '********' : 'Not set'}`);
    console.log();

    printInfo('Initializing connections...');
    const start = Date.now();

    // Initialize all connections
    const _connections = await dbService.initializeAllConnections();

    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    printSuccess(`All connections initialized in ${elapsed}s`);

    // Get connection status
    const status = dbService.getConnectionStatus();

    printInfo('Connection Status:');
    console.log(
      `  Main Database: ${status.main.connected ? colors.green + 'Connected' + colors.reset : colors.red + 'Disconnected' + colors.reset}`
    );
    console.log(
      `  Database1: ${status.database1.connected ? colors.green + 'Connected' + colors.reset : colors.red + 'Disconnected' + colors.reset}`
    );

    if (status.main.logs && status.main.logs.length > 0) {
      printInfo('Recent Main Database Logs:');
      status.main.logs.forEach(log => {
        const color = log.type === 'error' ? colors.red : colors.reset;
        console.log(
          `  [${new Date(log.timestamp).toLocaleTimeString()}] ${color}${log.message}${colors.reset}`
        );
      });
    }

    // Close all connections
    printInfo('Closing connections...');
    await dbService.closeAllConnections();
    printSuccess('All connections closed');
  } catch (error) {
    printError('Failed to test database connections', error);
    process.exit(1);
  }
}

// Run the test
testConnections()
  .then(() => {
    printHeader('Test Complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });

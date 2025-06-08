#!/usr/bin/env node

/**
 * Validation script for TypeScript-compatible server
 *
 * This script tests various aspects of the server to ensure it's working properly:
 * 1. Server starts correctly
 * 2. Routes respond as expected
 * 3. Middleware functions properly
 */

import http from 'node:http';
import { execSync } from 'child_process';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.join(__dirname, '..');

// Server configuration
const SERVER_PORT = process.env.PORT || 3000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
const SERVER_START_TIMEOUT = 5000; // 5 seconds

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Test endpoints
const endpoints = [
  { url: '/health', method: 'GET', expectedStatus: 200, name: 'Health check' },
  { url: '/api/v1/ads', method: 'GET', expectedStatus: 200, name: 'List ads' },
  {
    url: '/api/v1/travel/location?longitude=10&latitude=59',
    method: 'GET',
    expectedStatus: 200,
    name: 'Travel by location',
  },
  { url: '/non-existent-path', method: 'GET', expectedStatus: 404, name: '404 handler' },
];

// Helper to make HTTP requests
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ statusCode: res.statusCode, headers: res.headers, body: json });
        } catch (error) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Log with colors
function log(message, type = 'info') {
  const prefix =
    {
      info: `${colors.blue}[INFO]${colors.reset}`,
      success: `${colors.green}[SUCCESS]${colors.reset}`,
      error: `${colors.red}[ERROR]${colors.reset}`,
      warning: `${colors.yellow}[WARNING]${colors.reset}`,
      test: `${colors.cyan}[TEST]${colors.reset}`,
    }[type] || `${colors.blue}[INFO]${colors.reset}`;

  console.log(`${prefix} ${message}`);
}

// Start server process
async function startServer() {
  log('Starting server for validation...');

  // Start the server in a separate process
  const serverProcess = execSync('npm start', {
    stdio: 'pipe',
    cwd: serverRoot,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: SERVER_PORT,
    },
    detached: true,
  });

  // Give the server time to start
  log(`Waiting ${SERVER_START_TIMEOUT}ms for server to start...`);
  await setTimeout(SERVER_START_TIMEOUT);

  return serverProcess;
}

// Run tests against the server
async function runTests() {
  let passedTests = 0;
  let failedTests = 0;

  for (const endpoint of endpoints) {
    log(`Testing endpoint: ${endpoint.name} (${endpoint.method} ${endpoint.url})`, 'test');

    try {
      const response = await makeRequest(`${SERVER_URL}${endpoint.url}`, endpoint.method);

      if (response.statusCode === endpoint.expectedStatus) {
        log(`✓ ${endpoint.name} responded with expected status ${response.statusCode}`, 'success');
        passedTests++;
      } else {
        log(
          `✗ ${endpoint.name} responded with status ${response.statusCode}, expected ${endpoint.expectedStatus}`,
          'error'
        );
        failedTests++;
      }
    } catch (error) {
      log(`✗ ${endpoint.name} test failed: ${error.message}`, 'error');
      failedTests++;
    }
  }

  // Summary
  log('\n=== Test Results ===');
  log(`Total tests: ${endpoints.length}`);
  log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  log(`${colors.red}Failed: ${failedTests}${colors.reset}`);

  return failedTests === 0;
}

// Main function
async function main() {
  try {
    const distPath = path.join(serverRoot, 'dist');
    if (!fs.existsSync(distPath)) {
      log('No dist directory found. Please run the build script first.', 'error');
      process.exit(1);
    }

    // Start the server
    const serverProcess = await startServer();

    log('Server started successfully', 'success');

    // Run the tests
    const allTestsPassed = await runTests();

    // Cleanup
    if (serverProcess && serverProcess.pid) {
      process.kill(-serverProcess.pid);
    }

    // Exit with appropriate code
    process.exit(allTestsPassed ? 0 : 1);
  } catch (error) {
    log(`Validation failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  process.exit(1);
});

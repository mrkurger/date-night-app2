#!/usr/bin/env node

/**
 * Development server startup script with port fallback logic
 * Tries port 3000 first, then falls back to 3001 if needed
 */

const { spawn } = require('child_process');
const net = require('net');

async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    server.on('error', () => {
      resolve(false);
    });
  });
}

async function startDevServer() {
  const primaryPort = 3000;
  const fallbackPort = 3001;
  
  console.log(`Checking if port ${primaryPort} is available...`);
  const isPrimaryAvailable = await isPortAvailable(primaryPort);
  
  let port = primaryPort;
  let command = 'npm';
  let args = ['run', 'dev'];
  
  if (!isPrimaryAvailable) {
    console.log(`Port ${primaryPort} is not available, trying port ${fallbackPort}...`);
    const isFallbackAvailable = await isPortAvailable(fallbackPort);
    
    if (isFallbackAvailable) {
      port = fallbackPort;
      args = ['run', 'dev', '--', '--port', fallbackPort.toString()];
      console.log(`Using fallback port ${fallbackPort}`);
    } else {
      console.error(`Both ports ${primaryPort} and ${fallbackPort} are unavailable!`);
      process.exit(1);
    }
  } else {
    console.log(`Using primary port ${primaryPort}`);
  }
  
  // Set environment variable for Playwright to use
  process.env.PLAYWRIGHT_BASE_URL = `http://localhost:${port}`;
  
  console.log(`Starting development server on port ${port}...`);
  console.log(`PLAYWRIGHT_BASE_URL set to: ${process.env.PLAYWRIGHT_BASE_URL}`);
  
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true
  });
  
  child.on('error', (error) => {
    console.error('Failed to start development server:', error);
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    console.log(`Development server exited with code ${code}`);
    process.exit(code);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down development server...');
    child.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\nShutting down development server...');
    child.kill('SIGTERM');
  });
}

startDevServer().catch((error) => {
  console.error('Error starting development server:', error);
  process.exit(1);
});

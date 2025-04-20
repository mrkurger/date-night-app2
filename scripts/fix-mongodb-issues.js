#!/usr/bin/env node

/**
 * Script to diagnose and fix common MongoDB issues
 */

import { exec, execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
require('dotenv').config();

// Get MongoDB data path from .env or use default
const dbPath = process.env.DB_PATH || './data/db';
const absoluteDbPath = path.resolve(process.cwd(), dbPath);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}MongoDB Diagnostic and Repair Tool${colors.reset}`);
console.log(`${colors.cyan}=================================${colors.reset}\n`);

// Check MongoDB version
function checkMongoDBVersion() {
  return new Promise((resolve) => {
    exec('mongod --version', (error, stdout, stderr) => {
      if (error) {
        console.log(`${colors.red}MongoDB is not installed or not in PATH${colors.reset}`);
        console.log(`${colors.yellow}Please install MongoDB: https://www.mongodb.com/try/download/community${colors.reset}`);
        resolve(false);
      } else {
        const versionMatch = stdout.match(/db version v(\d+\.\d+\.\d+)/);
        if (versionMatch && versionMatch[1]) {
          console.log(`${colors.green}MongoDB version: ${versionMatch[1]}${colors.reset}`);
          resolve(true);
        } else {
          console.log(`${colors.yellow}MongoDB is installed but version could not be determined${colors.reset}`);
          resolve(true);
        }
      }
    });
  });
}

// Check if MongoDB is running
function checkMongoDBRunning() {
  return new Promise((resolve) => {
    exec('pgrep mongod', (error, stdout, stderr) => {
      if (error || !stdout) {
        console.log(`${colors.yellow}MongoDB is not running${colors.reset}`);
        resolve(false);
      } else {
        console.log(`${colors.green}MongoDB is running with PID: ${stdout.trim()}${colors.reset}`);
        resolve(true);
      }
    });
  });
}

// Check data directory permissions and structure
function checkDataDirectory() {
  console.log(`\n${colors.cyan}Checking data directory: ${absoluteDbPath}${colors.reset}`);
  
  // Check if directory exists
  if (!fs.existsSync(absoluteDbPath)) {
    console.log(`${colors.yellow}Data directory does not exist. Creating it...${colors.reset}`);
    try {
      fs.mkdirSync(absoluteDbPath, { recursive: true });
      console.log(`${colors.green}Created data directory: ${absoluteDbPath}${colors.reset}`);
    } catch (err) {
      console.log(`${colors.red}Failed to create data directory: ${err.message}${colors.reset}`);
      return false;
    }
  }
  
  // Check directory permissions
  try {
    const stats = fs.statSync(absoluteDbPath);
    const permissions = stats.mode & 0o777;
    console.log(`${colors.blue}Directory permissions: ${permissions.toString(8)}${colors.reset}`);
    
    // Check if current user has write permissions
    try {
      const testFile = path.join(absoluteDbPath, '.permissions-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log(`${colors.green}Current user has write permissions to the data directory${colors.reset}`);
    } catch (err) {
      console.log(`${colors.red}Current user does not have write permissions to the data directory${colors.reset}`);
      console.log(`${colors.yellow}Attempting to fix permissions...${colors.reset}`);
      
      try {
        if (os.platform() !== 'win32') {
          execSync(`chmod -R 755 "${absoluteDbPath}"`);
          console.log(`${colors.green}Fixed permissions on data directory${colors.reset}`);
        } else {
          console.log(`${colors.yellow}On Windows, please run the application as administrator or manually set permissions${colors.reset}`);
        }
      } catch (err) {
        console.log(`${colors.red}Failed to fix permissions: ${err.message}${colors.reset}`);
        return false;
      }
    }
  } catch (err) {
    console.log(`${colors.red}Failed to check directory permissions: ${err.message}${colors.reset}`);
    return false;
  }
  
  return true;
}

// Check for lock files
function checkLockFiles() {
  console.log(`\n${colors.cyan}Checking for lock files${colors.reset}`);
  
  const lockFile = path.join(absoluteDbPath, 'mongod.lock');
  if (fs.existsSync(lockFile)) {
    console.log(`${colors.yellow}Found lock file: ${lockFile}${colors.reset}`);
    console.log(`${colors.yellow}This may indicate MongoDB did not shut down properly${colors.reset}`);
    
    try {
      fs.unlinkSync(lockFile);
      console.log(`${colors.green}Removed lock file${colors.reset}`);
    } catch (err) {
      console.log(`${colors.red}Failed to remove lock file: ${err.message}${colors.reset}`);
      return false;
    }
  } else {
    console.log(`${colors.green}No lock files found${colors.reset}`);
  }
  
  return true;
}

// Repair database
function repairDatabase() {
  console.log(`\n${colors.cyan}Attempting to repair database${colors.reset}`);
  
  return new Promise((resolve) => {
    const repair = spawn('mongod', ['--repair', '--dbpath', absoluteDbPath]);
    
    repair.stdout.on('data', (data) => {
      console.log(`${colors.blue}${data.toString().trim()}${colors.reset}`);
    });
    
    repair.stderr.on('data', (data) => {
      console.log(`${colors.yellow}${data.toString().trim()}${colors.reset}`);
    });
    
    repair.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}Database repair completed successfully${colors.reset}`);
        resolve(true);
      } else {
        console.log(`${colors.red}Database repair failed with code ${code}${colors.reset}`);
        resolve(false);
      }
    });
  });
}

// Start MongoDB with verbose logging
function startMongoDBVerbose() {
  console.log(`\n${colors.cyan}Starting MongoDB with verbose logging${colors.reset}`);
  
  return new Promise((resolve) => {
    const mongod = spawn('mongod', ['--dbpath', absoluteDbPath, '--fork', '--logpath', path.join(process.cwd(), 'mongodb.log'), '--logappend']);
    
    mongod.stdout.on('data', (data) => {
      console.log(`${colors.blue}${data.toString().trim()}${colors.reset}`);
    });
    
    mongod.stderr.on('data', (data) => {
      console.log(`${colors.yellow}${data.toString().trim()}${colors.reset}`);
    });
    
    mongod.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}MongoDB started successfully${colors.reset}`);
        console.log(`${colors.blue}Log file: ${path.join(process.cwd(), 'mongodb.log')}${colors.reset}`);
        resolve(true);
      } else {
        console.log(`${colors.red}MongoDB failed to start with code ${code}${colors.reset}`);
        resolve(false);
      }
    });
  });
}

// Main function
async function main() {
  console.log(`${colors.blue}Starting MongoDB diagnostics...${colors.reset}`);
  
  // Check MongoDB installation
  const isInstalled = await checkMongoDBVersion();
  if (!isInstalled) {
    console.log(`${colors.red}MongoDB is not installed. Please install MongoDB first.${colors.reset}`);
    process.exit(1);
  }
  
  // Check if MongoDB is running
  const isRunning = await checkMongoDBRunning();
  if (isRunning) {
    console.log(`${colors.yellow}MongoDB is already running. Stopping it for diagnostics...${colors.reset}`);
    try {
      if (os.platform() === 'win32') {
        execSync('taskkill /F /IM mongod.exe');
      } else {
        execSync('pkill mongod');
      }
      console.log(`${colors.green}MongoDB stopped successfully${colors.reset}`);
    } catch (err) {
      console.log(`${colors.red}Failed to stop MongoDB: ${err.message}${colors.reset}`);
      console.log(`${colors.yellow}Please stop MongoDB manually and run this script again${colors.reset}`);
      process.exit(1);
    }
  }
  
  // Check data directory
  const dirOk = checkDataDirectory();
  if (!dirOk) {
    console.log(`${colors.red}Data directory issues could not be resolved${colors.reset}`);
    process.exit(1);
  }
  
  // Check for lock files
  const lockOk = checkLockFiles();
  if (!lockOk) {
    console.log(`${colors.red}Lock file issues could not be resolved${colors.reset}`);
    process.exit(1);
  }
  
  // Repair database
  const repairOk = await repairDatabase();
  if (!repairOk) {
    console.log(`${colors.yellow}Database repair had issues, but we'll try to start MongoDB anyway${colors.reset}`);
  }
  
  // Start MongoDB with verbose logging
  const startOk = await startMongoDBVerbose();
  if (startOk) {
    console.log(`\n${colors.green}MongoDB diagnostic and repair completed successfully${colors.reset}`);
    console.log(`${colors.green}MongoDB is now running with the repaired database${colors.reset}`);
  } else {
    console.log(`\n${colors.red}MongoDB could not be started after repairs${colors.reset}`);
    console.log(`${colors.yellow}Please check the MongoDB log file for more details${colors.reset}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(err => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, err);
  process.exit(1);
});
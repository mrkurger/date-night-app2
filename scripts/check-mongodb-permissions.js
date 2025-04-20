#!/usr/bin/env node

/**
 * Script to check and fix MongoDB data directory permissions
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Get MongoDB data path from .env or use default
const dbPath = process.env.DB_PATH || './data/db';
const absoluteDbPath = path.resolve(process.cwd(), dbPath);

console.log(`${colors.blue}MongoDB Data Directory Permission Check${colors.reset}`);
console.log(`${colors.blue}=====================================${colors.reset}\n`);

// Check if directory exists
if (!fs.existsSync(absoluteDbPath)) {
  console.log(`${colors.yellow}Data directory does not exist: ${absoluteDbPath}${colors.reset}`);
  console.log(`${colors.blue}Creating directory...${colors.reset}`);
  
  try {
    fs.mkdirSync(absoluteDbPath, { recursive: true });
    console.log(`${colors.green}Directory created successfully.${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}Failed to create directory: ${err.message}${colors.reset}`);
    process.exit(1);
  }
}

// Get directory stats
try {
  const stats = fs.statSync(absoluteDbPath);
  
  // Get current user and group
  let currentUser = '';
  let currentGroup = '';
  
  if (os.platform() !== 'win32') {
    try {
      currentUser = execSync('whoami').toString().trim();
      currentGroup = execSync('id -gn').toString().trim();
    } catch (err) {
      console.log(`${colors.yellow}Could not determine current user/group: ${err.message}${colors.reset}`);
    }
  }
  
  console.log(`${colors.blue}Directory: ${absoluteDbPath}${colors.reset}`);
  console.log(`${colors.blue}Exists: Yes${colors.reset}`);
  
  if (os.platform() !== 'win32') {
    // On Unix-like systems, show permissions in octal format
    const permissions = stats.mode & 0o777;
    console.log(`${colors.blue}Permissions: ${permissions.toString(8)} (octal)${colors.reset}`);
    
    // Show owner and group
    try {
      const owner = execSync(`ls -ld "${absoluteDbPath}" | awk '{print $3}'`).toString().trim();
      const group = execSync(`ls -ld "${absoluteDbPath}" | awk '{print $4}'`).toString().trim();
      
      console.log(`${colors.blue}Owner: ${owner}${colors.reset}`);
      console.log(`${colors.blue}Group: ${group}${colors.reset}`);
      console.log(`${colors.blue}Current user: ${currentUser}${colors.reset}`);
      console.log(`${colors.blue}Current group: ${currentGroup}${colors.reset}`);
      
      // Check if current user is the owner
      if (owner !== currentUser) {
        console.log(`${colors.yellow}Warning: The directory is not owned by the current user.${colors.reset}`);
      }
    } catch (err) {
      console.log(`${colors.yellow}Could not determine owner/group: ${err.message}${colors.reset}`);
    }
  } else {
    // On Windows, just show that we can't display Unix-style permissions
    console.log(`${colors.blue}Permissions: Windows permissions model (not displayed)${colors.reset}`);
  }
  
  // Test write permissions
  console.log(`\n${colors.blue}Testing write permissions...${colors.reset}`);
  const testFile = path.join(absoluteDbPath, '.permissions-test');
  
  try {
    fs.writeFileSync(testFile, 'test');
    console.log(`${colors.green}Write test: Success${colors.reset}`);
    
    try {
      fs.unlinkSync(testFile);
      console.log(`${colors.green}Delete test: Success${colors.reset}`);
    } catch (err) {
      console.log(`${colors.red}Delete test: Failed - ${err.message}${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.red}Write test: Failed - ${err.message}${colors.reset}`);
    
    // Try to fix permissions
    console.log(`\n${colors.yellow}Attempting to fix permissions...${colors.reset}`);
    
    if (os.platform() !== 'win32') {
      try {
        // On Unix-like systems, change permissions and ownership
        execSync(`chmod -R 755 "${absoluteDbPath}"`);
        console.log(`${colors.green}Changed permissions to 755${colors.reset}`);
        
        // Try to change ownership if we're running with sudo
        if (process.getuid && process.getuid() === 0) {
          execSync(`chown -R ${currentUser}:${currentGroup} "${absoluteDbPath}"`);
          console.log(`${colors.green}Changed ownership to ${currentUser}:${currentGroup}${colors.reset}`);
        } else {
          console.log(`${colors.yellow}Not running as root, cannot change ownership.${colors.reset}`);
          console.log(`${colors.yellow}You may need to run: sudo chown -R ${currentUser}:${currentGroup} "${absoluteDbPath}"${colors.reset}`);
        }
        
        // Test again
        try {
          fs.writeFileSync(testFile, 'test');
          console.log(`${colors.green}Write test after fix: Success${colors.reset}`);
          
          try {
            fs.unlinkSync(testFile);
            console.log(`${colors.green}Delete test after fix: Success${colors.reset}`);
          } catch (err) {
            console.log(`${colors.red}Delete test after fix: Failed - ${err.message}${colors.reset}`);
          }
        } catch (err) {
          console.log(`${colors.red}Write test after fix: Failed - ${err.message}${colors.reset}`);
          console.log(`${colors.red}You may need to manually fix permissions or run this script with sudo.${colors.reset}`);
        }
      } catch (err) {
        console.log(`${colors.red}Failed to fix permissions: ${err.message}${colors.reset}`);
      }
    } else {
      // On Windows, provide guidance
      console.log(`${colors.yellow}On Windows, you need to ensure the current user has full control of the directory.${colors.reset}`);
      console.log(`${colors.yellow}Right-click the folder, select Properties > Security > Edit, and add your user with Full Control.${colors.reset}`);
    }
  }
  
  // Check for lock files
  console.log(`\n${colors.blue}Checking for lock files...${colors.reset}`);
  const lockFile = path.join(absoluteDbPath, 'mongod.lock');
  
  if (fs.existsSync(lockFile)) {
    console.log(`${colors.yellow}Found lock file: ${lockFile}${colors.reset}`);
    
    try {
      fs.unlinkSync(lockFile);
      console.log(`${colors.green}Removed lock file${colors.reset}`);
    } catch (err) {
      console.log(`${colors.red}Failed to remove lock file: ${err.message}${colors.reset}`);
    }
  } else {
    console.log(`${colors.green}No lock files found${colors.reset}`);
  }
  
  // Final recommendations
  console.log(`\n${colors.magenta}Recommendations:${colors.reset}`);
  
  if (os.platform() !== 'win32') {
    console.log(`${colors.magenta}1. Ensure MongoDB data directory has permissions 755 (rwxr-xr-x)${colors.reset}`);
    console.log(`${colors.magenta}2. Ensure the directory is owned by the user running the application${colors.reset}`);
    console.log(`${colors.magenta}3. If using MongoDB from a package manager, you may need to add your user to the 'mongodb' group:${colors.reset}`);
    console.log(`${colors.magenta}   sudo usermod -aG mongodb ${currentUser}${colors.reset}`);
  } else {
    console.log(`${colors.magenta}1. Ensure your user account has Full Control permissions on the data directory${colors.reset}`);
    console.log(`${colors.magenta}2. Run the application as Administrator if you continue to have issues${colors.reset}`);
  }
  
  console.log(`\n${colors.green}Check complete.${colors.reset}`);
} catch (err) {
  console.error(`${colors.red}Error checking directory: ${err.message}${colors.reset}`);
  process.exit(1);
}
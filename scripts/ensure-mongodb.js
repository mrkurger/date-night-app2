import { exec, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

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
};

/**
 * Ensure the data directory exists and has proper permissions
 */
function ensureDataDirectory() {
  // Create directory if it doesn't exist
  if (!fs.existsSync(absoluteDbPath)) {
    console.log(`${colors.blue}Creating MongoDB data directory: ${absoluteDbPath}${colors.reset}`);
    try {
      fs.mkdirSync(absoluteDbPath, { recursive: true });
    } catch (err) {
      console.error(`${colors.red}Failed to create data directory: ${err.message}${colors.reset}`);
      throw err;
    }
  }

  // Check directory permissions
  try {
    // Try to write a test file to check permissions
    const testFile = path.join(absoluteDbPath, '.permissions-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
  } catch (err) {
    console.log(`${colors.yellow}Fixing permissions on data directory...${colors.reset}`);
    try {
      // On Unix-like systems, fix permissions
      if (os.platform() !== 'win32') {
        exec(`chmod -R 755 "${absoluteDbPath}"`);
      } else {
        console.log(
          `${colors.yellow}On Windows, please ensure you have proper permissions to the data directory${colors.reset}`
        );
      }
    } catch (permErr) {
      console.error(`${colors.red}Failed to fix permissions: ${permErr.message}${colors.reset}`);
    }
  }

  // Check for and remove lock files if MongoDB is not running
  const lockFile = path.join(absoluteDbPath, 'mongod.lock');
  if (fs.existsSync(lockFile)) {
    console.log(`${colors.yellow}Found lock file. Removing it...${colors.reset}`);
    try {
      fs.unlinkSync(lockFile);
    } catch (err) {
      console.error(`${colors.red}Failed to remove lock file: ${err.message}${colors.reset}`);
    }
  }
}

/**
 * Check if MongoDB is already running
 */
function checkMongoDBRunning() {
  return new Promise(resolve => {
    const cmd =
      os.platform() === 'win32' ? 'tasklist /FI "IMAGENAME eq mongod.exe"' : 'pgrep mongod';

    exec(cmd, (error, stdout, stderr) => {
      if (os.platform() === 'win32') {
        // On Windows, check if mongod.exe is in the output
        if (stdout.includes('mongod.exe')) {
          console.log(`${colors.green}MongoDB is already running.${colors.reset}`);
          resolve(true);
          return;
        }
      } else {
        // On Unix-like systems, check if pgrep returned a PID
        if (!error && stdout.trim()) {
          console.log(`${colors.green}MongoDB is already running.${colors.reset}`);
          resolve(true);
          return;
        }
      }

      console.log(`${colors.yellow}MongoDB is not running. Starting MongoDB...${colors.reset}`);
      resolve(false);
    });
  });
}

/**
 * Start MongoDB with appropriate options
 */
function startMongoDB() {
  return new Promise((resolve, reject) => {
    console.log(`${colors.blue}Starting MongoDB with data path: ${absoluteDbPath}${colors.reset}`);

    // MongoDB command-line options
    const mongoOptions = [
      '--dbpath',
      absoluteDbPath,
      '--bind_ip',
      '127.0.0.1', // Only bind to localhost for security
    ];

    // Add fork option on Unix-like systems
    if (os.platform() !== 'win32') {
      mongoOptions.push('--fork');
      mongoOptions.push('--logpath', path.join(process.cwd(), 'mongodb.log'));
    }

    // Start MongoDB process
    const mongod = spawn('mongod', mongoOptions, {
      detached: os.platform() !== 'win32', // Only detach on Unix-like systems
      stdio: os.platform() !== 'win32' ? 'ignore' : 'pipe', // Pipe output on Windows
    });

    // Handle process events
    if (os.platform() === 'win32') {
      // On Windows, we need to capture output
      let output = '';

      mongod.stdout.on('data', data => {
        output += data.toString();
        // Check for successful startup message
        if (output.includes('waiting for connections')) {
          console.log(`${colors.green}MongoDB started successfully.${colors.reset}`);
          resolve(true);
        }
      });

      mongod.stderr.on('data', data => {
        console.error(`${colors.red}MongoDB error: ${data.toString()}${colors.reset}`);
      });

      mongod.on('error', err => {
        console.error(`${colors.red}Failed to start MongoDB: ${err.message}${colors.reset}`);
        reject(err);
      });

      mongod.on('close', code => {
        if (code !== 0) {
          console.error(`${colors.red}MongoDB exited with code ${code}${colors.reset}`);
          reject(new Error(`MongoDB exited with code ${code}`));
        }
      });

      // Set a timeout to resolve if we don't get a "waiting for connections" message
      setTimeout(() => {
        if (!output.includes('waiting for connections')) {
          console.log(
            `${colors.yellow}MongoDB may have started, but we didn't detect the startup message.${colors.reset}`
          );
          resolve(true);
        }
      }, 5000);
    } else {
      // On Unix-like systems, we're using --fork so we can unref and resolve
      mongod.unref();

      // Wait a bit to ensure MongoDB has time to start
      setTimeout(() => {
        // Double-check that MongoDB is running
        exec('pgrep mongod', (error, stdout, stderr) => {
          if (!error && stdout.trim()) {
            console.log(`${colors.green}MongoDB started successfully.${colors.reset}`);
            resolve(true);
          } else {
            console.error(
              `${colors.red}MongoDB may have failed to start. Check mongodb.log for details.${colors.reset}`
            );
            reject(new Error('MongoDB failed to start'));
          }
        });
      }, 3000);
    }
  });
}

/**
 * Ensure MongoDB is running
 */
async function ensureMongoDB() {
  try {
    // First, ensure the data directory exists and has proper permissions
    ensureDataDirectory();

    // Check if MongoDB is already running
    const isRunning = await checkMongoDBRunning();

    // If not running, start it
    if (!isRunning) {
      await startMongoDB();
    }

    return true;
  } catch (err) {
    console.error(`${colors.red}Error ensuring MongoDB is running: ${err.message}${colors.reset}`);
    console.log(
      `${colors.yellow}Try running the MongoDB repair script: node scripts/fix-mongodb-issues.js${colors.reset}`
    );
    throw err;
  }
}

// Run the function
ensureMongoDB()
  .then(() => {
    console.log(`${colors.green}MongoDB is ready.${colors.reset}`);
    process.exit(0);
  })
  .catch(err => {
    console.error(
      `${colors.red}Failed to ensure MongoDB is running: ${err.message}${colors.reset}`
    );
    process.exit(1);
  });

// Export for use in other scripts
export default ensureMongoDB;

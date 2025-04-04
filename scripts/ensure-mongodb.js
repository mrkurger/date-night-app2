const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Get MongoDB data path from .env or use default
const dbPath = process.env.DB_PATH || './data/db';
const absoluteDbPath = path.resolve(process.cwd(), dbPath);

// Ensure the data directory exists
if (!fs.existsSync(absoluteDbPath)) {
  console.log(`Creating MongoDB data directory: ${absoluteDbPath}`);
  fs.mkdirSync(absoluteDbPath, { recursive: true });
}

// Check if MongoDB is already running
function checkMongoDBRunning() {
  return new Promise((resolve) => {
    exec('pgrep mongod', (error, stdout, stderr) => {
      if (error || !stdout) {
        console.log('MongoDB is not running. Starting MongoDB...');
        resolve(false);
      } else {
        console.log('MongoDB is already running.');
        resolve(true);
      }
    });
  });
}

// Start MongoDB if not running
async function ensureMongoDB() {
  const isRunning = await checkMongoDBRunning();
  
  if (!isRunning) {
    console.log(`Starting MongoDB with data path: ${absoluteDbPath}`);
    
    // Start MongoDB as a detached process
    const mongod = spawn('mongod', ['--dbpath', absoluteDbPath], {
      detached: true,
      stdio: 'ignore'
    });
    
    // Unref the child process so it can run independently
    mongod.unref();
    
    // Wait for MongoDB to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('MongoDB started successfully.');
  }
  
  return true;
}

// If this script is run directly
if (require.main === module) {
  ensureMongoDB()
    .then(() => {
      console.log('MongoDB is ready.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Failed to start MongoDB:', err);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = ensureMongoDB;
}
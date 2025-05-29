// db.js now imports both modules safely, without circular dependency
import database from './database.js';
import database1 from './database1.js';

// Use the imported modules here
// Example usage:
// database.userModel.doSomething();
// database1.anotherModel.doSomethingElse();

// TODO: Add logic as required

/**
 * Initializes all database connections
 * @returns {Promise<Object>} - Object containing all connected databases
 */
const initializeAllConnections = async () => {
  try {
    console.log('Initializing all database connections...');

    // Connect to the main database
    const mainDb = await database.dbService.connect();

    // Connect to the secondary database
    const db1 = await database1.connect();

    console.log('✓ All database connections initialized');

    return {
      main: mainDb,
      database1: db1,
    };
  } catch (error) {
    console.error('Failed to initialize database connections:', error);
    throw error;
  }
};

/**
 * Closes all database connections
 * @returns {Promise<void>}
 */
const closeAllConnections = async () => {
  try {
    console.log('Closing all database connections...');

    // Close both database connections
    await Promise.all([database.closeDB(), database1.close()]);

    console.log('✓ All database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
    throw error;
  }
};

/**
 * Get status of all database connections
 * @returns {Object} - Status of each connection
 */
const getConnectionStatus = () => {
  return {
    main: {
      connected: database.dbService.isConnected,
      logs: database.dbService.getLogs().slice(-5), // Get the last 5 logs
    },
    database1: {
      connected: database1.isConnected(),
    },
  };
};

export default {
  database,
  database1,
  initializeAllConnections,
  closeAllConnections,
  getConnectionStatus,
};

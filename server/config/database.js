// database.js now only handles database-specific exports
// Imports shared mongoose instance from core
import mongoose from './databaseCore.js';

// Export database-specific models or helpers here
// Example: Export a user model
// import userModel from './models/user.js';
// export { userModel };

// If you have additional setup, do it here
// TODO: Add more exports as needed

// Cache for database connections
const connections = new Map();

// Default connection options
const defaultOptions = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 2, // Keep at least 2 connections open
  family: 4, // Use IPv4, skip trying IPv6
  autoIndex: true, // Build indexes
  autoCreate: true, // Create collections automatically
};

/**
 * Database connection manager
 * Provides methods for connecting to databases and managing connections
 */
class DatabaseService {
  constructor() {
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
    this.logs = [];
  }

  /**
   * Connect to MongoDB database
   * @param {string} uri - MongoDB connection URI (optional, uses config if not provided)
   * @param {Object} options - Connection options (optional)
   * @param {string} name - Connection name (optional, uses 'default' if not provided)
   * @returns {Promise<mongoose.Connection>} - Connection object
   */
  async connect(uri, options = {}, name = 'default') {
    try {
      // Use provided URI or fallback to environment variable
      const connectionUri =
        uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/date_night';

      // If connection already exists, return it
      if (connections.has(name) && mongoose.connection.readyState === 1) {
        this.log(`Using existing connection: ${name}`);
        return connections.get(name);
      }

      // Combine default options with provided options
      const connectionOptions = {
        ...defaultOptions,
        ...options,
      };

      // Connect to MongoDB
      const sanitizedUri = this.getSanitizedUri(connectionUri);
      this.log(`Connecting to MongoDB: ${sanitizedUri}`);

      const conn = await mongoose.connect(connectionUri, connectionOptions);

      // Store connection in cache
      connections.set(name, conn);
      this.isConnected = true;
      this.retryAttempts = 0;

      this.log(`✓ MongoDB Connected: ${conn.connection.host}`);

      // Set up event listeners
      this.setupEventListeners(conn, name);

      return conn;
    } catch (err) {
      this.logError(`MongoDB connection error: ${err.message}`);

      // Retry connection if not exceeding max retries
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        this.log(
          `Retrying connection (${this.retryAttempts}/${this.maxRetries}) in ${this.retryDelay / 1000}s...`
        );

        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.connect(uri, options, name);
      }

      throw new Error(
        `Failed to connect to MongoDB after ${this.maxRetries} attempts: ${err.message}`
      );
    }
  }

  /**
   * Set up event listeners for connection
   * @param {mongoose.Connection} conn - Connection object
   * @param {string} name - Connection name
   */
  setupEventListeners(conn, name) {
    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      this.log(`MongoDB disconnected: ${name}`);
    });

    mongoose.connection.on('reconnected', () => {
      this.isConnected = true;
      this.log(`MongoDB reconnected: ${name}`);
    });

    mongoose.connection.on('error', err => {
      this.logError(`MongoDB connection error: ${err.message}`);
    });
  }

  /**
   * Connect to MongoDB with retry logic
   * @param {number} retries - Number of retry attempts
   * @param {number} delay - Delay between retries in milliseconds
   * @param {string} uri - MongoDB connection URI (optional)
   * @param {Object} options - Connection options (optional)
   * @returns {Promise<mongoose.Connection>} - Connection object
   */
  async connectWithRetry(retries = 5, delay = 5000, uri = null, options = {}) {
    this.maxRetries = retries;
    this.retryDelay = delay;
    return this.connect(uri, options);
  }

  /**
   * Get a database connection
   * @param {string} name - Connection name
   * @returns {mongoose.Connection|null} - Connection object or null if not found
   */
  getConnection(name = 'default') {
    return connections.get(name) || null;
  }

  /**
   * Check if connected to database
   * @param {string} name - Connection name
   * @returns {boolean} - True if connected
   */
  isConnectedTo(name = 'default') {
    const conn = connections.get(name);
    return conn && conn.connection.readyState === 1;
  }

  /**
   * Close a database connection
   * @param {string} name - Connection name
   * @returns {Promise<void>}
   */
  async closeConnection(name = 'default') {
    try {
      const conn = connections.get(name);
      if (conn) {
        await conn.connection.close();
        connections.delete(name);
        this.log(`MongoDB connection closed: ${name}`);
      }
    } catch (err) {
      this.logError(`Error closing MongoDB connection: ${err.message}`);
      throw err;
    }
  }

  /**
   * Close all database connections
   * @returns {Promise<void>}
   */
  async closeAllConnections() {
    try {
      const closePromises = Array.from(connections.keys()).map(name => this.closeConnection(name));
      await Promise.all(closePromises);
      this.log('All MongoDB connections closed');
    } catch (err) {
      this.logError(`Error closing MongoDB connections: ${err.message}`);
      throw err;
    }
  }

  /**
   * Get sanitized URI (hiding credentials)
   * @param {string} uri - MongoDB connection URI
   * @returns {string} - Sanitized URI
   * @private
   */
  getSanitizedUri(uri) {
    return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
  }

  /**
   * Log a message
   * @param {string} message - Log message
   * @private
   */
  log(message) {
    this.logs.push({
      timestamp: new Date(),
      message,
      type: 'info',
    });
    console.log(`[Database] ${message}`);
  }

  /**
   * Log an error
   * @param {string} message - Error message
   * @private
   */
  logError(message) {
    this.logs.push({
      timestamp: new Date(),
      message,
      type: 'error',
    });
    console.error(`[Database] ${message}`);
  }

  /**
   * Get connection logs
   * @returns {Array} - Array of log entries
   */
  getLogs() {
    return this.logs;
  }
}

// Create singleton instance
const dbService = new DatabaseService();

// Alias methods for backward compatibility
const connectDB = (uri, options) => dbService.connect(uri, options);
const closeDB = () => dbService.closeAllConnections();

// Export the database service and backward-compatible methods
export default {
  connectDB,
  closeDB,
  dbService,
};

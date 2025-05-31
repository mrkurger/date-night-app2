// database1.js imports the shared mongoose instance from core, not database.js
import mongoose from './databaseCore.js';
// import config from './environment.js'; // Unused

// Cache for database connections
const connections = new Map();

/**
 * Database1 specific connection options
 * Customize these settings for this specific database
 */
const database1Options = {
  // Database specific options
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 5,
  minPoolSize: 1,
  family: 4, // Use IPv4, skip trying IPv6
  autoIndex: true, // Build indexes
  autoCreate: true, // Create collections automatically
};

/**
 * Get the connection URI for Database1
 * @returns {string} Connection URI
 */
const getDatabase1Uri = () => {
  // Use a specific environment variable for this database connection
  // or fall back to the main database with a different database name
  return (
    process.env.DATABASE1_URI ||
    process.env.MONGODB_URI?.replace(/\/[^/]+$/, '/date_night_db1') ||
    'mongodb://127.0.0.1:27017/date_night_db1'
  );
};

/**
 * Database service class for Database1
 */
class Database1Service {
  constructor() {
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
    this.logs = [];
    this.connectionName = 'database1';
  }

  /**
   * Connect to Database1
   * @param {Object} options - Additional connection options (optional)
   * @returns {Promise<mongoose.Connection>} - Connection object
   */
  async connect(options = {}) {
    try {
      const uri = getDatabase1Uri();

      // If connection already exists, return it
      if (
        connections.has(this.connectionName) &&
        connections.get(this.connectionName).readyState === 1
      ) {
        this.log(`Using existing connection: ${this.connectionName}`);
        return connections.get(this.connectionName);
      }

      // Combine default options with provided options
      const connectionOptions = {
        ...database1Options,
        ...options,
      };

      this.log(`Connecting to Database1: ${this.getSanitizedUri(uri)}`);

      // Create a new connection
      const conn = await mongoose.createConnection(uri, connectionOptions);

      // Store connection in cache
      connections.set(this.connectionName, conn);
      this.isConnected = true;
      this.retryAttempts = 0;

      this.log(`✓ Database1 Connected: ${conn.host}`);

      // Set up event listeners
      this.setupEventListeners(conn);

      return conn;
    } catch (error) {
      this.logError(`Database1 connection error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the Database1 connection
   * @returns {mongoose.Connection|null} - Connection object or null if not connected
   */
  getConnection() {
    return connections.get(this.connectionName) || null;
  }

  /**
   * Close the Database1 connection
   * @returns {Promise<void>}
   */
  async close() {
    try {
      const conn = connections.get(this.connectionName);
      if (conn) {
        await conn.close();
        connections.delete(this.connectionName);
        this.isConnected = false;
        this.log(`Database1 connection closed`);
      }
    } catch (error) {
      this.logError(`Error closing Database1 connection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if connected to Database1
   * @returns {boolean} - True if connected
   */
  isConnected() {
    const conn = connections.get(this.connectionName);
    return conn && conn.readyState === 1;
  }

  /**
   * Create a new model that uses the Database1 connection
   * @param {string} name - Model name
   * @param {mongoose.Schema} schema - Model schema
   * @returns {mongoose.Model} - Model instance
   */
  model(name, schema) {
    const connection = this.getConnection();
    if (!connection) {
      throw new Error('Cannot create model: Not connected to Database1');
    }
    return connection.model(name, schema);
  }

  /**
   * Set up event listeners for connection
   * @param {mongoose.Connection} conn - Connection object
   * @private
   */
  setupEventListeners(conn) {
    conn.on('disconnected', () => {
      this.isConnected = false;
      this.log(`Database1 disconnected`);
    });

    conn.on('reconnected', () => {
      this.isConnected = true;
      this.log(`Database1 reconnected`);
    });

    conn.on('error', err => {
      this.logError(`Database1 connection error: ${err.message}`);
    });
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
    console.log(`[Database1] ${message}`);
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
    console.error(`[Database1] ${message}`);
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
const database1Service = new Database1Service();

export default {
  connect: options => database1Service.connect(options),
  getConnection: () => database1Service.getConnection(),
  close: () => database1Service.close(),
  isConnected: () => database1Service.isConnected(),
  model: (name, schema) => database1Service.model(name, schema),
  database1Service,
};

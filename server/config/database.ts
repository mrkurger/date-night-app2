/**
 * MongoDB database connection manager
 * Handles connection, reconnection, and monitoring
 */
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

// Connection options
interface DatabaseOptions {
  uri?: string;
  autoReconnect?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

class DatabaseConnection {
  private uri: string;
  private autoReconnect: boolean;
  private maxRetries: number;
  private retryDelay: number;
  private retryCount: number;
  private isConnected: boolean;

  constructor(options: DatabaseOptions = {}) {
    this.uri = options.uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/date-night-app';
    this.autoReconnect = options.autoReconnect !== false;
    this.maxRetries = options.maxRetries || 5;
    this.retryDelay = options.retryDelay || 5000;
    this.retryCount = 0;
    this.isConnected = false;

    // Set up mongoose global configuration
    mongoose.set('strictQuery', true);

    // Set up listeners for MongoDB connection events
    this.setupConnectionListeners();
  }

  /**
   * Set up event listeners for the MongoDB connection
   */
  private setupConnectionListeners(): void {
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      this.retryCount = 0;
      logger.info('MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      logger.warn('MongoDB disconnected');

      if (this.autoReconnect && this.retryCount < this.maxRetries) {
        this.retryCount++;
        logger.info(`Attempting to reconnect to MongoDB (${this.retryCount}/${this.maxRetries})...`);
        
        // Wait before trying again
        setTimeout(() => {
          this.connect().catch((err) => {
            logger.error('MongoDB reconnection failed:', err);
          });
        }, this.retryDelay);
      } else if (this.retryCount >= this.maxRetries) {
        logger.error('Max MongoDB reconnection attempts reached. Giving up.');
      }
    });

    // Handle Node.js process termination
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
  }

  /**
   * Connect to MongoDB
   */
  public async connect(): Promise<typeof mongoose> {
    if (this.isConnected) {
      logger.info('Already connected to MongoDB');
      return mongoose;
    }

    try {
      logger.info(`Connecting to MongoDB at ${this.uri.split('@').pop()}`);

      await mongoose.connect(this.uri, {
        // Options are set automatically in new Mongoose versions
      });

      logger.info('MongoDB connection successful');
      return mongoose;
    } catch (error) {
      logger.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Gracefully shut down the database connection
   */
  private gracefulShutdown(signal: string): void {
    logger.info(`${signal} received, gracefully shutting down MongoDB connection`);
    
    this.disconnect().then(() => {
      logger.info('MongoDB connection closed gracefully');
      process.exit(0);
    }).catch((err) => {
      logger.error('Error during MongoDB graceful shutdown:', err);
      process.exit(1);
    });
  }

  /**
   * Get the connection status
   */
  public getStatus(): {
    isConnected: boolean;
    retryCount: number;
    maxRetries: number;
  } {
    return {
      isConnected: this.isConnected,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
    };
  }
}

// Create and export a singleton instance
const database = new DatabaseConnection();
export default database;

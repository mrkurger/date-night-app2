// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains interfaces for MongoDB connection service
//
// COMMON CUSTOMIZATIONS:
// - ConnectionStatus: Add additional status types as needed
//   Related to: mongodb-connection.service.ts:MongoDBConnectionService
// ===================================================

/**
 * MongoDB connection status
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed'
}

/**
 * MongoDB connection configuration
 */
export interface MongoDBConfig {
  /** URI for MongoDB connection */
  uri: string;
  
  /** Database name */
  dbName: string;
  
  /** Maximum number of connection attempts */
  maxRetries?: number;
  
  /** Delay between retry attempts in milliseconds */
  retryDelay?: number;
  
  /** Connection timeout in milliseconds */
  connectionTimeout?: number;
  
  /** Socket timeout in milliseconds */
  socketTimeout?: number;
  
  /** Maximum connection pool size */
  maxPoolSize?: number;
}

/**
 * MongoDB connection options
 */
export interface ConnectionOptions {
  /** Connection timeout in milliseconds */
  connectionTimeoutMS?: number;
  
  /** Socket timeout in milliseconds */
  socketTimeoutMS?: number;
  
  /** Server selection timeout in milliseconds */
  serverSelectionTimeoutMS?: number;
  
  /** Maximum pool size */
  maxPoolSize?: number;
  
  /** IP version to use */
  family?: number;
}

/**
 * MongoDB connection error types
 */
export enum MongoDBErrorType {
  CONNECTION_ERROR = 'connection_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  TIMEOUT_ERROR = 'timeout_error',
  NETWORK_ERROR = 'network_error',
  SERVER_SELECTION_ERROR = 'server_selection_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * MongoDB connection event
 */
export interface ConnectionEvent {
  /** Event timestamp */
  timestamp: Date;
  
  /** Connection status */
  status: ConnectionStatus;
  
  /** Event message */
  message: string;
  
  /** Error information if applicable */
  error?: any;
}
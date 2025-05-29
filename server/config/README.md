database# Database Configuration Directory

This directory contains the database configuration files for the DateNight.io application. The database architecture is designed to support multiple database connections with robust error handling, connection pooling, and comprehensive logging.

## Files

### Core Files

- **`databaseCore.js`**: Provides a shared mongoose instance to avoid circular dependencies between database modules.
- **`database.js`**: Manages the main database connection used for core business data.
- **`database1.js`**: Manages the secondary database connection used for analytics, logging, and non-critical data.
- **`db.js`**: Unified interface to access all database connections.

### Supporting Files

- **`environment.js`**: Environment-specific configuration settings for database connections.

## Architecture

The database architecture follows these principles:

1. **Separation of Concerns**: Each database connection is managed by its own module.
2. **Dependency Management**: Uses a core module to avoid circular dependencies.
3. **Connection Pooling**: Optimized connection pools for different workloads.
4. **Error Handling**: Comprehensive error handling and automatic retries.
5. **Unified Interface**: Single entry point for database operations.

## Usage

```javascript
// Import the unified database service
import dbService from './db.js';

// Initialize all connections
await dbService.initializeAllConnections();

// Check connection status
const status = dbService.getConnectionStatus();

// Close connections during shutdown
await dbService.closeAllConnections();
```

## Documentation

Detailed documentation about the database architecture can be found in the docs directory:

- [Database Architecture](../docs/database-architecture.md)
- [Database1 Entity](../docs/database1-entity.md)

## Environment Variables

- **`MONGODB_URI`**: Connection string for the main database.
- **`DATABASE1_URI`**: Connection string for the secondary database (optional).

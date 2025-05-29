# Database Architecture Documentation

## Overview

The DateNight.io application uses a multi-database architecture to separate concerns and optimize performance. The database layer has been designed with the following goals in mind:

- **Connection Management**: Robust connection handling with automatic retries
- **Multiple Database Support**: Ability to connect to multiple MongoDB instances
- **Connection Pooling**: Optimized connection pools for different workloads
- **Error Handling**: Comprehensive error handling and recovery
- **Logging**: Detailed logging for troubleshooting and monitoring
- **Separation of Concerns**: Different databases for different data types

## Core Components

### 1. Database Core (`databaseCore.js`)

This is the foundation of the database architecture, providing a shared mongoose instance to avoid circular dependencies between database modules:

```javascript
// Core database setup shared by other modules
import mongoose from 'mongoose';
import config from './environment.js';

// Export the mongoose instance for use by other modules
export default mongoose;
```

### 2. Main Database (`database.js`)

The primary database connection used for core application data:

- User accounts
- Advertisements
- Transactions
- Chat messages
- Profiles
- Other business-critical data

Key features:
- Connection pooling (default: 10 max, 2 min connections)
- Automatic retry logic
- Event listeners for connection state
- Detailed logging
- Singleton pattern to prevent multiple instances

### 3. Secondary Database (`database1.js`)

A separate database connection used for:

- Analytics data
- Logging
- Metrics
- Non-critical data
- Historical data

Key features:
- Independent implementation with its own Database1Service class
- Smaller connection pool (default: 5 max, 1 min connections)
- Independent lifecycle from main database
- Custom configuration via DATABASE1_URI environment variable
- Can use a different MongoDB instance or the same instance with a different database name
- Specialized model creation method for analytics data
- Comprehensive event handling and logging

### 4. Unified Database Service (`db.js`)

A facade that provides a unified interface to all databases:

```javascript
export default {
  database,          // Main database
  database1,         // Secondary database
  initializeAllConnections,  // Initialize all connections at once
  closeAllConnections,       // Close all connections gracefully
  getConnectionStatus        // Check status of connections
};
```

## Usage Examples

### Connecting to Databases

```javascript
// Import the unified database service
import dbService from './config/db.js';

// Initialize all connections at once
await dbService.initializeAllConnections();

// Or connect to specific databases individually
const mainDb = await dbService.database.dbService.connect();
const db1 = await dbService.database1.connect();

// Check connection status
const status = dbService.getConnectionStatus();
console.log(`Main DB connected: ${status.main.connected}`);
console.log(`Database1 connected: ${status.database1.connected}`);
```

### Creating Models

#### Main Database Model

```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // schema definition
});

// Uses the default connection
const User = mongoose.model('User', userSchema);
```

#### Secondary Database Model

```javascript
import mongoose from 'mongoose';
import database1 from '../config/database1.js';

const analyticSchema = new mongoose.Schema({
  // schema definition
});

// Uses the secondary connection
const Analytic = database1.model('Analytic', analyticSchema);
```

### Graceful Shutdown

```javascript
// Close all database connections properly
await dbService.closeAllConnections();

// Or close individual connections
await dbService.database.closeDB();
await dbService.database1.close();
```

## Configuration

### Environment Variables

- `MONGODB_URI`: Primary database connection string
- `DATABASE1_URI`: Secondary database connection string

### Connection Options

#### Main Database Default Options

```javascript
const defaultOptions = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  family: 4,
  autoIndex: true,
  autoCreate: true,
};
```

#### Secondary Database Default Options

```javascript
const database1Options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 5,
  minPoolSize: 1,
  family: 4,
  autoIndex: true,
  autoCreate: true,
};
```

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Application    │     │    API Layer    │     │     Models      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                        ┌────────┴────────┐
                        │   Database      │
                        │   Service       │
                        └────────┬────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
        ┌────────┴────────┐             ┌────────┴────────┐
        │  Main Database  │             │  Secondary DB   │
        │  (database.js)  │             │ (database1.js)  │
        └────────┬────────┘             └────────┬────────┘
                 │                               │
        ┌────────┴────────┐             ┌────────┴────────┐
        │  Core Business  │             │    Analytics    │
        │      Data       │             │       Data      │
        └─────────────────┘             └─────────────────┘
```

A more detailed interactive diagram is available in the [database-architecture-diagram.md](./database-architecture-diagram.md) file.

## Best Practices

1. **Model Definition**:
   - Define models using the appropriate database connection
   - Keep models organized by their database connection

2. **Connection Management**:
   - Always use the database service for connecting and disconnecting
   - Implement proper error handling for database operations
   - Ensure connections are closed during application shutdown

3. **Query Optimization**:
   - Use appropriate indexes for your queries
   - Monitor query performance in each database
   - Consider data distribution between databases based on access patterns

4. **Error Handling**:
   - Handle connection errors gracefully
   - Implement retry logic for transient errors
   - Log database errors with appropriate context

## Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Check environment variables are correctly set
2. Verify network connectivity to MongoDB instances
3. Check MongoDB logs for errors
4. Review connection options for misconfiguration
5. Check for authentication issues

### Performance Issues

If you experience performance problems:

1. Review connection pool settings
2. Check for long-running queries
3. Verify indexes are being used effectively
4. Consider scaling MongoDB resources if needed
5. Monitor connection usage patterns

## Migration Guide

When migrating data between databases:

1. Create a migration script using both database connections
2. Use transactions where possible for data consistency
3. Implement validation to ensure data integrity
4. Consider implementing a rollback mechanism
5. Test thoroughly in a non-production environment

## Related Documentation

- [Database1 Entity Documentation](./database1-entity.md): Detailed information about the secondary database connection

## Future Enhancements

- Implement read replicas for scaling read operations
- Add database sharding for larger datasets
- Implement cross-database transactions where needed
- Add more sophisticated connection pooling strategies
- Implement database proxying for advanced routing

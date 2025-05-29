# Database1 Entity Documentation

## Overview

`database1` is a secondary MongoDB database connection entity within the DateNight.io application that is primarily used for storing analytics data, logs, and other non-critical information. It is designed to segregate high-volume analytics and logging data from the core business data to optimize performance and maintenance.

## Core Features

### Independent Connection Management

The `database1` entity maintains its own MongoDB connection separate from the main database:

- **Dedicated Connection Pool**: Configured with smaller connection pool limits (5 max, 1 min) optimized for analytics workloads
- **Independent Connection Lifecycle**: Can be started and stopped independently from the main database
- **Custom Configuration**: Uses its own environment variables and configuration options
- **Isolated Error Handling**: Failures in this connection don't affect the main application database

### Database Service Integration

`database1` integrates with the unified database service (`db.js`) while maintaining its independence:

- Accessible through the unified database service API
- Participates in unified connection management
- Shares the same monitoring and logging framework
- Uses the same graceful shutdown process

### Analytics-Optimized Design

The connection is specifically tuned for analytics workloads:

- Optimized read/write settings
- Configured for bulk inserts
- Balanced for analytical query patterns
- Set up for time-series data management

## Implementation

### Module Structure

```javascript
// database1.js - Secondary database connection module
import mongoose from './databaseCore.js';
import config from './environment.js';

// Connection caching and management
const connections = new Map();

// Database1-specific connection options
const database1Options = {
  maxPoolSize: 5,
  minPoolSize: 1,
  // Other optimized settings
};

// Database1Service class for connection management
class Database1Service {
  // Connection management methods
  // Error handling and logging
  // Model creation utilities
}

// Singleton instance
const database1Service = new Database1Service();

// Export functions and service
export default {
  connect,
  getConnection,
  close,
  isConnected,
  model,
  database1Service
};
```

### Connection URI Resolution

`database1` intelligently resolves its connection URI using this priority:

1. `DATABASE1_URI` environment variable if set
2. Modified `MONGODB_URI` with a different database name if available
3. Default local MongoDB URI with database1-specific database name

```javascript
const getDatabase1Uri = () => {
  return (
    process.env.DATABASE1_URI ||
    process.env.MONGODB_URI?.replace(/\/[^\/]+$/, '/date_night_db1') ||
    'mongodb://127.0.0.1:27017/date_night_db1'
  );
};
```

## Usage Examples

### Creating Models with database1

```javascript
// Import the database1 module
import database1 from '../config/database1.js';

// Define a schema
const analyticSchema = new mongoose.Schema({
  event: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, index: true },
  properties: { type: Map, of: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true }
});

// Create a model using the database1 connection
const Analytic = database1.model('Analytic', analyticSchema);

// Use the model for operations
const result = await Analytic.create({
  event: 'user_login',
  userId: user._id,
  properties: {
    device: 'mobile',
    browser: 'chrome'
  }
});
```

### Connecting and Disconnecting

```javascript
// Connect to database1
const db1Connection = await database1.connect();

// Check connection status
const isConnected = database1.isConnected();

// Close the connection when done
await database1.close();
```

### Direct Service Access

```javascript
// Access the database1 service directly
const logs = database1.database1Service.getLogs();

// Get connection information
const connection = database1.getConnection();
```

## Configuration Options

### Environment Variables

- `DATABASE1_URI`: Connection string for the secondary database
  - Example: `mongodb://username:password@host:port/date_night_db1?options`
  - Falls back to modified main database URI if not specified

### Connection Options

```javascript
const database1Options = {
  serverSelectionTimeoutMS: 10000,  // Server selection timeout
  connectTimeoutMS: 10000,          // Connection timeout
  socketTimeoutMS: 45000,           // Socket timeout
  maxPoolSize: 5,                   // Maximum connections in pool
  minPoolSize: 1,                   // Minimum connections to maintain
  family: 4,                        // Use IPv4
  autoIndex: true,                  // Auto-build indexes
  autoCreate: true,                 // Auto-create collections
};
```

## Best Practices

1. **Data Segregation**
   - Store high-volume, non-critical data in database1
   - Keep core business data in the main database
   - Use database1 for analytics, logs, and metrics

2. **Connection Management**
   - Initialize database1 only when needed
   - Close connections properly during shutdown
   - Monitor connection pool usage

3. **Error Handling**
   - Implement specific error handling for analytics operations
   - Ensure analytics failures don't impact core functionality
   - Log issues with appropriate context

4. **Model Organization**
   - Keep database1 models in dedicated files
   - Use clear naming conventions for database1 models
   - Document which database each model uses

## Integration with Knowledge Graph

The `database1` entity is part of the broader database architecture and has relationships with:

- **Main database**: Complementary but independent database connection
- **Database service**: Parent service that manages all connections
- **Analytic models**: Models that specifically use the database1 connection
- **Server initialization**: Part of the server startup and shutdown process
- **Environment configuration**: Configured through environment variables

## Future Enhancements

- Implement automatic archiving of old analytics data
- Add data aggregation pipelines for analytics processing
- Implement read replicas for analytics reporting
- Add time-to-live (TTL) indexes for automatic data expiration
- Implement analytics-specific backup strategies

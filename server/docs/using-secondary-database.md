# Using the Secondary Database (database1)

This guide demonstrates how to use the secondary database connection (`database1`) in your DateNight.io application.

## Overview

The application supports multiple database connections:
- `database.js`: Primary database for core business data
- `database1.js`: Secondary database for analytics, logging, and non-critical data

Using separate database connections allows for better separation of concerns, improved scalability, and optimized performance.

## Configuration

The secondary database uses the following environment variable:

```
DATABASE1_URI=mongodb://username:password@hostname:port/db_name
```

If not provided, it falls back to:
1. The main database URI with a different database name (`date_night_db1`)
2. Local MongoDB instance at `mongodb://127.0.0.1:27017/date_night_db1`

## Connection Options

The secondary database uses a smaller connection pool by default:

```javascript
const database1Options = {
  maxPoolSize: 5,
  minPoolSize: 1,
  // Other MongoDB connection options...
};
```

## Creating Models with database1

### Step 1: Import the database1 module

```javascript
import database1 from '../config/database1.js';
```

### Step 2: Define your schema

```javascript
import mongoose from 'mongoose';

const mySchema = new mongoose.Schema({
  // Schema definition
  field1: { type: String, required: true },
  field2: { type: Number },
  // ...
}, {
  timestamps: true,
  // Other schema options
});

// Add indexes, virtuals, methods as needed
mySchema.index({ field1: 1 });
```

### Step 3: Create the model using database1

```javascript
// This is the key difference - use database1.model instead of mongoose.model
const MyModel = database1.model('ModelName', mySchema);

export default MyModel;
```

## Example: Analytics Model

```javascript
// filepath: /server/models/analytic.model.js
import mongoose from 'mongoose';
import database1 from '../config/database1.js';

const analyticSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    properties: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'analytics',
    autoIndex: true,
    minimize: false,
  }
);

// Add compound indexes for common queries
analyticSchema.index({ event: 1, timestamp: -1 });
analyticSchema.index({ userId: 1, event: 1, timestamp: -1 });

// Create the model using the secondary database connection
const Analytic = database1.model('Analytic', analyticSchema);

export default Analytic;
```

## Usage in Services

```javascript
// filepath: /server/services/analytics.service.js
import Analytic from '../models/analytic.model.js';

class AnalyticsService {
  async trackEvent(event, userId, properties) {
    try {
      const analytic = new Analytic({
        event,
        userId,
        properties,
        // Other fields
      });
      
      return await analytic.save();
    } catch (error) {
      console.error(`Analytics error: ${error.message}`);
      // Handle error...
    }
  }
  
  async getEventsByUser(userId) {
    return await Analytic.find({ userId })
      .sort({ timestamp: -1 })
      .limit(100);
  }
  
  // Other methods...
}

export default new AnalyticsService();
```

## Best Practices

1. **Select appropriate data for the secondary database**
   - Analytics and metrics data
   - Logs and audit trails
   - Cached or temporary data
   - Historical/archived data

2. **Consider cross-database relationships carefully**
   - Use references (not direct relationships) between databases
   - Fetch data from different databases in separate operations
   - Join data in application code, not database queries

3. **Error handling**
   - Handle connection issues independently for each database
   - Implement fallbacks for non-critical operations
   - Log database errors with context

4. **Connection management**
   - Let the database service manage connections
   - Don't manually reconnect or close connections except during shutdown

## Example Use Cases

### 1. Event Tracking

Track user interactions and application events in the secondary database:

```javascript
await analyticsService.trackEvent('pageView', userId, { page: '/home' });
await analyticsService.trackEvent('buttonClick', userId, { buttonId: 'submit' });
```

### 2. Logging System

Store application logs in the secondary database:

```javascript
import LogEntry from '../models/log.model.js'; // Uses database1

async function logError(message, context) {
  try {
    await LogEntry.create({
      level: 'error',
      message,
      context,
      timestamp: new Date()
    });
  } catch (err) {
    // Fallback to console if database logging fails
    console.error(message, context);
  }
}
```

### 3. Metrics Collection

Gather application metrics for monitoring:

```javascript
import MetricModel from '../models/metric.model.js'; // Uses database1

export async function recordMetric(name, value, tags = {}) {
  await MetricModel.create({
    name,
    value,
    tags,
    timestamp: new Date()
  });
}

// Example usage
recordMetric('api_response_time', 235, { endpoint: '/users', method: 'GET' });
```

## Troubleshooting

### Connection Issues

If you encounter issues connecting to the secondary database:

1. Check the DATABASE1_URI environment variable is correctly set
2. Verify network connectivity to the MongoDB instance
3. Check MongoDB logs for specific errors
4. Verify authentication credentials

### Model Definition Issues

If you have trouble defining or using models:

1. Ensure you're using `database1.model()` instead of `mongoose.model()`
2. Check for schema validation errors
3. Verify that indexes are defined correctly
4. Check for model name collisions

### Performance Issues

If you encounter performance problems:

1. Review connection pool settings
2. Check indexing strategy for your collections
3. Monitor query performance and optimize as needed
4. Consider scaling your MongoDB resources if necessary

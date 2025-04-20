# DateNight.io Server

This is the backend API server for DateNight.io, built with Node.js, Express, and MongoDB.

## Setup and Installation

### Prerequisites

- Node.js v22.14.0 or later
- npm v10.9.2 or later
- MongoDB v6.0 or later
- Redis (optional, for caching and session management)

### Installation

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install
```

### Environment Configuration

The server uses environment variables for configuration. Create a `.env` file in the server directory:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your specific settings
```

### Required Environment Variables

| Variable                     | Description                                 | Default                             |
| ---------------------------- | ------------------------------------------- | ----------------------------------- |
| `PORT`                       | Server port                                 | 3000                                |
| `NODE_ENV`                   | Environment (development, test, production) | development                         |
| `MONGODB_URI`                | MongoDB connection string                   | mongodb://localhost:27017/datenight |
| `JWT_SECRET`                 | Secret for JWT token generation             | -                                   |
| `JWT_REFRESH_SECRET`         | Secret for refresh tokens                   | -                                   |
| `CORS_ORIGIN`                | Allowed CORS origins                        | http://localhost:4200               |
| `REDIS_URL`                  | Redis connection string (optional)          | redis://localhost:6379              |
| `ENCRYPTION_KEY`             | Key for server-side encryption              | -                                   |
| `LOG_LEVEL`                  | Logging level                               | info                                |
| `UPLOAD_DIR`                 | Directory for file uploads                  | uploads                             |
| `GOOGLE_CLIENT_ID`           | Google OAuth client ID                      | -                                   |
| `GOOGLE_CLIENT_SECRET`       | Google OAuth client secret                  | -                                   |
| `GITHUB_CLIENT_ID`           | GitHub OAuth client ID                      | -                                   |
| `GITHUB_CLIENT_SECRET`       | GitHub OAuth client secret                  | -                                   |
| `REDDIT_CLIENT_ID`           | Reddit OAuth client ID                      | -                                   |
| `REDDIT_CLIENT_SECRET`       | Reddit OAuth client secret                  | -                                   |
| `APPLE_CLIENT_ID`            | Apple Sign In client ID                     | -                                   |
| `APPLE_TEAM_ID`              | Apple developer team ID                     | -                                   |
| `APPLE_KEY_ID`               | Apple private key ID                        | -                                   |
| `APPLE_PRIVATE_KEY_LOCATION` | Path to Apple private key file              | -                                   |

## Running the Server

### Development Mode

```bash
# Start the server with nodemon (auto-restart on file changes)
npm run dev

# Start with debug logging
DEBUG=datenight:* npm run dev
```

The server will be available at `http://localhost:3000`.

### Production Mode

```bash
# Build the server
npm run build

# Start the server in production mode
npm start
```

## API Documentation

The API is documented using Swagger/OpenAPI. When the server is running, you can access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

For more detailed API documentation, see [API_DOCUMENTATION.MD](/docs/API_DOCUMENTATION.MD).

## Project Structure

```
server/
├── components/           # Feature components
│   ├── ads/              # Advertisement-related functionality
│   ├── auth/             # Authentication and authorization
│   ├── chat/             # Chat functionality
│   ├── profile/          # User profile management
│   └── ...
├── config/               # Configuration files
│   ├── database.js       # Database configuration
│   ├── passport.js       # Authentication strategies
│   └── ...
├── controllers/          # API controllers
├── middleware/           # Express middleware
│   ├── auth.js           # Authentication middleware
│   ├── error.js          # Error handling middleware
│   └── ...
├── models/               # Mongoose models
├── routes/               # API routes
│   ├── v1/               # API version 1
│   └── ...
├── services/             # Business logic services
├── utils/                # Utility functions
│   ├── encryption.js     # Encryption utilities
│   ├── validation.js     # Input validation
│   └── ...
├── app.js                # Express application setup
└── server.js             # Server entry point
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests for a specific file
npm test -- --testPathPattern=components/auth
```

Test reports are generated in the `coverage/` directory.

### Integration Tests

```bash
# Run integration tests
npm run test:integration
```

### Linting

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

## Database Management

### Migrations

```bash
# Create a new migration
npm run migrate:create -- migration-name

# Run pending migrations
npm run migrate:up

# Rollback the last migration
npm run migrate:down
```

### Seeding

```bash
# Seed the database with sample data
npm run seed

# Seed specific data
npm run seed -- --only=users,ads
```

## Monitoring and Debugging

### Logging

The server uses a structured logging system. Log levels can be configured in the `.env` file:

```
LOG_LEVEL=debug|info|warn|error
```

### Performance Monitoring

```bash
# Run with performance monitoring
NODE_ENV=production npm run monitor
```

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs)
- [Express Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com/docs)
- [Project Architecture Overview](/docs/ARCHITECTURE.MD)
- [Database Schema Documentation](/docs/DATABASE_SCHEMA_DETAIL.MD)
- [Security Best Practices](/docs/SECURITY_BEST_PRACTICES.MD)

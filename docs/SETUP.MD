# DateNight.io Setup Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Clone the Repository](#clone-the-repository)
  - [Environment Configuration](#environment-configuration)
  - [Install Dependencies](#install-dependencies)
  - [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
  - [Development Mode](#development-mode)
  - [Production Mode](#production-mode)
- [Testing](#testing)
  - [Running Tests](#running-tests)
  - [Test Coverage](#test-coverage)
- [Troubleshooting](#troubleshooting)
  - [Common Issues](#common-issues)
  - [MongoDB Issues](#mongodb-issues)
  - [Angular Build Issues](#angular-build-issues)
- [Additional Resources](#additional-resources)

## Prerequisites

Before setting up the DateNight.io application, ensure you have the following prerequisites installed:

- **Node.js**: Version 22.14.0 or later
  - See [NODEJS-INSTALLATION-GUIDE.MD](/docs/NODEJS-INSTALLATION-GUIDE.MD) for detailed installation instructions
  - For specific version installation, see [SPECIFIC-VERSION-INSTALLATION-GUIDE.MD](/docs/SPECIFIC-VERSION-INSTALLATION-GUIDE.MD)
- **npm**: Version 10.9.2 or later (typically comes with Node.js)
- **MongoDB**: Version 6.0 or later
  - See [MONGODB_TROUBLESHOOTING.MD](/docs/MONGODB_TROUBLESHOOTING.MD) for setup and troubleshooting
- **Angular CLI**: Version 19.2.0 or later (for frontend development)
  - Install globally: `npm install -g @angular/cli`
- **Git**: Latest version

## Installation

### Clone the Repository

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd date-night-app
```

### Environment Configuration

The application uses environment files for configuration. You need to set up both the server and client environment files:

#### Server Environment

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your specific settings:

   ```
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/datenight

   # Authentication
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here

   # CORS
   CORS_ORIGIN=http://localhost:4200

   # Optional Services
   REDIS_URL=redis://localhost:6379

   # File Storage
   UPLOAD_DIR=uploads

   # Logging
   LOG_LEVEL=info

   # OAuth Providers (if using)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   REDDIT_CLIENT_ID=your_reddit_client_id
   REDDIT_CLIENT_SECRET=your_reddit_client_secret
   APPLE_CLIENT_ID=your_apple_client_id
   APPLE_TEAM_ID=your_apple_team_id
   APPLE_KEY_ID=your_apple_key_id
   APPLE_PRIVATE_KEY_LOCATION=path/to/apple/private/key.p8
   ```

#### Client Environment

1. Navigate to the Angular client directory:

   ```bash
   cd client-angular
   ```

2. Copy the example environment file:

   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```

3. Edit the environment file with your specific settings:

   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api/v1',
     socketUrl: 'http://localhost:3000',
     googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
     encryptionKey: 'YOUR_ENCRYPTION_KEY',
     logLevel: 'debug',
   };
   ```

### Install Dependencies

The project includes a script to install all dependencies for both the server and client:

```bash
# From the project root
npm run install-all
```

Alternatively, you can install dependencies separately:

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client-angular
npm install
```

### Database Setup

1. Ensure MongoDB is running:

   ```bash
   # Start MongoDB (command may vary based on installation method)
   mongod
   ```

2. Run the setup script to verify environment variables and database connection:

   ```bash
   node scripts/setup.js
   ```

3. (Optional) Seed the database with sample data:

   ```bash
   node scripts/seed.js
   ```

## Running the Application

### Development Mode

To run the application in development mode with hot reloading:

```bash
# From the project root
npm run dev
```

This will start both the server and client in development mode:

- **Server**: Available at `http://localhost:3000`
- **API**: Available at `http://localhost:3000/api/v1`
- **API Documentation**: Available at `http://localhost:3000/api-docs`
- **Client**: Available at `http://localhost:4200`

To run the server and client separately:

```bash
# Run the server only
npm run server:dev

# Run the client only
npm run client:dev
```

### Production Mode

To build and run the application in production mode:

1. Build the client:

   ```bash
   # From the project root
   cd client-angular
   npm run build:prod
   ```

2. Start the server in production mode:

   ```bash
   # From the project root
   npm start
   ```

The server will serve the built Angular application at `http://localhost:3000`.

## Testing

### Running Tests

The project includes comprehensive test suites for both the server and client:

#### Server Tests

```bash
# From the project root
cd server

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration
```

#### Client Tests

```bash
# From the project root
cd client-angular

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run e2e

# Run end-to-end tests headlessly (CI mode)
npm run e2e:ci
```

### Test Coverage

Test coverage reports are generated in the `coverage/` directory for both the server and client. To view the coverage reports:

```bash
# Server coverage report
open server/coverage/lcov-report/index.html

# Client coverage report
open client-angular/coverage/index.html
```

## Troubleshooting

### Common Issues

#### Port Already in Use

If you encounter a "port already in use" error:

```bash
# Find the process using the port (e.g., 3000)
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### Node Version Issues

If you encounter Node.js version compatibility issues:

1. Verify your Node.js version:

   ```bash
   node -v
   ```

2. If needed, install the correct version using nvm:

   ```bash
   nvm install 22.14.0
   nvm use 22.14.0
   ```

### MongoDB Issues

For MongoDB connection issues, refer to [MONGODB_TROUBLESHOOTING.MD](/docs/MONGODB_TROUBLESHOOTING.MD).

Common MongoDB issues include:

- MongoDB not running
- Authentication issues
- Connection string format
- Network connectivity

### Angular Build Issues

For Angular build issues, especially memory-related errors, refer to [ANGULAR_BUILD_OPTIMIZATION.MD](/docs/ANGULAR_BUILD_OPTIMIZATION.MD).

Common Angular build issues include:

- JavaScript heap out of memory errors
- Dependency conflicts
- TypeScript compilation errors

## Additional Resources

- [ARCHITECTURE.MD](/docs/ARCHITECTURE.MD): Overview of the application architecture
- [API_DOCUMENTATION.MD](/docs/API_DOCUMENTATION.MD): API documentation
- [COMPONENT_LIBRARY.MD](/docs/COMPONENT_LIBRARY.MD): UI component library documentation
- [TESTING_GUIDE.MD](/docs/TESTING_GUIDE.MD): Detailed testing guidelines
- [DEPLOYMENT.MD](/docs/DEPLOYMENT.MD): Deployment instructions
- [CONTRIBUTING.MD](/CONTRIBUTING.MD): Contribution guidelines

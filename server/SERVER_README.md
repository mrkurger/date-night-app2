# Date Night App Server

This directory contains the backend server for the Date Night App. The server is built with Express and MongoDB, with TypeScript for type safety.

## Current Status

The server is currently in a transitional state, migrating from JavaScript to TypeScript. We've created multiple server implementations to ensure the application remains functional during this transition:

1. **TypeScript Server** (`server.ts`): The main server with TypeScript, still being improved.
2. **Enhanced JavaScript Server** (`server.enhanced.js`): A JavaScript version with many of the TypeScript server's features.
3. **Simple JavaScript Server** (`server.simple.js`): A minimalist server implementation that ensures basic functionality.

## Prerequisites

- Node.js 18.x or higher
- MongoDB 4.4 or higher
- NPM 7.x or higher

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Running the Server

We have multiple ways to run the server depending on your needs:

```bash
# Run the TypeScript server (requires successful build)
npm start

# Run in development mode with live reload
npm run dev

# Build the TypeScript server
npm run build

# Build the enhanced JavaScript server
npm run build:enhanced

# Build the simple JavaScript server
npm run build:simple
```

### Development

For development work, use the TypeScript server when possible:

```bash
# Watch mode for TypeScript compilation
npm run build:watch

# In another terminal, run the server with live reload
npm run dev
```

If you encounter TypeScript issues, you can temporarily use one of the JavaScript implementations:

```bash
# Build and run the enhanced server
npm run build:enhanced
cd dist && node server.js

# Or use the simple server as a fallback
npm run build:simple
cd dist && node server.js
```

## Project Structure

- `/controllers`: Request handlers organized by resource
- `/middleware`: Express middleware functions
- `/models`: MongoDB models using Mongoose
- `/routes`: API routes organized by resource
- `/src/types`: TypeScript type definitions
- `/src/utils`: Utility functions and helpers
- `/scripts`: Build and helper scripts

## API Documentation

The API is documented using OpenAPI/Swagger. Once the server is running, you can access the documentation at:

```
http://localhost:5000/api-docs
```

## TypeScript Migration

We're gradually improving TypeScript support. See [TYPESCRIPT_ROADMAP.md](./TYPESCRIPT_ROADMAP.md) for details on the migration plan.

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Contributing

1. Follow the TypeScript migration guidelines in the roadmap
2. Run linting before submitting changes: `npm run lint`
3. Make sure tests pass: `npm test`
4. Format code with Prettier: `npm run format`

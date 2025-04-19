# DateNight.io Angular Frontend

This is the main frontend application for DateNight.io, built with Angular 19.2.

## Setup and Installation

### Prerequisites

- Node.js v22.14.0 or later
- npm v10.9.2 or later
- Angular CLI v19.2.0 or later (`npm install -g @angular/cli`)

### Installation

```bash
# Navigate to the client directory
cd client-angular

# Install dependencies
npm install
```

### Environment Configuration

The application uses environment files for configuration:

1. Copy the example environment file:

   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```

2. Edit the environment file with your specific settings:
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

### Required Environment Variables

| Variable           | Description                               | Default                      |
| ------------------ | ----------------------------------------- | ---------------------------- |
| `apiUrl`           | Base URL for API requests                 | http://localhost:3000/api/v1 |
| `socketUrl`        | Socket.IO server URL                      | http://localhost:3000        |
| `googleMapsApiKey` | Google Maps API key for location features | -                            |
| `encryptionKey`    | Key for client-side encryption            | -                            |
| `logLevel`         | Logging level (debug, info, warn, error)  | info                         |

## Development Server

```bash
# Start development server
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200`.

For a specific port:

```bash
ng serve --port 4201
```

For production mode:

```bash
ng serve --configuration=production
```

## Project Structure

```
src/
├── app/
│   ├── core/              # Singleton services, guards, interceptors
│   │   ├── auth/          # Authentication services and guards
│   │   ├── http/          # HTTP interceptors
│   │   ├── services/      # Core application services
│   │   └── models/        # Data models and interfaces
│   ├── shared/            # Shared components, directives, pipes
│   │   ├── components/    # Reusable components
│   │   ├── directives/    # Custom directives
│   │   ├── pipes/         # Custom pipes
│   │   └── emerald/       # Emerald UI component library
│   └── features/          # Feature modules
│       ├── ads/           # Advertisement management
│       ├── auth/          # Authentication UI
│       ├── chat/          # Chat functionality
│       ├── profile/       # User profiles
│       ├── touring/       # Travel itinerary
│       └── ...
├── assets/                # Static files (images, fonts, etc.)
├── environments/          # Environment configurations
└── styles/                # Global styles and themes
```

## Key Features

- Multiple browsing interfaces (Grid, Tinder-style, Netflix-style)
- Real-time chat with Socket.IO and end-to-end encryption
- JWT authentication with refresh tokens
- Lazy-loaded feature modules
- Comprehensive TypeScript types
- Emerald UI component library

## Testing

### Unit Tests

To execute unit tests with Karma:

```bash
# Run all tests
npm test
# or
ng test

# Run tests with coverage
npm run test:coverage
# or
ng test --code-coverage

# Run tests for a specific file
ng test --include=src/app/features/chat/chat.service.spec.ts
```

Test reports are generated in the `coverage/` directory.

### End-to-End Tests

For end-to-end testing with Cypress:

```bash
# Open Cypress test runner
npm run e2e
# or
npx cypress open

# Run e2e tests headlessly
npm run e2e:ci
# or
npx cypress run
```

### Linting

```bash
# Run linting
npm run lint
# or
ng lint

# Fix linting issues automatically
npm run lint:fix
# or
ng lint --fix
```

## Building for Production

```bash
# Production build
npm run build:prod
# or
ng build --configuration=production

# Production build with source maps
npm run build:prod:sourcemap
# or
ng build --configuration=production --source-map

# Build with specific base-href (for deployment to subdirectory)
ng build --configuration=production --base-href=/app/
```

The build artifacts will be stored in the `dist/` directory.

### Memory Issues During Build

If you encounter JavaScript heap out of memory errors during build:

```bash
# Clean build with increased memory
npm run clean:build
```

For more details, see [ANGULAR_BUILD_OPTIMIZATION.MD](/docs/ANGULAR_BUILD_OPTIMIZATION.MD).

## Component Library

The project includes the Emerald UI component library. To view the component documentation:

```bash
# Start the component library documentation server
npm run compodoc
```

The component library documentation will be available at `http://localhost:8080`.

You can also generate a static version of the documentation:

```bash
# Generate static documentation
npm run compodoc:build
```

This will create documentation in the `/docs/component-library/` directory.

For more information, see [COMPONENT_LIBRARY.MD](/docs/COMPONENT_LIBRARY.MD).

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Reference](https://angular.dev/tools/cli)
- [RxJS Documentation](https://rxjs.dev)
- [NgRx Documentation](https://ngrx.io)
- [Project Architecture Overview](/docs/ARCHITECTURE.MD)
- [Testing Guide](/docs/TESTING_GUIDE.MD)

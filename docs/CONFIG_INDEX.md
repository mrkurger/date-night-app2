# Configuration Settings Index

This document serves as a central reference for all customizable settings in the Date Night App. Settings are organized by category and include links to their specific locations in the codebase.

## Table of Contents

- [Server Configuration](#server-configuration)
  - [Environment Settings](#environment-settings)
  - [Database Configuration](#database-configuration)
  - [Security Settings](#security-settings)
  - [Content Security Policy](#content-security-policy)
  - [OAuth Configuration](#oauth-configuration)
- [Client Configuration](#client-configuration)
  - [API Endpoints](#api-endpoints)
  - [Media Settings](#media-settings)
  - [UI Customization](#ui-customization)
  - [Feature Flags](#feature-flags)
- [Shared Configuration](#shared-configuration)

## Server Configuration

### Environment Settings

**File**: [server/config/environment.js](/Users/oivindlund/date-night-app/server/config/environment.js)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| port | Server port number | 3000 | Development |
| port | Server port number | 3001 | Test |
| port | Server port number | process.env.PORT | Production |
| mongoUri | MongoDB connection string | mongodb://localhost:27017/datenight_dev | Development |
| mongoUri | MongoDB connection string | mongodb://localhost:27017/datenight_test | Test |
| mongoUri | MongoDB connection string | process.env.MONGODB_URI | Production |
| jwtSecret | Secret for JWT token generation | dev_jwt_secret | Development |
| jwtSecret | Secret for JWT token generation | test_jwt_secret | Test |
| jwtSecret | Secret for JWT token generation | process.env.JWT_SECRET | Production |
| sessionSecret | Secret for session management | dev_session_secret | Development |
| sessionSecret | Secret for session management | test_session_secret | Test |
| sessionSecret | Secret for session management | process.env.SESSION_SECRET | Production |
| clientUrl | URL for client application | http://localhost:4200 | Development |
| clientUrl | URL for client application | http://localhost:4200 | Test |
| clientUrl | URL for client application | process.env.CLIENT_URL | Production |

### Content Security Policy

**File**: [server/config/csp.config.js](/Users/oivindlund/date-night-app/server/config/csp.config.js)

| Setting | Description | Environment |
|---------|-------------|------------|
| baseDirectives | Base CSP directives used in both environments | All |
| developmentDirectives | Development-specific CSP directives | Development |
| productionDirectives | Production-specific CSP directives | Production |
| reportOnly | Whether to only report CSP violations without enforcing | Development: true, Production: false |

## Client Configuration

### API Endpoints

**File**: [client-angular/src/environments/environment.ts](/Users/oivindlund/date-night-app/client-angular/src/environments/environment.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| apiUrl | Base URL for API requests | http://localhost:3000/api/v1 | Development |
| chatWsUrl | WebSocket URL for chat | ws://localhost:3000 | Development |
| socketUrl | Socket.io URL | http://localhost:3000 | Development |

**File**: [client-angular/src/environments/environment.prod.ts](/Users/oivindlund/date-night-app/client-angular/src/environments/environment.prod.ts) (Not shown, but follows similar structure for production)

### Media Settings

**File**: [client-angular/src/environments/environment.ts](/Users/oivindlund/date-night-app/client-angular/src/environments/environment.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| defaultImageUrl | Default image when none is provided | /assets/images/default-ad.jpg | Development |
| maxUploadSize | Maximum file upload size in bytes | 5MB (5 * 1024 * 1024) | Development |
| supportedImageTypes | Allowed image MIME types | ['image/jpeg', 'image/png', 'image/webp'] | Development |
| cdnUrl | CDN URL for media assets | '' (empty for local development) | Development |
| imageSizes | Responsive image size breakpoints | [320, 640, 960, 1280, 1920] | Development |

### External Services

**File**: [client-angular/src/environments/environment.ts](/Users/oivindlund/date-night-app/client-angular/src/environments/environment.ts)

| Setting | Description | Default Value | Environment |
|---------|-------------|---------------|------------|
| mapboxToken | API token for Mapbox integration | 'your_mapbox_token' | Development |
| stripePublicKey | Public key for Stripe payments | 'pk_test_51NxSampleTestKeyDoNotUseInProductionXYZ' | Development |

## Shared Configuration

This section will be populated as shared configuration settings are identified across the codebase.

---

*This index is automatically generated and maintained by the update_config_index.py script. Do not edit manually.*
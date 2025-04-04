# DateNight.io - Advertisement Platform

## Description

DateNight.io is a platform offering classified advertisements primarily focused on Escort, Striptease, and Massage services, initially targeting the Scandinavian market with a focus on Norway. The platform connects service providers (advertisers) with users (seekers), incorporating modern web application features like real-time chat, location-based searching, and multiple browsing interfaces.

### Key Features

- **Advertisement Platform**: Create, manage, and browse ads for escort and stripper services
- **Travel Itinerary**: Track advertisers' locations when they are actively seeking clientele
- **Real-time Chat**: Direct messaging between users and advertisers
- **Multiple Browsing Interfaces**: Traditional list/grid view, Tinder-style swipe interface, Netflix-style gallery
- **User Profiles**: Comprehensive profiles for both advertisers and users
- **Monetization**: Ad sales, fees on camshows, fees on OnlyFans-like interactions

This project uses the MEAN stack (MongoDB, Express.js, Angular, Node.js).

**Note:** The project has been fully migrated from AngularJS to Angular. The new Angular frontend is located in the `client-angular/` directory.

## Project Structure

The project uses a modern Angular frontend with an Express.js backend:

```
.
├── README.md                   # Project documentation
├── client-angular/            # Angular frontend application
├── server/                    # Express.js backend
├── docs/                      # Project documentation
└── scripts/                   # Utility scripts
```

## Technology Stack

* **Frontend:**
  * Angular 19.2
  * RxJS
  * Socket.IO Client
  * Bootstrap 5
* **Backend:**
  * Node.js & Express
  * MongoDB & Mongoose
  * Socket.IO
  * JWT Authentication
  * Passport.js

## Setup and Installation

**Prerequisites:**

* Node.js (v18+) and npm installed
* MongoDB installed and running (`mongod`)
* Angular CLI installed globally (`npm install -g @angular/cli`)

**Steps:**

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd date-night-app
   ```

2. **Configure Environment:**
   * Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   * Edit the `.env` file with your specific credentials (MongoDB URI, JWT Secret, OAuth Client IDs/Secrets)

3. **Install Dependencies:**
   ```bash
   npm run install-all
   ```

4. **Run Setup Script:**
   * Verifies environment variables and basic DB connection:
     ```bash
     node scripts/setup.js
     ```

5. **Seed Database (Optional):**
   * Ensure your MongoDB server is running
   * Populate the database with sample data:
     ```bash
     node scripts/seed.js
     ```

6. **Run the Application:**
   ```bash
   npm run dev
   ```

7. **Access the Application:**
   * Open your browser and navigate to `http://localhost:4200`
   * The API is available at `http://localhost:3000/api/v1`

## Feature Roadmap & Status

### Completed ✅
- Angular migration from AngularJS
- Core authentication system
- Basic chat functionality
- Ad management features
- Multiple browsing interfaces

### In Progress 🔄
- Enhanced chat with encryption
- Travel itinerary system
- User interaction features
- Location-based matching

### Planned 📅
- Advanced monetization features
- Camshow integration
- Mobile app development
- Analytics and monitoring

## OAuth Setup Instructions

(Adapted from original README [cite: uploaded:solmeme/README.md])

Instructions for setting up OAuth credentials (update callback URLs if your port changes):

### GitHub

1.  Go to GitHub Developer Settings -> OAuth Apps.
2.  Create a New OAuth App.
3.  Set **Homepage URL:** `http://localhost:8080` (or your client URL)
4.  Set **Authorization callback URL:** `http://localhost:3000/auth/github/callback` (your server URL + callback path)
5.  Add the generated Client ID and Client Secret to your `.env` file (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`).

### Google

1.  Go to Google Cloud Console -> APIs & Services -> Credentials.
2.  Create Credentials -> OAuth client ID.
3.  Select "Web application".
4.  Add **Authorized JavaScript origins:** `http://localhost:8080` (client URL).
5.  Add **Authorized redirect URIs:** `http://localhost:3000/auth/google/callback` (server callback).
6.  Add the generated Client ID and Client Secret to your `.env` file (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).

### Reddit

1.  Go to Reddit App Preferences -> "are you a developer? create an app...".
2.  Create a new app (select "web app").
3.  Set **redirect uri:** `http://localhost:3000/auth/reddit/callback`.
4.  Add the generated Client ID (under app name) and Client Secret to your `.env` file (`REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`).

### Apple

1.  Go to Apple Developer Account -> Certificates, IDs & Profiles -> Identifiers -> Create App ID.
2.  Enable "Sign in with Apple" capability.
3.  Go to Certificates, IDs & Profiles -> Keys -> Create a Key.
4.  Enable "Sign in with Apple", configure, download the `.p8` key file. Note the Key ID and Team ID.
5.  Go to Certificates, IDs & Profiles -> Identifiers -> Services IDs -> Create Service ID. Configure domains and redirect URLs (`http://localhost:3000/auth/apple/callback`). Note the Identifier (becomes Client ID).
6.  Add credentials to `.env`: `APPLE_CLIENT_ID` (Service ID Identifier), `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY_LOCATION` (path to downloaded `.p8` file).

## Client-Side TODO List

### Core Architecture
- [ ] **Module Organization**
  - Create missing module files:
    - `/client/src/app/core/core.module.js`
    - `/client/src/app/shared/shared.module.js`
    - `/client/src/app/features/tinder/tinder.module.js` 
    - `/client/src/app/features/gallery/gallery.module.js`

### Features
- [ ] **Gallery View** (`/client/src/app/features/gallery/`)
  - Complete Netflix-style layout calculations in GalleryLayoutService
  - Add image lazy loading
  - Implement category filtering
  - Add responsive grid layout

- [ ] **Chat System** (`/client/src/app/features/chat/`)
  - Add socket reconnection logic
  - Implement message encryption
  - Add typing indicator debouncing
  - Add message delivery status
  - Add file attachment support
  - Add message search

- [ ] **Ad Management** (`/client/src/app/features/ad-management/`)
  - Add image upload with preview
  - Add drag-and-drop support
  - Implement county selection map
  - Add ad status tracking
  - Add analytics dashboard

- [ ] **Authentication** (`/client/src/app/features/auth/`)
  - Complete OAuth provider integrations
  - Add session refresh logic
  - Add "Remember Me" functionality
  - Implement 2FA support

### Services
- [ ] **ChatService** (`/client/src/app/services/chat.service.js`)
  - Add offline message queue
  - Implement retry logic
  - Add presence detection
  - Add read receipts

- [ ] **AdService** (`/client/src/app/services/ad.service.js`)
  - Add caching layer
  - Implement infinite scroll
  - Add search optimization
  - Add location-based sorting

- [ ] **ImageService** (`/client/src/app/services/image.service.js`)
  - Add image compression
  - Implement CDN integration
  - Add image validation
  - Support multiple formats

### UI Components
- [ ] **Shared Components**
  - Create loading spinner directive
  - Add error message component
  - Implement toast notifications
  - Add confirmation dialogs

### Testing & Quality
- [ ] **Test Coverage**
  - Add unit tests for all services
  - Create component test suite
  - Add E2E test scenarios
  - Implement test data factories

### Performance
- [ ] **Optimization**
  - Add lazy loading for features
  - Implement service worker
  - Add client-side caching
  - Optimize bundle size

### Security
- [ ] **Client Security**
  - Complete CSP configuration
  - Add input sanitization
  - Implement XSS protection
  - Add CSRF tokens

## Server-Side TODO List

### Architecture & Structure
- [ ] **Component Organization**
  - Split monolithic controllers into feature modules
  - Implement proper dependency injection
  - Add service layer abstractions
  - Add repository pattern for data access

### API & Routes
- [ ] **Route Organization**
  - Add API versioning (`/api/v1/...`)
  - Implement proper route documentation
  - Add OpenAPI/Swagger specs
  - Add rate limiting per endpoint

### Controllers
- [ ] **Ad Controller** (`/server/components/ads/ad.controller.js`)
  - Add request validation
  - Implement caching
  - Add pagination
  - Add sorting and filtering
  - Add image processing

- [ ] **Chat Controller** (`/server/components/chat/chat.controller.js`)
  - Add message encryption
  - Implement file upload
  - Add message persistence
  - Add user presence tracking

### Models
- [ ] **Database Models**
  - Add validation schemas
  - Implement lifecycle hooks
  - Add indexing strategies
  - Add data access control
  - Add audit logging

### Middleware
- [ ] **Security Middleware**
  - Add rate limiting
  - Implement CORS properly
  - Add request validation
  - Add API key authentication
  - Add request logging

### Services
- [ ] **Ad Service**
  - Add caching layer
  - Implement search
  - Add recommendation engine
  - Add analytics tracking

- [ ] **Chat Service**
  - Add message queue
  - Implement presence
  - Add offline support
  - Add group chat support

### Testing
- [ ] **Unit Tests**
  - Add controller tests
  - Add service tests
  - Add model tests
  - Add middleware tests

- [ ] **Integration Tests**
  - Add API endpoint tests
  - Test WebSocket functionality
  - Add load testing
  - Add security testing

### Performance
- [ ] **Optimization**
  - Add response compression
  - Implement caching strategies
  - Add database query optimization
  - Add connection pooling

### Security
- [ ] **Server Security**
  - Add input sanitization
  - Implement rate limiting
  - Add security headers
  - Add request validation
  - Add audit logging
  - Add IP blocking

### Monitoring
- [ ] **Server Monitoring**
  - Add performance metrics
  - Implement error tracking
  - Add usage analytics
  - Add health checks

### Documentation
- [ ] **API Documentation**
  - Add OpenAPI specs
  - Create API reference
  - Add code documentation
  - Create architecture diagrams

## TODO List & Missing Components

### Frontend (client/)
- [ ] **Core Module**
  - Create `app/core/core.module.js`
  - Implement authentication guards
  - Add HTTP interceptors for JWT tokens
  - Add error handling interceptor

- [ ] **Shared Module**
  - Create `app/shared/shared.module.js`
  - Add common directives (loading spinner, error messages)
  - Add shared pipes/filters

- [ ] **Feature Modules**
  - Implement Tinder-style swipe view (`app/features/tinder/`)
  - Implement Netflix-style gallery view (`app/features/gallery/`)
  - Complete chat module real-time functionality
  - Add end-to-end encryption to chat

- [ ] **Services**
  - Complete `auth.service.js` with OAuth providers
  - Add `chat-polling.service.js` fallback
  - Add `socket.service.js` reconnection logic
  - Add `image.service.js` for upload/optimization

### Backend (server/)
- [ ] **Components**
  - Split monolithic controllers into feature modules
  - Move routes from server.js to feature route files
  - Add proper error handling middleware

- [ ] **Config**
  - Move database logic to dedicated config
  - Add environment configuration handling
  - Add OAuth provider configuration

- [ ] **Models**
  - Split schema definitions into separate files
  - Add proper validation
  - Add indexes for performance

### Testing
- [ ] **Frontend Tests**
  - Add unit tests for services
  - Add component tests
  - Add E2E tests with Protractor

- [ ] **Backend Tests**
  - Add unit tests for models
  - Add integration tests for API endpoints
  - Add WebSocket testing

### DevOps
- [ ] **Setup Scripts**
  - Add database migration scripts
  - Add production build scripts
  - Add Docker configuration

### Security
- [ ] **Authentication**
  - Complete OAuth provider integrations
  - Add rate limiting
  - Add CSRF protection
  - Review Content Security Policy

### Features
- [ ] **Chat System**
  - Add real-time notifications
  - Add message history
  - Add file sharing
  - Add end-to-end encryption

- [ ] **Ad Management**
  - Add image upload/optimization
  - Add location services
  - Add category management
  - Add reporting system

## Progress Tracking
- Current Status: Early Development/Refactoring
- Next Milestone: Complete Core Infrastructure
- Priority: Security & Authentication

## Areas for Improvement

- Refactor monolithic controllers (e.g. in client/app.module.js) into feature-specific modules.
- Clean up and properly populate the custom Express middleware under the /middleware directory.
- Split and modularize AngularJS components for authentication, ad management, and chat.
- Enhance error handling in $http interceptors.
- Review and update static asset paths and environment configurations.

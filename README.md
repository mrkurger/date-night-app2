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

* Node.js v22.14.0 and npm v10.9.2 installed
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

# TODOs Summary

This document provides a comprehensive list of all TODOs identified in the codebase, organized by component and priority.

## Client-Side TODOs

### Core Architecture
- [ ] **Module Organization**
  - Update Angular module structure to match current best practices
  - Ensure proper lazy loading configuration for all feature modules
  - Implement proper state management patterns

### Features

#### Gallery View (`/client-angular/src/app/features/gallery/`)
- [ ] Complete Netflix-style layout calculations in GalleryLayoutService
- [ ] Add image lazy loading for performance optimization
- [ ] Implement category filtering with proper UI controls
- [ ] Add responsive grid layout for different screen sizes
- [ ] Implement infinite scroll for gallery browsing

#### Chat System (`/client-angular/src/app/features/chat/`)
- [ ] Add socket reconnection logic to handle network interruptions
- [ ] Implement message encryption for private communications
- [ ] Add typing indicator debouncing to prevent excessive events
- [ ] Add message delivery status indicators (sent, delivered, read)
- [ ] Add file attachment support with preview functionality
- [ ] Add message search with highlighting
- [ ] Implement offline message queue for disconnected users

#### Ad Management (`/client-angular/src/app/features/ad-management/`)
- [ ] Add image upload with preview and cropping functionality
- [ ] Add drag-and-drop support for image reordering
- [ ] Implement county selection map for Norway
- [ ] Add ad status tracking with visual indicators
- [ ] Add analytics dashboard for ad performance
- [ ] Implement ad boosting and featuring options

#### Authentication (`/client-angular/src/app/features/auth/`)
- [ ] Complete OAuth provider integrations (Google, GitHub, Reddit, Apple)
- [ ] Add session refresh logic to handle token expiration
- [ ] Add "Remember Me" functionality with secure storage
- [ ] Implement 2FA support with multiple options
- [ ] Add account recovery workflows

#### Travel Itinerary (`/client-angular/src/app/features/touring/`)
- [ ] Implement map visualization for travel routes
- [ ] Add calendar integration for scheduling
- [ ] Implement notification system for travel updates
- [ ] Add location verification system
- [ ] Implement availability scheduling interface

### Services

#### ChatService (`/client-angular/src/app/core/services/chat.service.ts`)
- [ ] Add offline message queue with persistence
- [ ] Implement retry logic for failed message delivery
- [ ] Add presence detection with online/offline indicators
- [ ] Add read receipts with timestamp display
- [ ] Implement message encryption/decryption

#### AdService (`/client-angular/src/app/core/services/ad.service.ts`)
- [ ] Add caching layer for frequently accessed ads
- [ ] Implement infinite scroll with efficient data loading
- [ ] Add search optimization with filters and sorting
- [ ] Add location-based sorting and filtering
- [ ] Implement ad recommendation algorithm

#### ImageService (`/client-angular/src/app/core/services/media.service.ts`)
- [ ] Add image compression before upload
- [ ] Implement CDN integration for faster delivery
- [ ] Add image validation for size, dimensions, and content
- [ ] Support multiple formats (JPEG, PNG, WebP)
- [ ] Add image optimization pipeline

#### TravelService (`/client-angular/src/app/core/services/travel.service.ts`)
- [ ] Add geolocation services integration
- [ ] Implement travel history tracking
- [ ] Add notification scheduling for travel updates
- [ ] Implement location verification

### UI Components
- [ ] Create loading spinner directive with customizable appearance
- [ ] Add error message component with retry functionality
- [ ] Implement toast notifications system
- [ ] Add confirmation dialogs with customizable actions
- [ ] Create responsive navigation components

### Testing & Quality
- [ ] Add unit tests for all services with high coverage
- [ ] Create component test suite for UI validation
- [ ] Add E2E test scenarios for critical user flows
- [ ] Implement test data factories for consistent testing
- [ ] Add visual regression testing

### Performance
- [ ] Add lazy loading for all feature modules
- [ ] Implement service worker for offline capabilities
- [ ] Add client-side caching strategies
- [ ] Optimize bundle size with code splitting
- [ ] Implement virtual scrolling for large lists

### Security
- [ ] Complete Content Security Policy configuration
- [ ] Add input sanitization for all user inputs
- [ ] Implement XSS protection measures
- [ ] Add CSRF tokens for form submissions
- [ ] Implement secure storage for sensitive data

## Server-Side TODOs

### Architecture & Structure
- [ ] Split monolithic controllers into feature modules
- [ ] Implement proper dependency injection pattern
- [ ] Add service layer abstractions for business logic
- [ ] Add repository pattern for data access
- [ ] Refactor schema definitions in `SCHEMA_REFACTOR_NEEDED.js`

### API & Routes
- [ ] Add API versioning (`/api/v1/...`)
- [ ] Implement proper route documentation
- [ ] Add OpenAPI/Swagger specs for API documentation
- [ ] Add rate limiting per endpoint
- [ ] Implement consistent error response format

### Controllers

#### Ad Controller (`/server/components/ads/ad.controller.js`)
- [ ] Add request validation middleware
- [ ] Add rate limiting for ad creation
- [ ] Add image processing and optimization
- [ ] Add caching layer for frequently accessed ads
- [ ] Add pagination for ad listings
- [ ] Add filtering and sorting options
- [ ] Add proper error logging

#### Chat Controller (`/server/components/chat/chat.controller.js`)
- [ ] Add message encryption for privacy
- [ ] Implement file upload functionality
- [ ] Add message persistence for offline users
- [ ] Add user presence tracking
- [ ] Implement group chat functionality

#### Travel Controller (`/server/controllers/travel.controller.js`)
- [ ] Add validation for travel itinerary data
- [ ] Implement location verification
- [ ] Add notification system for travel updates
- [ ] Implement geofencing for location tracking

### Models
- [ ] Add comprehensive validation schemas
- [ ] Implement lifecycle hooks for data processing
- [ ] Add indexing strategies for performance
- [ ] Add data access control for security
- [ ] Add audit logging for changes

### Middleware

#### Request Validator (`/server/middleware/requestValidator.js`)
- [ ] Add schema validation
- [ ] Add sanitization
- [ ] Add custom validators
- [ ] Add validation error handling

#### Security Middleware
- [ ] Add rate limiting for API endpoints
- [ ] Implement CORS properly with appropriate restrictions
- [ ] Add request validation for all inputs
- [ ] Add API key authentication for external services
- [ ] Add request logging for audit trails

### Services

#### Ad Service (`/server/services/ad.service.js`)
- [ ] Add caching layer for performance
- [ ] Implement search functionality with filters
- [ ] Add recommendation engine based on user preferences
- [ ] Add analytics tracking for ad performance
- [ ] Implement ad moderation workflow

#### Chat Service (`/server/services/chat.service.js`)
- [ ] Add message queue for reliable delivery
- [ ] Implement presence detection system
- [ ] Add offline support with message storage
- [ ] Add group chat support with roles
- [ ] Implement end-to-end encryption

#### Travel Service (`/server/services/travel.service.js`)
- [ ] Implement geolocation verification
- [ ] Add travel history tracking
- [ ] Implement notification system for travel updates
- [ ] Add location-based matching algorithm

### Testing
- [ ] Add controller unit tests
- [ ] Add service unit tests
- [ ] Add model unit tests
- [ ] Add middleware unit tests
- [ ] Add API endpoint integration tests
- [ ] Test WebSocket functionality
- [ ] Add load testing for performance validation
- [ ] Add security testing for vulnerability detection

### Performance
- [ ] Add response compression
- [ ] Implement caching strategies for frequent requests
- [ ] Add database query optimization
- [ ] Add connection pooling for database
- [ ] Implement request batching where appropriate

### Security
- [ ] Add input sanitization for all user inputs
- [ ] Implement rate limiting for authentication attempts
- [ ] Add security headers (HSTS, X-Content-Type-Options, etc.)
- [ ] Add request validation for all endpoints
- [ ] Add audit logging for security events
- [ ] Add IP blocking for suspicious activity

### Monitoring
- [ ] Add performance metrics collection
- [ ] Implement error tracking and alerting
- [ ] Add usage analytics for feature adoption
- [ ] Add health checks for system components
- [ ] Implement logging infrastructure

### Documentation
- [ ] Add OpenAPI specifications
- [ ] Create comprehensive API reference
- [ ] Add code documentation with JSDoc
- [ ] Create architecture diagrams
- [ ] Add deployment documentation

## DevOps TODOs

### CI/CD
- [ ] Set up continuous integration pipeline
- [ ] Implement automated testing in CI
- [ ] Add deployment automation
- [ ] Implement environment-specific configurations

### Infrastructure
- [ ] Add database migration scripts
- [ ] Add production build optimization
- [ ] Add Docker configuration for containerization
- [ ] Implement infrastructure as code
- [ ] Set up monitoring and alerting

### Backup & Recovery
- [ ] Implement automated database backups
- [ ] Add disaster recovery procedures
- [ ] Implement data retention policies

## Feature TODOs

### Chat System
- [ ] Add real-time notifications for new messages
- [ ] Add message history with search functionality
- [ ] Add file sharing with preview
- [ ] Add end-to-end encryption for privacy
- [ ] Implement group chat with moderation

### Ad Management
- [ ] Add image upload/optimization pipeline
- [ ] Add location services for geographic targeting
- [ ] Add category management with filtering
- [ ] Add reporting system for inappropriate content
- [ ] Implement ad analytics dashboard

### Travel Itinerary
- [ ] Implement location verification system
- [ ] Add notification system for travel updates
- [ ] Add calendar integration
- [ ] Implement availability scheduling
- [ ] Add map visualization for travel routes

### Monetization
- [ ] Implement ad boosting and featuring options
- [ ] Add subscription management for premium features
- [ ] Implement payment processing integration
- [ ] Add analytics for revenue tracking
- [ ] Implement referral system

## Progress Tracking
- Current Status: Early Development/Refactoring
- Next Milestone: Complete Core Infrastructure
- Priority: Security & Authentication

## Areas for Improvement
- Refactor monolithic controllers into feature-specific modules
- Clean up and properly populate the custom Express middleware
- Split and modularize Angular components for better maintainability
- Enhance error handling in HTTP interceptors
- Review and update static asset paths and environment configurations

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

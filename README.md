# DateNight.io Classifieds (Project Codename: Solmeme)

## Description

DateNight.io aims to be a platform offering classified advertisements primarily focused on Escort, Striptease, and Massage services, initially targeting the Scandinavian market with a focus on Norway[cite: 2, 4]. The platform connects service providers (advertisers) with users (seekers), incorporating modern web application features like real-time chat, location-based searching, and multiple Browse interfaces [cite: Investorpresentasjon.pdf]. Future plans include functionality for advertisers to host live cam shows[cite: 3].

This project uses the MEAN stack (MongoDB, Express.js, Angular/AngularJS, Node.js).

**Note:** This project is currently undergoing a major code refactoring to improve structure and maintainability following an automated migration script. Manual code adjustments are in progress.

## Project Structure

The project is organized into separate `server` (backend) and `client` (frontend) directories.

.
├── README.md                   # This file
├── client                      # Frontend (AngularJS - requires refactoring)
│   ├── package.json            # Frontend dependencies (needs review/population)
│   └── src
│       ├── app                 # Main application code
│       │   ├── app.config.js   # Placeholder for Angular config (routing etc.)
│       │   ├── app.module.js   # Root Angular module (contains monolithic controller - NEEDS SPLITTING)
│       │   ├── components      # Shared/reusable UI components
│       │   │   └── card        # Example placeholder
│       │   ├── core            # Placeholder for core module (guards, interceptors)
│       │   ├── features        # Feature modules/components (NEEDS POPULATION)
│       │   │   ├── ad-browser  # Placeholder
│       │   │   ├── ad-management # Placeholder
│       │   │   ├── auth        # Placeholder
│       │   │   ├── chat        # Placeholder
│       │   │   ├── tinder      # Dedicated view and controller for Tinder-style swipe
│       │   │   └── gallery     # Dedicated view and controller for Netflix-style gallery
│       │   ├── models          # Placeholder for frontend models/interfaces
│       │   ├── services        # Placeholder for Angular services (NEEDS POPULATION)
│       │   └── shared          # Shared pipes, directives, constants
│       │       └── icons.constant.js # Moved from original assets
│       ├── assets              # Static assets
│       │   ├── images          # Images (default profile placeholder might be here)
│       │   └── styles          # Original styles moved here (needs review)
│       ├── environments        # Environment-specific settings
│       │   ├── environment.js
│       │   └── environment.prod.js
│       ├── index.html          # Main HTML entry point (paths NEED UPDATE)
│       ├── main.js             # Placeholder for app bootstrap
│       └── styles              # Global styles
│           ├── base.css        # Placeholder
│           ├── main.css        # Moved from original assets/styles
│           └── variables.css   # Placeholder
│   └── tests                   # Placeholder for frontend tests
├── scripts                     # Utility scripts
│   ├── seed.js                 # Database seeding script
│   └── setup.js                # Environment setup check script
└── server                      # Backend (Node.js / Express)
├── components              # Feature-based modules (NEED REFACTORING)
│   ├── SCHEMA_REFACTOR_NEEDED.js # Original models/index.js (NEEDS SPLITTING)
│   ├── ads
│   │   ├── ad.controller.js # Placeholder (logic needs move from server.js)
│   │   └── ad.routes.js    # Placeholder (routes need move from server.js)
│   ├── auth
│   │   ├── auth.controller.js # Placeholder
│   │   └── auth.routes.js    # Placeholder
│   ├── chat
│   │   ├── chat.controller.js # Placeholder
│   │   └── chat.routes.js    # Placeholder
│   └── users
│       ├── user.controller.js # Placeholder
│       └── user.routes.js    # Placeholder
├── config                  # Configuration files
│   ├── database.js         # Placeholder (DB logic needs move from server.js)
│   ├── environment.js      # Placeholder for env var handling
│   ├── index.js            # Placeholder for main config export
│   ├── oauth.js            # Moved from original config
│   └── passport.js         # Moved from original auth
├── middleware              # Custom Express middleware (NEEDS POPULATION)
│   ├── authenticateToken.js # Placeholder
│   └── errorHandler.js     # Placeholder
├── package.json            # Backend dependencies
├── server.js               # Main server entry point (Original index.js - NEEDS REFACTORING)
├── services                # Placeholder for shared services
├── tests                   # Placeholder for backend tests
└── utils                   # Utility functions
└── authHelpers.js      # Moved from original auth

## Technology Stack

* **MongoDB:** NoSQL Database
* **Express.js:** Backend web framework for Node.js
* **AngularJS (v1.x):** Frontend framework (Note: Currently AngularJS based on `client/app.module.js`, requires refactoring)
* **Node.js:** JavaScript runtime environment

## Setup and Installation

**Prerequisites:**

* Node.js and npm installed
* MongoDB installed and running (`mongod`)

**Steps:**

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <project-root-directory> # Should contain client/ server/ scripts/ etc.
    ```

2.  **Configure Environment:**
    * Copy the `.env.example` file to `.env`:
        ```bash
        cp .env.example .env
        ```
    * Edit the `.env` file with your specific credentials (MongoDB URI if needed, JWT Secret, OAuth Client IDs/Secrets). See OAuth Setup section below.

3.  **Install Dependencies:**
    * Install backend dependencies:
        ```bash
        cd server
        npm install
        cd ..
        ```
    * Install frontend dependencies (Review/update `client/package.json` first if managing frontend via npm):
        ```bash
        cd client
        npm install
        cd ..
        ```
    * NOTE: If you encounter an error like "Cannot find module 'mongoose'", ensure you install mongoose in the project root:
        ```bash
        npm install mongoose
        ```

4.  **Run Setup Script (Optional but Recommended):**
    * Verifies environment variables and basic DB connection.
    * Run from the project root:
        ```bash
        node scripts/setup.js
        ```

5.  **Seed Database (Optional):**
    * Ensure your MongoDB server is running.
    * Run the following command from the project root to populate dummy data:
        ```bash
        node scripts/seed.js
        ```
    * The script will connect to the database and insert sample documents (e.g. ads, users, etc.). Check the console output for progress and any errors.

6.  **Run the Application:**
    * **Start the Backend Server:**
        ```bash
        cd server
        npm run dev # Runs with nodemon for auto-restarts during development
        # OR
        npm start # Runs standard node server.js
        ```
        The server typically runs on `http://localhost:3000`.
    * **Start the Frontend:** (Since it's currently AngularJS likely served statically without a build step)
        * You need a simple HTTP server to serve the `client/src` directory.
        * If you have `http-server` installed (`npm install -g http-server`):
            ```bash
            http-server client/src -p 8080
            ```
        * Access the frontend at `http://localhost:8080`.

## Feature Roadmap & Status

**Core Platform:**

* **Ad Posting & Management:** ([Refactoring In Progress])  
  - Migrate from a monolithic controller to feature-based modules.  
  - Ensure proper separation for Escort/Striptease/Massage categories.
  
* **Authentication:** ([Refactoring In Progress])  
  - Abstract duplicate resolve logic into a shared service.  
  - Complete OAuth integration (GitHub, Google, Reddit, Apple).

**Browse & Searching:**

* **Tinder-style Swipe View:** ([Implemented, Needs Polishing])  
  - Create a dedicated view and controller under `client/src/app/features/tinder`.
  
* **Netflix-style Gallery View:** ([Implemented, Needs Polishing])  
  - Create a dedicated view and controller under `client/src/app/features/gallery`.

**User Interaction & Messaging:**

* **Real-time Chat:** ([Partially Implemented, Refactoring Needed])  
  - Improve notification, conversation history, and integrate socket reconnect logic.
* **End-to-End Encrypted Chat / Auto Deletion:** ([Not Implemented])  
  - New backend endpoints and client logic.
* **User Favorite Lists & Reviews:** ([Not Implemented])  
  - New modules for storing and displaying favorites and reviews.

**Monetization & Advanced Features:**

* **Paid Newsfeed/Twitter Feed:** ([Not Implemented])  
  - Feature for paid posts by advertisers.
* **Live Sex Show / Camshow Functionality:** ([Not Implemented])  
  - Ability for advertisers to broadcast paid shows.
* **Microtransactions:** ([Not Implemented])  
  - General concept for paid features.

**Other Implemented (Pre-Refactor):**

* **Advertiser Travel Plan:** ([Implemented], [Refactoring Needed]) Feature exists in code allowing advertisers to list counties.
* **County Filtering:** ([Implemented], [Refactoring Needed]) Client-side filtering by Norwegian county exists.

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

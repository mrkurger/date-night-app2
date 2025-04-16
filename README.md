# DateNight.io - Advertisement Platform

[![Angular Tests](https://github.com/mrkurger/date-night-app2/actions/workflows/angular-tests.yml/badge.svg)](https://github.com/mrkurger/date-night-app2/actions/workflows/angular-tests.yml)
[![Server Tests](https://github.com/mrkurger/date-night-app2/actions/workflows/server-tests.yml/badge.svg)](https://github.com/mrkurger/date-night-app2/actions/workflows/server-tests.yml)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/mrkurger/date-night-app2/blob/main/.github/dependabot.yml)

## Table of Contents

- [Description](#description)
  - [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Setup and Installation](#setup-and-installation)
- [Customization System](#customization-system)
- [Feature Roadmap & Status](#feature-roadmap--status)
- [Development Roadmap](#development-roadmap)
- [OAuth Setup Instructions](#oauth-setup-instructions)
- [TODOs Summary](#todos-summary)
- [Documentation](#documentation)
  - [Project Documentation](#project-documentation)
  - [Development Guides](#development-guides)
  - [Testing Documentation](#testing-documentation)
  - [UI/UX Documentation](#uiux-documentation)
  - [Customization Documentation](#customization-documentation)
  - [Security Documentation](#security-documentation)
  - [GitHub Integration](#github-integration)
  - [Workflow Error Monitoring](#workflow-error-monitoring)
  - [Lessons Learned](#lessons-learned)

## Description

DateNight.io is a platform offering classified advertisements primarily focused on Escort, Striptease, and Massage services, initially targeting the Scandinavian market with a focus on Norway. The platform connects service providers (advertisers) with users (seekers), incorporating modern web application features like real-time chat, location-based searching, and multiple browsing interfaces.

### Key Features

- **Advertisement Platform**: Create, manage, and browse ads for escort and stripper services
- **Travel Itinerary**: Track advertisers' locations when they are actively seeking clientele
- **Real-time Chat**: Direct messaging between users and advertisers with end-to-end encryption (AES-256 and RSA-2048)
- **Multiple Browsing Interfaces**: Traditional list/grid view, Tinder-style swipe interface, Netflix-style gallery
- **User Profiles**: Comprehensive profiles for both advertisers and users
- **Monetization**: Premium ad placements, subscription model, camshow integration

This project uses the MEAN stack (MongoDB, Express.js, Angular, Node.js).

**Note:** The project has been fully migrated from AngularJS to Angular. The new Angular frontend is located in the `client-angular/` directory.

## Project Structure

The project uses a modern Angular frontend with an Express.js backend:

```
.
├── README.md                   # Project documentation
├── client-angular/            # Angular frontend application
│   ├── src/                   # Angular source code
│   │   ├── app/               # Application components and modules
│   │   │   ├── core/          # Core services and guards
│   │   │   ├── features/      # Feature modules (chat, ads, etc.)
│   │   │   └── shared/        # Shared components and directives
│   │   ├── assets/            # Static assets
│   │   └── environments/      # Environment configurations
├── server/                    # Express.js backend
│   ├── components/            # Feature components
│   ├── config/                # Server configuration
│   ├── controllers/           # API controllers
│   ├── middleware/            # Express middleware
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   ├── services/              # Business logic services
│   └── utils/                 # Utility functions
├── docs/                      # Project documentation
│   ├── CUSTOMIZATION_GUIDE.md # Guide for the customization system
│   └── CONFIG_INDEX.md        # Index of all customizable settings
└── scripts/                   # Utility scripts
    ├── update_customization_headers.py  # Updates customization headers
    └── update_config_index.py           # Updates the configuration index
```

## Technology Stack

- **Frontend:**
  - Angular 19.2
  - RxJS
  - Socket.IO Client
  - Bootstrap 5
  - Angular Material
  - NgRx for state management
- **Backend:**
  - Node.js & Express
  - MongoDB & Mongoose
  - Socket.IO
  - JWT Authentication
  - Passport.js
  - WebRTC (for streaming features)

## Setup and Installation

**Prerequisites:**

- Node.js v22.14.0 and npm v10.9.2 installed
- MongoDB installed and running (`mongod`)
- Angular CLI installed globally (`npm install -g @angular/cli`)

**Steps:**

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd date-night-app
   ```

2. **Configure Environment:**

   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` file with your specific credentials (MongoDB URI, JWT Secret, OAuth Client IDs/Secrets)

3. **Install Dependencies:**

   ```bash
   npm run install-all
   ```

4. **Run Setup Script:**

   - Verifies environment variables and basic DB connection:
     ```bash
     node scripts/setup.js
     ```

5. **Seed Database (Optional):**

   - Ensure your MongoDB server is running
   - Populate the database with sample data:
     ```bash
     node scripts/seed.js
     ```

6. **Run the Application:**

   ```bash
   npm run dev
   ```

7. **Access the Application:**
   - Open your browser and navigate to `http://localhost:4200`
   - The API is available at `http://localhost:3000/api/v1`

## Customization System

The project implements a standardized customization system to make it easy for developers to locate, understand, and modify configuration settings across the entire codebase.

### Key Components

1. **CUSTOMIZATION_GUIDE.md**: Central documentation explaining how to use the customization system
2. **CONFIG_INDEX.md**: A comprehensive catalog of all customizable settings
3. **Standardized Headers**: All files with customizable settings include a standardized header
4. **Maintenance Utilities**: Scripts to maintain the customization system

### How to Use

1. Consult the **CONFIG_INDEX.md** file to find the settings you want to customize
2. Navigate to the specific file containing the settings
3. Make your changes following the guidelines in the file's header

### Updating the Customization System

When adding new customizable settings:

```bash
# Make the scripts executable
chmod +x scripts/make_customization_scripts_executable.sh
./scripts/make_customization_scripts_executable.sh

# Update customization headers
python3 scripts/update_customization_headers.py

# Update the configuration index
python3 scripts/update_config_index.py
```

For more details, see [docs/CUSTOMIZATION_GUIDE.md](/docs/CUSTOMIZATION_GUIDE.md).

## Feature Roadmap & Status

### Completed ✅

- Angular migration from AngularJS
- Core authentication system with OAuth integration
- Basic chat functionality
- Ad management features (create, edit, browse)
- Multiple browsing interfaces (List, Tinder-style, Netflix-style)
- UI/UX implementation with responsive design
- User profile management

### In Progress 🔄

- Enhanced chat with end-to-end encryption
- Travel itinerary system with location-based matching
  - ✅ Norwegian counties and cities database with coordinates
  - ✅ Location selection components for county/city
- User interaction features (favorites, reviews, ratings)
- Advanced search and filtering options

### Planned 📅

- Premium ad features (featured listings, enhanced visibility)
- Camshow integration with WebRTC
- Subscription model for content creators
- Mobile app development
- Analytics and monitoring dashboard
- Performance optimizations and security enhancements

## Development Roadmap

See our detailed implementation plan in [docs/completion-plan-2024.md](/docs/completion-plan-2024.md) for a comprehensive roadmap of upcoming features and enhancements.

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
- [x] Implement end-to-end encryption for private communications
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
- [x] Implement end-to-end encryption

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

## Documentation

This section provides links to all documentation files in the project, organized by category.

### Project Documentation

- [ChangeLog.md](/docs/ChangeLog.md) - History of changes to the project
- [Requirements.md](/docs/requirements.md) - Project requirements and specifications
- [Task List](/docs/task-list.md) - Current tasks and their status
- [Completion Plan 2024](/docs/completion-plan-2024.md) - Plan for completing the project in 2024
- [Migration Completion Plan](/docs/migration-completion-plan.md) - Plan for completing the Angular migration
- [Implementation Plan](/docs/implementation-plan.md) - General implementation plan
- [Architecture](docs/ARCHITECTURE.md) - System architecture documentation
- [Deprecated Code](/docs/DEPRECATED.md) - List of deprecated code that should be avoided
- [Code Duplication](/docs/DUPLICATES.md) - List of code duplication that should be refactored
- [Documentation Improvements](/docs/documentation-improvements.md) - Summary of documentation improvements
- [Documentation Index](/docs/DOCUMENTATION_INDEX.md) - Comprehensive index of all documentation
- [Documentation Style Guide](/docs/DOCUMENTATION_STYLE_GUIDE.md) - Guidelines for writing documentation

### GitHub Integration

- [GitHub Integration Strategy](/docs/GITHUB_INTEGRATION.md) - Comprehensive strategy for GitHub integration
- [GitHub Setup Guide](/docs/GITHUB_SETUP.md) - Instructions for setting up GitHub repository
- [GitHub Workflow Permissions](/docs/GITHUB_WORKFLOW_PERMISSIONS.md) - Guide to resolving workflow permission issues
- [Security Alerts Workflow](/docs/SECURITY_ALERTS_WORKFLOW.md) - Guide to security alerts generation workflows
- [GitHub Insights Workflow](/docs/GITHUB_INSIGHTS_WORKFLOW.md) - Guide to GitHub insights generation workflows
- [AI-Powered GitHub Actions](/docs/AI_GITHUB_ACTIONS.md) - AI-powered GitHub Actions for the project
- [GitHub Insights](/docs/github-insights/README.md) - Reports and data from GitHub Actions workflows

### Workflow Error Monitoring

- [Workflow Error Monitoring System](/docs/WORKFLOW_ERROR_MONITORING.md) - Documentation for the workflow error monitoring system
- [Workflow Error Logs](/workflow-error-logs/README.md) - Directory containing logs from failed GitHub Actions workflows
- [Workflow Error Analysis Tool](/scripts/analyze-workflow-errors.js) - Script for analyzing workflow error logs

### Development Guides

- [Setup Guide](SETUP.md) - Guide for setting up the development environment
- [Node.js Installation Guide](nodejs-installation-guide.md) - Guide for installing Node.js
- [Specific Version Installation Guide](specific-version-installation-guide.md) - Guide for installing specific versions of Node.js
- [MongoDB Troubleshooting](MONGODB_TROUBLESHOOTING.md) - Guide for troubleshooting MongoDB issues

### Testing Documentation

- [Testing Guide](/docs/TESTING_GUIDE.md) - General testing strategy and guidelines
- [Angular Testing Lessons](/docs/ANGULAR_TESTING_LESSONS.md) - Lessons learned from Angular testing
- [Unit Testing Lessons](/docs/UnitTestLessons.md) - Lessons learned from unit testing
- [Unit Testing Strategy](/docs/UnitStrat.md) - Strategy for unit testing
- [Example Unit Strategy](/docs/Example_UnitStrat.md) - Example of a unit testing strategy
- [Frontend Testing Review](FRONTEND_TESTING_REVIEW.md) - Review of frontend testing
- [Testing Improvements](TESTING_IMPROVEMENTS.md) - Improvements to testing

### UI/UX Documentation

- [UI/UX Roadmap](/docs/ui-ux-roadmap.md) - Roadmap for UI/UX improvements
- [UI/UX Implementation](/docs/ui-ux-implementation.md) - Implementation details for UI/UX
- [UI/UX Improvement Summary](/docs/ui-ux-improvement-summary.md) - Summary of UI/UX improvements
- [UI/UX Completion Report](/docs/ui-ux-completion-report.md) - Report on UI/UX completion
- [UI Components Technical](/docs/ui-components-technical.md) - Technical details of UI components
- [Styling Guide](/docs/styling-guide.md) - Guide for styling components

### Customization Documentation

- [Customization Guide](/docs/CUSTOMIZATION_GUIDE.md) - Guide for using the customization system
- [Configuration Index](/docs/CONFIG_INDEX.md) - Index of all customizable settings
- [CSP Configuration](/docs/csp-configuration.md) - Guide for configuring Content Security Policy

### Security Documentation

- [End-to-End Encryption](/docs/END_TO_END_ENCRYPTION.md) - Implementation details of the E2EE chat system
- [Security Best Practices](/docs/SECURITY_BEST_PRACTICES.md) - Security best practices for the application
- [Authentication Flow](/docs/AUTHENTICATION_FLOW.md) - Details of the authentication system
- [Data Protection](/docs/DATA_PROTECTION.md) - How user data is protected in the application

### Emerald Component Documentation

- [Emerald Components](/docs/emerald-components.md) - Documentation for Emerald UI components
- [Emerald Components Changelog](/docs/emerald-components-changelog.md) - Changelog for Emerald components
- [Emerald Implementation Plan](/docs/emerald-implementation-plan.md) - Plan for implementing Emerald components
- [Emerald Implementation Report](/docs/emerald-implementation-report.md) - Report on Emerald implementation
- [Emerald Implementation Summary](/docs/emerald-implementation-summary.md) - Summary of Emerald implementation
- [Emerald Testing Guide](/docs/emerald-testing-guide.md) - Guide for testing Emerald components

### Lessons Learned

- [AI Lessons](/docs/AILessons.md) - Lessons learned by the AI while working on the project
- [Unit Testing Lessons](/docs/UnitTestingLessons.md) - Comprehensive lessons learned from unit testing

## Progress Tracking

- Current Status: Early Development/Refactoring
- Next Milestone: Complete Core Infrastructure
- Priority: Security & Authentication

## Areas for Improvement

- Refactor monolithic controllers (e.g. in client/app.module.js) into feature-specific modules.
- Clean up and properly populate the custom Express middleware under the /middleware directory.
- Split and modularize Angular components for authentication, ad management, and chat.
- Enhance error handling in HTTP interceptors.
- Review and update static asset paths and environment configurations.

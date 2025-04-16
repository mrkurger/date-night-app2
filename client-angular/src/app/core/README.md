# Core Module Documentation

This document provides an overview of the core services and interceptors available in the Date Night App.

## Core Services

### Authentication & User Management

- **AuthService**: Handles user authentication, login, registration, and session management.
- **UserService**: Manages user profile data and user-related operations.
- **CsrfService**: Provides CSRF token management for secure form submissions.
- **VerificationService**: Handles user verification processes like email verification.

### Security

- **EncryptionService**: Provides end-to-end encryption for chat messages using the Web Crypto API.
- **CryptoService**: Offers cryptographic utilities for general-purpose encryption and hashing.
- **SafetyService**: Implements safety features like content warnings and reporting mechanisms.
- **ContentSanitizerService**: Sanitizes user-generated content to prevent XSS attacks.

### Data Management

- **FavoriteService**: Manages user favorites, allowing users to save and organize ads.
- **ProfileService**: Handles user profile data and profile-related operations.
- **MediaService**: Manages media uploads, processing, and retrieval.

### Location & Mapping

- **GeocodingService**: Converts between addresses and geographic coordinates.
- **LocationService**: Provides location-related utilities and data for Norwegian locations.
- **TravelService**: Manages travel itineraries and location-based searches.
- **MapMonitoringService**: Tracks map usage and performance metrics.

### Utilities

- **NotificationService**: Displays user notifications and toast messages.
- **TelemetryService**: Collects anonymous usage data for application improvement.
- **CachingService**: Provides caching mechanisms to improve application performance.

## HTTP Interceptors

The application uses several HTTP interceptors to handle cross-cutting concerns:

1. **CSPInterceptor**: Enforces Content Security Policy headers.
2. **AuthInterceptor**: Adds authentication tokens to outgoing requests.
3. **CsrfInterceptor**: Adds CSRF tokens to requests that modify data.
4. **HttpErrorInterceptor**: Handles HTTP errors and provides user-friendly error messages.

## Usage

Most services are provided at the root level and can be injected directly into components:

```typescript
import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
})
export class MyComponent {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  login(username: string, password: string): void {
    this.authService.login(username, password).subscribe({
      next: () => {
        this.notificationService.success('Login successful');
      },
      error: error => {
        this.notificationService.error('Login failed: ' + error.message);
      },
    });
  }
}
```

## Service Dependencies

Some services have dependencies on other services. Here's a simplified dependency graph:

- **AuthInterceptor** → AuthService, UserService
- **CsrfInterceptor** → CsrfService
- **HttpErrorInterceptor** → NotificationService, TelemetryService, AuthService
- **EncryptionService** → AuthService
- **FavoriteService** → (independent)
- **GeocodingService** → LocationService
- **MapComponent** → GeocodingService, MapMonitoringService

## Best Practices

1. **Service Injection**: Inject only the services you need in each component.
2. **Error Handling**: Use the NotificationService to display user-friendly error messages.
3. **Authentication**: Check user authentication status with AuthService before accessing protected features.
4. **Encryption**: Use EncryptionService for sensitive data that needs to be encrypted.
5. **Location**: Use GeocodingService and LocationService for location-related functionality.

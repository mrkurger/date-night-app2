// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for core.module settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

// Services
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { CsrfService } from './services/csrf.service';
import { NotificationService } from './services/notification.service';
import { TelemetryService } from './services/telemetry.service';
import { EncryptionService } from './services/encryption.service';
import { FavoriteService } from './services/favorite.service';
import { GeocodingService } from './services/geocoding.service';
import { LocationService } from './services/location.service';
import { TravelService } from './services/travel.service';
import { MapMonitoringService } from './services/map-monitoring.service';
import { CachingService } from './services/caching.service';
import { ContentSanitizerService } from './services/content-sanitizer.service';
import { CryptoService } from './services/crypto.service';
import { MediaService } from './services/media.service';
import { ProfileService } from './services/profile.service';
import { SafetyService } from './services/safety.service';
import { VerificationService } from './services/verification.service';

// Interceptors
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor.simple';
import { authInterceptor } from './interceptors/auth.interceptor';
import { cspInterceptor } from './interceptors/csp.interceptor';
import { CsrfInterceptor } from './interceptors/csrf.interceptor';

/**
 * Factory functions to avoid circular dependencies
 * These create instances of interceptors with their required dependencies
 */
export function cspInterceptorFactory() {
  return cspInterceptor;
}

export function authInterceptorFactory(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  authService: AuthService,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userService: UserService,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  router: Router,
) {
  // These services are injected but not directly used in the factory
  // They are needed for the interceptor to work properly
  return authInterceptor;
}

export function csrfInterceptorFactory(csrfService: CsrfService) {
  // The csrfService is injected but not directly used in the factory
  // It is needed for the interceptor to work properly
  return CsrfInterceptor;
}

export function httpErrorInterceptorFactory() {
  const interceptor = new HttpErrorInterceptor();

  // Configure the interceptor with default settings
  interceptor.configure({
    showNotifications: true,
    retryFailedRequests: true,
    maxRetryAttempts: 2,
    retryDelay: 1000,
    redirectToLogin: true,
    logErrors: true,
    includeRequestDetails: false,
    trackErrors: true,
    trackPerformance: false,
    groupSimilarErrors: true,
    retryJitter: 200,
    sanitizeSensitiveData: true,
    skipUrls: ['/assets/', '/api/health'],
  });

  return interceptor;
}

/**
 * Core Module
 *
 * This module provides all core services and interceptors for the application.
 * Most services are already provided with `providedIn: 'root'` in their definitions,
 * but they are listed here for documentation and clarity.
 *
 * Note: Order matters for interceptors - they are applied in the order listed.
 */
@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    // Core Services
    AuthService,
    UserService,
    CsrfService,
    NotificationService,
    TelemetryService,

    // Feature Services
    EncryptionService,
    FavoriteService,
    GeocodingService,
    LocationService,
    TravelService,
    MapMonitoringService,

    // Utility Services
    CachingService,
    ContentSanitizerService,
    CryptoService,
    MediaService,
    ProfileService,
    SafetyService,
    VerificationService,

    // HTTP Interceptors
    { provide: HTTP_INTERCEPTORS, useFactory: cspInterceptorFactory, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: authInterceptorFactory,
      deps: [AuthService, UserService, Router],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: csrfInterceptorFactory,
      deps: [CsrfService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: httpErrorInterceptorFactory,
      deps: [Router, NotificationService, TelemetryService, AuthService],
      multi: true,
    },
  ],
})
export class CoreModule {}

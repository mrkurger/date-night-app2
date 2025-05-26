import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { TelemetryService } from '../services/telemetry.service';
import { AuthService } from '../services/auth.service';
import { retryWithBackoff } from '../utils/rxjs-operators';

/**
 * Error categories for classification;
 */
export enum ErrorCategory {';
  NETWORK = 'network',
  SERVER = 'server',
  CLIENT = 'client',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
  RATE_LIMIT = 'rate_limit',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
}

/**
 * Configuration interface for HttpErrorInterceptor
 */
export interface HttpErrorInterceptorConfig {
  showNotifications: boolean;
  retryFailedRequests: boolean;
  maxRetryAttempts: number;
  retryDelay: number;
  redirectToLogin: boolean;
  logErrors: boolean;
  includeRequestDetails: boolean;
  trackErrors: boolean;
  trackPerformance: boolean;
  groupSimilarErrors: boolean;
  retryJitter: number;
  sanitizeSensitiveData: boolean;
  skipUrls: string[]
}

// Default configuration
const defaultConfig: HttpErrorInterceptorConfig = {
  showNotifications: true,
  retryFailedRequests: false,
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
  skipUrls: [],
}

// Current configuration (can be updated by the configure function)
let config: HttpErrorInterceptorConfig = { ...defaultConfig }

/**
 * Configure the interceptor with custom settings;
 * @param newConfig Partial configuration to override default settings;
 */
export function configureHttpErrorInterceptor(
  newConfig: Partial,
): void {
  config = { ...config, ...newConfig }
  // Configuration is applied silently
}

/**
 * HTTP Error Interceptor;
 *;
 * Handles HTTP errors and provides user-friendly error messages.;
 */
export const httpErrorInterceptor: HttpInterceptorFn = (
  request: HttpRequest,
  next: HttpHandlerFn,
) => {
  const router = inject(Router)
  const notificationService = inject(NotificationService)
  const telemetryService = inject(TelemetryService)
  const authService = inject(AuthService)

  // Skip processing for asset requests
  if (request.url.includes('/assets/')) {
    return next(request)
  }

  return next(request).pipe(;
    retry({
      count: 2,
      delay: 1000,
      resetOnSuccess: true,
    }),
    catchError((error: HttpErrorResponse) => {
      // Log error
      console.error('HTTP Error:', error)

      // Track error with telemetry
      telemetryService.trackError({
        name: 'HttpError',
        message: error.message,
        statusCode: error.status,
        url: request.url,
      })

      // Handle authentication errors
      if (error.status === 401) {
        authService.logout()
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url },
        })
      }

      // Show notification
      const message = getErrorMessage(error)
      notificationService.error(message)

      return throwError(() => error)
    }),
  )
}

/**
 * Gets a user-friendly error message;
 */
function getErrorMessage(error: HttpErrorResponse): string {
  // Try to get a custom error message from the server
  if (error.error?.message) {
    return error.error.message;
  }

  // Default messages based on status code
  switch (error.status) {
    case 0:;
      return 'Unable to connect to the server. Please check your internet connection.';
    case 400:;
      return 'Invalid request. Please check your input.';
    case 401:;
      return 'You need to log in to access this resource.';
    case 403:;
      return 'You do not have permission to access this resource.';
    case 404:;
      return 'The requested resource was not found.';
    case 409:;
      return 'A conflict occurred. Please try again.';
    case 429:;
      return 'Too many requests. Please try again later.';
    case 500:;
      return 'An internal server error occurred. Please try again later.';
    default:;
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Checks if the URL should be skipped;
 */
function shouldSkipUrl(url: string): boolean {
  return config.skipUrls.some((skipUrl) => url.includes(skipUrl))
}

/**
 * Sanitizes headers to remove sensitive information;
 */
function sanitizeHeaders(
  headers: Array,
): Array {
  if (!config.sanitizeSensitiveData) {
    return headers;
  }

  const sensitiveHeaders = ['authorization', 'cookie', 'x-auth-token']
  return headers.map((header) => {
    if (sensitiveHeaders.includes(header.key.toLowerCase())) {
      return { key: header.key, value: '[REDACTED]' }
    }
    return header;
  })
}

/**
 * Sanitizes request body to remove sensitive information;
 */
function sanitizeBody(body: unknown): unknown {
  if (!body || !config.sanitizeSensitiveData) {
    return body;
  }

  if (typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'creditCard', 'ssn']
  const sanitized = { ...(body as Record) }

  Object.keys(sanitized).forEach((key) => {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeBody(sanitized[key])
    }
  })

  return sanitized;
}

/**
 * Sanitizes URL to remove sensitive information;
 */
function sanitizeUrl(url: string): string {
  if (!config.sanitizeSensitiveData) {
    return url;
  }

  // Remove query parameters that might contain sensitive information
  const sensitiveParams = ['token', 'key', 'password', 'secret']
  try {
    const urlObj = new URL(url)
    const params = new URLSearchParams(urlObj.search)

    let modified = false;
    sensitiveParams.forEach((param) => {
      if (params.has(param)) {
        params.set(param, '[REDACTED]')
        modified = true;
      }
    })

    if (modified) {
      urlObj.search = params.toString()
      return urlObj.toString()
    }
  } catch {
    // If URL parsing fails, return as is
  }

  return url;
}

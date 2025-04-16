import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

/**
 * Configuration options for the HTTP error interceptor
 */
export interface HttpErrorInterceptorConfig {
  /** Whether to show notifications for errors */
  showNotifications: boolean;
  /** Whether to retry failed requests */
  retryFailedRequests: boolean;
  /** Maximum number of retry attempts */
  maxRetryAttempts: number;
  /** Base delay for exponential backoff (in ms) */
  retryDelay: number;
  /** Whether to redirect to login on 401 errors */
  redirectToLogin: boolean;
  /** Whether to log errors to console */
  logErrors: boolean;
  /** Whether to include request details in error logs */
  includeRequestDetails: boolean;
}

/**
 * Default configuration for the HTTP error interceptor
 */
const DEFAULT_CONFIG: HttpErrorInterceptorConfig = {
  showNotifications: true,
  retryFailedRequests: true,
  maxRetryAttempts: 2,
  retryDelay: 1000,
  redirectToLogin: true,
  logErrors: true,
  includeRequestDetails: true,
};

/**
 * HTTP interceptor that handles error responses
 * - Retries failed requests with exponential backoff
 * - Shows user-friendly error notifications
 * - Redirects to login page on authentication errors
 * - Logs detailed error information
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private config: HttpErrorInterceptorConfig;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.config = DEFAULT_CONFIG;
  }

  /**
   * Configure the interceptor
   * @param config Configuration options
   */
  configure(config: Partial<HttpErrorInterceptorConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Intercept HTTP requests and handle errors
   * @param request The outgoing request
   * @param next The next handler
   * @returns An observable of the HTTP event
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip error handling for specific endpoints if needed
    if (this.shouldSkipErrorHandling(request.url)) {
      return next.handle(request);
    }

    let retryAttempt = 0;

    return next.handle(request).pipe(
      // Retry failed requests with exponential backoff
      this.config.retryFailedRequests
        ? retry({
            count: this.config.maxRetryAttempts,
            delay: error => {
              if (this.isRetryable(error)) {
                retryAttempt++;
                const delay = this.getRetryDelay(retryAttempt);

                if (this.config.logErrors) {
                  console.log(
                    `Retrying request (${retryAttempt}/${this.config.maxRetryAttempts}) after ${delay}ms`
                  );
                }

                return timer(delay);
              }
              return throwError(() => error);
            },
          })
        : tap(),

      // Handle errors
      catchError((error: HttpErrorResponse) => {
        const errorDetails = this.getErrorDetails(error, request);

        // Log the error
        if (this.config.logErrors) {
          this.logError(errorDetails);
        }

        // Show notification
        if (this.config.showNotifications) {
          this.showErrorNotification(errorDetails);
        }

        // Handle authentication errors
        if (error.status === 401 && this.config.redirectToLogin) {
          this.router.navigate(['/auth/login']);
        }

        // Return the error for further handling
        return throwError(() => ({
          error,
          message: errorDetails.userMessage,
          details: errorDetails,
        }));
      }),

      // Finalize the request
      finalize(() => {
        // Clean up any resources if needed
      })
    );
  }

  /**
   * Determine if an error is retryable
   * @param error The HTTP error
   * @returns Whether the error is retryable
   */
  private isRetryable(error: HttpErrorResponse): boolean {
    // Don't retry client-side errors
    if (error.error instanceof ErrorEvent) {
      return false;
    }

    // Don't retry authentication errors
    if (error.status === 401 || error.status === 403) {
      return false;
    }

    // Don't retry bad requests
    if (error.status === 400) {
      return false;
    }

    // Retry server errors and network errors
    return error.status === 0 || error.status >= 500;
  }

  /**
   * Calculate retry delay with exponential backoff
   * @param attempt The retry attempt number
   * @returns The delay in milliseconds
   */
  private getRetryDelay(attempt: number): number {
    // Exponential backoff: baseDelay * 2^attempt
    return this.config.retryDelay * Math.pow(2, attempt - 1);
  }

  /**
   * Get detailed error information
   * @param error The HTTP error
   * @param request The original request
   * @returns Detailed error information
   */
  private getErrorDetails(error: HttpErrorResponse, request: HttpRequest<unknown>): any {
    let errorCode = 'unknown_error';
    let userMessage = 'An unknown error occurred';
    let technicalMessage = error.message || 'Unknown error';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorCode = 'client_error';
      userMessage = 'A problem occurred in your browser';
      technicalMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorCode = 'network_error';
          userMessage = 'Unable to connect to the server';
          technicalMessage = 'Network error or CORS issue';
          break;
        case 400:
          errorCode = 'bad_request';
          userMessage = 'The request was invalid';
          technicalMessage = error.error?.message || 'Bad Request';
          break;
        case 401:
          errorCode = 'unauthorized';
          userMessage = 'Please log in to continue';
          technicalMessage = 'Authentication required';
          break;
        case 403:
          errorCode = 'forbidden';
          userMessage = 'You do not have permission to access this resource';
          technicalMessage = 'Access forbidden';
          break;
        case 404:
          errorCode = 'not_found';
          userMessage = 'The requested resource was not found';
          technicalMessage = 'Resource not found';
          break;
        case 408:
          errorCode = 'timeout';
          userMessage = 'The request timed out';
          technicalMessage = 'Request timeout';
          break;
        case 409:
          errorCode = 'conflict';
          userMessage = 'The request could not be completed due to a conflict';
          technicalMessage = error.error?.message || 'Resource conflict';
          break;
        case 422:
          errorCode = 'validation_error';
          userMessage = 'The submitted data is invalid';
          technicalMessage = error.error?.message || 'Validation failed';
          break;
        case 429:
          errorCode = 'too_many_requests';
          userMessage = 'Too many requests, please try again later';
          technicalMessage = 'Rate limit exceeded';
          break;
        case 500:
          errorCode = 'server_error';
          userMessage = 'Something went wrong on our end';
          technicalMessage = error.error?.message || 'Internal server error';
          break;
        case 503:
          errorCode = 'service_unavailable';
          userMessage = 'Service temporarily unavailable';
          technicalMessage = 'Service unavailable';
          break;
        default:
          errorCode = `http_${error.status}`;
          userMessage = `Error ${error.status}: ${error.statusText}`;
          technicalMessage = error.error?.message || error.statusText;
      }
    }

    const details: any = {
      errorCode,
      userMessage,
      technicalMessage,
      timestamp: new Date().toISOString(),
      status: error.status,
      statusText: error.statusText,
    };

    // Include request details if configured
    if (this.config.includeRequestDetails) {
      details.request = {
        url: request.url,
        method: request.method,
        headers: this.getHeadersMap(
          request.headers.keys().map(key => ({ key, value: request.headers.get(key) }))
        ),
        body: this.sanitizeRequestBody(request.body),
      };
    }

    // Include error response if available
    if (error.error && typeof error.error === 'object') {
      details.response = error.error;
    }

    return details;
  }

  /**
   * Log error details to the console
   * @param errorDetails The error details
   */
  private logError(errorDetails: any): void {
    console.group('HTTP Error');
    console.error(`${errorDetails.errorCode}: ${errorDetails.technicalMessage}`);
    console.error('Details:', errorDetails);
    console.groupEnd();
  }

  /**
   * Show an error notification to the user
   * @param errorDetails The error details
   */
  private showErrorNotification(errorDetails: any): void {
    this.notificationService.error(errorDetails.userMessage);
  }

  /**
   * Convert headers array to a map
   * @param headers The headers array
   * @returns Headers map
   */
  private getHeadersMap(
    headers: Array<{ key: string; value: string | null }>
  ): Record<string, string> {
    const result: Record<string, string> = {};

    headers.forEach(({ key, value }) => {
      if (value !== null) {
        // Exclude sensitive headers
        if (!this.isSensitiveHeader(key)) {
          result[key] = value;
        }
      }
    });

    return result;
  }

  /**
   * Check if a header is sensitive and should be excluded from logs
   * @param headerName The header name
   * @returns Whether the header is sensitive
   */
  private isSensitiveHeader(headerName: string): boolean {
    const sensitiveHeaders = [
      'authorization',
      'x-auth-token',
      'cookie',
      'set-cookie',
      'x-csrf-token',
    ];

    return sensitiveHeaders.includes(headerName.toLowerCase());
  }

  /**
   * Sanitize request body to remove sensitive information
   * @param body The request body
   * @returns Sanitized body
   */
  private sanitizeRequestBody(body: any): any {
    if (!body) {
      return body;
    }

    if (typeof body !== 'object') {
      return body;
    }

    // Clone the body to avoid modifying the original
    const sanitized = { ...body };

    // Mask sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'creditCard', 'cardNumber'];

    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '********';
      }
    });

    return sanitized;
  }

  /**
   * Check if error handling should be skipped for a URL
   * @param url The request URL
   * @returns Whether to skip error handling
   */
  private shouldSkipErrorHandling(url: string): boolean {
    // Skip error handling for specific endpoints
    const skipUrls = ['/api/health', '/api/metrics'];

    return skipUrls.some(skipUrl => url.includes(skipUrl));
  }
}

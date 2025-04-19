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
  /** Whether to track errors with telemetry */
  trackErrors: boolean;
  /** Whether to track performance metrics */
  trackPerformance: boolean;
  /** Whether to group similar errors in notifications */
  groupSimilarErrors: boolean;
  /** Maximum jitter to add to retry delay (in ms) */
  retryJitter: number;
  /** Whether to sanitize sensitive data in logs */
  sanitizeSensitiveData: boolean;
  /** URLs to skip error handling for */
  skipUrls: string[];
}

/**
 * Default configuration for the HTTP error interceptor
 */
export const DEFAULT_HTTP_ERROR_CONFIG: HttpErrorInterceptorConfig = {
  showNotifications: true,
  retryFailedRequests: true,
  maxRetryAttempts: 3,
  retryDelay: 1000,
  redirectToLogin: true,
  logErrors: true,
  includeRequestDetails: true,
  trackErrors: true,
  trackPerformance: true,
  groupSimilarErrors: true,
  retryJitter: 300,
  sanitizeSensitiveData: true,
  skipUrls: ['/api/health', '/api/metrics', '/api/telemetry'],
};

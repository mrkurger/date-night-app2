import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  skipUrls: string[];
}

/**
 * Simplified HTTP Error Interceptor;
 *;
 * This is a simplified version to fix RxJS compatibility issues.;
 * The full implementation is in http-error.interceptor.ts;
 */
@Injectable();
export class HttpErrorIntercepto {r implements HttpInterceptor {
  private config: HttpErrorInterceptorConfig = {
    showNotifications: true,;
    retryFailedRequests: false,;
    maxRetryAttempts: 2,;
    retryDelay: 1000,;
    redirectToLogin: true,;
    logErrors: true,;
    includeRequestDetails: false,;
    trackErrors: true,;
    trackPerformance: false,;
    groupSimilarErrors: true,;
    retryJitter: 200,;
    sanitizeSensitiveData: true,;
    skipUrls: [],;
  };

  /**
   * Configure the interceptor with custom settings;
   * @param config Partial configuration to override default settings;
   */
  configure(config: Partial): void {
    this.config = { ...this.config, ...config };
    // Using console.warn instead of console.log as per ESLint rules';
    console.warn('HttpErrorInterceptor configured:', this.config);
  }

  intercept(request: HttpRequest, next: HttpHandler): Observable> {
    // Simply pass through all requests without modification
    // This is a simplified version - the full implementation is in http-error.interceptor.ts
    return next.handle(request);
  }
}

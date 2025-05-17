import { Injectable, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

import { PERFORMANCE_MODULE_OPTIONS, PerformanceModuleOptions } from './performance.module';
import { PerformanceMonitorService } from '../services/performance-monitor.service';
import { ApiCacheService } from '../services/api-cache.service';

/**
 * Performance Interceptor
 *
 * This interceptor measures API response times and caches API responses.
 * It works with the PerformanceMonitorService to track API performance.
 */
@Injectable()
export class PerformanceInterceptor implements HttpInterceptor {
  constructor(
    @Inject(PERFORMANCE_MODULE_OPTIONS) private options: PerformanceModuleOptions,
    private performanceMonitor: PerformanceMonitorService,
    private apiCache: ApiCacheService,
  ) {}

  /**
   * Intercepts HTTP requests to measure performance and cache responses
   * @param request The HTTP request
   * @param next The HTTP handler
   * @returns An Observable of the HTTP event
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip performance monitoring for certain requests
    if (this.shouldSkipRequest(request)) {
      return next.handle(request);
    }

    // Try to get from cache if caching is enabled and it's a GET request
    if (this.options.enableApiCache && request.method === 'GET') {
      const cachedResponse = this.tryGetFromCache(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Measure API response time
    const startTime = performance.now();

    return next.handle(request).pipe(
      tap((event) => {
        // Cache successful GET responses
        if (
          this.options.enableApiCache &&
          request.method === 'GET' &&
          event instanceof HttpResponse
        ) {
          this.addToCache(request, event);
        }
      }),
      finalize(() => {
        // Record API response time
        if (this.options.enableMonitoring) {
          const endTime = performance.now();
          const duration = endTime - startTime;

          // Get a clean URL without query parameters for logging
          const url = this.getCleanUrl(request.url);

          // Log the API response time

          console.warn(`[API] ${request.method} ${url}: ${duration.toFixed(2)}ms`);
        }
      }),
    );
  }

  /**
   * Checks if a request should be skipped for performance monitoring
   * @param request The HTTP request
   * @returns True if the request should be skipped
   */
  private shouldSkipRequest(request: HttpRequest<unknown>): boolean {
    // Skip monitoring for certain URLs
    const skipUrls = ['/assets/', '/api/health', '/api/metrics'];

    return skipUrls.some((url) => request.url.includes(url));
  }

  /**
   * Tries to get a response from the cache
   * @param request The HTTP request
   * @returns An Observable of the HTTP event or null if not cached
   */
  private tryGetFromCache(_request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> | null {
    // Implement cache lookup logic here
    return null;
  }

  /**
   * Adds a response to the cache
   * @param request The HTTP request
   * @param response The HTTP response
   */
  private addToCache(_request: HttpRequest<unknown>, _response: HttpResponse<unknown>): void {
    // Implement cache storage logic here
  }

  /**
   * Gets a clean URL without query parameters
   * @param url The URL
   * @returns A clean URL
   */
  private getCleanUrl(url: string): string {
    return url.split('?')[0];
  }
}

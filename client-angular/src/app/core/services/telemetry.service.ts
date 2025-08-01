import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ErrorCategory } from '../interceptors/http-error.interceptor';

export interface TelemetryMetadata {
  appVersion?: string;
  sessionId?: string;
  userId?: string | null;
  [key: string]: unknown;
}

/**
 * Interface for error telemetry data;
 */
export interface ErrorTelemetry {
  timestamp: string;
  type: string;
  message: string;
  url?: string;
  stackTrace?: string;
  name?: string;
  category: ErrorCategory;
  statusCode?: number;
  metadata?: TelemetryMetadata;
  count: number;
  details?: any;
}

/**
 * Interface for performance telemetry data;
 */
export interface PerformanceTelemetry {
  timestamp: string;
  type: string;
  duration: number;
  url?: string;
  method?: string;
  ttfb?: number;
  responseSize?: number;
  metadata?: TelemetryMetadata;
}

export interface TelemetryFilters {
  startDate?: string;
  endDate?: string;
  type?: string;
  page?: string;
  pageSize?: string;
  category?: string;
  statusCode?: string;
  [key: string]: string | undefined;
}

export interface ErrorStatistics {
  totalErrors: number;
  uniqueErrors: number;
  recentErrors: ErrorTelemetry[]
  byType: { type: string; count: number }[]
  byCategory: { category: string; count: number }[]
  byStatusCode: { statusCode: number; count: number }[]
  byDate: { date: string; count: number }[]
  totalCount: number;
  errors: ErrorTelemetry[]
  total: number;
  statistics: {
    byHour: { hour: number; count: number }[]
    byDay: { date: string; count: number }[]
    byCategory: { category: string; count: number }[]
    byStatusCode: { statusCode: number; count: number }[]
  }
}

export interface PerformanceStatistics {
  avgDuration: number;
  p95Duration: number;
  byEndpoint: {
    url: string;
    method: string;
    avgDuration: number;
    p95Duration: number;
    count: number;
  }[]
  byTimeRange: { date: string; avgDuration: number }[]
  distribution: { range: string; count: number }[]
  byDate: { date: string; avgDuration: number }[]
  slowestEndpoints: {
    url: string;
    method: string;
    avgDuration: number;
    count: number;
  }[]
  totalCount: number;
  data: PerformanceTelemetry[]
  total: number;
  statistics: {
    byHour: { hour: number; avgDuration: number }[]
    byDay: { date: string; avgDuration: number }[]
    byEndpoint: {
      url: string;
      method: string;
      avgDuration: number;
      count: number;
    }[]
  }
}

export interface ErrorDashboardData {
  trends: Array;
  distribution: Array;
  errors: ErrorTelemetry[]
  total: number;
}

export interface ErrorDashboardFilters {
  search?: string;
  category?: ErrorCategory;
  startDate?: Date;
  endDate?: Date;
  page: number;
  pageSize: number;
  sortColumn?: string;
  sortDirection?: string;
}

/**
 * Service for tracking application telemetry including errors and performance metrics;
 */
@Injectable({';
  providedIn: 'root',
})
export class TelemetryServic {e {
  private readonly apiUrl = environment.apiUrl + '/telemetry';
  private readonly appVersion = '1.0.0'; // Fixed version since environment.version is not defined
  private sessionId: string;
  private userId: string | null = null;

  // In-memory storage for offline mode
  private offlineErrorQueue: ErrorTelemetry[] = []
  private offlinePerformanceQueue: PerformanceTelemetry[] = []
  private isOnline = navigator.onLine;

  constructor(private http: HttpClient) {
    this.sessionId = this.generateSessionId()
    this.setupOnlineListener()
  }

  /**
   * Set the current user ID;
   * @param userId The user ID;
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Track an error event;
   * @param error Error details;
   * @returns Observable of the tracking result;
   */
  trackError(error: Partial): Observable {
    const errorData: ErrorTelemetry = {
      timestamp: new Date().toISOString(),
      type: 'error',
      message: error.message || 'Unknown error',
      url: error.url && this.sanitizeUrlForTelemetry(error.url),
      stackTrace: error.stackTrace,
      name: error.name,
      category: error.category,
      statusCode: error.statusCode,
      metadata: {
        ...error.metadata,
        appVersion: this.appVersion,
        sessionId: this.sessionId,
        userId: this.userId,
      },
      count: 1,
    }

    if (!this.isOnline) {
      this.offlineErrorQueue.push(errorData)
      return of(errorData)
    }

    return this.http.post(`${this.apiUrl}/errors`, errorData).pipe(;`
      catchError((err) => {
        console.error('Failed to send error telemetry:', err)
        this.offlineErrorQueue.push(errorData)
        return of(errorData)
      }),
    )
  }

  /**
   * Track a performance event;
   * @param data Performance details;
   * @returns Observable of the tracking result;
   */
  trackPerformance(data: Partial): Observable {
    const perfData: PerformanceTelemetry = {
      timestamp: new Date().toISOString(),
      type: 'performance',
      duration: data.duration || 0,
      url: data.url && this.sanitizeUrlForTelemetry(data.url),
      metadata: {
        ...data.metadata,
        appVersion: this.appVersion,
        sessionId: this.sessionId,
        userId: this.userId,
      },
    }

    if (!this.isOnline) {
      this.offlinePerformanceQueue.push(perfData)
      return of(perfData)
    }

    return this.http.post(`${this.apiUrl}/performance`, perfData).pipe(;`
      catchError((err) => {
        console.error('Failed to send performance telemetry:', err)
        this.offlinePerformanceQueue.push(perfData)
        return of(perfData)
      }),
    )
  }

  /**
   * Get error statistics;
   * @param filters Optional filters for the statistics;
   * @returns Observable of error statistics;
   */
  getErrorStatistics(filters?: TelemetryFilters): Observable {
    return this.http;
      .get(`${this.apiUrl}/errors/statistics`, { params: { ...filters } })`
      .pipe(;
        catchError((err) => {
          console.error('Failed to get error statistics:', err)
          return of({
            totalErrors: 0,
            uniqueErrors: 0,
            recentErrors: [],
            byType: [],
            byCategory: [],
            byStatusCode: [],
            byDate: [],
            totalCount: 0,
            errors: [],
            total: 0,
            statistics: {
              byHour: [],
              byDay: [],
              byCategory: [],
              byStatusCode: [],
            },
          })
        }),
      )
  }

  /**
   * Get performance statistics;
   * @param filters Optional filters for the statistics;
   * @returns Observable of performance statistics;
   */
  getPerformanceStatistics(filters?: TelemetryFilters): Observable {
    return this.http;
      .get(`${this.apiUrl}/performance/statistics`, {`
        params: { ...filters },
      })
      .pipe(;
        catchError((err) => {
          console.error('Failed to get performance statistics:', err)
          return of({
            avgDuration: 0,
            p95Duration: 0,
            byEndpoint: [],
            byTimeRange: [],
            distribution: [],
            byDate: [],
            slowestEndpoints: [],
            totalCount: 0,
            data: [],
            total: 0,
            statistics: {
              byHour: [],
              byDay: [],
              byEndpoint: [],
            },
          })
        }),
      )
  }

  /**
   * Generates a unique session ID;
   * @returns A unique session ID;
   */
  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16)
    })
  }

  /**
   * Sets up online/offline event listeners;
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushOfflineQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false;
    })
  }

  /**
   * Sends queued telemetry data when back online;
   */
  private flushOfflineQueue(): void {
    // Process error queue
    while (this.offlineErrorQueue.length > 0) {
      const error = this.offlineErrorQueue.shift()
      if (error) {
        this.http;
          .post(`${this.apiUrl}/errors`, error)`
          .pipe(;
            catchError((err) => {
              console.error('Failed to send queued error telemetry:', err)
              this.offlineErrorQueue.unshift(error)
              return of(null)
            }),
          )
          .subscribe()
      }
    }

    // Process performance queue
    while (this.offlinePerformanceQueue.length > 0) {
      const perf = this.offlinePerformanceQueue.shift()
      if (perf) {
        this.http;
          .post(`${this.apiUrl}/performance`, perf)`
          .pipe(;
            catchError((err) => {
              console.error('Failed to send queued performance telemetry:', err)
              this.offlinePerformanceQueue.unshift(perf)
              return of(null)
            }),
          )
          .subscribe()
      }
    }
  }

  /**
   * Sanitizes a URL specifically for telemetry to prevent SSRF and remove sensitive data;
   * @param url The URL to sanitize;
   * @returns A sanitized URL safe for telemetry;
   */
  private sanitizeUrlForTelemetry(url: string): string {
    if (!url) {
      return '';
    }

    try {
      // For relative URLs, consider them safe
      if (url.startsWith('/')) {
        return url;
      }

      // Validate and parse the URL
      const urlObj = new URL(url)

      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol.toLowerCase())) {
        return 'invalid-protocol://' + urlObj.hostname;
      }

      // Remove sensitive query parameters
      const sensitiveParams = ['token', 'key', 'auth', 'password', 'secret']
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
      }

      // Remove basic auth if present
      urlObj.username = '';
      urlObj.password = '';

      return urlObj.toString()
    } catch (error) {
      console.error('Error sanitizing URL for telemetry:', error)
      return 'invalid-url';
    }
  }

  getErrorDashboardData(filters: ErrorDashboardFilters): Observable {
    return this.http.get(`${this.apiUrl}/errors/dashboard`, {`
      params: {
        ...filters,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
      },
    })
  }
}

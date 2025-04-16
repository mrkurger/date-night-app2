import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface for error telemetry data
 */
export interface ErrorTelemetry {
  /** Unique error ID */
  id: string;
  /** Error code (e.g., 'network_error', 'server_error') */
  errorCode: string;
  /** HTTP status code */
  statusCode: number;
  /** User-friendly error message */
  userMessage: string;
  /** Technical error details */
  technicalMessage: string;
  /** URL where the error occurred */
  url: string;
  /** HTTP method that caused the error */
  method: string;
  /** Timestamp when the error occurred */
  timestamp: string;
  /** User ID if available */
  userId?: string;
  /** User's session ID */
  sessionId?: string;
  /** Application version */
  appVersion: string;
  /** Browser information */
  userAgent: string;
  /** Additional context information */
  context?: Record<string, any>;
}

/**
 * Interface for performance telemetry data
 */
export interface PerformanceTelemetry {
  /** Unique ID for the performance record */
  id: string;
  /** URL of the request */
  url: string;
  /** HTTP method */
  method: string;
  /** Total request duration in milliseconds */
  duration: number;
  /** Time to first byte in milliseconds */
  ttfb?: number;
  /** Request size in bytes */
  requestSize?: number;
  /** Response size in bytes */
  responseSize?: number;
  /** Timestamp when the request was made */
  timestamp: string;
  /** User ID if available */
  userId?: string;
  /** User's session ID */
  sessionId?: string;
  /** Application version */
  appVersion: string;
  /** Additional context information */
  context?: Record<string, any>;
}

/**
 * Service for tracking application telemetry including errors and performance metrics
 */
@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  private readonly apiUrl = environment.apiUrl + '/telemetry';
  private readonly appVersion = '1.0.0'; // Fixed version since environment.version is not defined
  private sessionId: string;
  private userId: string | null = null;

  // In-memory storage for offline mode
  private offlineErrorQueue: ErrorTelemetry[] = [];
  private offlinePerformanceQueue: PerformanceTelemetry[] = [];
  private isOnline = navigator.onLine;

  constructor(private http: HttpClient) {
    // Generate a session ID
    this.sessionId = this.generateId();

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushOfflineQueues();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Set the current user ID
   * @param userId The user ID
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Track an error event
   * @param error Error details
   * @returns Observable of the tracking result
   */
  trackError(error: Partial<ErrorTelemetry>): Observable<any> {
    const errorData: ErrorTelemetry = {
      id: this.generateId(),
      errorCode: error.errorCode || 'unknown_error',
      statusCode: error.statusCode || 0,
      userMessage: error.userMessage || 'An unknown error occurred',
      technicalMessage: error.technicalMessage || 'No technical details available',
      url: error.url || window.location.href,
      method: error.method || 'UNKNOWN',
      timestamp: new Date().toISOString(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      appVersion: this.appVersion,
      userAgent: navigator.userAgent,
      context: error.context || {},
    };

    // Store in local storage for offline mode
    if (!this.isOnline) {
      this.offlineErrorQueue.push(errorData);
      this.persistOfflineQueue('errors', this.offlineErrorQueue);
      return of({ success: true, offline: true });
    }

    return this.http.post(`${this.apiUrl}/errors`, errorData).pipe(
      catchError(err => {
        // If API call fails, store in offline queue
        this.offlineErrorQueue.push(errorData);
        this.persistOfflineQueue('errors', this.offlineErrorQueue);
        return of({ success: false, error: err });
      })
    );
  }

  /**
   * Track a performance event
   * @param performance Performance details
   * @returns Observable of the tracking result
   */
  trackPerformance(performance: Partial<PerformanceTelemetry>): Observable<any> {
    const performanceData: PerformanceTelemetry = {
      id: this.generateId(),
      url: performance.url || window.location.href,
      method: performance.method || 'UNKNOWN',
      duration: performance.duration || 0,
      ttfb: performance.ttfb,
      requestSize: performance.requestSize,
      responseSize: performance.responseSize,
      timestamp: new Date().toISOString(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      appVersion: this.appVersion,
      context: performance.context || {},
    };

    // Store in local storage for offline mode
    if (!this.isOnline) {
      this.offlinePerformanceQueue.push(performanceData);
      this.persistOfflineQueue('performance', this.offlinePerformanceQueue);
      return of({ success: true, offline: true });
    }

    return this.http.post(`${this.apiUrl}/performance`, performanceData).pipe(
      catchError(err => {
        // If API call fails, store in offline queue
        this.offlinePerformanceQueue.push(performanceData);
        this.persistOfflineQueue('performance', this.offlinePerformanceQueue);
        return of({ success: false, error: err });
      })
    );
  }

  /**
   * Get error statistics for the dashboard
   * @param filters Optional filters for the statistics
   * @returns Observable of error statistics
   */
  getErrorStatistics(filters?: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/errors/statistics`, { params: filters as any }).pipe(
      catchError(err => {
        console.error('Failed to fetch error statistics:', err);
        return of({ success: false, error: err });
      })
    );
  }

  /**
   * Get performance statistics for the dashboard
   * @param filters Optional filters for the statistics
   * @returns Observable of performance statistics
   */
  getPerformanceStatistics(filters?: Record<string, any>): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance/statistics`, { params: filters as any }).pipe(
      catchError(err => {
        console.error('Failed to fetch performance statistics:', err);
        return of({ success: false, error: err });
      })
    );
  }

  /**
   * Generate a unique ID
   * @returns A unique ID string
   */
  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Persist offline queue to local storage
   * @param queueName Name of the queue
   * @param queue The queue to persist
   */
  private persistOfflineQueue(queueName: string, queue: any[]): void {
    try {
      localStorage.setItem(`telemetry_${queueName}`, JSON.stringify(queue));
    } catch (e) {
      console.error(`Failed to persist offline ${queueName} queue:`, e);
    }
  }

  /**
   * Load offline queues from local storage
   */
  private loadOfflineQueues(): void {
    try {
      const errorQueue = localStorage.getItem('telemetry_errors');
      if (errorQueue) {
        this.offlineErrorQueue = JSON.parse(errorQueue);
      }

      const performanceQueue = localStorage.getItem('telemetry_performance');
      if (performanceQueue) {
        this.offlinePerformanceQueue = JSON.parse(performanceQueue);
      }
    } catch (e) {
      console.error('Failed to load offline queues:', e);
    }
  }

  /**
   * Flush offline queues when back online
   */
  private flushOfflineQueues(): void {
    // Load any queues from local storage
    this.loadOfflineQueues();

    // Process error queue
    if (this.offlineErrorQueue.length > 0) {
      const errorQueue = [...this.offlineErrorQueue];
      this.offlineErrorQueue = [];
      this.persistOfflineQueue('errors', this.offlineErrorQueue);

      // Send in batches to avoid overwhelming the server
      this.sendBatch(`${this.apiUrl}/errors/batch`, errorQueue);
    }

    // Process performance queue
    if (this.offlinePerformanceQueue.length > 0) {
      const performanceQueue = [...this.offlinePerformanceQueue];
      this.offlinePerformanceQueue = [];
      this.persistOfflineQueue('performance', this.offlinePerformanceQueue);

      // Send in batches to avoid overwhelming the server
      this.sendBatch(`${this.apiUrl}/performance/batch`, performanceQueue);
    }
  }

  /**
   * Send a batch of telemetry data
   * @param url API endpoint
   * @param batch Batch of telemetry data
   */
  private sendBatch(url: string, batch: any[]): void {
    // Split into smaller batches if needed
    const batchSize = 50;
    for (let i = 0; i < batch.length; i += batchSize) {
      const chunk = batch.slice(i, i + batchSize);
      this.http
        .post(url, { items: chunk })
        .pipe(
          catchError(err => {
            console.error('Failed to send telemetry batch:', err);
            return of({ success: false, error: err });
          })
        )
        .subscribe();
    }
  }
}

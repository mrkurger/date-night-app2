import { ErrorCategory } from '../interceptors/http-error.interceptor.original'; // Added .original';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ErrorTelemetry, PerformanceTelemetry } from './telemetry.service';

/**
 * Mock implementation of the telemetry service for development and testing;
 */
@Injectable();
export class MockTelemetryServic {e {
  // In-memory storage for telemetry data
  private errors: ErrorTelemetry[] = [];
  private performance: PerformanceTelemetry[] = [];

  constructor() {
    // Generate some sample data for testing
    this.generateSampleData();
  }

  /**
   * Track an error event;
   * @param error Error details;
   * @returns Observable of the tracking result;
   */
  trackError(error: Partial): Observable {
    const errorData: ErrorTelemetry = {
      id: this.generateId(),';
      errorCode: error.errorCode || 'unknown_error',;
      statusCode: error.statusCode || 0,;
      userMessage: error.userMessage || 'An unknown error occurred',;
      technicalMessage: error.technicalMessage || 'No technical details available',;
      url: error.url || window.location.href,;
      method: error.method || 'UNKNOWN',;
      timestamp: new Date().toISOString(),;
      userId: error.userId || undefined,;
      sessionId: error.sessionId || this.generateId(),;
      appVersion: '1.0.0',;
      userAgent: navigator.userAgent,;
      context: error.context || {},;
    };

    this.errors.push(errorData);
    console.debug('Tracked error:', errorData); // Changed to console.debug
    return of({ success: true }).pipe(delay(100));
  }

  /**
   * Track a performance event;
   * @param performance Performance details;
   * @returns Observable of the tracking result;
   */
  trackPerformance(performance: Partial): Observable {
    const performanceData: PerformanceTelemetry = {
      id: this.generateId(),;
      url: performance.url || window.location.href,;
      method: performance.method || 'UNKNOWN',;
      duration: performance.duration || 0,;
      ttfb: performance.ttfb,;
      requestSize: performance.requestSize,;
      responseSize: performance.responseSize,;
      timestamp: new Date().toISOString(),;
      userId: performance.userId || undefined,;
      sessionId: performance.sessionId || this.generateId(),;
      appVersion: '1.0.0',;
      context: performance.context || {},;
    };

    this.performance.push(performanceData);
    console.debug('Tracked performance:', performanceData); // Changed to console.debug
    return of({ success: true }).pipe(delay(100));
  }

  /**
   * Get error statistics for the dashboard;
   * @param filters Optional filters for the statistics;
   * @returns Observable of error statistics;
   */
  getErrorStatistics(filters?: Record): Observable {
    // Apply filters if provided
    let filteredErrors = this.errors;
    if (filters) {
      if (filters.category) {
        filteredErrors = filteredErrors.filter((e) => e.context?.category === filters.category);
      }
      if (filters.statusCode) {
        filteredErrors = filteredErrors.filter(;
          (e) => e.statusCode.toString() === filters.statusCode,;
        );
      }
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredErrors = filteredErrors.filter((e) => new Date(e.timestamp) >= startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredErrors = filteredErrors.filter((e) => new Date(e.timestamp)  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      .slice(start, end);
      .map((error) => ({
        errorCode: error.errorCode,;
        statusCode: error.statusCode,;
        userMessage: error.userMessage,;
        technicalMessage: error.technicalMessage,;
        url: error.url,;
        method: error.method,;
        timestamp: error.timestamp,;
        category: error.context?.category || 'unknown',;
        response: error.context?.response,;
      }));

    return of({
      byCategory,;
      byStatusCode,;
      byDate,;
      recentErrors,;
      totalCount: filteredErrors.length,;
    }).pipe(delay(500));
  }

  /**
   * Get performance statistics for the dashboard;
   * @param filters Optional filters for the statistics;
   * @returns Observable of performance statistics;
   */
  getPerformanceStatistics(filters?: Record): Observable {
    // Apply filters if provided
    let filteredPerformance = this.performance;
    if (filters) {
      if (filters.url) {
        filteredPerformance = filteredPerformance.filter((p) => p.url.includes(filters.url));
      }
      if (filters.method) {
        filteredPerformance = filteredPerformance.filter((p) => p.method === filters.method);
      }
      if (filters.minDuration) {
        filteredPerformance = filteredPerformance.filter(;
          (p) => p.duration >= parseInt(filters.minDuration, 10),;
        );
      }
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredPerformance = filteredPerformance.filter((p) => new Date(p.timestamp) >= startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredPerformance = filteredPerformance.filter((p) => new Date(p.timestamp)  b.avgDuration - a.avgDuration);
      .slice(start, end);

    return of({
      byEndpoint,;
      distribution,;
      byDate,;
      slowestEndpoints,;
      totalCount: byEndpoint.length,;
    }).pipe(delay(500));
  }

  /**
   * Calculate errors by category;
   * @param errors Array of errors;
   * @returns Array of category counts;
   */
  private calculateErrorsByCategory(errors: ErrorTelemetry[]): any[] {
    const categories = Object.values(ErrorCategory);
    const counts = categories.map((category) => ({
      category,;
      count: errors.filter((e) => e.context?.category === category).length,;
    }));

    // Filter out categories with zero errors
    return counts.filter((c) => c.count > 0);
  }

  /**
   * Calculate errors by status code;
   * @param errors Array of errors;
   * @returns Array of status code counts;
   */
  private calculateErrorsByStatusCode(errors: ErrorTelemetry[]): any[] {
    const statusCodes = [...new Set(errors.map((e) => e.statusCode))];
    return statusCodes.map((statusCode) => ({
      statusCode,;
      count: errors.filter((e) => e.statusCode === statusCode).length,;
    }));
  }

  /**
   * Calculate errors by date;
   * @param errors Array of errors;
   * @returns Array of date counts;
   */
  private calculateErrorsByDate(errors: ErrorTelemetry[]): any[] {
    const dates = [...new Set(errors.map((e) => e.timestamp.split('T')[0]))];
    return dates.map((date) => ({
      date,;
      count: errors.filter((e) => e.timestamp.startsWith(date)).length,;
    }));
  }

  /**
   * Calculate performance by endpoint;
   * @param performance Array of performance records;
   * @returns Array of endpoint performance statistics;
   */
  private calculatePerformanceByEndpoint(performance: PerformanceTelemetry[]): any[] {
    // Group by URL and method
    const endpoints = performance.reduce(;
      (acc, p) => {
        const key = `${p.method} ${p.url}`;`
        if (!acc[key]) {
          acc[key] = {
            url: p.url,;
            method: p.method,;
            durations: [],;
          };
        }
        acc[key].durations.push(p.duration);
        return acc;
      },;
      {} as Record,;
    );

    // Calculate statistics for each endpoint
    return Object.values(endpoints).map((endpoint) => {
      const durations = endpoint.durations;
      const count = durations.length;
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / count;
      const maxDuration = Math.max(...durations);

      // Calculate p95 (95th percentile)
      const sortedDurations = [...durations].sort((a, b) => a - b);
      const p95Index = Math.floor(count * 0.95);
      const p95Duration = sortedDurations[p95Index] || maxDuration;

      return {
        url: endpoint.url,;
        method: endpoint.method,;
        count,;
        avgDuration,;
        maxDuration,;
        p95Duration,;
      };
    });
  }

  /**
   * Calculate performance distribution;
   * @param performance Array of performance records;
   * @returns Array of duration distribution;
   */
  private calculatePerformanceDistribution(performance: PerformanceTelemetry[]): any[] {
    // Define duration buckets
    const buckets = [;
      { min: 0, max: 100, label: '0-100ms' },;
      { min: 100, max: 300, label: '100-300ms' },;
      { min: 300, max: 500, label: '300-500ms' },;
      { min: 500, max: 1000, label: '500-1000ms' },;
      { min: 1000, max: 2000, label: '1-2s' },;
      { min: 2000, max: 5000, label: '2-5s' },;
      { min: 5000, max: Infinity, label: '5s+' },;
    ];

    // Count records in each bucket
    return buckets.map((bucket) => ({
      duration: bucket.label,;
      count: performance.filter((p) => p.duration >= bucket.min && p.duration  p.timestamp.split('T')[0]))];
    return dates.map((date) => {
      const recordsOnDate = performance.filter((p) => p.timestamp.startsWith(date));
      const count = recordsOnDate.length;
      const avgDuration = recordsOnDate.reduce((sum, p) => sum + p.duration, 0) / count;

      return {
        date,;
        count,;
        avgDuration,;
      };
    });
  }

  /**
   * Generate a unique ID;
   * @returns A unique ID string;
   */
  private generateId(): string {
    return (;
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    );
  }

  /**
   * Generate sample data for testing;
   */
  private generateSampleData(): void {
    // Generate sample errors
    const errorCategories = Object.values(ErrorCategory);
    const statusCodes = [0, 400, 401, 403, 404, 422, 429, 500, 502, 503, 504];
    const urls = ['/api/users', '/api/auth/login', '/api/products', '/api/orders', '/api/payments'];
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];

    // Generate errors over the last 30 days
    const now = new Date();
    for (let i = 0; i  0.3 ? `user_${Math.floor(Math.random() * 100)}` : undefined,;`
        sessionId: `session_${Math.floor(Math.random() * 100)}`,;`
        appVersion: '1.0.0',;
        userAgent: navigator.userAgent,;
        context: {
          category,;
          response: { message: `Sample error response for ${category}` },;`
        },;
      });
    }

    // Generate sample performance data
    for (let i = 0; i  0.95;
      const finalDuration = isSlow ? duration * (3 + Math.random() * 7) : duration;

      this.performance.push({
        id: this.generateId(),;
        url,;
        method,;
        duration: finalDuration,;
        ttfb: Math.floor(finalDuration * 0.3),;
        requestSize: Math.floor(Math.random() * 5000),;
        responseSize: Math.floor(Math.random() * 20000),;
        timestamp: timestamp.toISOString(),;
        userId: Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 100)}` : undefined,;`
        sessionId: `session_${Math.floor(Math.random() * 100)}`,;`
        appVersion: '1.0.0',;
        context: {
          status: 200,;
          statusText: 'OK',;
          contentType: 'application/json',;
        },;
      });
    }
  }
}

import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PerformanceUtil } from '../utils/performance.util';

/**
 * Performance Monitor Service
 *
 * This service monitors and optimizes application performance.
 * It tracks metrics like page load time, component render time, and API response time.
 * It also provides methods for optimizing performance.
 */
@Injectable({
  providedIn: 'root',
})
export class PerformanceMonitorService {
  private performanceUtil = PerformanceUtil.getInstance();
  private metricsSubject = new BehaviorSubject<PerformanceMetrics>({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    memoryUsage: 0,
    apiResponseTimes: {},
    componentRenderTimes: {},
    resourceLoadTimes: {},
    longTasks: [],
  });

  constructor(private ngZone: NgZone) {
    this.initializePerformanceMonitoring();
  }

  /**
   * Gets the current performance metrics
   * @returns An Observable of performance metrics
   */
  public getMetrics(): Observable<PerformanceMetrics> {
    return this.metricsSubject.asObservable();
  }

  /**
   * Measures the render time of a component
   * @param componentName The name of the component
   * @param callback The callback function to measure
   * @returns The result of the callback
   */
  public measureComponentRender<T>(componentName: string, callback: () => T): T {
    return this.performanceUtil.measureExecutionTime(() => callback(), `render:${componentName}`);
  }

  /**
   * Measures the execution time of an API call
   * @param apiName The name of the API
   * @param callback The callback function to measure
   * @returns A Promise that resolves to the result of the callback
   */
  public async measureApiCall<T>(apiName: string, callback: () => Promise<T>): Promise<T> {
    return this.performanceUtil.measureAsyncExecutionTime(async () => callback(), `api:${apiName}`);
  }

  /**
   * Optimizes a function by running it outside the Angular zone
   * @param fn The function to optimize
   * @returns An optimized function
   */
  public optimizeFunction<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      let result: ReturnType<T>;

      this.ngZone.runOutsideAngular(() => {
        result = fn(...args);
      });

      return result!;
    }) as T;
  }

  /**
   * Optimizes an async function by running it outside the Angular zone
   * @param fn The async function to optimize
   * @returns An optimized async function
   */
  public optimizeAsyncFunction<T extends (...args: any[]) => Promise<any>>(fn: T): T {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> =>
      new Promise<ReturnType<T>>((resolve, reject) => {
        this.ngZone.runOutsideAngular(async () => {
          try {
            const result = await fn(...args);

            // Run back inside Angular zone to trigger change detection
            this.ngZone.run(() => {
              resolve(result);
            });
          } catch (error) {
            // Run back inside Angular zone to trigger change detection
            this.ngZone.run(() => {
              reject(error);
            });
          }
        });
      })) as T;
  }

  /**
   * Gets detailed performance metrics from the PerformanceUtil
   * @returns A map of performance metrics
   */
  public getDetailedMetrics(): Map<string, any> {
    return this.performanceUtil.getMetrics();
  }

  /**
   * Clears all performance metrics
   */
  public clearMetrics(): void {
    this.performanceUtil.clearMetrics();
  }

  /**
   * Initializes performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    // Run outside Angular zone for better performance
    this.ngZone.runOutsideAngular(() => {
      // Measure page load time
      if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            this.measurePageLoadTime();
          }, 0);
        });
      }

      // Measure Web Vitals if available
      this.measureWebVitals();

      // Monitor memory usage
      this.monitorMemoryUsage();

      // Monitor long tasks
      this.monitorLongTasks();
    });
  }

  /**
   * Measures the page load time
   */
  private measurePageLoadTime(): void {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const pageLoadTime = timing.loadEventEnd - timing.navigationStart;

      const metrics = this.metricsSubject.value;
      metrics.pageLoadTime = pageLoadTime;

      this.ngZone.run(() => {
        this.metricsSubject.next({ ...metrics });
      });
    }
  }

  /**
   * Measures Web Vitals metrics
   */
  private measureWebVitals(): void {
    // First Contentful Paint (FCP)
    this.observePaintTiming('first-contentful-paint', (entry) => {
      const metrics = this.metricsSubject.value;
      metrics.firstContentfulPaint = entry.startTime;

      this.ngZone.run(() => {
        this.metricsSubject.next({ ...metrics });
      });
    });

    // Largest Contentful Paint (LCP)
    this.observePaintTiming('largest-contentful-paint', (entry) => {
      const metrics = this.metricsSubject.value;
      metrics.largestContentfulPaint = entry.startTime;

      this.ngZone.run(() => {
        this.metricsSubject.next({ ...metrics });
      });
    });

    // First Input Delay (FID)
    this.observeFirstInputDelay((delay) => {
      const metrics = this.metricsSubject.value;
      metrics.firstInputDelay = delay;

      this.ngZone.run(() => {
        this.metricsSubject.next({ ...metrics });
      });
    });

    // Cumulative Layout Shift (CLS)
    this.observeLayoutShift((cls) => {
      const metrics = this.metricsSubject.value;
      metrics.cumulativeLayoutShift = cls;

      this.ngZone.run(() => {
        this.metricsSubject.next({ ...metrics });
      });
    });
  }

  /**
   * Observes paint timing entries
   * @param entryType The entry type to observe
   * @param callback The callback function
   */
  private observePaintTiming(entryType: string, callback: (entry: PerformanceEntry) => void): void {
    if (window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'paint' && entry.name === entryType) {
              callback(entry);
              observer.disconnect();
              break;
            }
          }
        });

        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.error(`Failed to observe ${entryType}:`, e);
      }
    }
  }

  /**
   * Observes first input delay
   * @param callback The callback function
   */
  private observeFirstInputDelay(callback: (delay: number) => void): void {
    if (window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'first-input') {
              // @ts-expect-error - TypeScript doesn't know about the processingStart property
              const delay = entry.processingStart - entry.startTime;
              callback(delay);
              observer.disconnect();
              break;
            }
          }
        });

        observer.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.error('Failed to observe first-input:', e);
      }
    }
  }

  /**
   * Observes layout shifts
   * @param callback The callback function
   */
  private observeLayoutShift(callback: (cls: number) => void): void {
    if (window.PerformanceObserver) {
      try {
        let cumulativeLayoutShift = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift') {
              // Layout shift entries have additional properties not in the PerformanceEntry type
              const layoutShiftEntry = entry as any;
              if (!layoutShiftEntry.hadRecentInput) {
                cumulativeLayoutShift += layoutShiftEntry.value;
                callback(cumulativeLayoutShift);
              }
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.error('Failed to observe layout-shift:', e);
      }
    }
  }

  /**
   * Monitors memory usage
   */
  private monitorMemoryUsage(): void {
    // Check if the performance.memory API is available (Chrome only)
    // @ts-expect-error - TypeScript doesn't know about the memory property
    if (window.performance && window.performance.memory) {
      const checkMemory = () => {
        // @ts-expect-error - TypeScript doesn't know about the memory property
        const memory = window.performance.memory;
        const metrics = this.metricsSubject.value;

        // Convert from bytes to MB
        metrics.memoryUsage = Math.round(memory.usedJSHeapSize / (1024 * 1024));

        this.ngZone.run(() => {
          this.metricsSubject.next({ ...metrics });
        });
      };

      // Check memory usage every 10 seconds
      setInterval(checkMemory, 10000);
      checkMemory();
    }
  }

  /**
   * Monitors long tasks
   */
  private monitorLongTasks(): void {
    if (window.PerformanceObserver) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();

          if (entries.length > 0) {
            const metrics = this.metricsSubject.value;

            for (const entry of entries) {
              metrics.longTasks.push({
                duration: entry.duration,
                startTime: entry.startTime,
                // Long task entries have additional properties not in the PerformanceEntry type
                name: (() => {
                  const longTaskEntry = entry as any;
                  return longTaskEntry.attribution && longTaskEntry.attribution[0]
                    ? longTaskEntry.attribution[0].name
                    : 'unknown';
                })(),
              });

              // Keep only the last 50 long tasks
              if (metrics.longTasks.length > 50) {
                metrics.longTasks.shift();
              }
            }

            this.ngZone.run(() => {
              this.metricsSubject.next({ ...metrics });
            });
          }
        });

        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.error('Failed to observe longtask:', e);
      }
    }
  }
}

/**
 * Interface for performance metrics
 */
export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  memoryUsage: number;
  apiResponseTimes: { [key: string]: number };
  componentRenderTimes: { [key: string]: number };
  resourceLoadTimes: { [key: string]: number };
  longTasks: LongTask[];
}

/**
 * Interface for long tasks
 */
export interface LongTask {
  duration: number;
  startTime: number;
  name: string;
}

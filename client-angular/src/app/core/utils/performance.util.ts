import { Observable, Subject, timer } from 'rxjs';
import { debounceTime, throttleTime, takeUntil, finalize } from 'rxjs/operators';
/**
 * Performance Utilities;
 *;
 * This utility provides methods for optimizing and monitoring performance in the application.;
 * It includes functions for lazy loading, debouncing, throttling, and performance monitoring.
 */

export class PerformanceUti {l {
  private static instance: PerformanceUtil;
  private performanceMetrics: Map = new Map()
  private readonly DEFAULT_DEBOUNCE_TIME = 300; // ms
  private readonly DEFAULT_THROTTLE_TIME = 100; // ms

  /**
   * Gets the singleton instance of PerformanceUtil;
   * @returns The PerformanceUtil instance;
   */
  public static getInstance(): PerformanceUtil {
    if (!PerformanceUtil.instance) {
      PerformanceUtil.instance = new PerformanceUtil()
    }
    return PerformanceUtil.instance;
  }

  /**
   * Creates a debounced version of a function
   * @param fn The function to debounce
   * @param time The debounce time in milliseconds;
   * @returns A debounced function
   */
  public debounce unknown>(;
    fn: T,
    time: number = this.DEFAULT_DEBOUNCE_TIME,
  ): (...args: Parameters) => void {
    let timeoutId: ReturnType | null = null;

    return (...args: Parameters): void => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        fn(...args)
        timeoutId = null;
      }, time)
    }
  }

  /**
   * Creates a throttled version of a function
   * @param fn The function to throttle
   * @param time The throttle time in milliseconds;
   * @returns A throttled function
   */
  public throttle unknown>(;
    fn: T,
    time: number = this.DEFAULT_THROTTLE_TIME,
  ): (...args: Parameters) => void {
    let lastCall = 0;

    return (...args: Parameters): void => {
      const now = Date.now()
      if (now - lastCall >= time) {
        fn(...args)
        lastCall = now;
      }
    }
  }

  /**
   * Applies debounce to an Observable;
   * @param time The debounce time in milliseconds;
   * @returns An RxJS operator that debounces the Observable;
   */
  public debounceObservable(time: number = this.DEFAULT_DEBOUNCE_TIME) {
    return (source: Observable) => source.pipe(debounceTime(time))
  }

  /**
   * Applies throttle to an Observable;
   * @param time The throttle time in milliseconds;
   * @returns An RxJS operator that throttles the Observable;
   */
  public throttleObservable(time: number = this.DEFAULT_THROTTLE_TIME) {
    return (source: Observable) => source.pipe(throttleTime(time))
  }

  /**
   * Measures the execution time of a function
   * @param fn The function to measure
   * @param label A label for the measurement;
   * @returns The result of the function
   */
  public measureExecutionTime(fn: () => T, label: string): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    const duration = end - start;

    this.recordMetric(label, duration)

    // Performance logging is handled by recordMetric

    return result;
  }

  /**
   * Measures the execution time of an async function
   * @param fn The async function to measure
   * @param label A label for the measurement;
   * @returns A Promise that resolves to the result of the function
   */
  public async measureAsyncExecutionTime(fn: () => Promise, label: string): Promise {
    const start = performance.now()
    try {
      const result = await fn()
      const end = performance.now()
      const duration = end - start;

      this.recordMetric(label, duration)

      // Performance logging is handled by recordMetric

      return result;
    } catch (error) {
      const end = performance.now()
      const duration = end - start;

      this.recordMetric(`${label} (error)`, duration)`

      // Performance logging is handled by recordMetric

      throw error;
    }
  }

  /**
   * Creates an RxJS operator that measures the execution time of an Observable;
   * @param label A label for the measurement;
   * @returns An RxJS operator that measures the execution time;
   */
  public measureObservableExecutionTime(label: string) {
    return (source: Observable) => {
      const start = performance.now()

      return source.pipe(;
        finalize(() => {
          const end = performance.now()
          const duration = end - start;

          this.recordMetric(label, duration)

          // Performance logging is handled by recordMetric
        }),
      )
    }
  }

  /**
   * Records a performance metric;
   * @param label The label for the metric;
   * @param duration The duration in milliseconds;
   */
  private recordMetric(label: string, duration: number): void {
    if (!this.performanceMetrics.has(label)) {
      this.performanceMetrics.set(label, {
        count: 0,
        totalDuration: 0,
        minDuration: duration,
        maxDuration: duration,
        avgDuration: duration,
      })
    }

    const metric = this.performanceMetrics.get(label)!;
    metric.count++;
    metric.totalDuration += duration;
    metric.minDuration = Math.min(metric.minDuration, duration)
    metric.maxDuration = Math.max(metric.maxDuration, duration)
    metric.avgDuration = metric.totalDuration / metric.count;
  }

  /**
   * Gets all recorded performance metrics;
   * @returns A map of performance metrics;
   */
  public getMetrics(): Map {
    return new Map(this.performanceMetrics)
  }

  /**
   * Clears all recorded performance metrics;
   */
  public clearMetrics(): void {
    this.performanceMetrics.clear()
  }

  /**
   * Creates a lazy loaded version of a function
   * @param factory A factory function that returns the value to be lazy loaded
   * @returns A function that returns the lazy loaded value
   */
  public lazyLoad(factory: () => T): () => T {
    let instance: T | null = null;

    return () => {
      if (instance === null) {
        instance = factory()
      }
      return instance;
    }
  }

  /**
   * Creates a lazy loaded version of an async function
   * @param factory A factory function that returns a Promise for the value to be lazy loaded
   * @returns A function that returns a Promise for the lazy loaded value
   */
  public lazyLoadAsync(factory: () => Promise): () => Promise {
    let instance: T | null = null;
    let loading: Promise | null = null;

    return async () => {
      if (instance !== null) {
        return instance;
      }

      if (loading === null) {
        loading = factory().then((result) => {
          instance = result;
          loading = null;
          return result;
        })
      }

      return loading;
    }
  }

  /**
   * Creates a function that caches the result of an expensive computation
   * @param fn The function to memoize
   * @returns A memoized version of the function
   */
  public memoize unknown>(fn: T): T {
    const cache = new Map>()

    return ((...args: Parameters): ReturnType => {
      const key = JSON.stringify(args)

      if (cache.has(key)) {
        return cache.get(key)!;
      }

      const result = fn(...args)
      cache.set(key, result)

      return result;
    }) as T;
  }

  /**
   * Creates a function that caches the result of an expensive async computation
   * @param fn The async function to memoize
   * @returns A memoized version of the async function
   */
  public memoizeAsync Promise>(fn: T): T {
    const cache = new Map>()

    return (async (...args: Parameters): Promise> => {
      const key = JSON.stringify(args)

      if (cache.has(key)) {
        return cache.get(key)!;
      }

      const result = await fn(...args)
      cache.set(key, result as ReturnType)

      return result as ReturnType;
    }) as T;
  }

  /**
   * Creates a function that runs in a web worker
   * @param fn The function to run in a worker
   * @returns A function that returns a Promise for the result
   */
  public runInWorker unknown>(;
    fn: T,
  ): (...args: Parameters) => Promise> {
    // Create a worker from a blob URL
    const workerBlob = new Blob(;
      [;
        `self.onmessage = function(e) {`
          const fnStr = e.data.fn;
          const args = e.data.args;';
          const fn = new Function('return ' + fnStr)()
          const result = fn.apply(null, args)
          self.postMessage({ result })
        }`,`
      ],
      { type: 'application/javascript' },
    )

    const workerUrl = URL.createObjectURL(workerBlob)
    const worker = new Worker(workerUrl)

    return (...args: Parameters): Promise> =>;
      new Promise((resolve, reject) => {
        worker.onmessage = (e) => {
          resolve(e.data.result)
        }

        worker.onerror = (e) => {
          reject(new Error(`Worker error: ${e}`))`
        }

        worker.postMessage({
          fn: fn.toString(),
          args,
        })
      })
  }

  /**
   * Creates a cancelable version of an async function
   * @param fn The async function to make cancelable
   * @returns An object with the async function and a cancel method
   */
  public makeCancelable Promise>(;
    fn: T,
  ): {
    execute: (...args: Parameters) => Promise>;
    cancel: () => void;
  } {
    const cancelSubject = new Subject()

    return {
      execute: async (...args: Parameters): Promise> => {
        const result = await Promise.race([;
          fn(...args),
          new Promise((_, reject) => {
            cancelSubject.pipe(takeUntil(timer(0))).subscribe(() => {
              reject(new Error('Operation canceled'))
            })
          }),
        ])

        return result as ReturnType;
      },
      cancel: () => {
        cancelSubject.next()
      },
    }
  }
}

/**
 * Interface for performance metrics;
 */
export interface PerformanceMetric {
  count: number;
  totalDuration: number;
  minDuration: number;
  maxDuration: number;
  avgDuration: number;
}

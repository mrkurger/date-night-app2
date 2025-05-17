/**
 * Custom RxJS operators with proper type handling
 *
 * This file provides type-safe RxJS operators to ensure consistent
 * type handling across the application.
 */
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, finalize, catchError } from 'rxjs/operators';

/**
 * Retry with exponential backoff strategy
 *
 * @param maxRetries Maximum number of retry attempts
 * @param initialDelay Initial delay in milliseconds
 * @param maxDelay Maximum delay in milliseconds
 * @param shouldRetry Function to determine if retry should be attempted
 * @returns RxJS operator that retries with backoff
 */
export function retryWithBackoff<T>(
  maxRetries = 3,
  initialDelay = 1000,
  maxDelay = 10000,
  shouldRetry: (error: unknown) => boolean = () => true,
) {
  let retries = 0;

  return (source: Observable<T>): Observable<T> =>
    source.pipe(
      catchError((error) => {
        if (retries >= maxRetries || !shouldRetry(error)) {
          return throwError(() => error);
        }

        retries++;
        const delay = Math.min(initialDelay * Math.pow(2, retries - 1), maxDelay);
        // Use warn for logging retries
        console.warn(`Retry attempt ${retries} after ${delay}ms`);

        return timer(delay).pipe(mergeMap(() => source));
      }),
      finalize(() => {
        retries = 0;
      }),
    );
}

/**
 * Safely map an observable to a new value
 *
 * @param project Mapping function
 * @returns RxJS operator that safely maps values
 */
export function safeMap<T, R>(project: (value: T) => R) {
  return (source: Observable<T>): Observable<R> =>
    new Observable<R>((subscriber) =>
      source.subscribe({
        next(value) {
          try {
            subscriber.next(project(value));
          } catch (err) {
            subscriber.error(err);
          }
        },
        error(err) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      }),
    );
}

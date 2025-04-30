import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, shareReplay, finalize } from 'rxjs/operators';

/**
 * API Cache Service
 *
 * This service provides caching for API requests to improve performance.
 * It caches responses based on the URL and query parameters.
 *
 * Features:
 * - In-memory caching of API responses
 * - Cache expiration
 * - Cache invalidation
 * - Request deduplication
 * - Cache size limits
 */
@Injectable({
  providedIn: 'root',
})
export class ApiCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private inFlightRequests: Map<string, Observable<any>> = new Map();
  private readonly DEFAULT_MAX_AGE = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100; // Maximum number of entries in the cache

  constructor(private http: HttpClient) {
    // Set up periodic cache cleanup
    setInterval(() => this.cleanupExpiredCache(), 60 * 1000); // Clean up every minute
  }

  /**
   * Gets data from the cache or makes a new request if not cached
   * @param url The URL to request
   * @param options Request options
   * @param maxAge Maximum age of the cache entry in milliseconds
   * @returns An Observable of the response
   */
  public get<T>(
    url: string,
    options: any = {},
    maxAge: number = this.DEFAULT_MAX_AGE
  ): Observable<T> {
    const cacheKey = this.createCacheKey(url, options);

    // Check if we have a valid cached response
    const cachedResponse = this.getFromCache<T>(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // Check if there's an in-flight request
    const inFlight = this.inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight as Observable<T>;
    }

    // Make a new request
    const request = this.http.get<T>(url, { ...options, observe: 'response' }).pipe(
      tap((response: HttpResponse<T>) => {
        // Cache the response
        this.addToCache(cacheKey, response.body as T, maxAge);
      }),
      catchError(error => {
        this.inFlightRequests.delete(cacheKey);
        return throwError(() => error);
      }),
      finalize(() => {
        this.inFlightRequests.delete(cacheKey);
      }),
      // Extract the response body
      tap(response => response.body),
      // Share the same response with multiple subscribers
      shareReplay(1)
    );

    // Store the in-flight request
    this.inFlightRequests.set(cacheKey, request);

    return request as Observable<T>;
  }

  /**
   * Invalidates a cache entry
   * @param url The URL to invalidate
   * @param options Request options
   */
  public invalidate(url: string, options: any = {}): void {
    const cacheKey = this.createCacheKey(url, options);
    this.cache.delete(cacheKey);
  }

  /**
   * Invalidates all cache entries
   */
  public invalidateAll(): void {
    this.cache.clear();
  }

  /**
   * Gets the number of entries in the cache
   * @returns The number of cache entries
   */
  public getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Creates a cache key from a URL and options
   * @param url The URL
   * @param options Request options
   * @returns A cache key
   */
  private createCacheKey(url: string, options: any): string {
    // Create a key based on the URL and query parameters
    const params = options.params ? this.serializeParams(options.params) : '';
    return `${url}${params ? '?' + params : ''}`;
  }

  /**
   * Serializes HttpParams to a string
   * @param params The HttpParams object
   * @returns A serialized string
   */
  private serializeParams(params: any): string {
    if (typeof params === 'string') {
      return params;
    }

    if (params instanceof URLSearchParams) {
      return params.toString();
    }

    // Handle HttpParams object
    if (params.keys) {
      return params
        .keys()
        .sort()
        .map(key => {
          const values = params.getAll(key);
          return values
            .sort()
            .map(value => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        })
        .join('&');
    }

    // Handle plain object
    return Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  /**
   * Gets a value from the cache
   * @param key The cache key
   * @returns The cached value or null if not found or expired
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    // Update the last accessed time
    entry.lastAccessed = Date.now();

    return entry.value as T;
  }

  /**
   * Adds a value to the cache
   * @param key The cache key
   * @param value The value to cache
   * @param maxAge Maximum age of the cache entry in milliseconds
   */
  private addToCache<T>(key: string, value: T, maxAge: number): void {
    // Ensure we don't exceed the maximum cache size
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + maxAge,
      lastAccessed: Date.now(),
    });
  }

  /**
   * Evicts the least recently used cache entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldest: { key: string; lastAccessed: number } | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.lastAccessed < oldest.lastAccessed) {
        oldest = { key, lastAccessed: entry.lastAccessed };
      }
    }

    if (oldest) {
      this.cache.delete(oldest.key);
    }
  }

  /**
   * Cleans up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Interface for cache entries
 */
interface CacheEntry {
  value: any;
  expiresAt: number;
  lastAccessed: number;
}

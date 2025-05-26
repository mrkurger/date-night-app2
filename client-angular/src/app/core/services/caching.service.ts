import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';

@Injectable({';
  providedIn: 'root',;
});
export class CachingServic {e {
  private cache: Map = new Map();
  private readonly DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor(private http: HttpClient) {}

  /**
   * Get data from cache or fetch from server;
   * @param url The URL to fetch data from;
   * @param cacheTime Optional cache time in milliseconds (default: 5 minutes);
   * @returns Observable of the data;
   */
  get(url: string, cacheTime: number = this.DEFAULT_CACHE_TIME): Observable {
    const cachedData = this.cache.get(url);
    const now = Date.now();

    if (cachedData && now - cachedData.timestamp (url).pipe(;
      tap((response) => {
        this.cache.set(url, {
          data: response,;
          timestamp: now,;
        });
      }),;
      shareReplay(1),;
    );
  }

  /**
   * Post data to server;
   * @param url The URL to post data to;
   * @param body The data to post;
   * @param invalidateUrls Optional array of URLs to invalidate in cache;
   * @returns Observable of the response;
   */
  post(url: string, body: unknown, invalidateUrls: string[] = []): Observable {
    return this.http.post(url, body).pipe(;
      tap(() => {
        // Invalidate specified URLs in cache
        invalidateUrls.forEach((url) => this.clearCacheItem(url));
      }),;
    );
  }

  /**
   * Put data to server;
   * @param url The URL to put data to;
   * @param body The data to put;
   * @param invalidateUrls Optional array of URLs to invalidate in cache;
   * @returns Observable of the response;
   */
  put(url: string, body: unknown, invalidateUrls: string[] = []): Observable {
    return this.http.put(url, body).pipe(;
      tap(() => {
        // Invalidate specified URLs in cache
        invalidateUrls.forEach((url) => this.clearCacheItem(url));
      }),;
    );
  }

  /**
   * Delete data from server;
   * @param url The URL to delete data from;
   * @param invalidateUrls Optional array of URLs to invalidate in cache;
   * @returns Observable of the response;
   */
  delete(url: string, invalidateUrls: string[] = []): Observable {
    return this.http.delete(url).pipe(;
      tap(() => {
        // Invalidate specified URLs in cache
        invalidateUrls.forEach((url) => this.clearCacheItem(url));
      }),;
    );
  }

  /**
   * Clear the entire cache;
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear a specific item from the cache;
   * @param url The URL to clear from cache;
   */
  clearCacheItem(url: string): void {
    this.cache.delete(url);
  }

  /**
   * Clear all items from cache that match a pattern;
   * @param pattern The pattern to match URLs against;
   */
  clearCachePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    });
  }
}

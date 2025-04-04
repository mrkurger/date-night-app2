import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

/**
 * Service to detect the current platform (browser or server)
 * Used for handling platform-specific code in SSR
 */
@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Check if the code is running in a browser
   */
  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Check if the code is running on the server
   */
  isServer(): boolean {
    return isPlatformServer(this.platformId);
  }

  /**
   * Execute a function only in the browser
   * @param fn Function to execute
   */
  runInBrowser(fn: () => void): void {
    if (this.isBrowser()) {
      fn();
    }
  }

  /**
   * Execute a function only on the server
   * @param fn Function to execute
   */
  runOnServer(fn: () => void): void {
    if (this.isServer()) {
      fn();
    }
  }
}
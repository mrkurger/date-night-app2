import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Service for sanitizing content to prevent XSS attacks
 * Provides methods to safely handle URLs and HTML content
 */
@Injectable({
  providedIn: 'root',
})
export class ContentSanitizerService {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Sanitizes a URL for safe binding to elements like img[src] and video[src]
   * @param url The URL to sanitize
   * @returns A safe URL that can be used in templates
   */
  sanitizeUrl(url: string): SafeUrl {
    if (!url) {
      return '';
    }

    // Validate URL format
    try {
      // For relative URLs, prepend with origin if they don't start with /
      if (!url.startsWith('http') && !url.startsWith('/')) {
        url = '/' + url;
      }

      return this.sanitizer.bypassSecurityTrustUrl(url);
    } catch (error) {
      console.error('Error sanitizing URL:', error);
      return '';
    }
  }

  /**
   * Sanitizes a URL for safe binding to iframe[src]
   * @param url The URL to sanitize
   * @returns A safe resource URL that can be used in iframes
   */
  sanitizeResourceUrl(url: string): SafeResourceUrl {
    if (!url) {
      return '';
    }

    try {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } catch (error) {
      console.error('Error sanitizing resource URL:', error);
      return '';
    }
  }

  /**
   * Validates if a string is a valid URL
   * @param url The URL to validate
   * @returns Boolean indicating if the URL is valid
   */
  isValidUrl(url: string): boolean {
    if (!url) {
      return false;
    }

    try {
      // For relative URLs, consider them valid if they start with /
      if (url.startsWith('/')) {
        return true;
      }

      // Reject potentially dangerous protocols
      if (url.toLowerCase().startsWith('javascript:')) {
        return false;
      }

      // Otherwise, try to create a URL object
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }
}

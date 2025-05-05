import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Service for optimizing images
 * Handles responsive image loading, lazy loading, and CDN integration
 */
@Injectable({
  providedIn: 'root',
})
export class ImageOptimizationService {
  private readonly cdnUrl = environment.cdnUrl || '';
  private readonly defaultQuality = 80;
  private readonly defaultFormat = 'webp';

  constructor() {}

  /**
   * Get optimized image URL with responsive sizing
   * @param originalUrl Original image URL
   * @param width Desired width
   * @param height Desired height (optional)
   * @param quality Image quality (1-100)
   * @param format Image format (webp, jpeg, png)
   * @returns Optimized image URL
   */
  getOptimizedUrl(
    originalUrl: string,
    width: number,
    height?: number,
    quality: number = this.defaultQuality,
    format: string = this.defaultFormat,
  ): string {
    // If URL is already a data URL or SVG, return as is
    if (originalUrl.startsWith('data:') || originalUrl.endsWith('.svg')) {
      return originalUrl;
    }

    // If using a CDN, format the URL according to CDN's API
    if (this.cdnUrl && !originalUrl.includes('http')) {
      return this.formatCdnUrl(originalUrl, width, height, quality, format);
    }

    // For local images without CDN, just return the original URL
    return originalUrl;
  }

  /**
   * Format URL for CDN with image optimization parameters
   */
  private formatCdnUrl(
    originalUrl: string,
    width: number,
    height?: number,
    quality: number = this.defaultQuality,
    format: string = this.defaultFormat,
  ): string {
    // Remove leading slash if present
    const cleanUrl = originalUrl.startsWith('/') ? originalUrl.substring(1) : originalUrl;

    // Construct CDN URL with optimization parameters
    let cdnUrl = `${this.cdnUrl}/${cleanUrl}?w=${width}`;

    if (height) {
      cdnUrl += `&h=${height}`;
    }

    cdnUrl += `&q=${quality}&fm=${format}&fit=crop`;

    return cdnUrl;
  }

  /**
   * Generate srcset for responsive images
   * @param originalUrl Original image URL
   * @param widths Array of widths for srcset
   * @param format Image format
   * @returns srcset string
   */
  generateSrcset(
    originalUrl: string,
    widths: number[] = [320, 640, 960, 1280, 1920],
    format: string = this.defaultFormat,
  ): string {
    return widths
      .map(
        (width) =>
          `${this.getOptimizedUrl(originalUrl, width, undefined, this.defaultQuality, format)} ${width}w`,
      )
      .join(', ');
  }

  /**
   * Get placeholder image URL (low quality)
   * @param originalUrl Original image URL
   * @returns Low quality placeholder image URL
   */
  getPlaceholderUrl(originalUrl: string): string {
    return this.getOptimizedUrl(originalUrl, 20, undefined, 20);
  }
}

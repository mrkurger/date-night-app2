import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Service for sanitizing content to prevent XSS attacks and SSRF vulnerabilities
 * Provides methods to safely handle URLs and HTML content
 */
@Injectable({
  providedIn: 'root',
})
export class ContentSanitizerService {
  // List of allowed protocols
  private readonly allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];
  // List of blocked IP patterns
  private readonly blockedIpPatterns = [
    /^127\./, // localhost
    /^10\./, // private network
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // private network
    /^192\.168\./, // private network
    /^0\./, // invalid
    /^169\.254\./, // link-local
    /^fc00::/, // unique local addr
    /^fe80::/, // link-local
  ];

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

    if (!this.isValidUrl(url)) {
      console.error('Invalid or potentially dangerous URL:', url);
      return '';
    }

    try {
      // For relative URLs, prepend with / if needed
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

    if (!this.isValidUrl(url)) {
      console.error('Invalid or potentially dangerous URL:', url);
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
   * Sanitizes text content to prevent XSS attacks
   * @param text The text content to sanitize
   * @returns Sanitized text content
   */
  sanitizeText(text: string): string {
    if (!text) return '';
    return text.replace(/[<>&"']/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;',
      };
      return entities[match];
    });
  }

  /**
   * Sanitizes HTML content, allowing only basic formatting tags
   * @param html The HTML content to sanitize
   * @returns Sanitized HTML content
   */
  sanitizeHtml(html: string): string {
    if (!html) return '';

    // Define allowed tags and their attributes
    const allowedTags = new Set(['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span']);
    const allowedAttrs = new Set(['href', 'target', 'rel']);

    // Create a temporary element
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;

    // Recursively clean nodes
    const cleanNode = (node: Node): Node | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();

        // Remove disallowed tags
        if (!allowedTags.has(tagName)) {
          return document.createTextNode(element.textContent || '');
        }

        // Clean attributes
        Array.from(element.attributes).forEach((attr) => {
          if (!allowedAttrs.has(attr.name)) {
            element.removeAttribute(attr.name);
          }
          // Additional security for links
          if (attr.name === 'href') {
            const url = attr.value;
            if (!this.isValidUrl(url)) {
              element.removeAttribute(attr.name);
            }
            // Force noopener noreferrer for external links
            if (url.startsWith('http')) {
              element.setAttribute('rel', 'noopener noreferrer');
              element.setAttribute('target', '_blank');
            }
          }
        });

        // Clean children
        Array.from(element.childNodes)
          .map(cleanNode)
          .filter(Boolean)
          .forEach((newChild) => {
            element.appendChild(newChild!);
          });

        return element;
      }

      return null;
    };

    // Clean the content
    const cleanedContent = Array.from(tempElement.childNodes)
      .map(cleanNode)
      .filter(Boolean)
      .map((node) => (node as Element).outerHTML || node!.textContent)
      .join('');

    return cleanedContent;
  }

  /**
   * Sanitizes and formats input for database storage
   * @param input The input to sanitize
   * @returns Sanitized input
   */
  sanitize(input: unknown): string {
    if (input === null || input === undefined) return '';
    if (typeof input !== 'string') return String(input);

    // For HTML content, use sanitizeHtml
    if (/<[a-z][\s\S]*>/i.test(input)) {
      return this.sanitizeHtml(input);
    }

    // For plain text, use sanitizeText
    return this.sanitizeText(input);
  }

  /**
   * Validates if a string is a valid URL and checks for potential SSRF vectors
   * @param url The URL to validate
   * @returns Boolean indicating if the URL is valid and safe
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

      const parsedUrl = new URL(url);

      // Check protocol
      if (!this.allowedProtocols.includes(parsedUrl.protocol.toLowerCase())) {
        console.warn('Blocked URL with disallowed protocol:', parsedUrl.protocol);
        return false;
      }

      // Only proceed with additional checks for http(s) protocols
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        // Check for private/internal IP addresses
        const hostname = parsedUrl.hostname;

        // Check if hostname is an IP address
        if (this.isIpAddress(hostname)) {
          if (this.blockedIpPatterns.some((pattern) => pattern.test(hostname))) {
            console.warn('Blocked URL with internal/private IP:', hostname);
            return false;
          }
        }

        // Block localhost variations
        if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
          console.warn('Blocked localhost URL:', hostname);
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks if a hostname is an IP address
   * @param hostname The hostname to check
   * @returns Boolean indicating if the hostname is an IP address
   */
  private isIpAddress(hostname: string): boolean {
    // IPv4
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6
    const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

    return ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname);
  }
}

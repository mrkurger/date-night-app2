import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Content Security Policy Interceptor
 *
 * This interceptor adds CSP headers to outgoing HTTP requests.
 * Note: For a production application, these headers should be set at the server level.
 * This is a client-side fallback for development purposes.
 */
@Injectable()
export class CSPInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only add CSP headers to same-origin requests
    if (this.isSameOrigin(req.url)) {
      const cspReq = req.clone({
        setHeaders: {
          'Content-Security-Policy': this.getCSPPolicy(),
        },
      });
      return next.handle(cspReq);
    }

    return next.handle(req);
  }

  /**
   * Determines if a URL is same-origin relative to the current window location
   * @param url The URL to check
   * @returns True if the URL is same-origin, false otherwise
   */
  private isSameOrigin(url: string): boolean {
    // Relative URLs are always same-origin
    if (url.startsWith('/')) {
      return true;
    }

    try {
      // For absolute URLs, compare origins
      return url.startsWith(window.location.origin);
    } catch (e) {
      // If there's an error parsing the URL, assume it's not same-origin
      return false;
    }
  }

  private getCSPPolicy(): string {
    // Define trusted domains
    const trustedScriptSources = [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com',
    ];

    const trustedStyleSources = [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com',
      'https://fonts.googleapis.com',
    ];

    const trustedFontSources = [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com',
    ];

    const trustedImageSources = [
      "'self'",
      'data:',
      'blob:',
      'https://*.cloudinary.com',
      'https://*.unsplash.com',
      'https://*.githubusercontent.com',
    ];

    const trustedConnectSources = [
      "'self'",
      'wss://*.example.com',
      'https://*.example.com',
      'https://api.example.com',
    ];

    // Build the CSP policy
    return [
      "default-src 'self'",
      `script-src ${trustedScriptSources.join(' ')}`,
      `style-src ${trustedStyleSources.join(' ')}`,
      `font-src ${trustedFontSources.join(' ')}`,
      `img-src ${trustedImageSources.join(' ')}`,
      `connect-src ${trustedConnectSources.join(' ')}`,
      "frame-src 'self'",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ].join('; ');
  }
}

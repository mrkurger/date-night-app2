import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
// HttpEvent and Observable are not used in this file

/**
 * Content Security Policy (CSP) Interceptor
 *
 * This interceptor adds CSP headers to same-origin requests to enhance security.
 * It helps protect against XSS, clickjacking, and other code injection attacks.
 */
export const cspInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  // Only add CSP headers to same-origin requests
  if (isSameOrigin(request.url)) {
    request = request.clone({
      setHeaders: {
        'Content-Security-Policy': getCSPPolicy(),
      },
    });
  }

  return next(request);
};

/**
 * Determines if a URL is same-origin
 */
function isSameOrigin(url: string): boolean {
  // Relative URLs are always same-origin
  if (url.startsWith('/')) {
    return true;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.origin === window.location.origin;
  } catch {
    // If URL parsing fails, assume it's not same-origin
    return false;
  }
}

/**
 * Generates a Content Security Policy
 */
function getCSPPolicy(): string {
  return [
    // Default policy for everything
    "default-src 'self'",

    // Script sources
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net cdnjs.cloudflare.com",

    // Style sources
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net cdnjs.cloudflare.com",

    // Font sources
    "font-src 'self' fonts.googleapis.com fonts.gstatic.com cdn.jsdelivr.net cdnjs.cloudflare.com",

    // Image sources
    "img-src 'self' data: blob: cloudinary.com *.cloudinary.com unsplash.com *.unsplash.com githubusercontent.com example.com",

    // Connect sources (XHR, WebSockets, etc.)
    "connect-src 'self' api.example.com example.com",

    // Frame sources
    "frame-src 'self' example.com",

    // Media sources
    "media-src 'self' cloudinary.com *.cloudinary.com example.com",

    // Object sources (plugins)
    "object-src 'none'",

    // Base URI restriction
    "base-uri 'self'",

    // Form action restriction
    "form-action 'self'",

    // Frame ancestors restriction (prevents clickjacking)
    "frame-ancestors 'self'",

    // Upgrade insecure requests
    'upgrade-insecure-requests',
  ].join('; ');
}

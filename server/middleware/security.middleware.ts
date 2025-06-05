import { Request, Response, NextFunction } from 'express';
import { ValidationUtils } from '../utils/validation-utils.js';

/**
 * Content Security Policy middleware
 * Sets strong security headers to prevent common web vulnerabilities
 */
export class SecurityMiddleware {
  /**
   * Main CSP middleware that sets all security headers
   */
  static configureSecurityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Generate nonce for inline scripts
      const nonce = ValidationUtils.generateNonce();
      res.locals.nonce = nonce;

      // Content Security Policy
      res.setHeader('Content-Security-Policy', SecurityMiddleware.buildCSPHeader(nonce));

      // Other security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader(
        'Permissions-Policy',
        'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
      );

      // Only allow HTTPS connections
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

      next();
    };
  }

  /**
   * Build Content Security Policy header value
   */
  private static buildCSPHeader(nonce: string): string {
    return [
      // Default fallback: deny all
      "default-src 'none'",

      // Scripts: only allow from same origin and with nonce
      `script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net`,

      // Styles: allow same origin and inline styles with nonce
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,

      // Images: allow same origin and data URIs
      "img-src 'self' data: https:",

      // Fonts: allow same origin and Google Fonts
      "font-src 'self' https://fonts.gstatic.com",

      // Connect: only allow same origin and specific APIs
      "connect-src 'self' https://api.example.com",

      // Media: only allow same origin
      "media-src 'self'",

      // Object: deny all
      "object-src 'none'",

      // Frames: only allow same origin
      "frame-src 'self'",

      // Forms: only allow same origin
      "form-action 'self'",

      // Frame ancestors: deny embedding
      "frame-ancestors 'none'",

      // Base URI: restrict to same origin
      "base-uri 'self'",

      // Manifest: allow same origin
      "manifest-src 'self'",

      // Require HTTPS
      'upgrade-insecure-requests',
    ].join('; ');
  }

  /**
   * Apply additional security checks to specific routes
   */
  static validateRoute(validations: Array<(_req: Request) => boolean>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const failedValidations = validations
          .map(validation => validation(req))
          .filter(result => !result);

        if (failedValidations.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Security validation failed',
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Common security validations
   */
  static validations = {
    /**
     * Validate Content-Type header
     */
    validateContentType: (req: Request): boolean => {
      const contentType = req.headers['content-type'];
      return (
        contentType === 'application/json' || contentType === 'application/x-www-form-urlencoded'
      );
    },

    /**
     * Validate request origin
     */
    validateOrigin: (req: Request): boolean => {
      const origin = req.headers.origin;
      return !origin || origin === process.env.ALLOWED_ORIGIN;
    },

    /**
     * Validate file upload content type
     */
    validateFileUpload: (req: Request): boolean => {
      const contentType = req.headers['content-type'];
      return contentType?.startsWith('multipart/form-data') || false;
    },

    /**
     * Check for common attack vectors in headers
     */
    validateSecurityHeaders: (req: Request): boolean => {
      const suspiciousHeaders = ['x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-port'];
      return !suspiciousHeaders.some(header => req.headers[header]);
    },
  };
}

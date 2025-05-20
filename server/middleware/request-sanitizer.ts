import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * Sanitization options interface
 */
interface SanitizationOptions {
  xssFilter?: boolean;
  trimStrings?: boolean;
  convertEmptyStringsToNull?: boolean;
}

/**
 * Request sanitizer middleware
 */
export class RequestSanitizer {
  private options: SanitizationOptions;

  constructor(options: SanitizationOptions = {}) {
    this.options = {
      xssFilter: true,
      trimStrings: true,
      convertEmptyStringsToNull: true,
      ...options
    };
  }

  /**
   * Sanitize a single value
   */
  private sanitizeValue(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    let sanitizedValue = value;

    // Apply XSS filtering
    if (this.options.xssFilter) {
      sanitizedValue = xss(sanitizedValue);
    }

    // Trim strings
    if (this.options.trimStrings) {
      sanitizedValue = sanitizedValue.trim();
    }

    // Convert empty strings to null
    if (this.options.convertEmptyStringsToNull && sanitizedValue === '') {
      return null;
    }

    return sanitizedValue;
  }

  /**
   * Recursively sanitize an object
   */
  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return this.sanitizeValue(obj);
  }

  /**
   * Middleware to sanitize request data
   */
  sanitize = (req: Request, _res: Response, next: NextFunction) => {
    // Sanitize body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize query params
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitize route params
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }

    next();
  };
}

// Create default sanitizer instance
const defaultSanitizer = new RequestSanitizer();
export const sanitizeRequest = defaultSanitizer.sanitize;

export default RequestSanitizer;

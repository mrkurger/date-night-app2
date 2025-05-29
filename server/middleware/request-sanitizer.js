/**
 * Request sanitizer middleware
 */
import xssFilters from 'xss-filters';

class RequestSanitizer {
  constructor(options = {}) {
    this.options = {
      xssFilter: true,
      trimStrings: true,
      convertEmptyStringsToNull: true,
      ...options,
    };
  }

  sanitizeValue(value) {
    if (typeof value !== 'string') {
      return value;
    }

    let sanitizedValue = value;

    // Apply XSS filtering
    if (this.options.xssFilter) {
      // Use more aggressive XSS filtering
      sanitizedValue = xssFilters.inHTMLData(sanitizedValue);

      // Remove dangerous attributes and scripts
      sanitizedValue = sanitizedValue
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers like onerror, onclick, etc.
        .replace(/\bon\w+\s*=\s*[^>\s]+/gi, '') // Remove unquoted event handlers
        .replace(/javascript:/gi, ''); // Remove javascript: URLs
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

  sanitizeObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      // Preserve special object types like Date, RegExp, etc.
      if (obj instanceof Date || obj instanceof RegExp || obj instanceof Buffer) {
        return obj;
      }

      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return this.sanitizeValue(obj);
  }

  sanitize = (req, res, next) => {
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

export { RequestSanitizer };
export default RequestSanitizer;

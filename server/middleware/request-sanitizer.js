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
      sanitizedValue = xssFilters.inHTMLData(sanitizedValue);
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

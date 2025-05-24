import { inHTMLData } from 'xss-filters';

/**
 * XSS Protection Middleware
 * Uses xss-filters to sanitize request data
 */
export const xssProtection = (req, res, next) => {
  if (req.body) {
    // Function to recursively sanitize objects
    const sanitizeObject = obj => {
      if (!obj || typeof obj !== 'object') {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }

      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          sanitized[key] = inHTMLData(value);
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    // Sanitize query parameters
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        req.query[key] = inHTMLData(value);
      }
    }
  }

  if (req.params) {
    // Sanitize URL parameters
    for (const [key, value] of Object.entries(req.params)) {
      if (typeof value === 'string') {
        req.params[key] = inHTMLData(value);
      }
    }
  }

  next();
};

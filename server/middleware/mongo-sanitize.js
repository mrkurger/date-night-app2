// Custom MongoDB query sanitization middleware that's compatible with Express 5
// Based on express-mongo-sanitize but modified to work with frozen request objects
import { createLogger, format, transports } from 'winston';

// Set up logger
const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: 'logs/mongo-sanitize-error.log', level: 'error' }),
    new transports.File({ filename: 'logs/mongo-sanitize.log' }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

const checkForMaliciousChars = (value, path = '') => {
  const hasDollar = value.includes('$');
  const hasDoc = value.includes('.');

  if (hasDollar || hasDoc) {
    logger.warn('Potentially malicious characters detected', {
      path,
      value,
      hasDollar,
      hasDoc,
    });
  }

  return hasDollar || hasDoc;
};

const sanitize = (value, path = '') => {
  if (typeof value === 'string') {
    // Replace $ with empty string unless it's a valid decimal number
    if (!/^\$?\d*\.?\d+$/.test(value)) {
      const oldValue = value;
      value = value.replace(/\$/g, '');
      if (oldValue !== value) {
        logger.info('Sanitized string value', {
          path,
          before: oldValue,
          after: value,
        });
      }
    }
  } else if (Array.isArray(value)) {
    value = value.map((v, i) => sanitize(v, `${path}[${i}]`));
  } else if (typeof value === 'object' && value !== null) {
    Object.keys(value).forEach(key => {
      value[key] = sanitize(value[key], path ? `${path}.${key}` : key);
    });
  }
  return value;
};

const sanitizeObject = (obj, source = '') => {
  const result = {};
  Object.keys(obj).forEach(key => {
    if (checkForMaliciousChars(key, `${source}.${key}`)) {
      logger.warn(`Skipping suspicious key in ${source}`, { key });
      return;
    }
    result[key] = sanitize(obj[key], key);
  });
  return result;
};

export const mongoSanitize = () => {
  return (req, res, next) => {
    const requestId = req.id || Math.random().toString(36).substring(7);

    try {
      logger.debug('Starting request sanitization', {
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
      });

      // Create sanitized copies of request data
      if (req.body && Object.keys(req.body).length) {
        const sanitizedBody = sanitizeObject(req.body, 'body');
        if (JSON.stringify(sanitizedBody) !== JSON.stringify(req.body)) {
          logger.info('Request body was sanitized', {
            requestId,
            before: req.body,
            after: sanitizedBody,
          });
        }
        req.body = sanitizedBody;
      }

      if (req.query && Object.keys(req.query).length) {
        try {
          const sanitizedQuery = sanitizeObject(req.query, 'query');
          if (JSON.stringify(sanitizedQuery) !== JSON.stringify(req.query)) {
            logger.info('Request query was sanitized', {
              requestId,
              before: req.query,
              after: sanitizedQuery,
            });
          }
          // Create a new query object since req.query is frozen in Express 5
          Object.defineProperty(req, 'query', {
            value: sanitizedQuery,
            configurable: true,
            enumerable: true,
          });
        } catch (queryError) {
          logger.error('Error sanitizing query parameters', {
            requestId,
            error: queryError.message,
            query: req.query,
          });
          throw queryError;
        }
      }

      if (req.params && Object.keys(req.params).length) {
        try {
          const sanitizedParams = sanitizeObject(req.params, 'params');
          if (JSON.stringify(sanitizedParams) !== JSON.stringify(req.params)) {
            logger.info('Request params were sanitized', {
              requestId,
              before: req.params,
              after: sanitizedParams,
            });
          }
          // Create a new params object since req.params might be frozen
          Object.defineProperty(req, 'params', {
            value: sanitizedParams,
            configurable: true,
            enumerable: true,
          });
        } catch (paramsError) {
          logger.error('Error sanitizing route parameters', {
            requestId,
            error: paramsError.message,
            params: req.params,
          });
          throw paramsError;
        }
      }

      logger.debug('Request sanitization completed', { requestId });
      next();
    } catch (err) {
      logger.error('Middleware error', {
        requestId,
        error: err.message,
        stack: err.stack,
        request: {
          method: req.method,
          path: req.path,
          headers: req.headers,
        },
      });

      // Send a safe error response
      res.status(400).json({
        error: 'Invalid request parameters',
        code: 'INVALID_REQUEST',
      });
    }
  };
};

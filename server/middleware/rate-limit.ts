/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */
import { Request, Response, NextFunction } from 'express';

// IP-based rate limiting storage
interface RateLimitRecord {
  count: number;
  resetAt: Date;
  blocked: boolean;
}

// Global rate limit storage
const rateLimits = new Map<string, RateLimitRecord>();

/**
 * Create a rate limiting middleware
 * 
 * @param options Rate limiting options
 * @returns Express middleware function
 */
export function rateLimit(options: {
  windowMs?: number;  // Time window in milliseconds (default: 15 minutes)
  maxRequests?: number;  // Maximum requests per window (default: 100)
  message?: string;  // Error message (default: 'Too many requests')
  statusCode?: number;  // Response status code (default: 429)
  skipSuccessfulRequests?: boolean;  // Whether to skip counting successful requests
  keyGenerator?: (req: Request) => string;  // Function to generate keys (default: IP address)
}) {
  const {
    windowMs = 15 * 60 * 1000,  // 15 minutes
    maxRequests = 100,
    message = 'Too many requests, please try again later',
    statusCode = 429,
    skipSuccessfulRequests = false,
    keyGenerator = (req: Request) => {
      return req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    },
  } = options;

  // Clean up expired entries every minute
  const interval = setInterval(() => {
    const now = new Date();
    
    for (const [key, record] of rateLimits.entries()) {
      if (now > record.resetAt) {
        rateLimits.delete(key);
      }
    }
  }, 60 * 1000);

  // Ensure the interval doesn't keep the process running
  interval.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    // Generate the key for this request
    const key = keyGenerator(req);
    const now = new Date();

    // Skip if rate limiting is disabled
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }

    // Get or create rate limit record
    let record = rateLimits.get(key);
    if (!record) {
      record = {
        count: 0,
        resetAt: new Date(now.getTime() + windowMs),
        blocked: false,
      };
      rateLimits.set(key, record);
    } else if (now > record.resetAt) {
      // Reset if window expired
      record.count = 0;
      record.resetAt = new Date(now.getTime() + windowMs);
      record.blocked = false;
    }

    // Check if blocked
    if (record.blocked) {
      const retryAfter = Math.ceil((record.resetAt.getTime() - now.getTime()) / 1000);
      
      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', String(Math.ceil(record.resetAt.getTime() / 1000)));
      
      return res.status(statusCode).json({
        success: false,
        message,
        retryAfter,
      });
    }

    // Increment counter
    record.count += 1;
    
    // Check if over limit
    if (record.count > maxRequests) {
      record.blocked = true;
      const retryAfter = Math.ceil((record.resetAt.getTime() - now.getTime()) / 1000);
      
      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', String(Math.ceil(record.resetAt.getTime() / 1000)));
      
      return res.status(statusCode).json({
        success: false,
        message,
        retryAfter,
      });
    }

    // Set headers
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(maxRequests - record.count));
    res.set('X-RateLimit-Reset', String(Math.ceil(record.resetAt.getTime() / 1000)));

    // Skip counting on successful response if specified
    if (skipSuccessfulRequests) {
      const end = res.end;
      res.end = function(...args: any[]) {
        // If response was successful, decrement the counter
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const record = rateLimits.get(key);
          if (record && record.count > 0) {
            record.count -= 1;
          }
        }
        return end.apply(res, args);
      };
    }

    next();
  };
}

// Export common rate limiters
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true, // Don't count successful logins
});

export const userCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 accounts per hour
  message: 'Account creation rate limit exceeded, please try again later',
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 password reset requests per hour
  message: 'Too many password reset requests, please try again later',
});

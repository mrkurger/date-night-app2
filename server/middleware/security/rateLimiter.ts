import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Express } from 'express';

interface RateLimitConfig {
  windowMs: number;
  delayAfter: number;
  delayMs: number;
  max: number;
}

export class RateLimitMiddleware {
  private static defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per windowMs before starting to delay responses
    delayMs: 500, // begin adding 500ms of delay per request
    max: 100, // limit each IP to 100 requests per windowMs
  };

  /**
   * Configure rate limiting for the entire app
   */
  static configureRateLimit(app: Express, config: Partial<RateLimitConfig> = {}) {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Rate limiter
    const limiter = rateLimit({
      windowMs: finalConfig.windowMs,
      max: finalConfig.max,
      message: {
        status: 429,
        message: 'Too many requests, please try again later.',
        details: `Rate limit: ${finalConfig.max} requests per ${finalConfig.windowMs / 1000 / 60} minutes.`,
      },
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });

    // Speed limiter (gradually slows down responses)
    const speedLimiter = slowDown({
      windowMs: finalConfig.windowMs,
      delayAfter: finalConfig.delayAfter,
      delayMs: finalConfig.delayMs,
    });

    // Apply rate limiting to all routes
    app.use(limiter);
    app.use(speedLimiter);
  }

  /**
   * Configure stricter rate limiting for specific routes (e.g., login, register)
   */
  static configureStrictRateLimit(app: Express, paths: string[]) {
    const strictLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // limit each IP to 5 requests per windowMs
      message: {
        status: 429,
        message: 'Too many attempts, please try again after an hour',
        details: 'Rate limit: 5 requests per hour.',
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false, // count successful requests against the rate limit
    });

    // Apply strict rate limiting to specified paths
    paths.forEach(path => app.use(path, strictLimiter));
  }

  /**
   * Configure API rate limiting for routes that require API key
   */
  static configureApiRateLimit(app: Express, apiPaths: string[]) {
    const apiLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 30, // limit each API key to 30 requests per minute
      message: {
        status: 429,
        message: 'API rate limit exceeded',
        details: 'Rate limit: 30 requests per minute.',
      },
      keyGenerator: req => {
        // Use API key from header or query parameter for rate limiting
        return req.headers['x-api-key'] || (req.query.apiKey as string) || req.ip;
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Apply API rate limiting to specified paths
    apiPaths.forEach(path => app.use(path, apiLimiter));
  }

  /**
   * Configure dynamic rate limiting based on user role
   */
  static configureDynamicRateLimit(app: Express, path: string) {
    const dynamicLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: req => {
        // Get user role from request (set by auth middleware)
        const userRole = (req as any).user?.role;

        // Define limits based on user role
        switch (userRole) {
          case 'admin':
            return 1000; // 1000 requests per 15 minutes
          case 'premium':
            return 500; // 500 requests per 15 minutes
          case 'basic':
            return 100; // 100 requests per 15 minutes
          default:
            return 50; // 50 requests per 15 minutes for unauthenticated users
        }
      },
      message: req => ({
        status: 429,
        message: 'Rate limit exceeded for your user role',
        details: `Please upgrade your account for higher limits.`,
      }),
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Apply dynamic rate limiting to the specified path
    app.use(path, dynamicLimiter);
  }
}

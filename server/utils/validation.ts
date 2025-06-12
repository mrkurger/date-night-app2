/**
 * Comprehensive validation utility for user data
 * Focused on password validation and security rules
 */
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Interface for validation errors
export interface ValidationError {
  field: string;
  message: string;
}

// Password validation schema with configurable rules
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// User registration validation schema
export const registerValidationSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, and ._-'),
  email: z.string().email('Please enter a valid email address'),
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
});

// Login validation schema
export const loginValidationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Password reset validation schema
export const resetPasswordValidationSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Email validation schema
export const emailValidationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Token validation schema
export const tokenValidationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

/**
 * Middleware for Zod validation
 * @param schema The Zod schema to validate against
 * @param source Where to find the data to validate (default: 'body')
 */
export const validate = (
  schema: z.ZodType<any>,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and parse the request data
      const data = await schema.parseAsync(req[source]);
      
      // Replace with validated data
      req[source] = data;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        });
      }
      
      next(error);
    }
  };
};

/**
 * Rate limiting helper to track failed attempts by IP
 * Used for implementing rate limiting in controllers
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetAt: Date }> = new Map();
  private readonly maxAttempts: number;
  private readonly timeWindowMs: number;

  constructor(maxAttempts = 5, timeWindowMs = 15 * 60 * 1000) { // Default: 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts;
    this.timeWindowMs = timeWindowMs;

    // Clean up expired entries every minute
    setInterval(() => this.cleanupExpired(), 60 * 1000);
  }

  /**
   * Record an attempt from an IP
   * @param ip The IP address
   * @returns Whether the IP is now blocked
   */
  recordAttempt(ip: string): boolean {
    const now = new Date();
    const record = this.attempts.get(ip);

    if (!record) {
      this.attempts.set(ip, { 
        count: 1, 
        resetAt: new Date(now.getTime() + this.timeWindowMs) 
      });
      return false;
    }

    // If reset time has passed, reset the counter
    if (now > record.resetAt) {
      this.attempts.set(ip, { 
        count: 1, 
        resetAt: new Date(now.getTime() + this.timeWindowMs) 
      });
      return false;
    }

    // Increment attempt count
    record.count += 1;
    this.attempts.set(ip, record);

    // Return true if limit exceeded
    return record.count > this.maxAttempts;
  }

  /**
   * Check if an IP is currently rate limited
   * @param ip The IP address to check
   * @returns Whether the IP is currently limited
   */
  isLimited(ip: string): boolean {
    const record = this.attempts.get(ip);
    if (!record) return false;

    const now = new Date();
    if (now > record.resetAt) {
      this.attempts.delete(ip);
      return false;
    }

    return record.count > this.maxAttempts;
  }

  /**
   * Get time remaining in rate limit for an IP
   * @param ip The IP address
   * @returns Time remaining in milliseconds or 0 if not limited
   */
  getTimeRemaining(ip: string): number {
    const record = this.attempts.get(ip);
    if (!record || record.count <= this.maxAttempts) return 0;

    const now = new Date();
    if (now > record.resetAt) return 0;

    return record.resetAt.getTime() - now.getTime();
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupExpired(): void {
    const now = new Date();
    for (const [ip, record] of this.attempts.entries()) {
      if (now > record.resetAt) {
        this.attempts.delete(ip);
      }
    }
  }
}

// Export a shared rate limiter instance for login attempts
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

// Export a shared rate limiter instance for password reset attempts
export const passwordResetRateLimiter = new RateLimiter(3, 60 * 60 * 1000);

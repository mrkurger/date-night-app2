/**
 * Validation middleware for auth-related routes
 */
import { z } from 'zod';
import { validationErrorResponse } from '../../utils/response.js';

// Base schemas
const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens');

const emailSchema = z
  .string()
  .email('Invalid email address format')
  .transform(val => val.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const tokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, 'Invalid token format');

// Request schemas
export const registerSchema = z.object({
  body: z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: usernameSchema,
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: tokenSchema,
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: tokenSchema,
    password: passwordSchema,
  }),
});

// Validation middleware factory
const validateSchema = schema => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(422).json(validationErrorResponse(formattedErrors));
    }
    next(error);
  }
};

// Validation middleware
export const validateRegister = validateSchema(registerSchema);
export const validateLogin = validateSchema(loginSchema);
export const validateRefreshToken = validateSchema(refreshTokenSchema);
export const validateForgotPassword = validateSchema(forgotPasswordSchema);
export const validateResetPassword = validateSchema(resetPasswordSchema);

export default {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
};

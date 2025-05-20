import { describe, it, expect } from '@jest/globals';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../../../middleware/validators/auth.validator.js';

describe('Auth Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        body: {
          username: 'testuser123',
          email: 'test@example.com',
          password: 'Test123!@#',
        },
      };
      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid username', () => {
      const invalidData = {
        body: {
          username: 't', // too short
          email: 'test@example.com',
          password: 'Test123!@#',
        },
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        body: {
          username: 'testuser123',
          email: 'not-an-email',
          password: 'Test123!@#',
        },
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('should reject weak password', () => {
      const invalidData = {
        body: {
          username: 'testuser123',
          email: 'test@example.com',
          password: 'weak',
        },
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        body: {
          username: 'testuser123',
          password: 'anypassword',
        },
      };
      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should reject missing password', () => {
      const invalidData = {
        body: {
          username: 'testuser123',
          password: '',
        },
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });
  });

  describe('refreshTokenSchema', () => {
    it('should validate valid refresh token', () => {
      const validData = {
        body: {
          refreshToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        },
      };
      expect(() => refreshTokenSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid token format', () => {
      const invalidData = {
        body: {
          refreshToken: 'not-a-token',
        },
      };
      expect(() => refreshTokenSchema.parse(invalidData)).toThrow();
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate valid email', () => {
      const validData = {
        body: {
          email: 'test@example.com',
        },
      };
      expect(() => forgotPasswordSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        body: {
          email: 'not-an-email',
        },
      };
      expect(() => forgotPasswordSchema.parse(invalidData)).toThrow();
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate valid reset data', () => {
      const validData = {
        body: {
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
          password: 'NewTest123!@#',
        },
      };
      expect(() => resetPasswordSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid token', () => {
      const invalidData = {
        body: {
          token: 'not-a-token',
          password: 'NewTest123!@#',
        },
      };
      expect(() => resetPasswordSchema.parse(invalidData)).toThrow();
    });

    it('should reject weak password', () => {
      const invalidData = {
        body: {
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
          password: 'weak',
        },
      };
      expect(() => resetPasswordSchema.parse(invalidData)).toThrow();
    });
  });
});

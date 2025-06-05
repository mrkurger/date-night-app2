// Global type declarations to fix Express and other common type issues
import { Express, Request, Response } from 'express';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      // Add user property
      user?: {
        id: string;
        role?: string;
        [key: string]: any;
      };
    }
  }
}

// Extend Error for custom error handling
declare global {
  interface Error {
    statusCode?: number;
    isOperational?: boolean;
  }
}

// Declare missing module definitions
declare module 'express-validator' {
  export interface ValidationError {
    param?: string;
    value?: any;
  }
}

export {};

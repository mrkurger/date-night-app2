/**
 * This script adds the necessary Express type augmentations to make
 * req.body, res.status(), etc. properly recognized in TypeScript
 */
const fs = require('fs');
const path = require('path');

const expressTypesPath = path.join(__dirname, '..', 'src', 'types', 'express-augmentation.d.ts');

const typesContent = `
// Global Express namespace augmentation
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role?: string;
      email?: string;
      [key: string]: any;
    };
  }
}

// Express module augmentation for proper request and response types
declare module 'express' {
  interface Request {
    body: any;
    params: Record<string, string>;
    query: Record<string, any>;
    headers: {
      [key: string]: string | string[] | undefined;
      'content-type'?: string;
      origin?: string;
    };
    originalUrl: string;
    ip: string;
  }

  interface Response {
    status(code: number): Response;
    json(body?: any): Response;
    locals: any;
    setHeader(name: string, value: string): this;
  }
}

// Make rate limiters compatible with Express middleware
declare module 'express-rate-limit' {
  export interface RateLimitRequestHandler {
    (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction): void;
  }
}

// Extend Error with fields used in custom error handling
declare global {
  interface Error {
    statusCode?: number;
    status?: number;
    code?: string;
  }
}
`;

try {
  fs.writeFileSync(expressTypesPath, typesContent);
  console.log(`Express type augmentations written to ${expressTypesPath}`);
} catch (error) {
  console.error('Error writing express type augmentations:', error);
}

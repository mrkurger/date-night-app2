import { NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// Global Express namespace augmentation
declare global {
  namespace Express {
    // Extend Request interface to include user property
    export interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
        [key: string]: any;
      };
    }
  }
}

// Express module augmentation
declare module 'express-serve-static-core' {
  interface Request {
    body: any;
    params: ParamsDictionary;
    query: ParsedQs;
    headers: {
      [key: string]: string | string[] | undefined;
      'content-type'?: string;
      origin?: string;
    };
    originalUrl: string;
    ip: string;
  }

  interface Response {
    status(code: number): this;
    json(body?: any): this;
    locals: any;
    setHeader(name: string, value: string): this;
  }
}

// Extend Error with optional statusCode property for custom errors
declare global {
  interface Error {
    statusCode?: number;
    status?: number;
    code?: string;
  }
}

import { _Component } from '@angular/core';
/**
 * Common types used throughout the application
 */

/**
 * Generic dictionary type for key-value pairs
 */
export type Dictionary<T = any> = {
  [key: string]: T;
};

/**
 * Type for API responses
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Type for event handlers
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * Type for callback functions
 */
export type Callback<T = any> = (data: T) => void;

/**
 * Type for HTTP request options
 */
export interface HttpOptions {
  headers?: Dictionary<string>;
  params?: Dictionary<string | number | boolean>;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
  observe?: 'body' | 'response' | 'events';
  reportProgress?: boolean;
  withCredentials?: boolean;
}

/**
 * Type for component configuration options
 */
export interface ComponentConfig {
  [key: string]: any;
}

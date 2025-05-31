/**
 * Type definitions for validation utilities
 */

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[];
}

export interface BaseValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
}

export type ErrorFormatter = (_error: any) => ValidationError;

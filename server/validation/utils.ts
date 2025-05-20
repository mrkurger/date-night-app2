/**
 * Helper functions for common validation tasks
 */

import mongoose from 'mongoose';

export class ValidationUtils {
  static validateObjectId(value: string): boolean {
    return mongoose.Types.ObjectId.isValid(value);
  }

  static sanitizeString(value: string): string {
    return value.trim().replace(/<[^>]*>/g, '');
  }

  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  static isValidNorwegianPhone(phone: string): boolean {
    return /^(\+47)?[2-9]\d{7}$/.test(phone);
  }

  static isValidNorwegianPostalCode(code: string): boolean {
    return /^\d{4}$/.test(code);
  }
}

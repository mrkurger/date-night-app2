/**
 * Tests for error sanitizer module
 */

import {
  sanitizeErrorMessage,
  restoreErrorMessage,
  sanitizeValidationErrors,
} from '../src/middleware/error-sanitizer';

describe('Error Sanitizer', () => {
  describe('sanitizeErrorMessage', () => {
    test('should sanitize URLs in error messages', () => {
      expect(sanitizeErrorMessage('Error at https://example.com')).toBe(
        'Error at https__//example.com'
      );
    });

    test('should sanitize multiple URLs in an error message', () => {
      const message = 'Found errors at https://site1.com and http://site2.com';
      const expected = 'Found errors at https__//site1.com and http__//site2.com';
      expect(sanitizeErrorMessage(message)).toBe(expected);
    });

    test('should handle non-string values', () => {
      expect(sanitizeErrorMessage(123)).toBe(123);
      expect(sanitizeErrorMessage(null)).toBeNull();
      expect(sanitizeErrorMessage(undefined)).toBeUndefined();
      expect(sanitizeErrorMessage(true)).toBe(true);
    });

    test('should handle complex error objects', () => {
      const error = new Error('Failed to load https://example.com/api');
      expect(sanitizeErrorMessage(error.message)).toBe('Failed to load https__//example.com/api');
    });
  });

  describe('restoreErrorMessage', () => {
    test('should restore sanitized URLs in error messages', () => {
      expect(restoreErrorMessage('Error at https__//example.com')).toBe(
        'Error at https://example.com'
      );
    });

    test('should restore multiple sanitized URLs in an error message', () => {
      const message = 'Found errors at https__//site1.com and http__//site2.com';
      const expected = 'Found errors at https://site1.com and http://site2.com';
      expect(restoreErrorMessage(message)).toBe(expected);
    });

    test('should handle non-string values', () => {
      expect(restoreErrorMessage(123)).toBe(123);
      expect(restoreErrorMessage(null)).toBeNull();
      expect(restoreErrorMessage(undefined)).toBeUndefined();
      expect(restoreErrorMessage(true)).toBe(true);
    });
  });

  describe('sanitizeValidationErrors', () => {
    test('should sanitize URLs in an array of validation error objects', () => {
      const errors = [
        { field: 'url', message: 'Invalid URL format: https://example.com' },
        { field: 'text', message: 'Text contains a URL http://example.org' },
        { field: 'other', value: 123 },
      ];

      const sanitized = sanitizeValidationErrors(errors);

      expect(sanitized[0].message).toBe('Invalid URL format: https__//example.com');
      expect(sanitized[1].message).toBe('Text contains a URL http__//example.org');
      expect(sanitized[2]).toEqual({ field: 'other', value: 123 });
    });

    test('should handle empty arrays', () => {
      expect(sanitizeValidationErrors([])).toEqual([]);
    });

    test('should handle null message fields', () => {
      const errors = [{ field: 'url', message: null }, { field: 'text' }];

      const sanitized = sanitizeValidationErrors(errors);
      expect(sanitized).toEqual(errors);
    });
  });
});

/**
 * Tests for path-to-regexp URL sanitization
 */

import {
  sanitizeUrl,
  restoreUrl,
  safePathToRegexp,
  mightCausePathToRegexpIssue,
} from '../src/middleware/path-to-regexp-patch';
import { sanitizeErrorMessage, restoreErrorMessage } from '../src/middleware/error-sanitizer';
import { pathToRegexp } from 'path-to-regexp';

describe('Path-to-regexp URL sanitization', () => {
  describe('sanitizeUrl', () => {
    test('should replace http:// with http__//', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http__//example.com');
    });

    test('should replace https:// with https__//', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https__//example.com');
    });

    test('should handle null and undefined', () => {
      expect(sanitizeUrl(null)).toBeNull();
      expect(sanitizeUrl(undefined)).toBeUndefined();
    });

    test('should not modify URLs without http or https', () => {
      expect(sanitizeUrl('ftp://example.com')).toBe('ftp://example.com');
    });
  });

  describe('restoreUrl', () => {
    test('should restore http__// to http://', () => {
      expect(restoreUrl('http__//example.com')).toBe('http://example.com');
    });

    test('should restore https__// to https://', () => {
      expect(restoreUrl('https__//example.com')).toBe('https://example.com');
    });

    test('should handle null and undefined', () => {
      expect(restoreUrl(null)).toBeNull();
      expect(restoreUrl(undefined)).toBeUndefined();
    });
  });

  describe('safePathToRegexp', () => {
    test('should handle URLs with colons without throwing errors', () => {
      expect(() => {
        safePathToRegexp('https://example.com');
      }).not.toThrow();
    });

    test('should still work with normal path patterns', () => {
      const regex = safePathToRegexp('/users/:id');
      expect('/users/123').toMatch(regex);
      expect('/users/abc').toMatch(regex);
      expect('/posts/123').not.toMatch(regex);
    });

    test('should sanitize URLs in patterns', () => {
      const regex = safePathToRegexp('https://example.com/users/:id');
      // The regex should match against the sanitized version
      expect('https__//example.com/users/123').toMatch(regex);
    });
  });

  describe('mightCausePathToRegexpIssue', () => {
    test('should identify URLs with colons', () => {
      expect(mightCausePathToRegexpIssue('https://example.com')).toBe(true);
      expect(mightCausePathToRegexpIssue('http://example.com')).toBe(true);
      expect(mightCausePathToRegexpIssue('/path/with:colon')).toBe(true);
    });

    test('should not flag safe paths', () => {
      expect(mightCausePathToRegexpIssue('/users/123')).toBe(false);
      expect(mightCausePathToRegexpIssue('/api/v1/products')).toBe(false);
    });
  });

  describe('sanitizeErrorMessage', () => {
    test('should sanitize URLs in error messages', () => {
      expect(sanitizeErrorMessage('Error at https://example.com')).toBe(
        'Error at https__//example.com'
      );
    });

    test('should handle non-string values', () => {
      expect(sanitizeErrorMessage(123)).toBe(123);
      expect(sanitizeErrorMessage(null)).toBeNull();
    });
  });

  describe('restoreErrorMessage', () => {
    test('should restore sanitized URLs in error messages', () => {
      expect(restoreErrorMessage('Error at https__//example.com')).toBe(
        'Error at https://example.com'
      );
    });

    test('should handle non-string values', () => {
      expect(restoreErrorMessage(123)).toBe(123);
      expect(restoreErrorMessage(null)).toBeNull();
    });
  });

  describe('Integration with path-to-regexp', () => {
    test('original path-to-regexp throws error with URL containing colons', () => {
      expect(() => {
        pathToRegexp('https://example.com');
      }).toThrow(/(Missing parameter name|path-to-regexp)/);
    });

    test('safePathToRegexp handles URL containing colons without error', () => {
      expect(() => {
        safePathToRegexp('https://example.com');
      }).not.toThrow();
    });
  });
});

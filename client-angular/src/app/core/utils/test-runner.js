/**
 * Simple test runner for utility functions
 * This allows us to test utility functions without the Angular test infrastructure
 *
 * @fileoverview This file contains utility functions for URL manipulation and a simple test framework
 * @global URL - The URL constructor is available in modern browsers and Node.js
 * @global console - The console object is available in browsers and Node.js
 */

/* global URL, console */

// Define the utility functions directly in this file for testing
// URL utilities

/**
 * Checks if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
function isValidUrl(url) {
  if (!url) {
    return false;
  }

  try {
    // Add protocol if missing
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);
    return !!urlObj.hostname;
  } catch (/* unused error */) {
    return false;
  }
}

/**
 * Adds query parameters to a URL
 * @param {string} url - The base URL
 * @param {Object} params - The query parameters to add
 * @returns {string} - The URL with query parameters
 */
function addQueryParams(url, params) {
  if (!url) {
    return '';
  }

  try {
    // Add protocol if missing
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);

    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.append(key, String(value));
    });

    return urlObj.toString();
  } catch (/* unused error */) {
    return url;
  }
}

/**
 * Extracts query parameters from a URL
 * @param {string} url - The URL to extract parameters from
 * @returns {Object} - The extracted query parameters
 */
function getQueryParams(url) {
  if (!url) {
    return {};
  }

  try {
    // Add protocol if missing
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);
    const params = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch (/* unused error */) {
    return {};
  }
}

/**
 * Joins URL path segments with forward slashes
 * @param {...string} segments - The path segments to join
 * @returns {string} - The joined path
 */
function joinUrlPaths(...segments) {
  return segments
    .map((segment) => (segment ? segment.replace(/^\/+|\/+$/g, '') : '')) // Remove leading/trailing slashes
    .filter(Boolean) // Remove empty segments
    .join('/');
}

// Simple test framework
/**
 * Defines a test suite
 * @param {string} name - The name of the test suite
 * @param {Function} fn - The function containing the tests
 */
function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

/**
 * Defines a test case
 * @param {string} name - The name of the test case
 * @param {Function} fn - The test function
 */
function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${error.message}`);
  }
}

/**
 * Creates an expectation for a value
 * @param {*} actual - The actual value
 * @returns {Object} - An object with assertion methods
 */
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(`Expected ${expectedStr}, but got ${actualStr}`);
      }
    },
  };
}

/**
 * Run the tests for URL utilities
 */
describe('URL Utilities', () => {
  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('example.com')).toBe(true);
      expect(isValidUrl('subdomain.example.com')).toBe(true);
      expect(isValidUrl('example.com/path')).toBe(true);
      expect(isValidUrl('example.com/path?query=value')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl('not a url with spaces')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
    });
  });

  describe('addQueryParams', () => {
    it('should add query parameters to a URL', () => {
      expect(addQueryParams('https://example.com', { param1: 'value1', param2: 'value2' })).toBe(
        'https://example.com/?param1=value1&param2=value2',
      );

      expect(addQueryParams('example.com', { param1: 'value1', param2: 'value2' })).toBe(
        'https://example.com/?param1=value1&param2=value2',
      );

      expect(addQueryParams('https://example.com?existing=true', { param1: 'value1' })).toBe(
        'https://example.com/?existing=true&param1=value1',
      );
    });

    it('should handle non-string parameter values', () => {
      expect(addQueryParams('https://example.com', { number: 123, boolean: true })).toBe(
        'https://example.com/?number=123&boolean=true',
      );
    });

    it('should handle empty or invalid URLs', () => {
      expect(addQueryParams('', { param1: 'value1' })).toBe('');
      expect(addQueryParams(null, { param1: 'value1' })).toBe('');
    });
  });

  describe('getQueryParams', () => {
    it('should extract query parameters from a URL', () => {
      expect(getQueryParams('https://example.com?param1=value1&param2=value2')).toEqual({
        param1: 'value1',
        param2: 'value2',
      });

      expect(getQueryParams('example.com?param1=value1&param2=value2')).toEqual({
        param1: 'value1',
        param2: 'value2',
      });
    });

    it('should return an empty object for URLs without query parameters', () => {
      expect(getQueryParams('https://example.com')).toEqual({});
      expect(getQueryParams('example.com')).toEqual({});
    });

    it('should handle empty or invalid URLs', () => {
      expect(getQueryParams('')).toEqual({});
      expect(getQueryParams(null)).toEqual({});
    });
  });

  describe('joinUrlPaths', () => {
    it('should join URL path segments correctly', () => {
      expect(joinUrlPaths('api', 'users', '123')).toBe('api/users/123');
      expect(joinUrlPaths('/api/', '/users/', '/123/')).toBe('api/users/123');
      expect(joinUrlPaths('api', '', 'users', '123')).toBe('api/users/123');
    });

    it('should handle empty segments', () => {
      expect(joinUrlPaths('', 'api', '', 'users')).toBe('api/users');
      expect(joinUrlPaths()).toBe('');
    });
  });
});

// Log test completion
console.log('\nTests completed!');

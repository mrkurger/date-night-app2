import {
  truncate,;
  capitalize,;
  toTitleCase,;
  camelToKebabCase,;
  kebabToCamelCase,;
  stripHtml,;
  formatCurrency,;
  formatDate,;
  formatRelativeTime,;
  slugify,;
  maskString,;
  formatPhoneNumber,;
  extractDomain,;
} from './string.utils';

describe('String Utilities', () => {
  describe('truncate', () => {
    it('should truncate strings longer than maxLength', () => {
      expect(truncate('This is a long string', 10)).toBe('This is a...');
      expect(truncate('This is a long string', 10, '…')).toBe('This is a…');
    });

    it('should not truncate strings shorter than maxLength', () => {
      expect(truncate('Short', 10)).toBe('Short');
      expect(truncate('', 10)).toBe('');
    });
  });

  describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('hello world')).toBe('Hello world');
    });

    it('should handle empty strings', () => {
      expect(capitalize('')).toBe('');
      expect(capitalize(null as any)).toBe('');
    });
  });

  describe('toTitleCase', () => {
    it('should convert strings to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
      expect(toTitleCase('hello WORLD')).toBe('Hello World');
    });

    it('should handle empty strings', () => {
      expect(toTitleCase('')).toBe('');
      expect(toTitleCase(null as any)).toBe('');
    });
  });

  describe('camelToKebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(camelToKebabCase('helloWorld')).toBe('hello-world');
      expect(camelToKebabCase('HelloWorld')).toBe('hello-world');
      expect(camelToKebabCase('helloWorldAgain')).toBe('hello-world-again');
      expect(camelToKebabCase('hello123World')).toBe('hello123-world');
      expect(camelToKebabCase('ABCTest')).toBe('a-b-c-test');
    });

    it('should handle empty strings', () => {
      expect(camelToKebabCase('')).toBe('');
      expect(camelToKebabCase(null as any)).toBe('');
    });
  });

  describe('kebabToCamelCase', () => {
    it('should convert kebab-case to camelCase', () => {
      expect(kebabToCamelCase('hello-world')).toBe('helloWorld');
      expect(kebabToCamelCase('hello-world-again')).toBe('helloWorldAgain');
    });

    it('should handle empty strings', () => {
      expect(kebabToCamelCase('')).toBe('');
      expect(kebabToCamelCase(null as any)).toBe('');
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags from a string', () => {
      expect(stripHtml('Hello World')).toBe('Hello World');
      expect(stripHtml('Test with nested tags')).toBe(;
        'Test with nested tags',;
      );
    });

    it('should handle empty strings', () => {
      expect(stripHtml('')).toBe('');
      expect(stripHtml(null as any)).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('should format numbers as currency', () => {
      // Note: These tests may fail in different locales
      expect(formatCurrency(1000, 'USD', 'en-US')).toBe('$1,000.00');
      expect(formatCurrency(1000.5, 'USD', 'en-US')).toBe('$1,000.50');
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      // Create a specific date for testing
      const testDate = new Date(2023, 0, 15); // January 15, 2023

      // Test with different locales and formats
      expect(;
        formatDate(testDate, 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),;
      ).toBe('January 15, 2023');

      expect(;
        formatDate(testDate, 'en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }),;
      ).toBe('01/15/23');
    });
  });

  describe('slugify', () => {
    it('should convert strings to URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Hello, World!')).toBe('hello-world');
      expect(slugify('Hello  World')).toBe('hello-world');
      expect(slugify('Hello--World')).toBe('hello-world');
      expect(slugify(' Hello World ')).toBe('hello-world');
    });

    it('should handle empty strings', () => {
      expect(slugify('')).toBe('');
      expect(slugify(null as any)).toBe('');
    });
  });

  describe('maskString', () => {
    it('should mask strings correctly', () => {
      expect(maskString('1234567890', 4, 2)).toBe('1234****90');
      expect(maskString('password', 0, 0)).toBe('********');
      expect(maskString('password', 2, 2)).toBe('pa****rd');
      expect(maskString('password', 0, 0, 'X')).toBe('XXXXXXXX');
    });

    it('should handle empty strings', () => {
      expect(maskString('')).toBe('');
      expect(maskString(null as any)).toBe('');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhoneNumber('1234567890', 'XXX-XXX-XXXX')).toBe('123-456-7890');
      expect(formatPhoneNumber('12345', 'XXX-XX-XXXX')).toBe('123-45-XXXX');
      expect(formatPhoneNumber('12345', '(XXX) XXX-XXXX')).toBe('(123) 45X-XXXX');
    });

    it('should handle empty strings', () => {
      expect(formatPhoneNumber('')).toBe('');
      expect(formatPhoneNumber(null as any)).toBe('');
    });
  });

  describe('extractDomain', () => {
    it('should extract domain from URLs correctly', () => {
      expect(extractDomain('https://www.example.com/path')).toBe('example.com');
      expect(extractDomain('http://subdomain.example.com')).toBe('example.com');
      expect(extractDomain('example.com')).toBe('example.com');
      expect(extractDomain('www.example.co.uk')).toBe('example.co.uk');
    });

    it('should include subdomains when specified', () => {
      expect(extractDomain('https://www.example.com', true)).toBe('www.example.com');
      expect(extractDomain('http://sub.domain.example.com', true)).toBe('sub.domain.example.com');
    });

    it('should handle special cases', () => {
      expect(extractDomain('https://example.com.au')).toBe('example.com.au');
      expect(extractDomain('https://something.co.uk')).toBe('something.co.uk');
    });

    it('should handle invalid URLs', () => {
      expect(extractDomain('')).toBe('');
      expect(extractDomain(null as any)).toBe('');
      expect(extractDomain('not a url')).toBe('not a url');
    });
  });
});

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  isValidEmail,
  isValidUrl,
  isValidNorwegianPhone,
  isValidPassword,
  matchingFieldsValidator,
  passwordMatchValidator,
  isValidNorwegianPostalCode,
  isValidISODate,
  isInRange,
  isAlphanumeric,
  isValidCreditCard,
} from './validation.utils';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('test.name@example.co.uk')).toBe(true);
      expect(isValidEmail('test+label@example.com')).toBe(true);
      expect(isValidEmail('test@subdomain.example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('test@example..com')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path')).toBe(true);
      expect(isValidUrl('http://example.com/path?query=value')).toBe(true);
      expect(isValidUrl('http://example.com:8080')).toBe(true);
      expect(isValidUrl('/relative/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('example')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
      expect(isValidUrl('http:/example.com')).toBe(false);
    });
  });

  describe('isValidNorwegianPhone', () => {
    it('should validate correct Norwegian phone numbers', () => {
      expect(isValidNorwegianPhone('99887766')).toBe(true);
      expect(isValidNorwegianPhone('998 877 66')).toBe(true);
      expect(isValidNorwegianPhone('+4799887766')).toBe(true);
      expect(isValidNorwegianPhone('+47 998 877 66')).toBe(true);
    });

    it('should reject invalid Norwegian phone numbers', () => {
      expect(isValidNorwegianPhone('')).toBe(false);
      expect(isValidNorwegianPhone('1234')).toBe(false);
      expect(isValidNorwegianPhone('12345678')).toBe(false); // Starts with 1, not valid
      expect(isValidNorwegianPhone('9988776')).toBe(false); // Too short
      expect(isValidNorwegianPhone('999887766')).toBe(false); // Too long
      expect(isValidNorwegianPhone('+4599887766')).toBe(false); // Wrong country code
    });
  });

  describe('isValidPassword', () => {
    it('should validate passwords with default requirements', () => {
      expect(isValidPassword('Passw0rd!')).toBe(true);
      expect(isValidPassword('C0mpl3x@P4ssw0rd')).toBe(true);
    });

    it('should reject passwords that do not meet default requirements', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('short')).toBe(false); // Too short
      expect(isValidPassword('password')).toBe(false); // No uppercase, numbers, or special chars
      expect(isValidPassword('Password')).toBe(false); // No numbers or special chars
      expect(isValidPassword('Password1')).toBe(false); // No special chars
    });

    it('should validate passwords with custom requirements', () => {
      // Only require minimum length
      expect(
        isValidPassword('password12', {
          minLength: 8,
          requireUppercase: false,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
        }),
      ).toBe(true);

      // Shorter minimum length
      expect(
        isValidPassword('Pass1!', {
          minLength: 6,
        }),
      ).toBe(true);
    });
  });

  describe('matchingFieldsValidator', () => {
    let formBuilder: FormBuilder;
    let form: FormGroup;

    beforeEach(() => {
      formBuilder = new FormBuilder();
      form = formBuilder.group(
        {
          field1: ['', Validators.required],
          field2: ['', Validators.required],
        },
        {
          validators: matchingFieldsValidator('field1', 'field2', 'fieldsMismatch'),
        },
      );
    });

    it('should not return error when fields match', () => {
      form.patchValue({
        field1: 'test',
        field2: 'test',
      });
      expect(form.valid).toBe(true);
      expect(form.get('field2')?.errors).toBeNull();
    });

    it('should return error when fields do not match', () => {
      form.patchValue({
        field1: 'test1',
        field2: 'test2',
      });
      expect(form.valid).toBe(false);
      expect(form.get('field2')?.errors?.['fieldsMismatch']).toBe(true);
    });
  });

  describe('passwordMatchValidator', () => {
    let formBuilder: FormBuilder;
    let form: FormGroup;

    beforeEach(() => {
      formBuilder = new FormBuilder();
      form = formBuilder.group(
        {
          password: ['', Validators.required],
          confirmPassword: ['', Validators.required],
        },
        {
          validators: passwordMatchValidator(),
        },
      );
    });

    it('should not return error when passwords match', () => {
      form.patchValue({
        password: 'test123',
        confirmPassword: 'test123',
      });
      expect(form.valid).toBe(true);
      expect(form.get('confirmPassword')?.errors).toBeNull();
    });

    it('should return error when passwords do not match', () => {
      form.patchValue({
        password: 'test123',
        confirmPassword: 'test456',
      });
      expect(form.valid).toBe(false);
      expect(form.get('confirmPassword')?.errors?.['passwordMismatch']).toBe(true);
    });
  });

  describe('isValidNorwegianPostalCode', () => {
    it('should validate correct Norwegian postal codes', () => {
      expect(isValidNorwegianPostalCode('0001')).toBe(true);
      expect(isValidNorwegianPostalCode('9999')).toBe(true);
      expect(isValidNorwegianPostalCode('1234')).toBe(true);
      expect(isValidNorwegianPostalCode(' 1234 ')).toBe(true); // With spaces
    });

    it('should reject invalid Norwegian postal codes', () => {
      expect(isValidNorwegianPostalCode('')).toBe(false);
      expect(isValidNorwegianPostalCode('123')).toBe(false); // Too short
      expect(isValidNorwegianPostalCode('12345')).toBe(false); // Too long
      expect(isValidNorwegianPostalCode('abcd')).toBe(false); // Not numeric
    });
  });

  describe('isValidISODate', () => {
    it('should validate correct ISO dates', () => {
      expect(isValidISODate('2023-01-01')).toBe(true);
      expect(isValidISODate('2023-12-31')).toBe(true);
      expect(isValidISODate('2023-02-28')).toBe(true);
      expect(isValidISODate('2024-02-29')).toBe(true); // Leap year
    });

    it('should reject invalid ISO dates', () => {
      expect(isValidISODate('')).toBe(false);
      expect(isValidISODate('2023/01/01')).toBe(false); // Wrong format
      expect(isValidISODate('01-01-2023')).toBe(false); // Wrong format
      expect(isValidISODate('2023-13-01')).toBe(false); // Invalid month
      expect(isValidISODate('2023-01-32')).toBe(false); // Invalid day
      expect(isValidISODate('2023-02-30')).toBe(false); // Invalid day for February
    });
  });

  describe('isInRange', () => {
    it('should validate numbers within range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true); // Min boundary
      expect(isInRange(10, 1, 10)).toBe(true); // Max boundary
    });

    it('should reject numbers outside range', () => {
      expect(isInRange(0, 1, 10)).toBe(false); // Below min
      expect(isInRange(11, 1, 10)).toBe(false); // Above max
    });
  });

  describe('isAlphanumeric', () => {
    it('should validate alphanumeric strings', () => {
      expect(isAlphanumeric('abc123')).toBe(true);
      expect(isAlphanumeric('ABC123')).toBe(true);
      expect(isAlphanumeric('123')).toBe(true);
      expect(isAlphanumeric('abc')).toBe(true);
    });

    it('should reject non-alphanumeric strings', () => {
      expect(isAlphanumeric('')).toBe(false);
      expect(isAlphanumeric('abc-123')).toBe(false); // Contains hyphen
      expect(isAlphanumeric('abc 123')).toBe(false); // Contains space
      expect(isAlphanumeric('abc_123')).toBe(false); // Contains underscore
      expect(isAlphanumeric('abc@123')).toBe(false); // Contains special char
    });
  });

  describe('isValidCreditCard', () => {
    it('should validate correct credit card numbers', () => {
      // Valid test credit card numbers (using Luhn algorithm)
      expect(isValidCreditCard('4111111111111111')).toBe(true); // Visa
      expect(isValidCreditCard('5555555555554444')).toBe(true); // Mastercard
      expect(isValidCreditCard('378282246310005')).toBe(true); // American Express
      expect(isValidCreditCard('6011111111111117')).toBe(true); // Discover
      expect(isValidCreditCard('4111-1111-1111-1111')).toBe(true); // With dashes
      expect(isValidCreditCard('4111 1111 1111 1111')).toBe(true); // With spaces
    });

    it('should reject invalid credit card numbers', () => {
      expect(isValidCreditCard('')).toBe(false);
      expect(isValidCreditCard('411111111111')).toBe(false); // Too short
      expect(isValidCreditCard('4111111111111112')).toBe(false); // Invalid checksum
      expect(isValidCreditCard('abcdefghijklmnop')).toBe(false); // Not numeric
    });
  });
});

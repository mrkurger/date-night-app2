import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';
import { ContentSanitizerService } from './content-sanitizer.service';
import { CryptoService } from './crypto.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { describe, expect, it } from '@jest/globals';

describe('ValidationService', () => {
  let service: ValidationService;
  let sanitizerService: ContentSanitizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidationService, ContentSanitizerService, CryptoService],
    });
    service = TestBed.inject(ValidationService);
    sanitizerService = TestBed.inject(ContentSanitizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      const validator = service.validateEmail();
      const control = new FormControl('test@example.com');
      expect(validator(control)).toBeNull();
    });

    it('should reject invalid email addresses', () => {
      const validator = service.validateEmail();
      const control = new FormControl('invalid-email');
      expect(validator(control)).toEqual({ email: true });
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const validator = service.validatePassword();
      const control = new FormControl('Test123!');
      expect(validator(control)).toBeNull();
    });

    it('should reject weak passwords', () => {
      const validator = service.validatePassword();
      const control = new FormControl('weak');
      expect(validator(control)).toEqual({ password: true });
    });
  });

  describe('Norwegian Phone Validation', () => {
    it('should validate correct Norwegian phone numbers', () => {
      const validator = service.validateNorwegianPhone();
      const validNumbers = ['+4792345678', '92345678', '004792345678'];
      validNumbers.forEach((number) => {
        const control = new FormControl(number);
        expect(validator(control)).toBeNull();
      });
    });

    it('should reject invalid Norwegian phone numbers', () => {
      const validator = service.validateNorwegianPhone();
      const invalidNumbers = ['+1234567890', '12345', '++4792345678'];
      invalidNumbers.forEach((number) => {
        const control = new FormControl(number);
        expect(validator(control)).toEqual({ norwegianPhone: true });
      });
    });
  });

  describe('Norwegian Postal Code Validation', () => {
    it('should validate correct Norwegian postal codes', () => {
      const validator = service.validateNorwegianPostalCode();
      const control = new FormControl('0123');
      expect(validator(control)).toBeNull();
    });

    it('should reject invalid Norwegian postal codes', () => {
      const validator = service.validateNorwegianPostalCode();
      const invalidCodes = ['123', '12345', 'abcd'];
      invalidCodes.forEach((code) => {
        const control = new FormControl(code);
        expect(validator(control)).toEqual({ norwegianPostalCode: true });
      });
    });
  });

  describe('Secure URL Validation', () => {
    it('should validate secure URLs', () => {
      const validator = service.validateSecureUrl();
      const validUrls = [
        'https://example.com',
        'https://sub.example.com/path',
        'https://example.com?param=value',
      ];
      validUrls.forEach((url) => {
        const control = new FormControl(url);
        expect(validator(control)).toBeNull();
      });
    });

    it('should reject insecure or invalid URLs', () => {
      const validator = service.validateSecureUrl();
      const invalidUrls = ['http://example.com', 'ftp://example.com', 'invalid-url'];
      invalidUrls.forEach((url) => {
        const control = new FormControl(url);
        expect(validator(control)).toEqual({ url: true });
      });
    });
  });

  describe('Field Matching Validation', () => {
    it('should validate matching fields', () => {
      const form = new FormGroup(
        {
          password: new FormControl('Test123!'),
          confirmPassword: new FormControl('Test123!'),
        },
        [service.validateFieldMatch('password', 'confirmPassword')],
      );
      expect(form.errors).toBeNull();
    });

    it('should reject non-matching fields', () => {
      const form = new FormGroup(
        {
          password: new FormControl('Test123!'),
          confirmPassword: new FormControl('Different123!'),
        },
        [service.validateFieldMatch('password', 'confirmPassword')],
      );
      expect(form.errors).toEqual({ mismatch: true });
    });
  });

  describe('Date Validation', () => {
    it('should validate past dates', () => {
      const validator = service.validatePastDate();
      const pastDate = new Date(2020, 1, 1).toISOString();
      const control = new FormControl(pastDate);
      expect(validator(control)).toBeNull();
    });

    it('should validate future dates', () => {
      const validator = service.validateFutureDate();
      const futureDate = new Date(2030, 1, 1).toISOString();
      const control = new FormControl(futureDate);
      expect(validator(control)).toBeNull();
    });
  });

  describe('Form Data Sanitization', () => {
    it('should sanitize string values in form data', () => {
      const mockSanitize = spyOn(sanitizerService, 'sanitize').and.callFake((val) => val);
      const data = {
        name: '<script>alert("xss")</script>John',
        age: 25,
        email: 'test@example.com',
      };

      service.sanitizeFormData(data);
      expect(mockSanitize).toHaveBeenCalledTimes(2); // Once for name, once for email
    });
  });

  describe('Error Message Generation', () => {
    it('should generate appropriate error messages', () => {
      const control = new FormControl('', [Validators.required, Validators.email]);
      control.markAsTouched();

      expect(service.getErrorMessage(control)).toBe('This field is required');

      control.setValue('invalid-email');
      expect(service.getErrorMessage(control)).toBe('Please enter a valid email address');
    });
  });

  describe('Complete Error State', () => {
    it('should return complete validation state', () => {
      const control = new FormControl('', [Validators.required, Validators.email]);
      control.markAsTouched();
      control.markAsDirty();

      const state = service.getCompleteErrorState(control);
      expect(state).toEqual({
        invalid: true,
        dirty: true,
        touched: true,
        errors: { required: true },
        errorMessage: 'This field is required',
      });
    });
  });
  // Additional test cases for validation.service.spec.ts

  describe('URL Validation', () => {
    it('should validate various HTTPS URL formats', () => {
      const validator = service.validateSecureUrl();
      const validUrls = [
        'https://example.com',
        'https://sub.domain.example.com',
        'https://example.com/path?param=value#hash',
        'https://example.com:8443',
      ];
      validUrls.forEach((url) => {
        expect(validator(new FormControl(url))).toBeNull();
      });
    });

    it('should reject non-HTTPS and malformed URLs', () => {
      const validator = service.validateSecureUrl();
      const invalidUrls = [
        'http://example.com',
        'ftp://example.com',
        'example.com',
        'https://',
        'https://example',
      ];
      invalidUrls.forEach((url) => {
        expect(validator(new FormControl(url))).toEqual({ url: true });
      });
    });
  });

  describe('Name Validation', () => {
    it('should validate Norwegian names with special characters', () => {
      const validator = service.validateName();
      const validNames = ['Øyvind', 'Åse-Marie', 'Per Erik Østli', 'Håkon æ Æ'];
      validNames.forEach((name) => {
        expect(validator(new FormControl(name))).toBeNull();
      });
    });

    it('should reject invalid name formats', () => {
      const validator = service.validateName();
      const invalidNames = ['John123', 'Per!', '123', 'John@Doe'];
      invalidNames.forEach((name) => {
        expect(validator(new FormControl(name))).toEqual({ name: true });
      });
    });
  });

  describe('Password Match Validation', () => {
    let formGroup: FormGroup;

    beforeEach(() => {
      formGroup = new FormGroup(
        {
          password: new FormControl(''),
          confirmPassword: new FormControl(''),
        },
        [service.validatePasswordMatch('password', 'confirmPassword')],
      );
    });

    it('should validate matching passwords', () => {
      formGroup.patchValue({
        password: 'Test123!',
        confirmPassword: 'Test123!',
      });
      expect(formGroup.errors).toBeNull();
      expect(formGroup.get('confirmPassword')?.errors).toBeNull();
    });

    it('should detect non-matching passwords', () => {
      formGroup.patchValue({
        password: 'Test123!',
        confirmPassword: 'Different123!',
      });
      expect(formGroup.errors).toEqual({ passwordMismatch: true });
      expect(formGroup.get('confirmPassword')?.errors).toEqual({ passwordMismatch: true });
    });

    it('should clear errors when passwords match', () => {
      formGroup.patchValue({
        password: 'Test123!',
        confirmPassword: 'Different123!',
      });
      expect(formGroup.errors).toBeTruthy();

      formGroup.patchValue({
        confirmPassword: 'Test123!',
      });
      expect(formGroup.errors).toBeNull();
    });
  });

  describe('Date Range Validation', () => {
    let formGroup: FormGroup;

    beforeEach(() => {
      formGroup = new FormGroup(
        {
          startDate: new FormControl(''),
          endDate: new FormControl(''),
        },
        [service.validateDateRange('startDate', 'endDate')],
      );
    });

    it('should validate correct date ranges', () => {
      formGroup.patchValue({
        startDate: '2023-01-01',
        endDate: '2023-01-02',
      });
      expect(formGroup.errors).toBeNull();
    });

    it('should reject invalid date ranges', () => {
      formGroup.patchValue({
        startDate: '2023-01-02',
        endDate: '2023-01-01',
      });
      expect(formGroup.errors).toEqual({ dateRange: true });
    });

    it('should handle same day dates', () => {
      formGroup.patchValue({
        startDate: '2023-01-01',
        endDate: '2023-01-01',
      });
      expect(formGroup.errors).toEqual({ dateRange: true });
    });
  });

  describe('Form Data Sanitization', () => {
    it('should sanitize nested objects', () => {
      const mockSanitize = jest
        .spyOn(sanitizerService, 'sanitizeText')
        .mockImplementation((val) => val);

      const data = {
        user: {
          name: '<script>alert("xss")</script>John',
          profile: {
            bio: '<img src=x onerror=alert(1)>',
          },
        },
      };

      service.sanitizeFormData(data);
      expect(mockSanitize).toHaveBeenCalledTimes(2);
      mockSanitize.mockRestore();
    });

    it('should handle arrays of data', () => {
      const mockSanitize = jest
        .spyOn(sanitizerService, 'sanitizeText')
        .mockImplementation((val) => val);

      const data = {
        comments: ['<script>alert(1)</script>', 'normal text', '<img src=x>'],
      };

      service.sanitizeFormData(data);
      expect(mockSanitize).toHaveBeenCalledTimes(3);
      mockSanitize.mockRestore();
    });

    it('should preserve non-string values', () => {
      const data = {
        age: 25,
        active: true,
        score: 3.14,
        dates: [new Date(), null, undefined],
      };

      const result = service.sanitizeFormData(data);
      expect(result).toEqual(data);
    });
  });
});

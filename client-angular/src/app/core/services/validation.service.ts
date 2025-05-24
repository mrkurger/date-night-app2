import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ContentSanitizerService } from './content-sanitizer.service';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor(
    private contentSanitizer: ContentSanitizerService,
    private cryptoService: CryptoService,
  ) {}

  /**
   * Common validation patterns
   */
  private patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
    norwegianPhone: /^(\+47|0047)?[2-9]\d{7}$/,
    norwegianPostalCode: /^\d{4}$/,
    url: /^https:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/,
    name: /^[a-zA-ZæøåÆØÅ\s-]+$/,
    filePath: /^[a-zA-Z0-9-_/]+\.[a-zA-Z0-9]+$/,
    mongoId: /^[0-9a-fA-F]{24}$/,
    coordinates: /^-?\d+(\.\d+)?$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
  };

  /**
   * Common validation messages
   */
  private messages: { [key: string]: string } = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    password:
      'Password must be at least 8 characters and contain uppercase, lowercase, number and special character',
    minlength: 'Value is too short',
    maxlength: 'Value is too long',
    pattern: 'Value has an invalid format',
    norwegianPhone: 'Please enter a valid Norwegian phone number',
    norwegianPostalCode: 'Please enter a valid Norwegian postal code',
    url: 'Please enter a valid HTTPS URL',
    name: 'Name can only contain letters, spaces and hyphens',
    filePath: 'Invalid file path format',
    mongoId: 'Invalid ID format',
    coordinates: 'Please enter a valid coordinate',
    date: 'Please enter a valid date (YYYY-MM-DD)',
    passwordMismatch: 'Passwords do not match',
    dateRange: 'End date must be after start date',
    min: 'Value is too small',
    max: 'Value is too large',
    email_backend: 'This email is already registered',
    username_backend: 'This username is already taken',
  };

  /**
   * Get validation message for a control
   */
  getErrorMessage(control: AbstractControl): string {
    if (!control || !control.errors) return '';

    const firstError = Object.keys(control.errors)[0];
    const errorDetails = control.errors[firstError];

    // Handle custom error messages with parameters
    if (firstError === 'minlength') {
      return `Minimum length is ${errorDetails.requiredLength} characters`;
    }
    if (firstError === 'maxlength') {
      return `Maximum length is ${errorDetails.requiredLength} characters`;
    }
    if (firstError === 'min') {
      return `Minimum value is ${errorDetails.min}`;
    }
    if (firstError === 'max') {
      return `Maximum value is ${errorDetails.max}`;
    }

    return this.messages[firstError] || 'Invalid value';
  }

  /**
   * Custom validator: Password strength
   */
  validatePassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = this.patterns.password.test(control.value);
      return valid ? null : { password: true };
    };
  }

  /**
   * Custom validator: Norwegian phone number
   */
  validateNorwegianPhone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = this.patterns.norwegianPhone.test(control.value);
      return valid ? null : { norwegianPhone: true };
    };
  }

  /**
   * Custom validator: Norwegian postal code
   */
  validateNorwegianPostalCode(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = this.patterns.norwegianPostalCode.test(control.value);
      return valid ? null : { norwegianPostalCode: true };
    };
  }

  /**
   * Custom validator: Secure URL (HTTPS)
   */
  validateSecureUrl(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = this.patterns.url.test(control.value);
      return valid ? null : { url: true };
    };
  }

  /**
   * Custom validator: Name format
   */
  validateName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const valid = this.patterns.name.test(control.value);
      return valid ? null : { name: true };
    };
  }

  /**
   * Custom validator: Password confirmation
   */
  validatePasswordMatch(passwordKey: string, confirmPasswordKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordKey);
      const confirmPassword = group.get(confirmPasswordKey);

      if (!password || !confirmPassword) return null;

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }

      // Clear the error if passwords match
      const errors = { ...confirmPassword.errors };
      delete errors['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);

      return null;
    };
  }

  /**
   * Custom validator: Date range
   */
  validateDateRange(startDateKey: string, endDateKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const startDate = group.get(startDateKey);
      const endDate = group.get(endDateKey);

      if (!startDate || !endDate) return null;

      const start = new Date(startDate.value);
      const end = new Date(endDate.value);

      if (start >= end) {
        endDate.setErrors({ dateRange: true });
        return { dateRange: true };
      }

      // Clear the error if dates are valid
      const errors = { ...endDate.errors };
      delete errors['dateRange'];
      endDate.setErrors(Object.keys(errors).length ? errors : null);

      return null;
    };
  }

  /**
   * Sanitize form data before submission
   */
  sanitizeFormData(data: any): any {
    if (!data) return data;

    if (typeof data === 'string') {
      return this.contentSanitizer.sanitizeText(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeFormData(item));
    }

    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeFormData(data[key]);
        }
      }
      return sanitized;
    }

    return data;
  }
}

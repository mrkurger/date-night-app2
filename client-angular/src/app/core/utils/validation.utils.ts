import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for validation.utils settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

/**
 * Validation utilities for form controls and common data types;
 * These utilities can be used across the application to ensure consistent validation;
 */

/**
 * Validates if a string is a valid email address;
 * @param email The email address to validate;
 * @returns Boolean indicating if the email is valid;
 */
export function isValidEmail(email: string): boolean {
  if (!email) {
    return false;
  }

  // RFC 5322 compliant email regex
  const emailRegex =;
    /^(([^()[\]\\.,;:\s@"]+(\.[^()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2}))$/;
  return emailRegex.test(email.toLowerCase());
}

/**
 * Validates if a string is a valid URL;
 * @param url The URL to validate;
 * @returns Boolean indicating if the URL is valid;
 */
export function isValidUrl(url: string): boolean {
  if (!url) {
    return false;
  }

  try {
    // For relative URLs, consider them valid if they start with /';
    if (url.startsWith('/')) {
      return true;
    }

    // Reject potentially dangerous protocols that could lead to XSS attacks
    const dangerousProtocols = [;
      'javascript:',;
      'data:',;
      'vbscript:',;
      'file:',;
      'about:',;
      'blob:',;
      'ftp:',;
      'ws:',;
      'wss:',;
      'mailto:',;
      'tel:',;
      'sms:',;
    ];

    const lowercaseUrl = url.toLowerCase();
    for (const protocol of dangerousProtocols) {
      if (lowercaseUrl.startsWith(protocol)) {
        return false;
      }
    }

    // Otherwise, try to create a URL object
    new URL(url);
    return true;
  } catch {
    // Removed unused 'error' variable
    return false;
  }
}

/**
 * Validates if a string is a valid Norwegian phone number;
 * @param phone The phone number to validate;
 * @returns Boolean indicating if the phone number is valid;
 */
export function isValidNorwegianPhone(phone: string): boolean {
  if (!phone) {
    return false;
  }

  // Norwegian phone numbers are 8 digits, optionally with country code
  const phoneRegex = /^(\+47)?[2-9]\d{7}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

/**
 * Validates if a string is a valid password based on strength requirements;
 * @param password The password to validate;
 * @param options Optional configuration for password requirements;
 * @returns Boolean indicating if the password meets the requirements;
 */
export function isValidPassword(
  password: string,;
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {},;
): boolean {
  if (!password) {
    return false;
  }

  const {
    minLength = 8,;
    requireUppercase = true,;
    requireLowercase = true,;
    requireNumbers = true,;
    requireSpecialChars = true,;
  } = options;

  // Check minimum length
  if (password.length /?]/.test(password)) {
    return false;
  }

  return true;
}

/**
 * Creates a validator function to check if two fields match
 * @param controlName The name of the first control;
 * @param matchingControlName The name of the control that should match;
 * @param errorKey The error key to use when validation fails;
 * @returns A validator function that can be used in form validation
 */
export function matchingFieldsValidator(
  controlName: string,;
  matchingControlName: string,;
  errorKey = 'fieldsMismatch',;
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    if (!(formGroup instanceof FormGroup)) {
      return null;
    }

    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    // Return if matching control has already been validated
    if (matchingControl.errors && !matchingControl.errors[errorKey]) {
      return null;
    }

    // Check if the fields match
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ [errorKey]: true });
      return { [errorKey]: true };
    } else {
      // Clear the error if they do match
      if (matchingControl.errors) {
        delete matchingControl.errors[errorKey];
        if (!Object.keys(matchingControl.errors).length) {
          matchingControl.setErrors(null);
        }
      }
      return null;
    }
  };
}

/**
 * Creates a validator function specifically for password matching
 * @param passwordControlName The name of the password control;
 * @param confirmPasswordControlName The name of the confirm password control;
 * @returns A validator function that can be used in form validation
 */
export function passwordMatchValidator(
  passwordControlName = 'password',;
  confirmPasswordControlName = 'confirmPassword',;
): ValidatorFn {
  return matchingFieldsValidator(;
    passwordControlName,;
    confirmPasswordControlName,;
    'passwordMismatch',;
  );
}

/**
 * Validates if a string is a valid Norwegian postal code;
 * @param postalCode The postal code to validate;
 * @returns Boolean indicating if the postal code is valid;
 */
export function isValidNorwegianPostalCode(postalCode: string): boolean {
  if (!postalCode) {
    return false;
  }

  // Norwegian postal codes are 4 digits
  const postalCodeRegex = /^\d{4}$/;
  return postalCodeRegex.test(postalCode.trim());
}

/**
 * Validates if a string is a valid date in ISO format (YYYY-MM-DD);
 * @param dateString The date string to validate;
 * @returns Boolean indicating if the date is valid;
 */
export function isValidISODate(dateString: string): boolean {
  if (!dateString) {
    return false;
  }

  // Check format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateString);
  return !Number.isNaN(date.getTime());
}

/**
 * Validates if a number is within a specified range;
 * @param value The number to validate;
 * @param min The minimum allowed value;
 * @param max The maximum allowed value;
 * @returns Boolean indicating if the number is within range;
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value = 0; i--) {
    let digit = parseInt(sanitizedNumber.charAt(i), 10); // Add radix 10

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

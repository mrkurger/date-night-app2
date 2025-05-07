import { URL } from 'url';

/**
 * Validation utility functions for the application
 * This file provides common validation functions used across the application
 */

/**
 * Validates if a string is a valid email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for validation settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a string is not empty
 * @param {string} str - The string to validate
 * @returns {boolean} - True if not empty, false otherwise
 */
const isNotEmpty = str => {
  return typeof str === 'string' && str.trim().length > 0;
};

/**
 * Validates if a value is a valid number
 * @param {any} value - The value to validate
 * @returns {boolean} - True if valid number, false otherwise
 */
const isValidNumber = value => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Validates if a string meets minimum length requirements
 * @param {string} str - The string to validate
 * @param {number} minLength - The minimum length required
 * @returns {boolean} - True if valid, false otherwise
 */
const hasMinLength = (str, minLength) => {
  return typeof str === 'string' && str.length >= minLength;
};

/**
 * Validates if a string meets maximum length requirements
 * @param {string} str - The string to validate
 * @param {number} maxLength - The maximum length allowed
 * @returns {boolean} - True if valid, false otherwise
 */
const hasMaxLength = (str, maxLength) => {
  return typeof str === 'string' && str.length <= maxLength;
};

/**
 * Validates if a string contains only alphanumeric characters
 * @param {string} str - The string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isAlphanumeric = str => {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(str);
};

/**
 * Validates if a password meets security requirements
 * @param {string} password - The password to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isStrongPassword = password => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates if a date string is in a valid format
 * @param {string} dateStr - The date string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidDate = dateStr => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Validates if a value is within a specified range
 * @param {number} value - The value to validate
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {boolean} - True if within range, false otherwise
 */
const isInRange = (value, min, max) => {
  return isValidNumber(value) && value >= min && value <= max;
};

/**
 * Sanitizes a string by removing HTML tags
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
const sanitizeString = str => {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
};

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The id to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateObjectId = id => {
  return id && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Checks if a hostname is an IP address
 * @param {string} hostname - The hostname to check
 * @returns {boolean} - True if hostname is an IP address
 */
const isIpAddress = hostname => {
  // IPv4
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

  return ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname);
};

/**
 * Validates if a string is a valid URL and checks for SSRF vectors
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid and safe, false otherwise
 */
const isValidUrl = url => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Allow relative URLs starting with /
  if (url.startsWith('/')) {
    return true;
  }

  try {
    const parsedUrl = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol.toLowerCase())) {
      return false;
    }

    // Block localhost and internal IP addresses
    const hostname = parsedUrl.hostname.toLowerCase();
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];

    if (blockedHosts.includes(hostname) || hostname.endsWith('.localhost')) {
      return false;
    }

    // Block internal/private IP ranges
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
      const parts = hostname.split('.');
      const firstOctet = parseInt(parts[0], 10);

      // Check for private/internal IP ranges
      if (
        firstOctet === 10 || // 10.0.0.0/8
        firstOctet === 0 || // 0.0.0.0/8
        firstOctet === 127 || // 127.0.0.0/8
        (firstOctet === 172 && parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31) || // 172.16.0.0/12
        (firstOctet === 192 && parseInt(parts[1], 10) === 168) || // 192.168.0.0/16
        (firstOctet === 169 && parseInt(parts[1], 10) === 254) // 169.254.0.0/16
      ) {
        return false;
      }
    }

    // Block IPv6 localhost and private ranges
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    if (ipv6Regex.test(hostname)) {
      const blockedIPv6Prefixes = [
        'fc00:', // Unique local address
        'fe80:', // Link-local address
        'ff00:', // Multicast
        '::1', // Localhost
        '0000:', // Mapped IPv4
        '2001:db8:', // Documentation
      ];

      if (blockedIPv6Prefixes.some(prefix => hostname.toLowerCase().startsWith(prefix))) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

export default {
  isValidEmail,
  isNotEmpty,
  isValidNumber,
  hasMinLength,
  hasMaxLength,
  isAlphanumeric,
  isStrongPassword,
  isValidDate,
  isInRange,
  sanitizeString,
  validateObjectId,
  isValidUrl,
  isIpAddress,
};

export {
  isValidEmail,
  isNotEmpty,
  isValidNumber,
  hasMinLength,
  hasMaxLength,
  isAlphanumeric,
  isStrongPassword,
  isValidDate,
  isInRange,
  sanitizeString,
  validateObjectId,
  isValidUrl,
  isIpAddress,
};

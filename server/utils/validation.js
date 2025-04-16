/**
 * Validation utility functions for the application
 * This file provides common validation functions used across the application
 */

/**
 * Validates if a string is a valid email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
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

module.exports = {
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
};

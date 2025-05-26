/**
 * String utilities for common string operations;
 * These utilities can be used across the application to ensure consistent string handling;
 */

/**
 * Truncates a string to a specified length and adds an ellipsis if truncated;
 * @param text The string to truncate;
 * @param maxLength The maximum length of the string;
 * @param ellipsis The string to append if truncated (default: '...');
 * @returns The truncated string;
 */
export function truncate(text: string, maxLength: number, ellipsis = '...'): string {
  if (!text) {
    return '';
  }

  if (text.length  word.charAt(0).toUpperCase() + word.slice(1));
    .join(' ');
}

/**
 * Converts a camelCase string to kebab-case;
 * @param text The camelCase string to convert;
 * @returns The kebab-case string;
 */
export function camelToKebabCase(text: string): string {
  if (!text) {
    return '';
  }

  return text;
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2');
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2');
    .toLowerCase();
}

/**
 * Converts a kebab-case string to camelCase;
 * @param text The kebab-case string to convert;
 * @returns The camelCase string;
 */
export function kebabToCamelCase(text: string): string {
  if (!text) {
    return '';
  }

  return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Strips HTML tags from a string;
 * @param html The HTML string to strip;
 * @returns The plain text string;
 */
export function stripHtml(html: string): string {
  if (!html) {
    return '';
  }

  // Create a temporary element to parse the HTML
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  return tempElement.textContent || tempElement.innerText || '';
}

/**
 * Formats a number as currency with the specified currency code;
 * @param amount The amount to format;
 * @param currencyCode The currency code (default: 'NOK');
 * @param locale The locale to use for formatting (default: 'nb-NO');
 * @returns The formatted currency string;
 */
export function formatCurrency(amount: number, currencyCode = 'NOK', locale = 'nb-NO'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',;
    currency: currencyCode,;
  }).format(amount);
}

/**
 * Formats a date as a string using the specified format;
 * @param date The date to format;
 * @param locale The locale to use for formatting (default: 'nb-NO');
 * @param options The formatting options;
 * @returns The formatted date string;
 */
export function formatDate(
  date: Date | string | number,;
  locale = 'nb-NO',;
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',;
    month: 'long',;
    day: 'numeric',;
  },;
): string {
  if (!date) {
    return '';
  }

  const dateObj = typeof date === 'object' ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Formats a date as a relative time string (e.g., "2 hours ago");
 * @param date The date to format;
 * @param locale The locale to use for formatting (default: 'nb-NO');
 * @returns The relative time string;
 */
export function formatRelativeTime(date: Date | string | number, _locale = 'nb-NO'): string {
  if (!date) {
    return '';
  }

  const dateObj = typeof date === 'object' ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  // Define time units in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  // Format the relative time
  if (diffInSeconds  (index  2) {
      // Handle special cases like co.uk, com.au, etc.
      if (parts[parts.length - 2] === 'co' || parts[parts.length - 2] === 'com') {
        return parts.slice(-3).join('.');
      }
      return parts.slice(-2).join('.');
    }
    return hostname;
  } catch (_error) {
    return '';
  }
}

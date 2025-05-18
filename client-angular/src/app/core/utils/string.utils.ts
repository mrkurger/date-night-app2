/**
 * String utilities for common string operations
 * These utilities can be used across the application to ensure consistent string handling
 */

/**
 * Truncates a string to a specified length and adds an ellipsis if truncated
 * @param text The string to truncate
 * @param maxLength The maximum length of the string
 * @param ellipsis The string to append if truncated (default: '...')
 * @returns The truncated string
 */
export function truncate(text: string, maxLength: number, ellipsis = '...'): string {
  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + ellipsis;
}

/**
 * Capitalizes the first letter of a string
 * @param text The string to capitalize
 * @returns The capitalized string
 */
export function capitalize(text: string): string {
  if (!text) {
    return '';
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converts a string to title case (capitalizes the first letter of each word)
 * @param text The string to convert
 * @returns The title case string
 */
export function toTitleCase(text: string): string {
  if (!text) {
    return '';
  }

  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts a camelCase string to kebab-case
 * @param text The camelCase string to convert
 * @returns The kebab-case string
 */
export function camelToKebabCase(text: string): string {
  if (!text) {
    return '';
  }

  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Converts a kebab-case string to camelCase
 * @param text The kebab-case string to convert
 * @returns The camelCase string
 */
export function kebabToCamelCase(text: string): string {
  if (!text) {
    return '';
  }

  return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Strips HTML tags from a string
 * @param html The HTML string to strip
 * @returns The plain text string
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
 * Formats a number as currency with the specified currency code
 * @param amount The amount to format
 * @param currencyCode The currency code (default: 'NOK')
 * @param locale The locale to use for formatting (default: 'nb-NO')
 * @returns The formatted currency string
 */
export function formatCurrency(amount: number, currencyCode = 'NOK', locale = 'nb-NO'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

/**
 * Formats a date as a string using the specified format
 * @param date The date to format
 * @param locale The locale to use for formatting (default: 'nb-NO')
 * @param options The formatting options
 * @returns The formatted date string
 */
export function formatDate(
  date: Date | string | number,
  locale = 'nb-NO',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
): string {
  if (!date) {
    return '';
  }

  const dateObj = typeof date === 'object' ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Formats a date as a relative time string (e.g., "2 hours ago")
 * @param date The date to format
 * @param locale The locale to use for formatting (default: 'nb-NO')
 * @returns The relative time string
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
  if (diffInSeconds < 5) {
    return 'just now';
  } else if (diffInSeconds < minute) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (diffInSeconds < month) {
    const weeks = Math.floor(diffInSeconds / week);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffInSeconds / year);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}

/**
 * Generates a slug from a string (for URLs)
 * @param text The string to convert to a slug
 * @returns The slug
 */
export function slugify(text: string): string {
  if (!text) {
    return '';
  }

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
    .trim();
}

/**
 * Masks a string by replacing characters with a mask character
 * @param text The string to mask
 * @param visibleStart The number of characters to show at the start
 * @param visibleEnd The number of characters to show at the end
 * @param maskChar The character to use for masking (default: '*')
 * @returns The masked string
 */
export function maskString(text: string, visibleStart = 0, visibleEnd = 0, maskChar = '*'): string {
  if (!text) {
    return '';
  }

  const start = text.substring(0, visibleStart);
  const end = text.substring(text.length - visibleEnd);
  const masked = maskChar.repeat(Math.max(0, text.length - visibleStart - visibleEnd));

  return start + masked + end;
}

/**
 * Formats a phone number with the specified format
 * @param phone The phone number to format
 * @param format The format to use (default: 'XXX XXX XXX')
 * @returns The formatted phone number
 */
export function formatPhoneNumber(phone: string, format = 'XXX XXX XXX'): string {
  if (!phone) {
    return '';
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Count the number of X's in the format
  const xCount = (format.match(/X/g) || []).length;

  // If the number of digits is less than the number of X's, pad with X's
  if (digits.length < xCount) {
    return format.replace(/X/g, (_, index) => (index < digits.length ? digits[index] : 'X'));
  }

  // Replace X's with digits
  let result = format;
  let digitIndex = 0;

  for (let i = 0; i < result.length; i++) {
    if (result[i] === 'X') {
      if (digitIndex < digits.length) {
        result = result.substring(0, i) + digits[digitIndex] + result.substring(i + 1);
        digitIndex++;
      }
    }
  }

  return result;
}

/**
 * Extracts a domain name from a URL
 * @param url The URL to extract the domain from
 * @param includeSubdomain Whether to include the subdomain (default: false)
 * @returns The domain name
 */
export function extractDomain(url: string, includeSubdomain = false): string {
  if (!url) {
    return '';
  }

  try {
    // Add protocol if missing
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    if (includeSubdomain) {
      return hostname;
    }

    // Extract the main domain (remove subdomains)
    const parts = hostname.split('.');
    if (parts.length > 2) {
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

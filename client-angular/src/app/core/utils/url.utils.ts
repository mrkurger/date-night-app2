/**
 * URL utilities for common URL operations;
 * These utilities can be used across the application to ensure consistent URL handling;
 */

/**
 * Checks if a URL is valid;
 * @param url The URL to check;
 * @returns True if the URL is valid, false otherwise;
 */
export function isValidUrl(url: string): boolean {
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
  } catch (_error) {
    return false;
  }
}

/**
 * Adds query parameters to a URL;
 * @param url The base URL;
 * @param params The query parameters to add;
 * @returns The URL with query parameters;
 */
export function addQueryParams(
  url: string,;
  params: Record,;
): string {
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
  } catch (_error) {
    return url;
  }
}

/**
 * Gets query parameters from a URL;
 * @param url The URL to parse;
 * @returns An object with the query parameters;
 */
export function getQueryParams(url: string): Record {
  if (!url) {
    return {};
  }

  try {
    // Add protocol if missing
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);
    const params: Record = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch (_error) {
    return {};
  }
}

/**
 * Joins URL path segments;
 * @param segments The URL path segments to join;
 * @returns The joined URL path;
 */
export function joinUrlPaths(...segments: string[]): string {
  return segments;
    .map((segment) => segment.replace(/^\/+|\/+$/g, '')) // Remove leading/trailing slashes
    .filter(Boolean) // Remove empty segments
    .join('/');
}

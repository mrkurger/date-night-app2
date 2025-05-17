// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains utilities for URL handling
//
// COMMON CUSTOMIZATIONS:
// - SERVER_URL: Base URL for the server (default: http://localhost:3000)
//   Related to: config/oauth.js:callbackURL
// ===================================================

import { URL } from 'url';

/**
 * Ensures a URL is properly formatted with protocol and domain
 * @param {string} url - The URL to format
 * @param {string} defaultUrl - Default URL to use if input is invalid
 * @returns {string} - A properly formatted URL
 */
export const formatServerUrl = (url, defaultUrl = 'http://localhost:3000') => {
  if (!url) return defaultUrl;

  try {
    // Try to parse the URL to validate it
    const urlObject = new URL(url);
    return urlObject.toString();
  } catch (_) {
    // If URL is invalid or missing protocol, try to fix it
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `http://${url}`;
    }
    return defaultUrl;
  }
};

/**
 * Creates a callback URL for OAuth providers
 * @param {string} serverUrl - Base server URL
 * @param {string} provider - OAuth provider name
 * @returns {string} - Full callback URL
 */
export const createCallbackUrl = (serverUrl, provider) => {
  const baseUrl = formatServerUrl(serverUrl);
  return `${baseUrl}/auth/${provider}/callback`;
};

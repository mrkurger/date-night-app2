/**
 * Content Security Policy (CSP) Configuration for Angular Client
 *
 * This script adds a CSP meta tag to the index.html file at build time.
 * It's used by the Angular build process to inject the appropriate CSP.
 *
 * @fileoverview Node.js script that adds or updates CSP meta tag in index.html
 * @global process - The process object is available in Node.js
 * @global __dirname - The directory name is available in Node.js
 * @global console - The console object is available in browsers and Node.js
 */

/* global process, __dirname, console */

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for configuration settings (csp-config)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import fs from 'fs/promises';
import path from 'path';

/**
 * Main function to add or update CSP meta tag in index.html
 */
async function updateCspMetaTag() {
  try {
    // Determine if we're in development or production
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Define CSP directives
    const cspDirectives = [
      "default-src 'self'",
      // In development, we need unsafe-eval for Angular's JIT compilation
      // In production, we use AOT compilation so unsafe-eval is not needed
      `script-src 'self' ${isDevelopment ? "'unsafe-eval' 'unsafe-inline'" : ''}`,
      // Angular requires unsafe-inline for styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.googleapis.com",
      `connect-src 'self' ws: wss: ${isDevelopment ? 'http://localhost:* ws://localhost:*' : ''}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; ');

    // Path to index.html
    const indexPath = path.join(__dirname, 'index.html');

    // Read the index.html file
    const data = await fs.readFile(indexPath, 'utf8');

    let updatedData;

    // Check if CSP meta tag already exists
    if (data.includes('<meta http-equiv="Content-Security-Policy"')) {
      // Update existing CSP meta tag
      updatedData = data.replace(
        /<meta http-equiv="Content-Security-Policy"[^>]*>/,
        `<meta http-equiv="Content-Security-Policy" content="${cspDirectives}">`,
      );

      await fs.writeFile(indexPath, updatedData, 'utf8');
      console.log('CSP meta tag updated in index.html');
    } else {
      // Add CSP meta tag after the first <head> tag
      updatedData = data.replace(
        '<head>',
        `<head>\n  <meta http-equiv="Content-Security-Policy" content="${cspDirectives}">`,
      );

      await fs.writeFile(indexPath, updatedData, 'utf8');
      console.log('CSP meta tag added to index.html');
    }
  } catch (_error) {
    console.error('Error processing index.html');
  }
}

// Execute the main function
updateCspMetaTag();

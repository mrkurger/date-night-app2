/**
 * WebSocket Polyfill for Angular Development Server
 *
 * This script intercepts WebSocket connections to the Angular development server
 * and prevents constant reconnection attempts that can flood the console with error messages.
 *
 * @fileoverview Browser-only script that polyfills WebSocket to handle reconnection attempts
 * @global window - The window object is available in browsers
 * @global console - The console object is available in browsers
 */

/* global window, console */

(function () {
  'use strict';

  // Only apply in development mode
  if (window.location.hostname !== 'localhost') {
    return;
  }

  console.log('[WebSocket Polyfill] Initializing...');

  // Store the original WebSocket constructor
  const OriginalWebSocket = window.WebSocket;
  const reconnectAttempts = {};
  const MAX_RECONNECT_ATTEMPTS = 3;

  // Override the WebSocket constructor
  window.WebSocket = function (url, protocols) {
    // Check if this is a connection to the Angular dev server
    const isDevServer = url.includes('localhost:4201');

    if (isDevServer && reconnectAttempts[url] >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[WebSocket Polyfill] Maximum reconnection attempts reached for:', url);

      // Return a mock WebSocket object that does nothing
      return {
        addEventListener: function () {},
        removeEventListener: function () {},
        send: function () {},
        close: function () {},
        readyState: 3, // CLOSED
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3,
      };
    }

    try {
      // Create a real WebSocket instance
      const instance = new OriginalWebSocket(url, protocols);

      if (isDevServer) {
        // Initialize reconnect attempts counter if not exists
        if (!reconnectAttempts[url]) {
          reconnectAttempts[url] = 0;
        }

        // Handle connection errors
        instance.addEventListener('error', function (_event) {
          reconnectAttempts[url]++;

          if (reconnectAttempts[url] === 1) {
            console.warn('[WebSocket Polyfill] Connection failed to:', url);
            console.warn(
              '[WebSocket Polyfill] Live reload may not work. This is normal in some environments.',
            );
          }
        });

        // Reset counter on successful connection
        instance.addEventListener('open', function () {
          reconnectAttempts[url] = 0;
        });
      }

      return instance;
    } catch (_error) {
      console.warn('[WebSocket Polyfill] Error creating WebSocket');

      // Return a mock WebSocket object that does nothing
      return {
        addEventListener: function () {},
        removeEventListener: function () {},
        send: function () {},
        close: function () {},
        readyState: 3, // CLOSED
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3,
      };
    }
  };

  // Copy static properties from the original WebSocket
  window.WebSocket.prototype = OriginalWebSocket.prototype;
  window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
  window.WebSocket.OPEN = OriginalWebSocket.OPEN;
  window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
  window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;

  console.log('[WebSocket Polyfill] Initialized successfully');
})();

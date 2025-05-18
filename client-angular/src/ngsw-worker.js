/**
 * Placeholder for the Angular Service Worker
 * The actual file will be generated during the build process
 * This file is needed to prevent 404 errors during development
 *
 * @fileoverview Service Worker placeholder for Angular development
 * @global self - The service worker global scope
 * @global console - The console object is available in browsers
 * @global fetch - The fetch API is available in browsers
 */

/* global self, console, fetch */

console.log('Service Worker Placeholder Loaded');

/**
 * Install event handler
 * Immediately activates the service worker
 */
self.addEventListener('install', (_event) => {
  self.skipWaiting();
});

/**
 * Activate event handler
 * Claims all clients after activation
 * @param {Event} event - The activate event
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * Fetch event handler
 * Passes through all requests to the network
 * @param {FetchEvent} event - The fetch event
 */
self.addEventListener('fetch', (event) => {
  // Let the browser handle the request normally
  event.respondWith(fetch(event.request));
});

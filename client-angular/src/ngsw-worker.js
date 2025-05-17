// This is a placeholder for the Angular Service Worker
// The actual file will be generated during the build process
// This file is needed to prevent 404 errors during development

console.log('Service Worker Placeholder Loaded');

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle the request normally
  event.respondWith(fetch(event.request));
});

// This is a service worker file for PWA functionality

// Cache version - update when making significant changes
const CACHE_NAME = 'carousely-cache-v1';

// Assets to cache on install
const urlsToCache = [
  '/',
  '/carousely',
  '/offline', // Optional offline fallback page
  // Add any essential static assets here
];

// Install event - cache key resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    }),
  );
  // Activate the service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache if available, fall back to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    return handleApiRequest(event);
  }

  // Handle image requests
  if (event.request.destination === 'image') {
    return handleImageRequest(event);
  }

  // Handle navigation requests (HTML)
  if (event.request.mode === 'navigate') {
    return handleNavigationRequest(event);
  }

  // Standard cache-first strategy for other assets
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(response => {
        // Don't cache non-OK responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response since it can only be consumed once
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    }),
  );
});

// API request handler - network first with cache fallback
function handleApiRequest(event) {
  if (event.request.method !== 'GET') {
    return fetch(event.request); // Skip caching for non-GET requests
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request); // Fallback to cache
      }),
  );
}

// Image handler - cache first
function handleImageRequest(event) {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    }),
  );
}

// Navigation handler - network first with offline fallback
function handleNavigationRequest(event) {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        // If no cached version, show offline page
        return caches.match('/offline');
      });
    }),
  );
}

// Push notification handler
self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || 'Carousely Notification';
  const options = {
    body: data.body || 'New matches available!',
    icon: data.icon || '/images/notification-icon.png',
    badge: data.badge || '/images/badge-icon.png',
    data: data.data || { url: '/carousely' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  // Open the URL from the notification or default to root
  const urlToOpen = event.notification.data?.url || '/carousely';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if there is already a window focused on the target URL
      for (let client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      // If no matching client, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    }),
  );
});

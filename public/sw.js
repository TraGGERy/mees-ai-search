// A simple service worker with basic caching.
// You can expand this logic to suit your needs.

const CACHE_NAME = "mees-ai-cache-v1";
const OFFLINE_URL = "/offline";

// Resources to pre-cache
const PRECACHE_ASSETS = [
  "/",
  OFFLINE_URL,
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  // Add other critical assets like CSS, JS, images
];

// Install event
self.addEventListener("install", (event) => {
  console.log('Service Worker installed');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Pre-cache offline page and essential assets
      await cache.addAll(PRECACHE_ASSETS);
      await self.skipWaiting();
    })()
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      try {
        // Try to get the response from the network first
        const response = await fetch(event.request);
        
        // Save the response in cache
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
        
        return response;
      } catch (error) {
        // If network fails, try to get it from cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If the request is for a page, show offline page
        if (event.request.mode === 'navigate') {
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }

        // If nothing else works, throw the error
        throw error;
      }
    })()
  );
});

self.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(),
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  };

  event.waitUntil(
    self.registration.showNotification('New Article Available!', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/discover')
  );
}); 
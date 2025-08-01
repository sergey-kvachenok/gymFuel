const CACHE_NAME = 'gymfuel-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icon-192.svg',
  '/icon-512.svg',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache).catch(error => {
          console.error('[SW] Failed to cache resources:', error);
          // Don't fail the install if some resources fail to cache
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests, like those for Google Analytics
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(() => {
          // If the network is down and we don't have a cached version,
          // return the offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
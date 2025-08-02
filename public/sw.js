const CACHE_NAME = 'gymfuel-v3';
const STATIC_CACHE_NAME = 'gymfuel-static-v3';

// URLs to cache during install
const ESSENTIAL_URLS = [
  '/',
  '/history',
  '/goals',
  '/offline',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching essential URLs');
      return cache.addAll(ESSENTIAL_URLS).catch(error => {
        console.error('[SW] Failed to cache essential URLs:', error);
        // Continue anyway - we'll cache pages as they're visited
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API routes - let them fail and trigger offline mode
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Handle static assets (cache-first)
  if (request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font' ||
      request.destination === 'image' ||
      url.pathname.includes('/_next/static/') ||
      url.pathname.includes('.css') ||
      url.pathname.includes('.js') ||
      url.pathname.includes('.woff') ||
      url.pathname.includes('.woff2') ||
      url.pathname.includes('.ttf') ||
      url.pathname.includes('.svg') ||
      url.pathname.includes('.png') ||
      url.pathname.includes('.jpg') ||
      url.pathname.includes('.jpeg') ||
      url.pathname.includes('.ico') ||
      url.pathname === '/manifest.webmanifest') {
    
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // Return a basic fallback for critical assets
          if (url.pathname.includes('.css')) {
            return new Response('/* Offline fallback CSS */', { 
              headers: { 'Content-Type': 'text/css' } 
            });
          }
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // Handle navigation requests (app pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        // Cache successful navigation responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Return cached page or fallback to root page
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Try to return cached root page as fallback
          return caches.match('/').then((rootResponse) => {
            if (rootResponse) {
              return rootResponse;
            }
            
            // Last resort: offline page
            return caches.match('/offline') || new Response(
              '<html><body><h1>Offline</h1><p>Please check your connection</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        });
      })
    );
    return;
  }
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('[SW] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
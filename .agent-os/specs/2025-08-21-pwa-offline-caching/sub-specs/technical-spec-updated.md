# Technical Specification - PWA Offline Caching (Updated)

## Overview

### Problem Statement

The current GymFuel PWA lacks comprehensive offline functionality, causing users to see empty screens when opening the app while server requests are completing. Users need immediate access to cached data for a seamless offline experience.

### Chosen Solution

Follow the **official Next.js PWA approach** as documented at https://nextjs.org/docs/app/guides/progressive-web-apps using native Next.js features without third-party PWA libraries. Implement manual service worker with custom caching strategies for tRPC GET requests to show cached data immediately while fetching fresh data in the background.

### Success Criteria

- Users can view all nutrition data (products, consumption, goals) immediately when opening the app offline
- No empty screens or loading states when offline
- Seamless transitions between online and offline states
- Improved app performance with faster loading times
- Automatic cache management and data freshness

### Key Benefits of Official Next.js Approach

- **Zero external dependencies**: No third-party PWA libraries needed
- **Official support**: Maintained by the Next.js team
- **Security focused**: Built-in security headers configuration
- **Future-proof**: Aligned with Next.js roadmap and App Router
- **Native integration**: Uses Next.js native manifest.json support

## Technical Details

### Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Query   │◄──►│   Service Worker │◄──►│   tRPC API      │
│   (Client Cache)│    │   (Manual SW)    │    │   (Server)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Components │    │   Cache Storage  │    │   Database      │
│   (Immediate    │    │   (Cache API)    │    │   (PostgreSQL)  │
│    Display)     │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Official Next.js PWA Implementation Components

1. **Native Manifest Support**: Use Next.js built-in `manifest.json` file convention
2. **Manual Service Worker**: Custom `public/sw.js` with tRPC-specific caching logic
3. **Security Headers**: Configure PWA security headers through `next.config.js`
4. **App Router Integration**: Leverage App Router features for PWA functionality

### Data Models

No new data models required. The solution will cache existing tRPC query responses:

- Product data (from `productRouter.getAll`)
- Consumption data (from `consumptionRouter.getByDate`)
- Goals data (from `goalsRouter.get`)
- Static assets (CSS, JS, images)

### API Design

No changes to existing tRPC API required. The service worker will intercept and cache:

- `GET /api/trpc/*` - All tRPC query requests using stale-while-revalidate strategy
- `GET /_next/static/*` - Next.js static assets
- `GET /icons/*` - PWA icons and images
- `GET /manifest.json` - PWA manifest

### Service Worker Caching Strategy

Based on official Next.js PWA documentation:

```javascript
// Custom caching strategies for different resource types
const CACHE_NAME = 'gymfuel-cache-v1';
const STATIC_CACHE_NAME = 'gymfuel-static-v1';
const TRPC_CACHE_NAME = 'gymfuel-trpc-v1';

// Stale-while-revalidate for tRPC GET requests
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/trpc/') && event.request.method === 'GET') {
    event.respondWith(staleWhileRevalidate(event.request, TRPC_CACHE_NAME));
  }
  // Cache-first for static assets
  else if (event.request.url.includes('/_next/static/')) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE_NAME));
  }
});
```

### State Management

- **React Query Cache**: Primary client-side cache for application state
- **Service Worker Cache**: Secondary cache for offline access and performance
- **Cache Synchronization**: Ensure consistency between React Query and service worker caches

## Implementation Guide

### Dependencies

**Zero external dependencies** - uses only native Next.js features:

```json
{
  "dependencies": {
    // No additional PWA dependencies needed
    // Next.js provides all PWA functionality natively
  }
}
```

### Integration Points

1. **Manifest Configuration**: Create `app/manifest.ts` using Next.js native support
2. **Service Worker**: Create custom `public/sw.js` following official documentation
3. **Security Headers**: Configure through `next.config.js`
4. **App Router Components**: Integrate PWA features with App Router
5. **React Query**: Ensure cache invalidation works with service worker

### Implementation Steps (Following Official Docs)

#### Step 1: Create Web App Manifest

Use Next.js native manifest support in `app/manifest.ts`:

```typescript
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GymFuel',
    short_name: 'GymFuel',
    description: 'Track your nutrition and fitness goals',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
```

#### Step 2: Create Custom Service Worker

Create `public/sw.js` with tRPC-specific caching:

```javascript
const CACHE_NAME = 'gymfuel-cache-v1';
const TRPC_CACHE_NAME = 'gymfuel-trpc-v1';

// Stale-while-revalidate strategy for tRPC GET requests
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Always try to fetch fresh data in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // Return cached response immediately if available
  return cachedResponse || fetchPromise;
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache tRPC GET requests
  if (url.pathname.includes('/api/trpc/') && event.request.method === 'GET') {
    event.respondWith(staleWhileRevalidate(event.request, TRPC_CACHE_NAME));
  }
});
```

#### Step 3: Configure Security Headers

Update `next.config.js` with PWA security headers:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

#### Step 4: Register Service Worker

Create App Router component to register service worker:

```typescript
'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
```

### Testing Strategy

1. **Unit Tests**: Test service worker caching logic
2. **Integration Tests**: Test cache integration with React Query
3. **E2E Tests**: Test offline scenarios and data synchronization
4. **Performance Tests**: Measure cache hit rates and loading times
5. **Manual Testing**: Test offline functionality in various network conditions

### Security Considerations

Following official Next.js PWA security recommendations:

- **HTTPS Requirement**: Service worker only works over HTTPS in production
- **Security Headers**: Implemented through `next.config.js`
- **Content Security Policy**: Strict CSP for service worker
- **Cache Isolation**: User-specific data cached separately
- **Data Validation**: Validate cached responses before use

### Performance Considerations

- **Cache Strategy**: Stale-while-revalidate for immediate display with fresh data
- **Cache Size Management**: Implement cache cleanup and size limits
- **Lazy Loading**: Cache data on-demand rather than pre-caching
- **Compression**: Leverage Next.js built-in compression

### Migration from Current Implementation

1. **Remove third-party dependencies**: No external PWA libraries needed
2. **Replace existing service worker**: Use custom service worker following official docs
3. **Add native manifest**: Use Next.js native manifest support
4. **Configure security headers**: Add PWA security headers
5. **Test thoroughly**: Ensure no regression in existing functionality

This approach follows the official Next.js PWA documentation and ensures we're using supported, maintained solutions directly from the Next.js team.

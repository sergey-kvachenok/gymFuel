# Technical Specification - PWA Offline Caching

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
- Cache size stays under 150MB total (50MB tRPC + 100MB static assets)
- Cache invalidation occurs within 5 seconds of data mutations
- Offline data freshness indicators show cache age to users

### Existing Functionality

- Basic service worker (`public/sw.js`) with network-first strategy
- Offline banner component (`src/components/OfflineBanner.tsx`)
- Online status hook (`src/hooks/use-online-status.ts`)
- React Query for client-side state management
- tRPC for type-safe API communication

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
│    Display)     │    │                 │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Models

No new data models required. The solution will cache existing tRPC query responses:

- Product data (from `productRouter.getAll`)
- Consumption data (from `consumptionRouter.getByDate`)
- Goals data (from `goalsRouter.get`)
- Static assets (CSS, JS, images)

### API Design

No changes to existing tRPC API required. The service worker will intercept and cache:

- `GET /api/trpc/*` - All tRPC query requests
- `GET /_next/static/*` - Next.js static assets
- `GET /icons/*` - PWA icons and images
- `GET /manifest.json` - PWA manifest

### State Management

- **tRPC/React Query Cache**: Primary data source - always used when available
- **Service Worker Cache**: Fallback cache for offline tRPC requests only
- **Cache Synchronization**: Service worker cache updated with fresh tRPC data for offline fallback

### Cache Strategy Specifications

**tRPC Requests (`/api/trpc/*`):**

- **Strategy**: Stale-while-revalidate
- **TTL**: 24 hours (86,400,000 ms)
- **Cache Limit**: 50MB
- **Cache Key**: `trpc:${userId}:${requestUrl}:${requestBody}`
- **Invalidation**: On React Query mutations via `queryClient.invalidateQueries()`

**Static Assets (`/_next/static/*`):**

- **Strategy**: Cache-first
- **TTL**: 7 days (604,800,000 ms)
- **Cache Limit**: 50MB
- **Cache Key**: `static:${requestUrl}`

**PWA Assets (`/icons/*`, `/manifest.json`):**

- **Strategy**: Cache-first
- **TTL**: 30 days (2,592,000,000 ms)
- **Cache Limit**: 50MB
- **Cache Key**: `pwa:${requestUrl}`

**Navigation Requests:**

- **Strategy**: Network-first with cache fallback
- **TTL**: 1 hour (3,600,000 ms)
- **Fallback**: Serve home page (`/`) if not cached

### Error Handling

- **Network Errors**: Fallback to cached data when network requests fail
- **Cache Miss**: Graceful degradation when requested data is not cached
- **Storage Quota**: Handle cache size limits and cleanup
- **Invalid Data**: Validate cached data before use

### Error Handling Specifications

**Network Failures:**

- **tRPC Requests**: Serve cached data if available, show offline indicator
- **Static Assets**: Serve from cache, no fallback needed
- **Navigation**: Serve cached page or fallback to home page

**Cache Storage Quota Exceeded:**

- **Priority**: Keep tRPC data, remove oldest static assets first
- **Cleanup Strategy**: Remove assets older than TTL, then oldest assets
- **User Notification**: Show "Storage limit reached" message in offline banner

**Invalid Cached Data:**

- **Validation**: Check response status and content-type before serving
- **Fallback**: Remove invalid cache entry, attempt fresh fetch
- **User Feedback**: Show "Data may be outdated" indicator

**Service Worker Registration Failures:**

- **Graceful Degradation**: App continues to work without offline caching
- **User Notification**: Show "Offline mode unavailable" message
- **Recovery**: Attempt re-registration on next app load

### Security Architecture

- **Cache Isolation**: User-specific data cached separately
- **Data Validation**: Validate cached responses before use
- **HTTPS Only**: Service worker only works over HTTPS (production requirement)
- **No Sensitive Data**: Avoid caching authentication tokens or sensitive information

### Security Specifications

**User Data Isolation:**

- **Cache Key Strategy**: Include user ID in tRPC cache keys
- **Session Validation**: Verify user session before serving cached data
- **Data Segregation**: Separate cache stores for different user sessions

**Data Validation:**

- **Response Validation**: Check HTTP status codes (200-299 only)
- **Content-Type Validation**: Verify JSON responses for tRPC requests
- **Size Limits**: Reject responses larger than 1MB for tRPC data

**Authentication Integration:**

- **Token Handling**: Never cache authentication headers or tokens
- **Session Management**: Clear user-specific cache on logout
- **Authorization**: Verify user permissions before serving cached data

**HTTPS Requirements:**

- **Development**: Works on HTTP localhost for development
- **Production**: Requires HTTPS for service worker functionality
- **Mixed Content**: Block non-HTTPS requests in production

### Code Reuse Strategy

- **Existing Components**: Enhance `OfflineBanner` component for better UX
- **Existing Hooks**: Extend `useOnlineStatus` hook for enhanced offline detection
- **Existing Service Worker**: Enhance current `public/sw.js` with tRPC caching functionality
- **Existing tRPC Setup**: No changes to existing tRPC configuration

### Integration Patterns

**React Query ↔ Service Worker Integration:**

```typescript
// When React Query invalidates cache
queryClient.invalidateQueries(['consumption', 'getHistory']);
// Service worker should clear corresponding cached responses
// Cache key: `trpc:${userId}:/api/trpc/consumption.getHistory`
```

**tRPC Request Interception:**

```typescript
// Service worker intercepts tRPC requests
if (url.pathname.includes('/api/trpc/') && request.method === 'GET') {
  // Apply stale-while-revalidate strategy
  return staleWhileRevalidate(request);
}
```

**Cache Synchronization:**

```typescript
// When fresh tRPC data arrives, update service worker cache
const response = await fetch(request);
if (response.ok) {
  const cache = await caches.open(TRPC_CACHE_NAME);
  await cache.put(request, response.clone());
}
```

**User Session Integration:**

```typescript
// Include user ID in cache keys for isolation
const userId = getUserIdFromRequest(request);
const cacheKey = `trpc:${userId}:${requestUrl}:${requestBody}`;
```

**Offline Banner Enhancement:**

```typescript
// Show cache freshness information
const cacheAge = Date.now() - cachedResponse.headers.get('sw-cache-time');
const isStale = cacheAge > 24 * 60 * 60 * 1000; // 24 hours
```

## Implementation Guide

### Dependencies

No new external dependencies required. Use existing PWA infrastructure:

- **Existing PWA Manifest**: Already configured at `public/manifest.json`
- **Manual Service Worker**: Custom implementation for tRPC caching
- **Cache API**: Native browser caching APIs
- **Security Headers**: Configure through `next.config.js`

### Integration Points

1. **Next.js Configuration**: Update `next.config.js` with PWA security headers
2. **Service Worker**: Enhance existing `public/sw.js` with tRPC caching functionality
3. **React Query**: Ensure React Query cache is properly invalidated when data changes
4. **Offline Banner**: Enhance existing offline banner for better user feedback
5. **tRPC Client**: No changes required - service worker will intercept requests

### Architecture Implementation

1. **Service Worker Architecture**: Implement stale-while-revalidate strategy for tRPC requests
2. **Cache Integration**: Synchronize React Query cache with service worker cache
3. **UI Enhancement**: Update components to handle cached data gracefully
4. **Performance Optimization**: Implement cache management and cleanup strategies

### Configuration Requirements

1. **Security Headers**: Configure PWA-specific headers in `next.config.js`
2. **Service Worker Registration**: Set up proper registration with error handling
3. **Cache Configuration**: Configure cache names, sizes, and expiration policies
4. **Offline Indicators**: Configure visual indicators for cached data

### Testing Strategy (High-Level)

- **Integration Testing**: Test service worker integration with React Query
- **User Scenario Testing**: Test offline user journeys and data display
- **Performance Testing**: Measure cache effectiveness and loading times
- **Security Testing**: Validate cache isolation and data integrity

### Performance Considerations

- **Cache Size Limits**: Implement cache size management to prevent excessive storage usage
- **Cache Expiration**: Set appropriate TTL for different types of data
- **Lazy Loading**: Cache data on-demand rather than pre-caching everything
- **Compression**: Ensure cached responses are properly compressed

### Security Considerations

- **HTTPS Requirement**: Service worker only works over HTTPS in production
- **Data Validation**: Validate all cached responses before use
- **User Isolation**: Ensure user-specific data is properly isolated
- **Cache Poisoning**: Implement safeguards against malicious cached data

### Security Testing

- **Cache Validation**: Test that invalid cached data is properly rejected
- **User Isolation**: Verify that users cannot access other users' cached data
- **HTTPS Enforcement**: Ensure service worker only works over secure connections
- **Data Integrity**: Test that cached data remains valid and unmodified

### Security Monitoring

- **Cache Hit Rates**: Monitor cache effectiveness and performance
- **Storage Usage**: Track cache size and storage quota usage
- **Error Rates**: Monitor cache-related errors and failures
- **User Experience**: Track offline usage patterns and user satisfaction

### Code Style Guidelines

Follow existing code style patterns:

- Use TypeScript for all new code
- Follow existing component patterns and naming conventions
- Use existing utility functions and hooks where possible
- Maintain consistency with current error handling patterns
- Follow existing testing patterns and conventions

### Refactoring Approach

1. **Incremental Implementation**: Implement caching layer without breaking existing functionality
2. **Feature Flags**: Use environment variables to enable/disable offline features during development
3. **Backward Compatibility**: Ensure app works without service worker for graceful degradation
4. **Progressive Enhancement**: Build offline functionality on top of existing online features

## Implementation Details

### PWA Security Configuration

#### 1. Configure Security Headers (`next.config.js`)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Enhanced Service Worker Implementation

#### 1. Enhanced Service Worker (`public/sw.js`)

```javascript
const CACHE_NAME = 'gymfuel-v1';
const TRPC_CACHE_NAME = 'gymfuel-trpc-v1';

// Stale-while-revalidate strategy for tRPC requests
async function staleWhileRevalidate(request) {
  const cache = await caches.open(TRPC_CACHE_NAME);
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
    event.respondWith(staleWhileRevalidate(event.request));
  }

  // Cache static assets with cache-first strategy
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      }),
    );
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/', '/manifest.json', '/icon-192x192.png', '/icon-512x512.png']);
    }),
  );
});
```

#### 2. Service Worker Registration (`src/components/ServiceWorkerRegistration.tsx`)

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

This approach leverages the existing PWA manifest and follows the official Next.js PWA documentation for service worker implementation, ensuring we're using supported, maintained solutions directly from the Next.js team.

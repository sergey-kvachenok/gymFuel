# PWA Style Guide

This guide outlines best practices for Progressive Web App development including manifest configuration, service worker implementation, responsive design, and testing strategies.

## Web App Manifest

- **Maintain a complete web app manifest** (prefer `manifest.webmanifest`) with:
  - `name`, `short_name`, `id`, `start_url`, `scope`, `display` (e.g., `standalone`), `display_override`, `theme_color`, `background_color`, `orientation`
  - Icons: include at least 192×192 and 512×512, plus a maskable icon (`purpose: any maskable`)
  - Optional: `shortcuts`, `screenshots`, `categories`, `description`, `lang`, `dir`

## Service Worker Implementation

- **Register a HTTPS-only Service Worker** with:
  - Precache the app shell and critical assets (e.g., via Workbox) and serve a navigation offline fallback page
  - Apply runtime caching strategies per route/asset type (e.g., stale-while-revalidate for static, network-first for API)
  - Manage cache versions and clean up old caches; do not cache sensitive/PII or authenticated API responses
  - Implement a robust update flow (listen for `updatefound`; prompt the user; call `skipWaiting()` judiciously)

## Responsiveness and Installability

- **Ensure responsiveness and installability**:
  - Responsive layout across breakpoints; handle safe areas on iOS; use touch targets ≥ 48×48 dp
  - Satisfy install criteria (valid manifest + SW over HTTPS); include `<link rel="manifest">` with correct MIME type
  - Add iOS meta tags and `apple-touch-icon` entries for proper standalone behavior on iOS

## Testing and Automation

- **Test and automate**:
  - Run Lighthouse (PWA + Performance) locally and in CI (e.g., Lighthouse CI) with enforceable score thresholds
  - Add end-to-end tests covering offline mode, SW updates, and install/uninstall flows
  - Monitor SW errors and cache misses; validate CSP to mitigate XSS and SW abuse

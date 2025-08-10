# Spec Tasks

## Tasks

- [x] 1. **Setup PWA Dependencies and Configuration**
  - [x] 1.1 Add `dexie` to `package.json`.
  - [x] 1.2 Run `npm install` to install the new dependencies.
  - [x] 1.3 Create the `public/manifest.json` file with the required properties.
  - [x] 1.4 Add a link to the manifest in the `app/layout.tsx` file.

- [x] 2. **Implement Service Worker**
  - [x] 2.1 Create the `public/sw.js` file with basic event listeners.
  - [x] 2.2 Add service worker registration logic to `providers.tsx`.
  - [x] 2.3 Use a `useEffect` hook to ensure the registration logic only runs on the client side after mount.

- [x] 3. **Implement Offline Banner**
  - [x] 3.1 Create a reusable `useOnlineStatus` hook to track the browser's connectivity.
  - [x] 3.2 Create the `OfflineBanner` component that utilizes the `useOnlineStatus` hook.
  - [x] 3.3 Integrate the `OfflineBanner` into the main application layout.
  - [x] 3.4 Verify that the banner displays correctly based on network status.

## Changes

### Task Modifications During Implementation

#### Task 1.1 Dependencies (2025-08-10)

- **Original**: Add `dexie` and `@types/dexie` to `package.json`
- **Modified**: Add only `dexie` to `package.json`
- **Reason**: Dexie includes built-in TypeScript definitions, separate @types package not needed

#### Task 2 Service Worker Refactoring (2025-08-10)

- **Additional Implementation**: Created custom `useServiceWorker` hook
- **Files Added**: `src/hooks/use-service-worker.ts`
- **Reason**: Better code organization and separation of concerns suggested during implementation
- **Impact**: All original task requirements fulfilled with improved code structure

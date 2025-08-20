# Spec Requirements Document

> Spec: PWA Offline Support
> Created: 2024-07-22

## Overview

Implement a comprehensive offline mode for the application, allowing users to perform all core CRUD operations on their data (products, consumption, and goals) without an internet connection. The system will use IndexedDB via Dexie.js for local storage and will automatically sync with the server when connectivity is restored.

## User Stories

### Offline Data Access & Modification

As a user, I want to be able to view, create, update, and delete my products, meals, and nutrition goals while I am offline, so that I can continue to track my nutrition seamlessly, regardless of my internet connection.

### Automatic Data Synchronization

As a user, when my internet connection is restored, I want the app to automatically sync all the changes I made offline to the server, so that my data is always up-to-date across all my devices without manual intervention.

### Sync Status Visibility

As a user, I want to see how many of my offline changes are waiting to be synced, so that I have confidence that my data is being saved correctly and I'm aware of the current sync status.

## Spec Scope

1.  **IndexedDB Schema**: Define and create the necessary tables in IndexedDB using Dexie.js to store products, consumption records, and user goals.
2.  **Offline CRUD Operations**: Implement the logic to route all database operations (create, read, update, delete) to IndexedDB when the application is offline.
3.  **Data Synchronization**: Develop a synchronization mechanism that automatically pushes local changes to the server upon re-establishing a connection.
4.  **Conflict Resolution**: Implement a "last write wins" strategy based on a `lastUpdated` timestamp in both the server database and IndexedDB to handle data conflicts.
5.  **Sync Queue Counter**: Display the number of pending sync operations in the offline banner.

## Out of Scope

- Real-time collaboration features.
- Manual sync triggers.
- Syncing of non-essential data like application settings.

## Expected Deliverable

1.  Users can fully manage their products, consumption, and goals while offline.
2.  Users can view, search, and filter all data offline (including offline changes).
3.  All offline changes are automatically synced to the server when the user comes back online.
4.  Data conflicts are resolved based on the most recent `updatedAt` timestamp.
5.  The offline banner shows the number of items pending synchronization.

## Data Return Strategy

The app uses a **hybrid approach** combining Service Worker caching with IndexedDB storage:

### Service Worker Role

- **HTTP Response Caching**: Caches tRPC responses for faster loading when online
- **Static Asset Caching**: Handles HTML, CSS, JS, manifest files
- **Network Fallback**: Provides cached responses when network fails

### IndexedDB Role

- **Primary Data Source**: All queries return data from IndexedDB for consistency
- **Offline Change Management**: Merges server data with pending offline changes
- **Smart Query Support**: Enables search, filter, and sort operations offline

### Data Flow by Status

| Status                   | Data Source        | Returned Data                            |
| ------------------------ | ------------------ | ---------------------------------------- |
| **Online + Fresh Fetch** | Server → IndexedDB | Fresh server data + offline changes      |
| **Online + Cached**      | IndexedDB only     | Cached server data + offline changes     |
| **Offline**              | IndexedDB only     | Last known server data + offline changes |

### Data Merging Logic

1. **Base Data**: Server-synced records stored in IndexedDB
2. **Offline Additions**: Records created offline (marked with `isOfflineOnly: true`)
3. **Pending Modifications**: Apply updates from sync queue
4. **Pending Deletions**: Filter out records marked for deletion
5. **Final Result**: Merged view showing current state including all offline changes

## Changes

### Implementation Decisions Made During Development

#### Field Naming Consistency (2025-08-10)

- **Decision**: Changed field name from `lastUpdated` to `updatedAt` in database schema
- **Rationale**: The existing `NutritionGoals` model already used `updatedAt` field, so changed Product and Consumption models to use the same naming for consistency
- **Implementation**: All three models now consistently use `updatedAt` timestamp field
- **Impact**: Better code consistency and maintainability across the data model

#### Hybrid Data Strategy - IndexedDB + Service Worker (2025-08-10)

- **Decision**: Use IndexedDB as primary data source instead of relying solely on Service Worker HTTP caching
- **Rationale**: Service Worker caching alone cannot handle dynamic offline changes - users need to see their offline modifications immediately in the UI
- **Implementation**:
  - Service Worker handles HTTP response caching and static assets
  - IndexedDB stores application data and merges server data with offline changes
  - All query hooks return data from IndexedDB for consistency across online/offline states
  - Server data updates bypass sync queue, only user changes create sync entries
- **Benefits**:
  - Immediate visibility of offline changes in UI
  - Consistent data structure online/offline
  - Support for search/filter operations when offline
  - Smart data merging prevents data loss

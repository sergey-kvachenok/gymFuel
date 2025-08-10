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
2.  All offline changes are automatically synced to the server when the user comes back online.
3.  Data conflicts are resolved based on the most recent `updatedAt` timestamp.
4.  The offline banner shows the number of items pending synchronization.

## Changes

### Implementation Decisions Made During Development

#### Field Naming Consistency (2025-08-10)

- **Decision**: Changed field name from `lastUpdated` to `updatedAt` in database schema
- **Rationale**: The existing `NutritionGoals` model already used `updatedAt` field, so changed Product and Consumption models to use the same naming for consistency
- **Implementation**: All three models now consistently use `updatedAt` timestamp field
- **Impact**: Better code consistency and maintainability across the data model

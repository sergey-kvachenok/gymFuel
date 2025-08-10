# Spec Tasks

## Tasks

- [x] 1. **Update Database Schema**
  - [x] 1.1 Add the `updatedAt` field to the `Product`, `Consumption`, and `NutritionGoals` models in `prisma/schema.prisma`.
  - [x] 1.2 Generate and run a new database migration.

- [x] 2. **Setup Dexie.js and Sync Queue**
  - [x] 2.1 Define the Dexie.js database schema, including tables for products, consumption, goals, and a `sync_queue`.
  - [x] 2.2 Create a data abstraction layer that directs operations to IndexedDB.

- [x] 3. **Implement Offline CRUD and Sync Logic**
  - [x] 3.1 Modify all data mutation hooks (`use-product-manipulation`, etc.) to write to IndexedDB and add an entry to the `sync_queue`.
  - [x] 3.2 Create a `SyncService` that processes the `sync_queue` when the app is online.
  - [x] 3.3 Implement the `sync.batchSync` tRPC endpoint on the server to handle incoming sync operations.

- [ ] 4. **Implement Offline Data Fetching**
  - [ ] 4.1 Update all data fetching logic to read from IndexedDB when offline.
  - [ ] 4.2 Ensure that fetching data from the server to refresh the cache does **not** add entries to the `sync_queue`.

- [ ] 5. **Update UI**
  - [ ] 5.1 Update the `OfflineBanner` to display the number of items in the `sync_queue`.
  - [ ] 5.2 Verify that the entire offline workflow is functioning correctly.

## Changes

### Task Modifications During Implementation

#### Task 1.1 Field Naming (2025-08-10)

- **Original**: Add the `lastUpdated` field to the models
- **Modified**: Add the `updatedAt` field to the models
- **Reason**: Consistency with existing `NutritionGoals.updatedAt` field already in the schema
- **Impact**: All models now use consistent `updatedAt` naming convention

#### Task 2 Type Reuse (2025-08-10)

- **Decision**: Reuse existing types from `src/types/api.ts` instead of creating duplicate `OfflineProduct`, `OfflineConsumption`, `OfflineNutritionGoals` interfaces
- **Reason**: Ensures type consistency between server DB and IndexedDB, following DRY principle
- **Implementation**:
  - Updated `src/types/api.ts` to include `updatedAt` fields and missing `NutritionGoals` interface
  - Refactored `offline-db.ts` and `offline-data-service.ts` to use existing types
- **Impact**: Better type safety and consistency across the application

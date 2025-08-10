# Spec Tasks

## Tasks

- [x] 1. **Update Database Schema**
  - [x] 1.1 Add the `updatedAt` field to the `Product`, `Consumption`, and `NutritionGoals` models in `prisma/schema.prisma`.
  - [x] 1.2 Generate and run a new database migration.

- [x] 2. **Setup Dexie.js and Sync Queue**
  - [x] 2.1 Define the Dexie.js database schema, including tables for products, consumption, goals, and a `sync_queue`.
  - [x] 2.2 Create a data abstraction layer that directs operations to IndexedDB.

- [x] 3. **Implement Offline CRUD and Sync Logic**
  - [x] 3.1 Modify all data mutation hooks to write to IndexedDB and add an entry to the `sync_queue`:
    - [x] `use-product-manipulation` (update/delete products)
    - [x] `use-meal-manipulation` (update/delete consumptions)
    - [x] Product creation in `ProductForm.tsx` (create products)
    - [x] Consumption creation in `ConsumptionManager.tsx` (create meals/consumptions)
    - [x] Nutrition goals in `GoalsForm.tsx` (create/update goals)
  - [x] 3.2 Create a `SyncService` that processes the `sync_queue` when the app is online.
  - [x] 3.3 Implement the `sync.batchSync` tRPC endpoint on the server to handle incoming sync operations.

- [x] 4. **Implement Offline Data Fetching**
  - [x] 4.1 Implement hybrid data layer that uses IndexedDB as primary data source
    - [x] Create enhanced `useProductSearch` hook with IndexedDB integration
    - [x] Create enhanced consumption query hooks (daily stats, by date)
    - [x] Create enhanced nutrition goals query hook
    - [x] Add server data caching to IndexedDB (mark with `isOfflineOnly: false`)
    - [x] Implement data merging logic (server data + offline changes + pending sync operations)
  - [ ] 4.2 Update offline data service to support query operations
    - [ ] Add `syncServerProducts()` method to cache fresh server data
    - [ ] Add `syncServerConsumptions()` method to cache fresh server data
    - [ ] Add `syncServerNutritionGoals()` method to cache fresh server data
    - [ ] Implement smart filtering that excludes pending deletions
    - [ ] Add support for search, filter, and sort operations on IndexedDB
  - [ ] 4.3 Ensure server data updates do **not** add entries to the `sync_queue`
    - [ ] Server data updates bypass sync queue (direct IndexedDB writes)
    - [ ] Only user-initiated changes create sync queue entries

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

#### Task 4.1 Hybrid Data Layer Implementation (2025-01-27)

- **Completed**: Implemented hybrid data layer that uses IndexedDB as primary data source
- **Implementation**:
  - Created `useDailyStats()` hook with offline/online data switching
  - Created `useConsumptionsByDate()` hook with offline/online data switching
  - Created `useNutritionGoals()` hook with offline/online data switching
  - Updated `useHybridProductSearch()` hook to accept userId parameter
  - Added server data caching to IndexedDB via `offlineDataService.cacheServer*()` methods
  - Implemented simple data merging logic: `isOnline ? serverData : offlineData`
  - Created centralized auth utilities (`getCurrentUserId()`, `getCurrentSession()`)
  - Updated components to pass real user ID instead of hardcoded values
- **Architecture**: Simple conditional pattern `isOnline ? trpc.data : offlineData` for data source selection
- **Impact**: Full offline functionality with real user authentication, no more hardcoded user IDs

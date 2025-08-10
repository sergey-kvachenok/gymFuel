# Spec Tasks

## Tasks

- [ ] 1. **Update Database Schema**
  - [ ] 1.1 Add the `lastUpdated` field to the `Product`, `Consumption`, and `UserNutritionGoal` models in `prisma/schema.prisma`.
  - [ ] 1.2 Generate and run a new database migration.

- [ ] 2. **Setup Dexie.js and Sync Queue**
  - [ ] 2.1 Define the Dexie.js database schema, including tables for products, consumption, goals, and a `sync_queue`.
  - [ ] 2.2 Create a data abstraction layer that directs operations to IndexedDB.

- [ ] 3. **Implement Offline CRUD and Sync Logic**
  - [ ] 3.1 Modify all data mutation hooks (`use-product-manipulation`, etc.) to write to IndexedDB and add an entry to the `sync_queue`.
  - [ ] 3.2 Create a `SyncService` that processes the `sync_queue` when the app is online.
  - [ ] 3.3 Implement the `sync.batchSync` tRPC endpoint on the server to handle incoming sync operations.

- [ ] 4. **Implement Offline Data Fetching**
  - [ ] 4.1 Update all data fetching logic to read from IndexedDB when offline.
  - [ ] 4.2 Ensure that fetching data from the server to refresh the cache does **not** add entries to the `sync_queue`.

- [ ] 5. **Update UI**
  - [ ] 5.1 Update the `OfflineBanner` to display the number of items in the `sync_queue`.
  - [ ] 5.2 Verify that the entire offline workflow is functioning correctly.

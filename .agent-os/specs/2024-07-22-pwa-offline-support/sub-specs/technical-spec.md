# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2024-07-22-pwa-offline-support/spec.md

## Technical Requirements

- **Database Schema**:
  - Add a `lastUpdated` field (of type `DateTime`) to the `Product`, `Consumption`, and `Goals` models in the `prisma/schema.prisma` file. This field should be automatically updated whenever a record is created or updated.
- **Dexie.js Setup**:
  - Create a new file to define the Dexie database instance and its schema, mirroring the Prisma models.
  - The Dexie schema will include tables for products, consumption, and goals, each with a `lastUpdated` field.
  - Create a dedicated `sync_queue` table in Dexie to log all user-initiated operations that need to be sent to the server.
- **Data-Fetching Logic**:
  - Modify all data-fetching hooks and tRPC calls to use the `useOnlineStatus` hook.
  - When online, fetch data from the tRPC API and update the IndexedDB cache. Data re-fetching will be managed by React Query, configured to trigger on component mount and network reconnect, but disabled for window refocus events.
  - When offline, fetch data directly from IndexedDB.
- **Data-Mutation Logic**:
  - Modify all mutation logic (create, update, delete) to operate on the IndexedDB database first.
  - When a user performs a CRUD action, the change is written to the appropriate IndexedDB table AND a new entry is added to the `sync_queue` table.
- **Synchronization Service**:
  - Create a service that listens for changes in the online status.
  - When the app comes online, this service will read the `sync_queue`, send the operations to the server, and remove them from the queue upon success.
  - Cache update operations (fetching data from the server to refresh local state) will write directly to the data tables in IndexedDB but will **not** add entries to the `sync_queue`, thus preventing loops.
- **Offline Banner**:
  - Update the `OfflineBanner` component to display the number of items in the sync queue.

## External Dependencies (Conditional)

No new dependencies are required for this feature, as Dexie.js was included in the previous spec.

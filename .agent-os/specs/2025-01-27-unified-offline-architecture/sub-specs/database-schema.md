# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-01-27-unified-offline-architecture/spec.md

## IndexedDB Schema Updates

### New Fields for All Tables

All tables (products, consumptions, nutritionGoals) will include these new fields for sync management:

```typescript
interface SyncFields {
  _synced: boolean; // Whether the record has been synced to server
  _syncTimestamp?: Date; // When the record was last synced
  _syncError?: string; // Error message if sync failed
  _lastModified: Date; // Last modification timestamp for conflict resolution
  _version: number; // Version number for optimistic concurrency
}
```

### Updated Table Schemas

#### Products Table

```typescript
interface Product {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  // New sync fields
  _synced: boolean;
  _syncTimestamp?: Date;
  _syncError?: string;
  _lastModified: Date;
  _version: number;
}
```

#### Consumptions Table

```typescript
interface Consumption {
  id: number;
  productId: number;
  userId: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  // New sync fields
  _synced: boolean;
  _syncTimestamp?: Date;
  _syncError?: string;
  _lastModified: Date;
  _version: number;
}
```

#### NutritionGoals Table

```typescript
interface NutritionGoals {
  id: number;
  userId: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  createdAt: Date;
  updatedAt: Date;
  // New sync fields
  _synced: boolean;
  _syncTimestamp?: Date;
  _syncError?: string;
  _lastModified: Date;
  _version: number;
}
```

### Simplified Sync Queue

Replace the complex sync queue with a simple pending operations table:

```typescript
interface PendingOperation {
  id?: number;
  tableName: string;
  operation: 'create' | 'update' | 'delete';
  recordId: number;
  data?: unknown;
  timestamp: Date;
  userId: number;
  retryCount: number;
  lastRetry?: Date;
}
```

## Database Migration

### Version 11 Schema Update

```typescript
// In offline-db.ts
this.version(11).stores({
  products: '&id, userId, name, createdAt, updatedAt, _synced, _lastModified',
  consumptions: '&id, userId, productId, date, createdAt, updatedAt, _synced, _lastModified',
  nutritionGoals: '&id, userId, createdAt, updatedAt, _synced, _lastModified',
  pendingOperations: '++id, tableName, operation, recordId, timestamp, userId, retryCount',
});
```

### Migration Logic

1. **Add new fields**: Add sync fields to all existing records
2. **Initialize sync status**: Set `_synced: true` for existing records
3. **Set timestamps**: Use `updatedAt` as initial `_lastModified`
4. **Initialize versions**: Set `_version: 1` for all records

## Indexes and Performance

### Primary Indexes

- `id`: Primary key for all tables
- `userId`: For user-specific queries
- `_synced`: For filtering unsynced records
- `_lastModified`: For conflict resolution

### Secondary Indexes

- `name` (products): For search functionality
- `date` (consumptions): For date-based queries
- `productId` (consumptions): For product relationships

## Data Integrity Rules

1. **Required Fields**: All sync fields are required except `_syncTimestamp` and `_syncError`
2. **Timestamp Consistency**: `_lastModified` must always be >= `updatedAt`
3. **Version Increment**: `_version` must increment on each modification
4. **Sync Status**: `_synced` must be false when `_syncError` is present

## Conflict Resolution Strategy

1. **Timestamp Comparison**: Use `_lastModified` for conflict detection
2. **Version Checking**: Use `_version` for optimistic concurrency
3. **Last Write Wins**: Server timestamp takes precedence in conflicts
4. **Error Handling**: Failed syncs are retried with exponential backoff

# Data Flow Architecture

## Overview

This document provides a detailed breakdown of the data flow in the unified offline-first architecture, including diagrams, implementation details, and decision rationale.

## Current vs New Architecture Comparison

### Current Architecture (Broken)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │    tRPC     │    │   Server    │    │ IndexedDB   │
│  Action     │───▶│   Cache     │───▶│  Database   │───▶│   (Cache)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    UI       │    │   Sync      │    │  Conflict   │    │   Offline   │
│  Update     │    │  Queue      │    │ Resolution  │    │   Changes   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Problems:**

- ❌ Complex data flow with multiple sources
- ❌ Race conditions between cache and IndexedDB
- ❌ Callback failures break the entire flow
- ❌ Delayed UI updates
- ❌ Inconsistent state management

### New Architecture (Unified)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │ IndexedDB   │    │    UI       │
│  Action     │───▶│ (Primary)   │───▶│  Update     │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │ Background  │
                   │    Sync     │
                   └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │   Server    │
                   │  Database   │
                   └─────────────┘
```

**Benefits:**

- ✅ Single source of truth (IndexedDB)
- ✅ Immediate UI updates
- ✅ No race conditions
- ✅ Simple, reliable flow
- ✅ Consistent state management

## Detailed Data Flow

### 1. Create Operation Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │ UnifiedData │    │ IndexedDB   │    │    UI       │
│  Clicks     │───▶│  Service    │───▶│   Write     │───▶│  Update     │
│ "Add"       │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │ Background  │
                   │ Sync Queue  │
                   └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │   Server    │
                   │   API       │
                   └─────────────┘
```

**Implementation:**

```typescript
// 1. User action triggers create operation
const handleCreate = async (data) => {
  // 2. Write to IndexedDB immediately
  const result = await unifiedDataService.create(data);

  // 3. UI updates instantly
  updateUI(result);

  // 4. Background sync happens automatically
  // (no user interaction required)
};
```

### 2. Read Operation Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │ UnifiedData │    │ IndexedDB   │
│  Requests   │───▶│  Service    │───▶│    Read     │
│   Data      │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │    UI       │
                   │  Display    │
                   └─────────────┘
```

**Implementation:**

```typescript
// Always read from IndexedDB (single source of truth)
const getData = async () => {
  return await unifiedDataService.getAll();
};
```

### 3. Update Operation Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │ UnifiedData │    │ IndexedDB   │    │    UI       │
│  Updates    │───▶│  Service    │───▶│   Update    │───▶│  Update     │
│   Record    │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │ Background  │
                   │ Sync Queue  │
                   └─────────────┘
```

**Implementation:**

```typescript
const handleUpdate = async (id, data) => {
  // 1. Update IndexedDB immediately
  const result = await unifiedDataService.update(id, data);

  // 2. UI updates instantly
  updateUI(result);

  // 3. Background sync queues the update
};
```

### 4. Delete Operation Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │    │ UnifiedData │    │ IndexedDB   │    │    UI       │
│  Deletes    │───▶│  Service    │───▶│   Delete    │───▶│  Update     │
│   Record    │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │ Background  │
                   │ Sync Queue  │
                   └─────────────┘
```

## Background Sync Flow

### Sync Trigger Events

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Connection  │    │ Background  │    │   Server    │
│  Monitor    │───▶│ Sync Mgr    │───▶│    API      │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Online/     │    │ Batch Sync  │    │ Conflict    │
│ Offline     │    │ Operations  │    │ Resolution  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Sync Process Details

1. **Connection Detection**: ConnectionMonitor detects online status
2. **Queue Processing**: BackgroundSyncManager processes pending operations
3. **Batch Operations**: Multiple operations sent in single API call
4. **Conflict Resolution**: Server resolves conflicts using timestamps
5. **Status Update**: Update sync status in IndexedDB

## Conflict Resolution Flow

### Conflict Detection

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ IndexedDB   │    │ Background  │    │   Server    │
│   Record    │───▶│ Sync Mgr    │───▶│   Record    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ _lastMod    │    │ Compare     │    │ _lastMod    │
│ Timestamp   │    │ Timestamps  │    │ Timestamp   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Resolution Strategy

1. **Timestamp Comparison**: Compare `_lastModified` timestamps
2. **Last Write Wins**: Server timestamp takes precedence
3. **Version Checking**: Use `_version` for optimistic concurrency
4. **Error Handling**: Retry failed operations with exponential backoff

## Error Handling Flow

### Error Scenarios

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Error     │    │ Error       │    │   Retry     │
│  Occurs     │───▶│  Handler    │───▶│   Logic     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ User        │    │ Log Error   │    │ Exponential │
│ Notification│    │ & Metrics   │    │ Backoff     │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Error Recovery

1. **Immediate Recovery**: IndexedDB operations continue to work
2. **Background Retry**: Failed sync operations retry automatically
3. **User Notification**: Clear error messages for user
4. **Logging**: Comprehensive error logging for debugging

## Performance Optimization

### IndexedDB Optimization

1. **Efficient Indexing**: Proper indexes for common queries
2. **Batch Operations**: Group operations for better performance
3. **Lazy Loading**: Load data on demand
4. **Memory Management**: Clean up unused data

### Background Sync Optimization

1. **Batch Processing**: Sync multiple operations together
2. **Retry Logic**: Exponential backoff for failed operations
3. **Network Efficiency**: Minimize API calls
4. **Conflict Resolution**: Efficient conflict detection and resolution

## Implementation Considerations

### Data Consistency

1. **ACID Properties**: Ensure data consistency in IndexedDB
2. **Transaction Management**: Use transactions for complex operations
3. **Rollback Capability**: Ability to rollback failed operations
4. **Data Validation**: Validate data before storing

### Scalability

1. **Large Datasets**: Handle thousands of records efficiently
2. **Memory Usage**: Monitor and optimize memory consumption
3. **Battery Impact**: Minimize impact on device battery
4. **Network Usage**: Optimize network usage for sync operations

## Monitoring and Debugging

### Sync Status Monitoring

1. **Queue Status**: Monitor pending operations
2. **Error Tracking**: Track sync failures and retries
3. **Performance Metrics**: Monitor sync performance
4. **User Experience**: Track offline usage patterns

### Debugging Tools

1. **IndexedDB Inspector**: Browser tools for database inspection
2. **Sync Logs**: Detailed logs for sync operations
3. **Error Reporting**: Comprehensive error reporting
4. **Performance Profiling**: Tools for performance analysis

## Conclusion

The unified offline-first architecture provides a clear, simple, and reliable data flow that eliminates the complexity and reliability issues of the current hybrid approach. By treating IndexedDB as the single source of truth and implementing intelligent background synchronization, we ensure that users can always interact with their data immediately while maintaining data consistency and reliability.

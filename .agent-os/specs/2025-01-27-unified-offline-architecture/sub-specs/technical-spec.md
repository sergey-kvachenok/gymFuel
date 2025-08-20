# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-01-27-unified-offline-architecture/spec.md

## Technical Requirements

### Unified Data Service Architecture

- **Single Data Source**: IndexedDB becomes the primary data store for all operations
- **Immediate Writes**: All CRUD operations write to IndexedDB first, then trigger UI updates
- **Background Sync**: Server synchronization happens asynchronously without blocking UI
- **Conflict Resolution**: Simple timestamp-based "last write wins" strategy
- **Error Handling**: Clear error states with retry mechanisms

### Data Flow Implementation

1. **User Action**: User performs any CRUD operation
2. **IndexedDB Write**: Operation immediately writes to IndexedDB
3. **UI Update**: UI reflects changes from IndexedDB data
4. **Background Sync**: If online, sync to server in background
5. **Conflict Resolution**: Handle any conflicts during sync

### Key Components

#### UnifiedDataService

- Handles all CRUD operations for products, consumptions, and goals
- Manages IndexedDB operations with proper error handling
- Provides consistent API regardless of online/offline status

#### BackgroundSyncManager

- Monitors online/offline status
- Queues operations for background sync
- Handles conflict resolution during sync
- Provides sync status and progress indicators

#### ConnectionMonitor

- Detects network connectivity changes
- Triggers sync operations when coming online
- Manages sync queue processing

### Database Schema Updates

- **Add sync status fields**: `_synced`, `_syncTimestamp`, `_syncError`
- **Add conflict resolution fields**: `_lastModified`, `_version`
- **Simplify sync queue**: Remove complex queue structure, use simple pending operations

### API Integration

- **tRPC Integration**: Use tRPC for server communication but not for local state
- **Batch Operations**: Implement batch sync for efficiency
- **Error Recovery**: Retry failed operations with exponential backoff

### Performance Considerations

- **Lazy Loading**: Load data from IndexedDB on demand
- **Background Processing**: Sync operations don't block UI
- **Memory Management**: Efficient IndexedDB usage with proper cleanup
- **Network Optimization**: Batch sync operations to reduce API calls

## External Dependencies

No new external dependencies required. The implementation will use existing libraries:

- **Dexie.js**: Already in use for IndexedDB operations
- **tRPC**: Already in use for server communication
- **React Query**: Will be simplified to work with IndexedDB as primary source

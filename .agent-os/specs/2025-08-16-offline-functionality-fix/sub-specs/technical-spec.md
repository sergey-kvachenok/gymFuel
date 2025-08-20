# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-16-offline-functionality-fix/spec.md

## Technical Requirements

### Hook Refactoring

- **UnifiedDataService Integration**: All hooks must use UnifiedDataService as the single source of truth
- **Remove Hybrid Logic**: Eliminate all online/offline switching logic from hooks
- **Simplified State Management**: Remove complex state management for multiple data sources
- **Error Handling**: Add proper error handling for IndexedDB operations

### Background Sync Integration

- **App Startup Initialization**: Initialize BackgroundSyncManager in app startup
- **Connection Monitor Integration**: Connect BackgroundSyncManager to ConnectionMonitor
- **Automatic Sync**: Ensure sync triggers automatically when coming online
- **Error Recovery**: Implement retry logic for failed sync operations

### Component Updates

- **Form Components**: Update ProductForm, ConsumptionForm, and GoalsForm to use simplified hooks
- **Data Flow**: Ensure all CRUD operations go through UnifiedDataService
- **UI Updates**: Maintain immediate UI updates from IndexedDB operations
- **Error States**: Add proper error states and user feedback

### Error Handling and Logging

- **Comprehensive Logging**: Add logging for all IndexedDB operations and sync events
- **Error Recovery**: Implement proper error recovery mechanisms
- **User Feedback**: Provide clear error messages to users
- **Debugging Support**: Add debugging information for troubleshooting

## External Dependencies

- **Dexie.js**: For IndexedDB operations
- **React Query**: For server communication (when online)
- **tRPC**: For API communication
- **Service Worker**: For PWA functionality

## Implementation Details

### Hook Refactoring Pattern

```typescript
// Before: Complex hybrid approach
const useProductSearch = (userId: number | null, options: ProductSearchOptions = {}) => {
  const isOnline = useOnlineStatus();
  const serverQuery = trpc.product.getAll.useQuery(/* ... */);
  const [offlineProducts, setOfflineProducts] = useState([]);

  // Complex logic to switch between online/offline
  useEffect(() => {
    if (isOnline) {
      // Handle online logic
    } else {
      // Handle offline logic
    }
  }, [isOnline]);

  return {
    data: isOnline ? serverQuery.data : offlineProducts,
    // ... more complex logic
  };
};

// After: Simplified unified approach
const useProductSearch = (userId: number | null, options: ProductSearchOptions = {}) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const unifiedDataService = UnifiedDataService.getInstance();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await unifiedDataService.getProducts(userId, options);
        setProducts(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProducts();
    }
  }, [userId, options]);

  return { data: products, isLoading, error };
};
```

### Background Sync Integration

```typescript
// In app startup (e.g., providers.tsx or layout.tsx)
import { BackgroundSyncManager } from '../lib/background-sync-manager';
import { ConnectionMonitor } from '../lib/connection-monitor';
import { UnifiedDataService } from '../lib/unified-data-service';

// Initialize background sync system
const connectionMonitor = new ConnectionMonitor();
const dataService = UnifiedDataService.getInstance();
const backgroundSyncManager = new BackgroundSyncManager(dataService, connectionMonitor);

// The BackgroundSyncManager will automatically:
// 1. Monitor connection changes
// 2. Trigger sync when coming online
// 3. Handle retry logic for failed operations
```

### Error Handling Strategy

```typescript
// Comprehensive error handling in UnifiedDataService
async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<UnifiedProduct> {
  try {
    console.log('Creating product:', productData);

    const now = new Date();
    const unifiedProduct: Omit<UnifiedProduct, 'id'> = {
      ...productData,
      createdAt: now,
      updatedAt: now,
      _synced: false,
      _syncTimestamp: null,
      _syncError: null,
      _lastModified: now,
      _version: 1,
    };

    const id = await unifiedOfflineDb.products.add(unifiedProduct as UnifiedProduct);
    const product = await unifiedOfflineDb.products.get(id);

    if (!product) {
      throw new Error('Failed to create product in IndexedDB');
    }

    console.log('Product created successfully:', product);
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error(`Failed to create product: ${error.message}`);
  }
}
```

## Testing Requirements

### Offline Functionality Tests

- **CRUD Operations**: Test all create, read, update, delete operations offline
- **Data Persistence**: Verify data is properly saved to IndexedDB
- **UI Updates**: Ensure immediate UI updates from IndexedDB operations
- **Error Handling**: Test error scenarios and recovery

### Background Sync Tests

- **Connection Changes**: Test sync triggering when coming online
- **Retry Logic**: Test retry mechanisms for failed operations
- **Conflict Resolution**: Test conflict resolution during sync
- **Data Consistency**: Verify data consistency after sync

### Integration Tests

- **End-to-End Flow**: Test complete offline to online flow
- **Component Integration**: Test all components work with unified architecture
- **Performance**: Ensure acceptable performance for offline operations
- **PWA Requirements**: Verify PWA functionality is maintained

## Migration Checklist

- [ ] Refactor useProductSearch hook
- [ ] Refactor useConsumptionsByDate hook
- [ ] Refactor useNutritionGoals hook
- [ ] Initialize BackgroundSyncManager in app startup
- [ ] Connect BackgroundSyncManager to ConnectionMonitor
- [ ] Update ProductForm component
- [ ] Update ConsumptionForm component
- [ ] Update GoalsForm component
- [ ] Add comprehensive error handling and logging
- [ ] Test complete offline functionality
- [ ] Remove old hybrid logic and unused code
- [ ] Validate PWA requirements are met

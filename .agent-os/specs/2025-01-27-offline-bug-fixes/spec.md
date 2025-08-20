# Spec Requirements Document

> Spec: Offline Bug Fixes
> Created: 2025-01-27

## Overview

Fix critical bugs in the PWA offline functionality where consumption submission doesn't work offline, consumption list doesn't update, and data synchronization fails. The current implementation has gaps in data flow and hardcoded user IDs that prevent proper offline operation.

## User Stories

### Offline Consumption Creation

As a user, I want to be able to create consumption records while offline and see them immediately appear in my consumption list, so that I can track my nutrition without interruption when I don't have internet connectivity.

### Offline Data Persistence

As a user, I want my offline changes to persist and sync properly when I come back online, so that I don't lose any data I entered while offline.

### Real User Authentication

As a user, I want the app to use my actual user ID instead of hardcoded values, so that my data is properly associated with my account and syncs correctly.

## Spec Scope

1. **Fix Hardcoded User IDs** - Replace all hardcoded `userId: 1` with actual user authentication data
2. **Fix Offline Consumption Submission** - Ensure consumption form properly saves to IndexedDB when offline
3. **Fix Consumption List Updates** - Make sure UI immediately reflects offline changes
4. **Fix Data Flow Issues** - Ensure proper data merging between online and offline states
5. **Add Missing Data Test IDs** - Add proper test selectors for reliable e2e testing

## Out of Scope

- Adding new features
- Changing the overall architecture
- Modifying the database schema

## Expected Deliverable

1. Users can create consumptions offline and see them immediately in the list
2. All offline changes persist and sync when coming back online
3. No hardcoded user IDs - all operations use real authentication
4. Comprehensive e2e tests pass for all offline scenarios
5. Data flow is consistent between online and offline states

## Current Status

### ✅ Completed Tasks

- **Task 1: Fix Hardcoded User IDs** - COMPLETED ✅
  - Resolved hardcoded user IDs in test data
  - Implemented proper user ID handling in offline operations
  - Verified with comprehensive testing

### 🔄 In Progress Tasks

- **Task 2: Fix Offline Consumption Submission** - IN PROGRESS 🔄
  - **Status**: Core issue identified - product caching to IndexedDB not working
  - **Progress**: 70% complete - test infrastructure working, root cause identified
  - **Blocking Issue**: Products not cached to IndexedDB prevents offline consumption flow

### 📋 Remaining Tasks

- **Task 3: Fix Consumption List Updates** - PENDING
- **Task 4: Fix Data Flow Issues** - PENDING
- **Task 5: Add Missing Test IDs** - PARTIALLY COMPLETE
- **Task 6: Comprehensive Testing** - PENDING
- **Task 7: Documentation and Cleanup** - PENDING

## Technical Findings

### Root Cause Analysis

The primary issue preventing offline consumption submission is a **broken data flow**:

1. **Product Creation** → ✅ Working correctly in online mode
2. **Product Caching** → ❌ **BROKEN** - Products not cached to IndexedDB
3. **Offline Product Availability** → ❌ **BROKEN** - No products available offline
4. **Offline Consumption Creation** → ❌ **BROKEN** - Cannot create consumption without products

### Debugging Results

- ✅ **Test Infrastructure**: Working correctly with proper test data generation
- ✅ **Form Submission**: Working correctly in online mode
- ✅ **UI Components**: All forms and components visible and functional
- ✅ **Offline Detection**: Browser offline status detection working correctly
- ❌ **Product Caching**: IndexedDB always empty after product creation
- ❌ **Offline Data Flow**: Complete offline consumption flow broken

### Data Flow Issues

The offline consumption submission fails because:

1. Products created online are not cached to IndexedDB
2. ProductCombobox has no products to display in offline mode
3. Users cannot select products for consumption in offline mode
4. Offline consumption creation cannot proceed without product selection

## Implementation Status

### Working Components

- Test data factory and management
- Form submission infrastructure
- UI component visibility and interaction
- Online consumption creation and display
- Offline mode detection

### Broken Components

- Product caching to IndexedDB
- Offline product availability
- Complete offline consumption flow
- UI refresh after offline operations

## Next Steps

### Immediate Priority

1. **Fix Product Caching**: Ensure products are cached to IndexedDB after online creation
2. **Verify Offline Product Availability**: Confirm ProductCombobox shows cached products
3. **Test Complete Offline Flow**: End-to-end offline consumption creation

### Secondary Priority

4. **Fix UI Refresh**: Ensure meals list updates after offline consumption
5. **Add Error Handling**: Comprehensive error handling for offline operations
6. **Complete Remaining Tasks**: Tasks 3-7 implementation and testing

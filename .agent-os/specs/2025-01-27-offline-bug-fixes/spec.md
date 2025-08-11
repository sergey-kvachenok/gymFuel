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

## Root Cause Analysis

### Primary Issues:

1. **Hardcoded User IDs**: `userId: 1` used in multiple places instead of real auth
2. **Data Flow Gaps**: Offline changes not properly merged with UI state
3. **Missing Test IDs**: No reliable selectors for e2e testing
4. **Hook Dependencies**: React hooks not properly invalidating after offline changes
5. **IndexedDB Integration**: Offline data service not properly integrated with UI components

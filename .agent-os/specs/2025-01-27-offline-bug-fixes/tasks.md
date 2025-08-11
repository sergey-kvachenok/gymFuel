# Offline Bug Fixes - Task Progress

## Task 1: Fix Hardcoded User IDs

- [x] 1.1 Audit all files for hardcoded `userId: 1` usage
- [x] 1.2 Fix hardcoded user ID in `GoalsForm.tsx`
- [x] 1.3 Fix hardcoded user ID in `offline-data-service.ts`
- [x] 1.4 Verify all components use real authentication data
- [x] 1.5 Test that user-specific data is properly isolated

## Task 2: Fix Offline Consumption Submission

- [ ] 2.1 Debug why consumption form submission fails offline
- [ ] 2.2 Fix `ConsumptionManager.tsx` offline submission logic
- [ ] 2.3 Ensure proper error handling in offline submission
- [ ] 2.4 Verify consumption data is saved to IndexedDB
- [ ] 2.5 Test consumption submission with real user ID

## Task 3: Fix Consumption List Updates

- [ ] 3.1 Debug why consumption list doesn't update after offline creation
- [ ] 3.2 Fix `useConsumptionsByDate` hook to properly merge offline data
- [ ] 3.3 Ensure UI components re-render after offline changes
- [ ] 3.4 Fix data invalidation after offline operations
- [ ] 3.5 Test that consumption list updates immediately

## Task 4: Fix Data Flow Issues

- [ ] 4.1 Review and fix data merging logic in offline data service
- [ ] 4.2 Ensure proper sync queue management
- [ ] 4.3 Fix data consistency between online and offline states
- [ ] 4.4 Verify data persistence across online/offline transitions
- [ ] 4.5 Test data integrity with multiple offline operations

## Task 5: Add Missing Test IDs

- [ ] 5.1 Add `data-testid="consumption-item"` to consumption list items
- [ ] 5.2 Add test IDs to offline banner components
- [ ] 5.3 Add test IDs to product list items
- [ ] 5.4 Verify all test selectors are reliable and unique
- [ ] 5.5 Update e2e tests to use proper selectors

## Task 6: Comprehensive Testing

- [ ] 6.1 Create focused offline functionality test
- [ ] 6.2 Test offline consumption creation end-to-end
- [ ] 6.3 Test offline data persistence and sync
- [ ] 6.4 Test online/offline transitions
- [ ] 6.5 Verify all tests pass consistently

## Task 7: Documentation and Cleanup

- [ ] 7.1 Update lessons.md with new findings
- [ ] 7.2 Document the fixes applied
- [ ] 7.3 Remove any debug code or console logs
- [ ] 7.4 Verify code follows style guidelines
- [ ] 7.5 Update task status in original spec

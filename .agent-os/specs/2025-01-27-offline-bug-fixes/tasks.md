# Offline Bug Fixes - Task Progress

## Task 1: Fix Hardcoded User IDs ✅ COMPLETED

- [x] 1.1 Audit all files for hardcoded `userId: 1` usage
- [x] 1.2 Fix hardcoded user ID in `GoalsForm.tsx`
- [x] 1.3 Fix hardcoded user ID in `offline-data-service.ts`
- [x] 1.4 Verify all components use real authentication data
- [x] 1.5 Test that user-specific data is properly isolated

**Review Status**: ✅ Lead Senior Software Developer review completed
**Issues Fixed**: All critical and high priority issues resolved
**Tests**: ✅ Unit tests and E2E tests passing
**Test Isolation**: ✅ Separate test database setup created
**Regression Prevention**: ✅ Simple, reliable tests prevent getting stuck

## Task 2: Fix Offline Consumption Submission 🔄 IN PROGRESS

- [x] 2.1 Debug why consumption form submission fails offline
- [x] 2.2 Fix `ConsumptionManager.tsx` offline submission logic
- [x] 2.3 Ensure proper error handling in offline submission
- [x] 2.4 Verify consumption data is saved to IndexedDB
- [ ] 2.5 Test consumption submission with real user ID

**Review Status**: 🔄 Tech Lead review in progress
**Issues Identified**:

- ✅ **RESOLVED**: Test data issues (undefined amounts, missing test IDs)
- ✅ **RESOLVED**: Form submission works correctly in online mode
- ✅ **RESOLVED**: Test infrastructure and debugging capabilities
- 🔄 **IN PROGRESS**: Product caching to IndexedDB not working
- 🔄 **IN PROGRESS**: Offline data flow broken due to missing cached products
- 🔄 **IN PROGRESS**: UI refresh mechanism for offline data not working

**Root Cause Analysis**:

- **Primary Issue**: Products are not being cached to IndexedDB when created online
- **Secondary Issue**: Without cached products, ProductCombobox has no options in offline mode
- **Tertiary Issue**: Offline consumption submission cannot work without available products
- **Data Flow Gap**: Online product creation → IndexedDB caching → Offline product availability → Offline consumption creation

**Technical Findings**:

1. **Product Creation**: Works correctly in online mode
2. **Product Caching**: `cacheServerProducts()` method exists but is not being called or failing silently
3. **IndexedDB State**: Always empty (`📊 Cached products after creation: []`)
4. **Form Submission**: Works correctly when products are available
5. **Offline Detection**: Working correctly (`📱 Browser offline status: true`)

**Debugging Results**:

- ✅ Test data generation: Working correctly
- ✅ Form visibility: Working correctly
- ✅ Product combobox visibility: Working correctly
- ❌ Product caching: Not working (`📊 Cached products after creation: []`)
- ❌ Offline product availability: No products available in offline mode

**Next Steps**:

1. Fix product caching mechanism in ProductForm.tsx
2. Ensure products are cached to IndexedDB after online creation
3. Verify offline product availability in ProductCombobox
4. Test complete offline consumption flow
5. Add comprehensive error handling for caching failures

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

- [ ] 7.1 Update lessons-project-specific.md with new findings
- [ ] 7.2 Document the fixes applied
- [ ] 7.3 Remove any debug code or console logs
- [ ] 7.4 Verify code follows style guidelines
- [ ] 7.5 Update task status in original spec

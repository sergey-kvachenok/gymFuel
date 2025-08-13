# Project-Specific Lessons Learned

## Authentication and User Management

### Always Use Real User IDs - Never Hardcode

- **Problem**: Used `const userId = 1;` in offline data service
- **Solution**:
  - Create `getCurrentUserId()` utility function
  - Pass actual user IDs from server components as props
  - Validate user ID is not null before using
- **Lesson**: Always use real authentication data, never hardcode user IDs

### Centralize Authentication Logic

- **Problem**: User ID retrieval was scattered across components
- **Solution**:
  - Create `src/lib/auth-utils.ts` with centralized functions
  - Use server components to fetch user session data
  - Pass user data as props to client components
  - Implement proper error handling for missing authentication
- **Lesson**: Centralize authentication logic in utility functions for consistency and maintainability

### Check for Hardcoded Values When Debugging Offline Issues

- **Problem**: Offline data not working due to hardcoded `userId: 1` in ProductForm
- **Solution**:
  - Pass actual user ID as prop and validate it's not null
  - Check for hardcoded values in forms and data services
  - Validate user authentication before processing offline data
- **Lesson**: When offline data isn't working, check for hardcoded user IDs first

## PWA and Offline Functionality

### Cache Server Data When Online

- **Problem**: No data available when going offline
- **Solution**:
  - Cache all server data to IndexedDB when online
  - Implement proper cache invalidation strategies
  - Handle cache size limits and cleanup
  - Provide fallback data when cache is empty
- **Lesson**: Cache data proactively when online for offline availability

### Test Both Online and Offline Functionality

- **Problem**: Only testing online functionality
- **Solution**:
  - Test data availability in offline mode
  - Test UI behavior when offline (button visibility, error states)
  - Test data synchronization when coming back online
  - Test navigation flows in offline mode
  - Test error handling for network failures
- **Lesson**: PWA offline functionality needs dedicated testing for all user scenarios

### Understand Hook Activation Timing

- **Problem**: useProductSearch hook wasn't caching data because it wasn't active when product was created
- **Solution**:
  - Open consumption form to activate hook before going offline
  - Ensure data caching hooks are active when data is created
  - Implement proper hook activation strategies
  - Consider timing dependencies in offline functionality
- **Lesson**: Data caching hooks need to be active when data is created to cache it properly

### Consider Timing in Offline Scenarios

- **Problem**: Data needed to be cached before going offline, but hooks weren't active yet
- **Solution**:
  - Ensure data caching hooks are active when data is created
  - Implement proper hook activation strategies
  - Consider timing dependencies in offline functionality
  - Test timing-sensitive scenarios thoroughly
- **Lesson**: Offline functionality often has timing dependencies that need to be considered

### Test the Actual User Flow

- **Problem**: Test was going offline immediately after creating product, but caching hook wasn't active yet
- **Solution**:
  - Test the complete flow: create product → open form (activate hook) → go offline → test functionality
  - Include realistic timing and user interactions
  - Test edge cases and error scenarios
  - Validate user experience, not just technical functionality
- **Lesson**: Test the actual user flow, not just technical steps

## SSR and Hydration (PWA Specific)

### Fix Hydration Errors in Offline Mode

- **Problem**: Hydration errors when switching between pages in offline mode due to `navigator.onLine` usage during SSR
- **Solution**:
  - Always default to online status during SSR
  - Set actual status in useEffect after hydration
  - Avoid using browser-specific APIs during SSR initialization
  - Use proper client-side detection patterns
- **Lesson**: Avoid using browser-specific APIs during SSR initialization to prevent hydration mismatches

### Test Navigation Flows in Offline Mode

- **Problem**: Hydration errors only occur during specific navigation patterns in offline mode
- **Solution**:
  - Create comprehensive tests that cover navigation between pages
  - Test menu clicks and rapid navigation
  - Test specific user flows that trigger issues
  - Validate navigation behavior in both online and offline modes
- **Lesson**: Test the actual user flows that trigger issues, not just isolated functionality

## Project-Specific Data Management

### Avoid Duplicate Data Fetching Logic

- **Problem**: ProductSearch component had its own offline logic conflicting with useProductSearch hook
- **Solution**:
  - Made ProductSearch a pure UI component, centralized data fetching in hooks
  - Use consistent data fetching patterns
  - Implement proper error handling and loading states
- **Lesson**: Keep data fetching logic centralized in hooks, make UI components pure

### Create Focused Debug Tests

- **Problem**: Complex test failing without clear indication of where the issue was
- **Solution**:
  - Created simple debug test to isolate specific functionality
  - Keep focused debug tests as regression tests for future functionality
  - Debug tests serve as valuable regression tests when adding new features
- **Lesson**: Create focused debug tests to isolate and confirm specific functionality

## Project Documentation

### Update Documentation After Completing Tasks

- **Problem**: Documentation not reflecting current state
- **Solution**:
  - Update tasks.md and lessons-project-specific.md after each major completion
  - Keep documentation in sync with actual progress
  - Document decisions and rationale
  - Maintain up-to-date technical documentation
- **Lesson**: Keep documentation in sync with actual progress

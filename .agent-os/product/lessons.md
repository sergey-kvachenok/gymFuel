# Lessons Learned

## Always Use Real User IDs - Never Hardcode

- **Problem**: Used `const userId = 1;` in offline data service
- **Solution**: Created `getCurrentUserId()` utility and pass actual user IDs from server components
- **Lesson**: Always use real authentication data, never hardcode user IDs

## Centralize Authentication Logic

- **Problem**: User ID retrieval was scattered across components
- **Solution**: Created `src/lib/auth-utils.ts` with centralized functions
- **Lesson**: Centralize authentication logic in utility functions for consistency

## Pass User ID as Props from Server Components

- **Problem**: Client components couldn't access user session data
- **Solution**: Fetch user ID in server components and pass as props to client components
- **Lesson**: Server components can access session data, client components need props

## Follow React Rules of Hooks Strictly

- **Problem**: Hooks called inside callbacks causing "Rules of Hooks" violations
- **Solution**: Moved all hooks to top level of components
- **Lesson**: Never call hooks inside loops, conditions, or nested functions

## Prevent Infinite Re-renders in React Hooks

- **Problem**: Missing dependencies in useEffect causing infinite re-renders
- **Solution**: Include all dependencies in useEffect dependency arrays
- **Lesson**: Always include all variables used inside useEffect in the dependency array

## Always Include All Dependencies in React Hook Arrays

- **Problem**: Missing dependencies causing stale closures and bugs
- **Solution**: Use ESLint exhaustive-deps rule and include all dependencies
- **Lesson**: Missing dependencies can cause subtle bugs that are hard to debug

## Use Data-Testid Attributes for Reliable Test Selectors

- **Problem**: Tests failing due to text-based selectors being fragile
- **Solution**: Added `data-testid` attributes to all key UI elements
- **Lesson**: Data-testid attributes are more reliable than text-based selectors

## Add Proper Timeouts to Playwright Tests

- **Problem**: Tests timing out due to network delays and page loading
- **Solution**: Added explicit timeouts to all Playwright operations
- **Lesson**: Always add appropriate timeouts for network operations and page loading

## Test Both Online and Offline Functionality

- **Problem**: Only testing online functionality
- **Solution**: Created comprehensive offline functionality tests
- **Lesson**: PWA offline functionality needs dedicated testing

## Don't Over-Engineer Solutions

- **Problem**: Created complex hook abstractions that caused more problems
- **Solution**: Simplified to direct tRPC calls where appropriate
- **Lesson**: Sometimes simpler solutions are better than complex abstractions

## Fix Linter Errors Immediately

- **Problem**: Accumulated linter errors making code harder to maintain
- **Solution**: Fixed all TypeScript and ESLint errors as they appeared
- **Lesson**: Keep code clean and error-free from the start

## Question Complex State Management

- **Problem**: Complex state management causing re-render issues
- **Solution**: Simplified state management and removed unnecessary complexity
- **Lesson**: Question whether complex state management is actually needed

## Don't Modify Core API Types for Implementation Details

- **Problem**: Modified API types to accommodate implementation details
- **Solution**: Keep API types clean and handle implementation details separately
- **Lesson**: API types should reflect the domain, not implementation details

## Cache Server Data When Online

- **Problem**: No data available when going offline
- **Solution**: Cache all server data to IndexedDB when online
- **Lesson**: Cache data proactively when online for offline availability

## Listen to User Feedback Immediately

- **Problem**: Ignored user feedback about infinite re-renders
- **Solution**: Immediately investigated and fixed re-render issues
- **Lesson**: User feedback is often accurate - investigate immediately

## Update Documentation After Completing Tasks

- **Problem**: Documentation not reflecting current state
- **Solution**: Update tasks.md and lessons.md after each major completion
- **Lesson**: Keep documentation in sync with actual progress

## Run Tests After Every Feature Addition

- **Problem**: Bugs accumulating without immediate testing
- **Solution**: Run tests after every feature to catch issues early
- **Lesson**: Continuous testing prevents bug accumulation

## Remove Unreliable Tests

- **Problem**: Tests failing due to parallel execution dependencies
- **Solution**: Removed tests that relied on data from other parallel tests
- **Lesson**: Tests should be independent and not rely on execution order or parallel test data

## Fix TypeScript Errors Properly

- **Problem**: Using `as any` which is prohibited
- **Solution**: Use proper type assertions like `as unknown as Type`
- **Lesson**: Always use proper TypeScript patterns, never `as any`

## Check for Hardcoded Values When Debugging Offline Issues

- **Problem**: Offline data not working due to hardcoded `userId: 1` in ProductForm
- **Solution**: Pass actual user ID as prop and validate it's not null
- **Lesson**: When offline data isn't working, check for hardcoded user IDs first

## Understand Hook Activation Timing

- **Problem**: useProductSearch hook wasn't caching data because it wasn't active when product was created
- **Solution**: Open consumption form to activate hook before going offline
- **Lesson**: Data caching hooks need to be active when data is created to cache it properly

## Test the Actual User Flow

- **Problem**: Test was going offline immediately after creating product, but caching hook wasn't active yet
- **Solution**: Test the complete flow: create product → open form (activate hook) → go offline → test functionality
- **Lesson**: Test the actual user flow, not just technical steps

## Create Focused Debug Tests

- **Problem**: Complex test failing without clear indication of where the issue was
- **Solution**: Created simple debug test to isolate specific functionality
- **Lesson**: Create focused debug tests to isolate and confirm specific functionality

## Avoid Duplicate Data Fetching Logic

- **Problem**: ProductSearch component had its own offline logic conflicting with useProductSearch hook
- **Solution**: Made ProductSearch a pure UI component, centralized data fetching in hooks
- **Lesson**: Keep data fetching logic centralized in hooks, make UI components pure

## Consider Timing in Offline Scenarios

- **Problem**: Data needed to be cached before going offline, but hook wasn't active yet
- **Solution**: Added timing considerations and hook activation steps
- **Lesson**: Offline functionality often has timing dependencies that need to be considered

## Listen to User Observations

- **Problem**: User correctly identified "If there are no products when offline, the button is not visible"
- **Solution**: This insight led directly to understanding the issue was data availability, not UI
- **Lesson**: User observations often point to the root cause - investigate them immediately

## Fix Hydration Errors in Offline Mode

- **Problem**: Hydration errors when switching between pages in offline mode due to `navigator.onLine` usage during SSR
- **Solution**: Always default to online status during SSR, then set actual status in useEffect after hydration
- **Lesson**: Avoid using browser-specific APIs during SSR initialization to prevent hydration mismatches

## Test Navigation Flows in Offline Mode

- **Problem**: Hydration errors only occur during specific navigation patterns in offline mode
- **Solution**: Create comprehensive tests that cover navigation between pages, menu clicks, and rapid navigation
- **Lesson**: Test the actual user flows that trigger issues, not just isolated functionality

## Keep Data Flow Simple and Straightforward

- **Problem**: Created multiple hooks that referenced each other, making data flow complex
- **Solution**: Use single, focused hooks that don't depend on each other unless absolutely necessary
- **Lesson**: Data flow should be simple and straightforward - avoid unnecessary hook dependencies

## Break Problems Into Smaller Chunks

- **Problem**: Trying to solve multiple issues simultaneously (offline data, UI, caching, etc.)
- **Solution**: Focus on one specific issue at a time (e.g., fix hardcoded userId first, then test flow)
- **Lesson**: Solve one problem at a time - don't try to fix everything together

## Clean Up Unused Code Immediately

- **Problem**: Left unused hooks and components after refactoring
- **Solution**: Remove unused code as soon as it's no longer needed
- **Lesson**: Always clean up after completing a task - don't leave "rubbish code"

## Keep Regression Tests for Future Development

- **Problem**: Removed debug tests that could be useful for regression testing
- **Solution**: Keep focused debug tests as regression tests for future functionality
- **Lesson**: Debug tests serve as valuable regression tests when adding new features

## Only Create Multiple Hooks When Really Necessary

- **Problem**: Created unnecessary hook abstractions that added complexity
- **Solution**: Use existing hooks and only create new ones when there's a clear, specific need
- **Lesson**: Keep the number of hooks minimal - only create new ones when absolutely necessary

# Generic Lessons Learned

## React and Hooks Best Practices

### Follow React Rules of Hooks Strictly

- **Problem**: Hooks called inside callbacks causing "Rules of Hooks" violations
- **Solution**:
  - Move all hooks to top level of components
  - Never call hooks inside loops, conditions, or nested functions
  - Use custom hooks to encapsulate complex logic
- **Lesson**: Never call hooks inside loops, conditions, or nested functions

### Prevent Infinite Re-renders and Stale Closures

- **Problem**: Missing dependencies in useEffect causing infinite re-renders and stale closures
- **Solution**:
  - Include all dependencies in useEffect dependency arrays
  - Use ESLint exhaustive-deps rule to catch missing dependencies
  - Use useCallback and useMemo for expensive operations
  - Consider using useRef for values that shouldn't trigger re-renders
- **Lesson**: Always include all variables used inside useEffect in the dependency array

### Keep Hooks Simple and Minimal

- **Problem**: Created complex hook abstractions and unnecessary multiple hooks
- **Solution**:
  - Use existing hooks when possible
  - Only create new hooks when there's a clear, specific need
  - Avoid hook dependencies unless absolutely necessary
  - Simplify complex state management
- **Lesson**: Keep hooks simple, focused, and minimal - avoid over-engineering

## Testing Best Practices

### Use Reliable Test Selectors

- **Problem**: Tests failing due to text-based selectors being fragile
- **Solution**:
  - Add `data-testid` attributes to all key UI elements
  - Use semantic selectors when possible (role, label)
  - Avoid text-based selectors that can change
  - Create reusable test utilities for common selectors
- **Lesson**: Data-testid attributes are more reliable than text-based selectors

### Add Proper Timeouts to E2E Tests

- **Problem**: Tests timing out due to network delays and page loading
- **Solution**:
  - Add explicit timeouts to all E2E test operations
  - Use appropriate wait strategies (waitForSelector, waitForLoadState)
  - Handle network delays gracefully
  - Set reasonable timeout values for different operations
- **Lesson**: Always add appropriate timeouts for network operations and page loading

### Create Focused and Independent Tests

- **Problem**: Complex tests failing without clear indication of where the issue was
- **Solution**:
  - Create simple debug tests to isolate specific functionality
  - Make tests independent and not rely on execution order
  - Remove tests that rely on data from other parallel tests
  - Keep regression tests for future development
- **Lesson**: Create focused, independent tests that isolate and confirm specific functionality

### Test the Actual User Flow

- **Problem**: Testing technical steps instead of user workflows
- **Solution**:
  - Test complete user journeys from start to finish
  - Include realistic timing and user interactions
  - Test edge cases and error scenarios
  - Validate user experience, not just technical functionality
- **Lesson**: Test the actual user flow, not just technical steps

## Code Quality and Maintenance

### Fix Linter and TypeScript Errors Immediately

- **Problem**: Accumulated linter errors making code harder to maintain
- **Solution**:
  - Fix all TypeScript and ESLint errors as they appear
  - Use proper type assertions like `as unknown as Type`
  - Never use `as any` - use proper TypeScript patterns
  - Run linter checks before committing code
- **Lesson**: Keep code clean and error-free from the start

### Keep API Types Clean

- **Problem**: Modified API types to accommodate implementation details
- **Solution**:
  - Keep API types clean and domain-focused
  - Handle implementation details separately
  - Use type guards and validation for runtime type checking
  - Separate domain types from implementation types
- **Lesson**: API types should reflect the domain, not implementation details

### Clean Up Unused Code Immediately

- **Problem**: Left unused hooks and components after refactoring
- **Solution**:
  - Remove unused code as soon as it's no longer needed
  - Use tools to detect unused imports and variables
  - Refactor incrementally and clean up after each step
  - Keep codebase lean and maintainable
- **Lesson**: Always clean up after completing a task - don't leave "rubbish code"

## Data Management and Architecture

### Centralize Data Fetching Logic

- **Problem**: Duplicate data fetching logic scattered across components
- **Solution**:
  - Centralize data fetching in custom hooks
  - Make UI components pure and focused on presentation
  - Use consistent data fetching patterns
  - Implement proper error handling and loading states
- **Lesson**: Keep data fetching logic centralized in hooks, make UI components pure

### Keep Data Flow Simple and Straightforward

- **Problem**: Created multiple hooks that referenced each other, making data flow complex
- **Solution**:
  - Use single, focused hooks that don't depend on each other unless absolutely necessary
  - Minimize hook dependencies
  - Keep data flow linear and predictable
  - Avoid unnecessary complexity in state management
- **Lesson**: Data flow should be simple and straightforward - avoid unnecessary hook dependencies

### Question Complex State Management

- **Problem**: Complex state management causing re-render issues
- **Solution**:
  - Question whether complex state management is actually needed
  - Simplify state management and remove unnecessary complexity
  - Use simpler solutions when possible
  - Consider if the complexity adds real value
- **Lesson**: Question whether complex state management is actually needed

## User Experience and Feedback

### Listen to User Feedback Immediately

- **Problem**: Ignored user feedback about infinite re-renders
- **Solution**:
  - Immediately investigate user-reported issues
  - Treat user feedback as valuable insights
  - Test user-reported scenarios thoroughly
  - Prioritize user experience issues
- **Lesson**: User feedback is often accurate - investigate immediately

### Listen to User Observations

- **Problem**: User correctly identified UI behavior issues
- **Solution**:
  - Pay attention to user observations about UI behavior
  - Use user insights to understand root causes
  - Test scenarios based on user observations
  - Consider user perspective when debugging issues
- **Lesson**: User observations often point to the root cause - investigate them immediately

## Documentation and Process

### Update Documentation After Completing Tasks

- **Problem**: Documentation not reflecting current state
- **Solution**:
  - Update documentation after each major completion
  - Keep documentation in sync with actual progress
  - Document decisions and rationale
  - Maintain up-to-date technical documentation
- **Lesson**: Keep documentation in sync with actual progress

### Break Problems Into Smaller Chunks

- **Problem**: Trying to solve multiple issues simultaneously
- **Solution**:
  - Focus on one specific issue at a time
  - Solve problems incrementally
  - Test each fix before moving to the next
  - Avoid trying to fix everything together
- **Lesson**: Solve one problem at a time - don't try to fix everything together

## SSR and Hydration

### Handle SSR and Client-Side Differences

- **Problem**: Hydration errors due to browser-specific APIs during SSR
- **Solution**:
  - Always provide safe defaults during SSR
  - Set actual values in useEffect after hydration
  - Avoid using browser-specific APIs during SSR initialization
  - Use proper client-side detection patterns
- **Lesson**: Avoid using browser-specific APIs during SSR initialization to prevent hydration mismatches

### Test Navigation Flows Thoroughly

- **Problem**: Issues only occur during specific navigation patterns
- **Solution**:
  - Create comprehensive tests that cover navigation between pages
  - Test menu clicks and rapid navigation
  - Test specific user flows that trigger issues
  - Validate navigation behavior in different states
- **Lesson**: Test the actual user flows that trigger issues, not just isolated functionality

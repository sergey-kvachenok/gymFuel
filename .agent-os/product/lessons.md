# Lessons Learned

This file stores lessons and corrections learned from user feedback to avoid repeating mistakes.

## Development Process

- **Listen to User Feedback Immediately - Don't Over-Engineer**: When users point out issues or suggest simpler approaches, implement them immediately. Complex solutions often create more problems than they solve.

- **Prevent Infinite Re-renders in React Hooks**: When using `useCallback` with async functions, move the async logic inside `useEffect` to prevent infinite re-renders. The pattern `useEffect(() => { const fetchData = async () => { ... }; fetchData(); }, [deps])` is safer than `useCallback(async () => { ... }, [deps])`.

- **Don't Modify Core API Types for Implementation Details**: Adding fields like `isOfflineOnly` to core types can cause conflicts with database schemas and other systems. Keep implementation details separate from core data models.

- **Fix Linter Errors Immediately - Don't Accumulate Technical Debt**: Address TypeScript and linter errors as they appear. Accumulating errors makes the codebase harder to work with and can mask real issues.

- **Question Complex State Management - Prefer Simple Conditionals**: Instead of complex state management patterns, prefer simple conditional logic like `isOnline ? serverData : offlineData`. This is more readable and less error-prone.

- **Understand Authentication Contexts - Server vs Client**: Server-side operations (tRPC) use `getServerSession()` and JWT tokens automatically, while client-side operations need explicit session management. Don't add unnecessary complexity like `SessionProvider` if you're only doing server-side operations.

- **Centralize Authentication Logic in Utility Functions**: Create reusable utility functions like `getCurrentUserId()` and `getCurrentSession()` to avoid duplicating session logic across components. This makes the code more maintainable and consistent.

- **Never Use Mock/Hardcoded Data - Always Use Real Data**: Never use placeholder values like `const userId = 1` or mock data. Always implement proper data fetching and use real, correct data from the appropriate sources (sessions, APIs, databases). Mock data creates bugs and security issues.

- **Always Include All Dependencies in React Hook Arrays**: Never ignore React hook dependency warnings. Always include all variables used inside useEffect, useCallback, and useMemo in their dependency arrays. Missing dependencies cause stale closures, infinite re-renders, and hard-to-debug bugs.

## Architecture

- **Hybrid Data Layer Pattern**: Use `isOnline ? serverData : offlineData` for simple, effective offline/online data switching.

- **Keep Offline Services Parameter-Based**: Design offline data services to accept `userId` as a parameter rather than trying to access authentication context internally.

- **Separate Concerns**: Keep server-side authentication (JWT tokens) separate from client-side state management.

- **Pass User ID as Props**: Instead of complex context or global state, pass user ID as props from server components to client components that need it.

## Implementation Workflow Lessons

### Planning Before Implementation

- **Lesson**: Never start writing code during planning or documentation creation
- **Context**: Always discuss all details, requirements, and implementation approach first
- **Action**: Ask "Should I implement the discussed functionality?" before proceeding
- **Date**: [Date when learned]

### Don't Start Coding Without Permission

- **Lesson**: Never begin implementing code when user only asks planning questions like "what's next?"
- **Context**: User asked "what's next?" and I immediately started writing User Profile code without being asked to implement anything
- **Action**: Always answer planning questions with plans/recommendations only. Wait for explicit request like "implement this" or "build the profile feature" before writing any code
- **Date**: 2025-01-27

## Code Style Lessons

### General Practices

- **Lesson**: [Add specific lessons here]
- **Context**: [When/why this lesson was learned]
- **Action**: [What to do differently next time]
- **Date**: [Date when learned]

## Communication Lessons

### User Interaction

- **Lesson**: Always clarify user intent before taking action, especially when questions could be informational vs. implementation requests
- **Context**: User asked "we still have no sw, right?" which was an informational question about current state, but I immediately started planning and implementing the service worker without being asked to do so
- **Action**: When user asks status questions like "do we have X?" or "is Y implemented?", provide a clear answer about current state and wait for explicit implementation request before proceeding with any code changes
- **Date**: 2025-08-10

## Technical Lessons

### Framework-Specific

- **Lesson**: [Add specific lessons here]
- **Context**: [When/why this lesson was learned]
- **Action**: [What to do differently next time]
- **Date**: [Date when learned]

## Documentation Lessons

### Spec and Task Documentation

- **Lesson**: Always document implementation changes and decisions in a "Changes" section within spec and task files
- **Context**: During PWA implementation, we made improvements (service worker hook refactoring, dependency adjustments) that weren't in the original spec but improved code quality
- **Action**: Add a "Changes" section to both spec.md and tasks.md files to track implementation decisions, modifications, and additional work done beyond original requirements. This maintains visibility of both original planning and actual implementation decisions.
- **Date**: 2025-08-10

### Code Style Guide Compliance

- **Lesson**: Always read @code-style.md and relevant sub-style guides before starting any implementation
- **Context**: Implemented offline banner features without reading code style guide first, missing important style and best practice requirements
- **Action**: Before any code implementation, always:
  1. Read @code-style.md
  2. Check @lessons.md for relevant lessons
  3. Read technology-specific style guides (React, TypeScript, Tailwind, etc.)
  4. Follow the conditional blocks in code-style.md for the technologies being used
- **Date**: 2025-08-10

### File Management and Corrections

- **Lesson**: NEVER create duplicate files when fixing existing code. Always modify the original file directly and avoid file duplication
- **Context**: When correcting OfflineBanner.tsx for style guide compliance, created a duplicate file "OfflineBanner-corrected.tsx" instead of fixing the original, creating codebase clutter
- **Action**: When fixing existing code:
  1. Modify the original file directly using search_replace or edit tools
  2. NEVER create duplicate files with modified names (e.g., "-corrected", "-fixed", "-new")
  3. Clean up any accidentally created duplicates immediately
  4. Keep the codebase clean and avoid confusion
- **Date**: 2025-08-10

### Clean HTML/CSS Structure

- **Lesson**: Avoid unnecessary wrapper elements and redundant styles - keep DOM structure minimal and efficient
- **Context**: OfflineBanner component initially had unnecessary nested div wrapper that duplicated flexbox styles instead of combining them into a single element
- **Action**: When creating components:
  1. Use single wrapper elements when possible instead of nested containers
  2. Combine related CSS classes into one element rather than creating extra divs
  3. Question if each wrapper serves a distinct purpose
  4. Prefer flat DOM structure over deeply nested elements for better performance and maintainability
- **Date**: 2025-08-10

### Type/Interface Reuse

- **Lesson**: Always check for existing types/interfaces before creating new ones - reuse and extend existing types instead of duplicating them
- **Context**: Initially created duplicate interfaces `OfflineProduct`, `OfflineConsumption`, `OfflineNutritionGoals` when identical types already existed in `src/types/api.ts`
- **Action**: Before creating new interfaces or types:
  1. Search codebase for existing similar interfaces (grep for interface names)
  2. Check if existing types can be reused or extended
  3. If types need slight modifications, extend existing ones rather than duplicating
  4. Ensure consistency between related data structures (server DB vs IndexedDB)
  5. Follow DRY principle - single source of truth for data types
- **Date**: 2025-08-10

### Avoid "any" Type - Use Proper Type Definitions

- **Lesson**: Never use `any` type to work around unknown return types - always create proper interfaces/types
- **Context**: During sync service implementation, initially used `(result as any)` to access properties on unknown tRPC response instead of defining proper types
- **Action**: When working with unknown types from external libraries/APIs:
  1. Define proper interfaces that match the expected response structure
  2. Use type assertions with specific types (e.g., `as BatchSyncResult`) instead of `any`
  3. Check code style guides - they explicitly forbid `any` type usage
  4. Create reusable type definitions for API responses/external data structures
  5. Use `unknown` as return type initially, then narrow with proper type assertions
- **Date**: 2025-08-10

### Question Unnecessary Abstraction Layers

- **Lesson**: Critically evaluate if wrapper functions/classes add value or just increase complexity
- **Context**: Created `use-offline-mutations` hook that was essentially just wrapping `OfflineDataService` without adding significant value, creating unnecessary indirection
- **Action**: Before creating abstraction layers:
  1. Ask "Does this abstraction simplify the code or add unnecessary complexity?"
  2. Check if the wrapper provides clear benefits (error handling, state management, etc.)
  3. Consider if direct usage of underlying service would be cleaner
  4. Remove abstraction layers that don't provide clear value
  5. Focus on single responsibility principle - each layer should have a distinct purpose
- **Date**: 2025-08-10

### Work WITH TypeScript, Not Against It - Use Proper Schema Design

- **Lesson**: When dealing with dynamic data, define proper schemas instead of fighting TypeScript with `any`/`unknown`
- **Context**: Initially tried to handle sync operations using `unknown` data types and `any` casts, creating type errors and fighting against TypeScript's type system. User correctly pointed out this was the wrong approach.
- **Action**: When handling dynamic/variable data structures:
  1. Define explicit Zod schemas for each data variant (ProductDataSchema, ConsumptionDataSchema, etc.)
  2. Use union types and proper type guards instead of `any`/`unknown`
  3. Let TypeScript infer types from Zod schemas (`z.infer<typeof Schema>`)
  4. Validate data at runtime with Zod, get compile-time safety with TypeScript
  5. If you're fighting TypeScript extensively, step back and reconsider the approach
  6. TypeScript errors usually indicate design issues, not TypeScript limitations
- **Benefits**: Type safety, runtime validation, better maintainability, cleaner code
- **Date**: 2025-08-10

### Listen to User Feedback Immediately - Don't Over-Engineer

- **Lesson**: When user suggests a simpler approach, implement it immediately instead of over-engineering
- **Context**: User suggested `isOnline ? trpc.data : offlineData` pattern, but I initially implemented complex offline change tracking with `OfflineChange<T>` interfaces and infinite re-render issues
- **Action**: When user provides feedback:
  1. Stop current implementation immediately
  2. Implement the user's suggested approach first
  3. Only add complexity if the simple approach doesn't work
  4. User feedback is often the most efficient solution
  5. Don't assume complex solutions are better than simple ones
- **Date**: 2025-01-27

### Prevent Infinite Re-renders in React Hooks

- **Lesson**: Avoid creating infinite re-render loops with `useCallback` and `useEffect` dependencies
- **Context**: Created `useCallback` with dependencies that caused infinite re-renders, then hit the 3-attempt limit trying to fix TypeScript errors
- **Action**: When creating hooks with async operations:
  1. Move async functions inside `useEffect` to avoid dependency cycles
  2. Keep `useEffect` dependencies minimal and stable
  3. Test for re-render issues early in development
  4. Use `useMemo` for expensive calculations, not for async operations
  5. If you hit the 3-attempt limit, step back and simplify the approach
- **Date**: 2025-01-27

### Don't Modify Core API Types for Implementation Details

- **Lesson**: Never add implementation-specific fields to core API types that are used by Prisma
- **Context**: Added `isOfflineOnly?: boolean` to Product, Consumption, and NutritionGoals interfaces, which could cause Prisma schema mismatches
- **Action**: When working with database types:
  1. Keep Prisma-generated types clean and unmodified
  2. Create separate types for internal implementation if needed
  3. Use type composition (extends) rather than modification
  4. Consider if the field is actually needed or if there's a simpler approach
  5. Database types should match the actual database schema
- **Date**: 2025-01-27

### Fix Linter Errors Immediately - Don't Accumulate Technical Debt

- **Lesson**: Address TypeScript/linter errors immediately when they're simple fixes
- **Context**: Let TypeScript errors accumulate in offline data service, hit the 3-attempt limit, and had to leave errors unfixed
- **Action**: When encountering linter errors:
  1. Fix simple errors immediately (unused imports, type mismatches)
  2. Don't let technical debt build up
  3. Address issues one at a time systematically
  4. If you hit the 3-attempt limit, document the issue and move on
  5. Simple fixes prevent complex debugging later
- **Date**: 2025-01-27

### Question Complex State Management - Prefer Simple Conditionals

- **Lesson**: Simple conditional logic is often better than complex state synchronization
- **Context**: Initially implemented complex offline change tracking and data merging when `isOnline ? trpc.data : offlineData` worked perfectly
- **Action**: When designing data flow:
  1. Start with the simplest conditional approach
  2. Ask "Can this be solved with a simple if/else?"
  3. Avoid complex state synchronization unless absolutely necessary
  4. Direct data source selection is cleaner than complex merging logic
  5. Test the simple approach before adding complexity
- **Date**: 2025-01-27

---

## How to Use This File

1. **Add new lessons** when user provides feedback about incorrect behavior
2. **Reference this file** before starting similar tasks to avoid repeating mistakes
3. **Update existing lessons** if additional context or corrections are provided
4. **Review regularly** to ensure lessons are being applied consistently

## Pre-Implementation Checklist

**MANDATORY: Complete this checklist BEFORE writing ANY code**

### Code Style Verification ✓

- [ ] **TypeScript**: Use arrow functions (`const func = () => {}`) NOT function declarations (`function func() {}`)
- [ ] **TypeScript**: Define proper types/interfaces, NEVER use `any` - create Zod schemas when needed
- [ ] **TypeScript**: Use proper type inference (`z.infer<typeof Schema>`) instead of `unknown`
- [ ] **React**: Use `FC` type annotation for components
- [ ] **Imports**: Group by type (3rd party, project, relative) with blank lines between groups
- [ ] **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces
- [ ] **Functions**: End arrow function blocks with semicolon (`;`)

### Architecture & Design ✓

- [ ] **Types**: Search for existing types/interfaces before creating new ones - reuse when possible
- [ ] **Abstraction**: Question if wrapper layers add value or just complexity
- [ ] **TypeScript**: If fighting TypeScript extensively, step back and reconsider approach
- [ ] **Documentation**: Add "Changes" section to spec/task files for implementation decisions

### File Management ✓

- [ ] **Corrections**: NEVER create duplicate files (-corrected, -new) - modify originals directly
- [ ] **Structure**: Avoid unnecessary wrapper elements - keep DOM flat and efficient
- [ ] **Cleanup**: Remove unused imports and temporary files

**🔥 If you violate these guidelines, the user WILL call you out. Follow them religiously!**

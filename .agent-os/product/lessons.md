# Lessons Learned

This file stores lessons and corrections learned from user feedback to avoid repeating mistakes.

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

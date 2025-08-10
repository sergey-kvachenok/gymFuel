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

---

## How to Use This File

1. **Add new lessons** when user provides feedback about incorrect behavior
2. **Reference this file** before starting similar tasks to avoid repeating mistakes
3. **Update existing lessons** if additional context or corrections are provided
4. **Review regularly** to ensure lessons are being applied consistently

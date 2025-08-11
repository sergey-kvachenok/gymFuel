# Code Style Guide

## Context

Global code style rules for Agent OS projects.

## Implementation Workflow

### Planning and Discussion Phase

- **NEVER start writing code during planning or documentation creation**
- Always discuss all details, requirements, and implementation approach first
- Ask clarifying questions to understand the full scope and requirements
- Present the proposed solution and get confirmation before proceeding
- **Review `@lessons.md`** to check for relevant lessons before planning similar tasks

### Implementation Confirmation

- After planning and discussion, ask: **"Should I implement the discussed functionality?"**
- Only proceed with code implementation after receiving a positive confirmation
- If the answer is negative or unclear, continue discussing until requirements are clear

### Code Writing Guidelines

- Only write code after explicit confirmation to implement
- Follow all style guidelines below when implementing
- Break down complex implementations into smaller, manageable tasks
- **Check `@lessons.md` file** before starting any task to avoid repeating previous mistakes
- **Refer to `@remember-lesson.md`** for guidance on learning from feedback and avoiding repeated errors

### Lead Senior Software Developer Review Phase

After completing a task and its subtasks, the agent should switch to the role of a **Lead Senior Software Developer** and perform a critical code review:

#### Review Process

1. **Act as Lead Senior Software Developer**:
   - Review all code changes made during the task
   - Apply senior-level software engineering principles
   - Consider code quality, maintainability, and best practices

2. **Review Against Standards**:
   - Check compliance with `@code-style.md` guidelines
   - Verify adherence to lessons learned in `@lessons.md`
   - Assess architectural decisions and patterns used
   - Evaluate error handling and edge cases
   - Review test coverage and quality

3. **Document Review Findings**:
   - Create `review.md` in the spec folder if it doesn't exist
   - Document all findings, suggestions, and potential improvements
   - Include severity levels (Critical, High, Medium, Low)
   - Provide specific recommendations for fixes

4. **Implementation Agent Response**:
   - The previous implementation agent should review the findings
   - Address all relevant suggestions and fix issues
   - Update code based on senior developer feedback
   - Document what was fixed and what was rejected (with rationale)

5. **Comprehensive E2E Testing**:
   - Write detailed e2e tests covering the entire flow
   - Test all user scenarios and edge cases
   - Ensure tests are robust and reliable
   - Fix any test failures before proceeding

#### Review Documentation Format

```markdown
# Code Review - [Task Name]

**Reviewer**: Lead Senior Software Developer  
**Date**: [YYYY-MM-DD]  
**Task**: [Task Description]

## Critical Issues

- [ ] **Critical**: [Description of critical issue]

## High Priority Issues

- [ ] **High**: [Description of high priority issue]

## Medium Priority Issues

- [ ] **Medium**: [Description of medium priority issue]

## Low Priority Issues

- [ ] **Low**: [Description of low priority issue]

## Positive Findings

- [x] [Positive aspect of the implementation]

## Recommendations

1. [Specific recommendation with rationale]
2. [Specific recommendation with rationale]

## Test Coverage Assessment

- [ ] Unit tests cover all new functionality
- [ ] E2E tests cover complete user flows
- [ ] Error scenarios are properly tested
- [ ] Edge cases are handled and tested
```

#### Role Switching Guidelines

- **Clear Role Separation**: When switching to Lead Senior Developer role, explicitly state the role change
- **Objective Perspective**: Review code as if it was written by another developer
- **Constructive Feedback**: Provide actionable, specific feedback
- **Knowledge Integration**: Apply both `@code-style.md` and `@lessons.md` insights
- **Quality Focus**: Prioritize code quality, maintainability, and user experience

This review process ensures that all code meets senior-level standards and incorporates lessons learned from previous development cycles.

<conditional-block context-check="general-formatting">
IF this General Formatting section already read in current context:
  SKIP: Re-reading this section
  NOTE: "Using General Formatting rules already in context"
ELSE:
  READ: The following formatting rules

## General Formatting

### Indentation

- Use 2 spaces for indentation (never tabs)
- Maintain consistent indentation throughout files
- Align nested structures for readability

### Naming Conventions

- **Methods and Variables**: Use camelCase (e.g., `userProfile`, `calculateTotal`)
- **Classes and Modules**: Use PascalCase (e.g., `UserProfile`, `PaymentProcessor`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)

### String Formatting

- Use single quotes for strings: `'Hello World'`
- Use double quotes only when interpolation is needed
- Use template literals for multi-line strings or complex interpolation

### Code Comments

- Add brief comments above non-obvious business logic
- Document complex algorithms or calculations
- Explain the "why" behind implementation choices
- Never remove existing comments unless removing the associated code
- Update comments when modifying code to maintain accuracy
- Keep comments concise and relevant
  </conditional-block>

<conditional-block task-condition="html-css-tailwind" context-check="html-css-style">
IF current task involves writing or updating HTML, CSS, or TailwindCSS:
  IF html-style.md AND css-style.md already in context:
    SKIP: Re-reading these files
    NOTE: "Using HTML/CSS style guides already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get HTML formatting rules from code-style/html-style.md"
        REQUEST: "Get CSS and TailwindCSS rules from code-style/css-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ the following style guides (only if not already in context):
        - @~/.agent-os/standards/code-style/html-style.md (if not in context)
        - @~/.agent-os/standards/code-style/css-style.md (if not in context)
    </context_fetcher_strategy>
ELSE:
  SKIP: HTML/CSS style guides not relevant to current task
</conditional-block>

<conditional-block task-condition="typescript" context-check="typescript-style">
IF current task involves writing or updating TypeScript:
  IF typescript-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using TypeScript style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get TypeScript style rules from code-style/typescript-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @~/.agent-os/standards/code-style/typescript-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: TypeScript style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="react-nextjs" context-check="react-style">
IF current task involves writing or updating React or Next.js components:
  IF react-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using React/Next.js style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get React/Next.js style rules from code-style/react-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @~/.agent-os/standards/code-style/react-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: React/Next.js style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="indexeddb" context-check="indexeddb-style">
IF current task involves writing or updating IndexedDB code:
  IF indexeddb-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using IndexedDB style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get IndexedDB style rules from code-style/indexeddb-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @~/.agent-os/standards/code-style/indexeddb-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: IndexedDB style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="nextauth" context-check="nextauth-style">
IF current task involves writing or updating NextAuth code:
  IF nextauth-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using NextAuth style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get NextAuth style rules from code-style/nextauth-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @~/.agent-os/standards/code-style/nextauth-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: NextAuth style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="prisma" context-check="prisma-style">
IF current task involves writing or updating Prisma code:
  IF prisma-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using Prisma style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get Prisma style rules from code-style/prisma-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @~/.agent-os/standards/code-style/prisma-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: Prisma style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="pwa" context-check="pwa-style">
IF current task involves writing or updating PWA features:
  IF pwa-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using PWA style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get PWA style rules from code-style/pwa-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @~/.agent-os/standards/code-style/pwa-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: PWA style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="react-query" context-check="react-query-style">
IF current task involves writing or updating React Query code:
  IF react-query-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using React Query style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get React Query style rules from code-style/react-query-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @~/.agent-os/standards/code-style/react-query-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: React Query style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="tailwindcss" context-check="tailwindcss-style">
IF current task involves writing or updating Tailwind CSS code:
  IF tailwindcss-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using Tailwind CSS style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get Tailwind CSS style rules from code-style/tailwindcss-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @~/.agent-os/standards/code-style/tailwindcss-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: Tailwind CSS style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="testing" context-check="testing-style">
IF current task involves writing or updating tests:
  IF testing-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using Testing style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get Testing style rules from code-style/testing-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @~/.agent-os/standards/code-style/testing-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: Testing style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="trpc" context-check="trpc-style">
IF current task involves writing or updating tRPC code:
  IF trpc-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using tRPC style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get tRPC style rules from code-style/trpc-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @~/.agent-os/standards/code-style/trpc-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: tRPC style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="zod" context-check="zod-style">
IF current task involves writing or updating Zod validation code:
  IF zod-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using Zod style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get Zod style rules from code-style/zod-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @~/.agent-os/standards/code-style/zod-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: Zod style guide not relevant to current task
</conditional-block>

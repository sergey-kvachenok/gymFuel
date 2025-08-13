---
description: Rules to execute a task and its sub-tasks using Agent OS with role-switching
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Task Execution Rules

## Overview

Execute a specific task along with its sub-tasks systematically following a **single-agent role-switching workflow** with three distinct roles that the AI assistant switches between until the task is correctly implemented.

## Shared Agent Workflow Concepts

**REFERENCE**: @~/.agent-os/instructions/core/shared-agent-workflow.md

**IMPORTANT**: Before executing any task, you MUST investigate and understand the shared agent workflow concepts from the referenced file. This file contains essential information including:

- Multi-Agent Role System (roles, responsibilities, problem-solving guidelines)
- Role-Switching Workflow (6-phase process with role indicators)
- Role-Switching Instructions (how to switch, context preservation, stuck situation handling)
- Agent Communication and Documentation (documentation requirements, context management)
- Critical Requirements (completion validation, role switching, test execution safety)
- File Formats (technical implementation template)

**INSTRUCTION**: Read and follow all rules and guidelines from the shared workflow file during task implementation. Apply the role-switching system, critical requirements, and safety protocols as specified in that file.

## Process Flow

<process_flow>

<step number="1" name="task_understanding">

### Step 1: Task Understanding

Read and analyze the given parent task and all its sub-tasks from tasks.md to gain complete understanding of what needs to be built.

<task_analysis>
<read_from_tasks_md> - Parent task description - All sub-task descriptions - Task dependencies - Expected outcomes
</read_from_tasks_md>
</task_analysis>

<instructions>
  ACTION: Read the specific parent task and all its sub-tasks
  ANALYZE: Full scope of implementation required
  UNDERSTAND: Dependencies and expected deliverables
  NOTE: Test requirements for each sub-task
</instructions>

</step>

<step number="2" name="technical_spec_review">

### Step 2: Technical Specification Review

Search and extract relevant sections from technical-spec.md and technical-implementation.md to understand the technical implementation approach for this task.

<selective_reading>
<search_technical_spec>
FIND sections in technical-spec.md related to: - Current task functionality - Implementation approach for this feature - Integration requirements - Performance criteria
</search_technical_spec>
<search_technical_implementation>
FIND sections in technical-implementation.md related to: - Solution rationale and chosen approach - Pros and cons of selected solution - Comparison with alternative approaches - Technical decision factors - Implementation details and considerations
</search_technical_implementation>
</selective_reading>

<instructions>
  ACTION: Search technical-spec.md and technical-implementation.md for task-relevant sections
  EXTRACT: Implementation details and decision rationale for current task
  SKIP: Unrelated technical specifications
  FOCUS: Technical approach and reasoning for this specific feature
  UNDERSTAND: Why this solution was chosen and what alternatives were considered
</instructions>

</step>

<step number="3" subagent="context-fetcher" name="lessons_and_best_practices_review">

### Step 3: Lessons and Best Practices Review

Use the context-fetcher subagent to retrieve relevant lessons from @~/.agent-os/product/lessons.md and sections from @~/.agent-os/standards/best-practices.md that apply to the current task's technology stack and feature type.

<selective_reading>
<search_lessons>
FIND lessons relevant to: - Current task type - Technology stack being used - Implementation patterns - Previously encountered issues
</search_lessons>
<search_best_practices>
FIND sections relevant to: - Task's technology stack - Feature type being implemented - Testing approaches needed - Code organization patterns
</search_best_practices>
</selective_reading>

<instructions>
  ACTION: Use context-fetcher subagent
  REQUEST: "Find relevant lessons from lessons.md for:
            - Task type: [CURRENT_TASK_TYPE]
            - Technology stack: [CURRENT_TECH]
            - Implementation patterns being used
            - Common mistakes to avoid"
  REQUEST: "Find best practices sections relevant to:
            - Task's technology stack: [CURRENT_TECH]
            - Feature type: [CURRENT_FEATURE_TYPE]
            - Testing approaches needed
            - Code organization patterns"
  PROCESS: Returned lessons and best practices
  APPLY: Relevant patterns and avoid documented mistakes
</instructions>

</step>

<step number="4" subagent="context-fetcher" name="code_style_review">

### Step 4: Code Style Review

Use the context-fetcher subagent to retrieve relevant code style rules from @~/.agent-os/standards/code-style.md for the languages and file types being used in this task.

<selective_reading>
<search_code_style>
FIND style rules for: - Languages used in this task - File types being modified - Component patterns being implemented - Testing style guidelines
</search_code_style>
</selective_reading>

<instructions>
  ACTION: Use context-fetcher subagent
  REQUEST: "Find code style rules for:
            - Languages: [LANGUAGES_IN_TASK]
            - File types: [FILE_TYPES_BEING_MODIFIED]
            - Component patterns: [PATTERNS_BEING_IMPLEMENTED]
            - Testing style guidelines"
  PROCESS: Returned style rules
  APPLY: Relevant formatting and patterns
</instructions>

</step>

<step number="5" name="task_execution">

### Step 5: Multi-Agent Task Execution

Execute the parent task and all sub-tasks using the multi-agent role system, switching between agents until the task is correctly implemented and all tests pass.

<typical_task_structure>
<first_subtask>Write tests for [feature]</first_subtask>
<middle_subtasks>Implementation steps</middle_subtasks>
<final_subtask>Verify all tests pass</final_subtask>
</typical_task_structure>

<execution_order>
<role_switching_cycle>
FOR each sub-task until completion:

<senior_developer_phase>
**SWITCH TO**: Senior Software Developer role
**PHASE**: Implementation
**ACTIONS**:

- Implement the sub-task functionality
- Write initial code and logic
- Ensure basic functionality works
- Document implementation approach
- Monitor performance and resource usage
  **ROLE INDICATOR**: [SENIOR DEVELOPER MODE]
  </senior_developer_phase>

<tech_lead_review_phase>
**SWITCH TO**: Tech Lead role
**PHASE**: Review
**ACTIONS**:

- Critically review the implementation
- Identify issues, bugs, and improvements
- Provide technical feedback and recommendations
- Document review findings in task spec folder
- Validate against requirements and best practices
- Check code quality and security compliance
  **ROLE INDICATOR**: [TECH LEAD MODE]
  </tech_lead_review_phase>

<senior_developer_fix_phase>
**SWITCH TO**: Senior Software Developer role
**PHASE**: Fixes
**ACTIONS**:

- Address Tech Lead feedback and issues
- Fix identified problems
- Improve code quality and architecture
- Ensure all review recommendations are implemented
- Optimize performance and maintainability
  **ROLE INDICATOR**: [SENIOR DEVELOPER MODE]
  </senior_developer_fix_phase>

<qa_testing_phase>
**SWITCH TO**: Senior QA Automation Engineer role
**PHASE**: Testing
**ACTIONS**:

- Implement comprehensive E2E tests
- Ensure test coverage and quality
- Run tests and validate functionality
- Use timeout protection to prevent stuck states
- **ALWAYS** use agent-timeout-protector.js for test execution
- **NEVER** run `npx playwright test` directly without protection
- **ALWAYS** implement TestTimeoutManager in test setup
- **NEVER** allow tests to run indefinitely
- Clean up test database after each test run
  **ROLE INDICATOR**: [QA ENGINEER MODE]
  </qa_testing_phase>

<resolution_phase>
**PHASE**: Resolution
IF tests fail due to code issues:
**SWITCH TO**: Senior Software Developer role
**ACTION**: Fix code issues identified by tests
ELSE IF tests fail due to test issues:
**SWITCH TO**: Senior QA Automation Engineer role
**ACTION**: Fix test implementation issues
ELSE IF all tests pass:
**ACTION**: Mark sub-task complete and proceed to next sub-task
ELSE:
**ACTION**: Continue fixing until all tests pass (NEVER mark complete with failing tests)
</resolution_phase>

<cleanup_phase>
**PHASE**: Cleanup
**SWITCH TO**: All roles as needed
**ACTIONS**:

- Remove dead code, console logs, and unnecessary code
- Clean up test database to initial state
- Remove temporary files and test artifacts
- Update documentation
- Verify code quality and performance
  </cleanup_phase>
  </role_switching_cycle>
  </execution_order>

<test_management>
<qa_agent_responsibility>
**Senior QA Automation Engineer Responsibility**:

- Write comprehensive E2E tests for each sub-task
- Ensure test coverage includes edge cases and error handling
- Implement timeout protection mechanisms
- Debug and fix test failures
- Maintain test infrastructure and best practices
- Clean up test environment after each test run
  </qa_agent_responsibility>

<test_coverage>
**Test Coverage Requirements**:

- Unit tests for individual components
- Integration tests for feature interactions
- E2E tests for complete user workflows
- Error handling and edge case scenarios
- Performance and reliability testing

**Test Completion Requirements**:

- **ALL TESTS MUST PASS**: No task can be marked complete with failing tests
- **100% PASS RATE**: Ensure all tests pass before proceeding
- **NO SKIPPED TESTS**: All tests must run and pass successfully
- **COMPREHENSIVE COVERAGE**: Tests must cover all implemented functionality
- **VALIDATION REQUIRED**: Final test run must confirm all tests pass
  </test_coverage>

<timeout_protection>
**Timeout Protection**:

- Use agent-timeout-protector.js for stuck test prevention
- Force termination after 30 seconds of no progress
- Automatic cleanup of stuck processes
- Agent recovery and continuation capabilities
  </timeout_protection>
  </test_management>

<instructions>
  ACTION: Execute sub-tasks using single-agent role-switching system
  SWITCH ROLES: Between Senior Software Developer, Tech Lead, and Senior QA Automation Engineer
  ANNOUNCE: Each role switch with clear role indicators
  IMPLEMENT: Code functionality (Senior Software Developer role)
  REVIEW: Implementation quality and correctness (Tech Lead role)
  FIX: Issues based on review feedback (Senior Software Developer role)
  TEST: Comprehensive E2E testing (Senior QA Automation Engineer role)
  RESOLVE: Test failures by switching to appropriate role
  DOCUMENT: All role decisions and reviews in task spec folder
  PROTECT: Use timeout mechanisms to prevent stuck states
  UPDATE: Mark each sub-task complete only after all tests pass
  CLEANUP: Remove dead code, console logs, and clean test environment
  
  **CRITICAL COMPLETION REQUIREMENT**:
  - **NEVER** mark a task or sub-task as complete if any tests are failing
  - **ALWAYS** resolve all test failures before proceeding to next task
  - **ALWAYS** ensure 100% test pass rate before marking complete
  - **NEVER** skip test failures or mark tasks complete with broken tests
  - **ALWAYS** fix code issues or test issues until all tests pass
  
  **ROLE SWITCHING REQUIREMENTS**:
  - **ALWAYS** announce role changes with role indicators (e.g., [SENIOR DEVELOPER MODE])
  - **ALWAYS** maintain context and previous work when switching roles
  - **ALWAYS** think and respond from the current role's perspective
  - **ALWAYS** document role switches in task documentation
  
  **STUCK SITUATION HANDLING**:
  - **MAXIMUM 3 ATTEMPTS**: Senior Developer tries up to 3 different approaches
  - **DOCUMENT ATTEMPTS**: Log what was tried and why it failed
  - **SEEK TECH LEAD ADVICE**: Switch to Tech Lead role for guidance when stuck
  - **IMPLEMENT ADVICE**: Switch back to Senior Developer and implement recommendations
  - **ITERATE UNTIL RESOLVED**: Continue this cycle until issue is solved
  
  **CRITICAL TEST EXECUTION SAFETY**:
  - **ALWAYS** use agent-timeout-protector.js for test execution
  - **NEVER** run `npx playwright test` directly without timeout protection
  - **ALWAYS** set reasonable timeouts (30-60 seconds maximum)
  - **NEVER** allow tests to run indefinitely
  - **ALWAYS** monitor test progress and force termination if stuck
  - **ALWAYS** clean up test database after each test run
</instructions>

</step>

<step number="6" subagent="test-runner" name="task_test_verification">

### Step 6: Task-Specific Test Verification

Use the test-runner subagent to run and verify only the tests specific to this parent task (not the full test suite) to ensure the feature is working correctly.

<focused_test_execution>
<run_only> - All new tests written for this parent task - All tests updated during this task - Tests directly related to this feature
</run_only>
<skip> - Full test suite (done later in execute-tasks.md) - Unrelated test files
</skip>
</focused_test_execution>

<final_verification>
IF any test failures: - Debug and fix the specific issue - Re-run only the failed tests
ELSE: - Confirm all task tests passing - Ready to proceed
</final_verification>

<instructions>
  ACTION: Use test-runner subagent
  REQUEST: "Run tests for [this parent task's test files]"
  WAIT: For test-runner analysis
  PROCESS: Returned failure information
  VERIFY: 100% pass rate for task-specific tests
  CONFIRM: This feature's tests are complete
</instructions>

</step>

<step number="7" name="final_cleanup">

### Step 7: Final Cleanup and Quality Assurance

Perform comprehensive cleanup and quality assurance before marking the task complete.

<cleanup_checklist>
<code_cleanup>

- Remove all console.log, console.debug, console.error statements
- Remove dead code and unused functions
- Remove commented-out code and temporary implementations
- Clean up unused imports and dependencies
- Remove unused variables and parameters
- Update documentation with changes
  </code_cleanup>

<test_environment_cleanup>

- Reset test database to initial state
- Remove all test data and temporary records
- Clean up temporary files and directories
- Terminate all test processes
- Clear caches and temporary storage
- Remove test artifacts
  </test_environment_cleanup>

<quality_assurance>

- Run code quality checks (ESLint, Prettier)
- Verify security compliance
- Check performance impact
- Validate accessibility standards
- Confirm test coverage requirements
- Review documentation updates
  </quality_assurance>
  </cleanup_checklist>

<instructions>
  ACTION: Perform comprehensive cleanup
  REMOVE: All console logs, dead code, and unnecessary code
  RESET: Test database to initial state
  CLEAN: Test environment and temporary files
  VERIFY: Code quality and security compliance
  UPDATE: Documentation with changes
  CONFIRM: All cleanup requirements met
</instructions>

</step>

<step number="8" name="task_status_updates">

### Step 8: Task Status Updates

Update the tasks.md file immediately after completing each task to track progress.

<update_format>
<completed>- [x] Task description</completed>
<incomplete>- [ ] Task description</incomplete>
<blocked> - [ ] Task description
⚠️ Blocking issue: [DESCRIPTION]
</blocked>
</update_format>

<blocking_criteria>
<attempts>maximum 3 different approaches</attempts>
<action>document blocking issue</action>
<emoji>⚠️</emoji>
</blocking_criteria>

<instructions>
  ACTION: Update tasks.md after each task completion
  MARK: [x] for completed items immediately
  DOCUMENT: Blocking issues with ⚠️ emoji
  LIMIT: 3 attempts before marking as blocked
  
  **TASK COMPLETION VALIDATION**:
  - **VERIFY**: All tests are passing before marking task complete
  - **CONFIRM**: No test failures exist for the completed task
  - **ENSURE**: 100% test pass rate for all task-related tests
  - **NEVER**: Mark task complete if any tests are failing
  - **ALWAYS**: Run final test verification before updating status
</instructions>

</step>

</process_flow>

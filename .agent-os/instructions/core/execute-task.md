---
description: Rules to execute a task and its sub-tasks using Agent OS
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Task Execution Rules

## Overview

Execute a specific task along with its sub-tasks systematically following a multi-agent development workflow with three distinct roles that switch until the task is correctly implemented.

## Multi-Agent Role System

### Agent Roles and Responsibilities

<agent_roles>
<senior_software_developer>
**Role**: Senior Software Developer
**Primary Responsibility**: Implement functionality and fix code issues
**Focus Areas**:

- Write and modify code
- Implement features according to specifications
- Fix bugs and issues identified by other agents
- Ensure code follows best practices
- Optimize performance and maintainability

**Test Execution Guidelines**:

- **ALWAYS** use agent-timeout-protector.js for test execution
- **NEVER** run `npx playwright test` directly without timeout protection
- **ALWAYS** use: `node tests/e2e/agent-timeout-protector.js <test-file> <test-name> <timeout-ms>`
- **NEVER** use: `npx playwright test --timeout=30000` (bypasses protection)
- **ALWAYS** set reasonable timeouts (30-60 seconds maximum)
- **NEVER** allow tests to run indefinitely
- **ALWAYS** monitor test progress and force termination if stuck
  </senior_software_developer>

<tech_lead>
**Role**: Tech Lead
**Primary Responsibility**: Critical review and technical guidance
**Focus Areas**:

- Review implemented code for correctness and completeness
- Identify architectural issues and design problems
- Provide technical feedback and recommendations
- Ensure adherence to technical specifications
- Validate implementation against requirements
- Document review findings and issues
  </tech_lead>

<senior_qa_automation_engineer>
**Role**: Senior QA Automation Engineer
**Primary Responsibility**: Test implementation and quality assurance
**Focus Areas**:

- Write comprehensive E2E tests
- Implement test automation frameworks
- Ensure test coverage and quality
- Debug test failures and issues
- Maintain test infrastructure
- Prevent agents from getting stuck with timeout protection

**Test Execution and Safety Guidelines**:

- **ALWAYS** use agent-timeout-protector.js for test execution
- **NEVER** run Playwright tests directly without timeout protection
- **ALWAYS** implement timeout protection in test code
- **NEVER** create tests that can run indefinitely
- **ALWAYS** monitor test progress and force termination if stuck
- **NEVER** leave processes hanging after test completion
- **ALWAYS** use TestTimeoutManager in test setup and teardown
- **NEVER** rely solely on Playwright's built-in timeouts
  </senior_qa_automation_engineer>
  </agent_roles>

### Agent Switching Workflow

<agent_workflow>
<phase_1_implementation>
**Phase 1: Implementation**
AGENT: Senior Software Developer
ACTION: Implement the task functionality
OUTCOME: Working implementation or identified issues
</phase_1_implementation>

<phase_2_review>
**Phase 2: Review**
AGENT: Tech Lead
ACTION: Critically review the implementation
OUTCOME: Feedback, issues, and recommendations
DOCUMENT: All findings in task spec folder
</phase_2_review>

<phase_3_fixes>
**Phase 3: Fixes**
AGENT: Senior Software Developer
ACTION: Fix code based on Tech Lead feedback
OUTCOME: Improved implementation addressing review issues
</phase_3_fixes>

<phase_4_testing>
**Phase 4: Testing**
AGENT: Senior QA Automation Engineer
ACTION: Implement comprehensive E2E tests
OUTCOME: Test coverage and validation
</phase_4_testing>

<phase_5_resolution>
**Phase 5: Resolution**
IF tests fail due to code issues:
AGENT: Senior Software Developer
ACTION: Fix code issues
ELSE IF tests fail due to test issues:
AGENT: Senior QA Automation Engineer
ACTION: Fix test implementation
</phase_5_resolution>
</agent_workflow>

### Agent Communication and Documentation

<agent_communication>
<documentation_requirements>

- All agent decisions must be documented in the task spec folder
- Tech Lead reviews must be saved as separate review files
- Agent conversations and feedback must be preserved
- Implementation changes must be tracked and justified
  </documentation_requirements>

<context_management>
**Context Management and Memory Preservation**:

- **Monitor Context Usage**: Continuously monitor agent context fill level
- **Context Threshold**: When context is filled more than 90%, trigger memory preservation
- **Memory File**: Create/update `memory.md` in task spec folder with current progress
- **Context Clearing**: Clear context after memory preservation to free space
- **Context Restoration**: Review necessary specs and memory.md to restore working context
- **Pipeline Continuity**: Ensure agents never lose scope of work in progress

**Memory Preservation Process**:

1. **Assess Context Level**: Check if context is >90% filled
2. **Summarize Progress**: Document current findings, conclusions, and next steps
3. **Write to Memory**: Update `memory.md` with structured progress summary
4. **Clear Context**: Free up context space for continued work
5. **Restore Context**: Review relevant specs and memory.md to restore working state
6. **Continue Work**: Resume task execution with full context awareness

**Memory File Format**:

```markdown
# Task Memory - [TASK_NAME]

## Current Status

- **Phase**: [Current agent phase]
- **Progress**: [Percentage complete]
- **Last Action**: [What was just completed]

## Key Findings

- [Finding 1]
- [Finding 2]

## Technical Conclusions

- [Conclusion 1]
- [Conclusion 2]

## Next Steps

- [Next step 1]
- [Next step 2]

## Blocking Issues

- [Issue 1] - [Status]
- [Issue 2] - [Status]

## Context Restoration Notes

- **Specs to Review**: [List of spec files]
- **Key Files Modified**: [List of modified files]
- **Test Status**: [Current test status]
```

**Context Restoration Checklist**:

- [ ] Review task spec and requirements
- [ ] Read memory.md for current progress
- [ ] Review any recent Tech Lead feedback
- [ ] Check current test status and failures
- [ ] Verify implementation state
- [ ] Confirm next steps from memory
- [ ] Resume work with full context awareness
      </context_management>

<review_format>
**Tech Lead Review Format**:

- Issues identified with severity levels
- Technical recommendations
- Code quality assessment
- Performance and security considerations
- Acceptance criteria validation
  </review_format>

<timeout_protection>
**QA Agent Timeout Protection**:

- Implement timeout mechanisms to prevent agent stuck states
- Force termination after 30 seconds of no progress
- Automatic cleanup of stuck processes
- Agent recovery and continuation capabilities
  </timeout_protection>

<test_execution_safety>
**Test Execution Safety Guidelines**:

**✅ SAFE Test Execution Commands**:

```bash
# Use agent timeout protector for safe test execution
node tests/e2e/agent-timeout-protector.js tests/e2e/feature.spec.ts "test name" 30000

# For specific test with timeout protection
node tests/e2e/agent-timeout-protector.js tests/e2e/offline-consumption-submission.spec.ts "should create consumption offline" 30000

# For debugging with timeout protection
node tests/e2e/agent-timeout-protector.js tests/e2e/feature.spec.ts --headed 60000
```

**❌ UNSAFE Test Execution Commands**:

```bash
# These bypass timeout protection and can cause agent stuck states
npx playwright test tests/e2e/feature.spec.ts --timeout=30000
npx playwright test --grep "test name" --timeout=30000
npx playwright test tests/e2e/feature.spec.ts --headed
```

**🛡️ Timeout Protection Features**:

- Automatic process monitoring and cleanup
- Force termination after 30 seconds of no progress
- Kills all Playwright processes on timeout
- Prevents agent stuck states
- Automatic recovery and continuation
  </test_execution_safety>
  </agent_communication>

<pre_flight_check>
EXECUTE: @~/.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

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

Search and extract relevant sections from technical-spec.md to understand the technical implementation approach for this task.

<selective_reading>
<search_technical_spec>
FIND sections in technical-spec.md related to: - Current task functionality - Implementation approach for this feature - Integration requirements - Performance criteria
</search_technical_spec>
</selective_reading>

<instructions>
  ACTION: Search technical-spec.md for task-relevant sections
  EXTRACT: Only implementation details for current task
  SKIP: Unrelated technical specifications
  FOCUS: Technical approach for this specific feature
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
<agent_cycle>
FOR each sub-task until completion:
<senior_developer_phase>
**Senior Software Developer Phase**:

- Implement the sub-task functionality
- Write initial code and logic
- Ensure basic functionality works
- Document implementation approach
  </senior_developer_phase>

<tech_lead_review_phase>
**Tech Lead Review Phase**:

- Critically review the implementation
- Identify issues, bugs, and improvements
- Provide technical feedback and recommendations
- Document review findings in task spec folder
- Validate against requirements and best practices
  </tech_lead_review_phase>

<senior_developer_fix_phase>
**Senior Software Developer Fix Phase**:

- Address Tech Lead feedback and issues
- Fix identified problems
- Improve code quality and architecture
- Ensure all review recommendations are implemented
  </senior_developer_fix_phase>

<qa_testing_phase>
**Senior QA Automation Engineer Phase**:

- Implement comprehensive E2E tests
- Ensure test coverage and quality
- Run tests and validate functionality
- Use timeout protection to prevent stuck states
- **ALWAYS** use agent-timeout-protector.js for test execution
- **NEVER** run `npx playwright test` directly without protection
- **ALWAYS** implement TestTimeoutManager in test setup
- **NEVER** allow tests to run indefinitely
  </qa_testing_phase>

<resolution_phase>
**Resolution Phase**:
IF tests fail due to code issues: - Switch back to Senior Software Developer - Fix code issues identified by tests
ELSE IF tests fail due to test issues: - Switch to Senior QA Automation Engineer - Fix test implementation issues
ELSE: - Mark sub-task complete - Proceed to next sub-task
</resolution_phase>
</agent_cycle>
</execution_order>

<test_management>
<qa_agent_responsibility>
**Senior QA Automation Engineer Responsibility**:

- Write comprehensive E2E tests for each sub-task
- Ensure test coverage includes edge cases and error handling
- Implement timeout protection mechanisms
- Debug and fix test failures
- Maintain test infrastructure and best practices
  </qa_agent_responsibility>

<test_coverage>
**Test Coverage Requirements**:

- Unit tests for individual components
- Integration tests for feature interactions
- E2E tests for complete user workflows
- Error handling and edge case scenarios
- Performance and reliability testing
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
  ACTION: Execute sub-tasks using multi-agent role system
  SWITCH: Between Senior Software Developer, Tech Lead, and Senior QA Automation Engineer
  IMPLEMENT: Code functionality (Senior Software Developer)
  REVIEW: Implementation quality and correctness (Tech Lead)
  FIX: Issues based on review feedback (Senior Software Developer)
  TEST: Comprehensive E2E testing (Senior QA Automation Engineer)
  RESOLVE: Test failures by switching to appropriate agent
  DOCUMENT: All agent decisions and reviews in task spec folder
  PROTECT: Use timeout mechanisms to prevent agent stuck states
  UPDATE: Mark each sub-task complete only after all tests pass
  
  **CRITICAL TEST EXECUTION SAFETY**:
  - **ALWAYS** use agent-timeout-protector.js for test execution
  - **NEVER** run `npx playwright test` directly without timeout protection
  - **ALWAYS** set reasonable timeouts (30-60 seconds maximum)
  - **NEVER** allow tests to run indefinitely
  - **ALWAYS** monitor test progress and force termination if stuck
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

<step number="7" name="task_status_updates">

### Step 7: Task Status Updates

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
</instructions>

</step>

</process_flow>

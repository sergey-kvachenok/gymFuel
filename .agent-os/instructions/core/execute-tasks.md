---
description: Rules to initiate execution of a set of tasks using Agent OS
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Task Execution Rules

## Overview

Initiate execution of one or more tasks for a given spec using a multi-agent development workflow with three distinct roles that switch until all tasks are correctly implemented.

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

- **Monitor Context Usage**: Continuously monitor agent context fill level during task execution
- **Context Threshold**: When context is filled more than 90%, trigger memory preservation
- **Memory File**: Create/update `memory.md` in task spec folder with current progress
- **Context Clearing**: Clear context after memory preservation to free space
- **Context Restoration**: Review necessary specs and memory.md to restore working context
- **Pipeline Continuity**: Ensure agents never lose scope of work in progress across multiple tasks

**Memory Preservation Process**:

1. **Assess Context Level**: Check if context is >90% filled
2. **Summarize Progress**: Document current findings, conclusions, and next steps
3. **Write to Memory**: Update `memory.md` with structured progress summary
4. **Clear Context**: Free up context space for continued work
5. **Restore Context**: Review relevant specs and memory.md to restore working state
6. **Continue Work**: Resume task execution with full context awareness

**Memory File Format for Multi-Task Execution**:

```markdown
# Multi-Task Memory - [SPEC_NAME]

## Current Task Status

- **Active Task**: [Current task being worked on]
- **Phase**: [Current agent phase]
- **Progress**: [Percentage complete for current task]
- **Last Action**: [What was just completed]

## Completed Tasks

- [Task 1] - ✅ Complete
- [Task 2] - ✅ Complete

## Pending Tasks

- [Task 3] - 🔄 In Progress
- [Task 4] - ⏳ Pending

## Key Findings Across Tasks

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
- **Git Status**: [Current branch and commit status]
```

**Context Restoration Checklist for Multi-Task Execution**:

- [ ] Review spec requirements and task breakdown
- [ ] Read memory.md for current progress across all tasks
- [ ] Review any recent Tech Lead feedback
- [ ] Check current test status and failures
- [ ] Verify implementation state for current task
- [ ] Confirm next steps from memory
- [ ] Check git branch and commit status
- [ ] Resume work with full context awareness across all tasks
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

<step number="1" name="task_assignment">

### Step 1: Task Assignment

Identify which tasks to execute from the spec (using spec_srd_reference file path and optional specific_tasks array), defaulting to the next uncompleted parent task if not specified.

<task_selection>
<explicit>user specifies exact task(s)</explicit>
<implicit>find next uncompleted task in tasks.md</implicit>
</task_selection>

<instructions>
  ACTION: Identify task(s) to execute
  DEFAULT: Select next uncompleted parent task if not specified
  CONFIRM: Task selection with user
</instructions>

</step>

<step number="2" subagent="context-fetcher" name="context_analysis">

### Step 2: Context Analysis

Use the context-fetcher subagent to gather minimal context for task understanding by always loading spec tasks.md, and conditionally loading @.agent-os/product/mission-lite.md, spec-lite.md, and sub-specs/technical-spec.md if not already in context.

<instructions>
  ACTION: Use context-fetcher subagent to:
    - REQUEST: "Get product pitch from mission-lite.md"
    - REQUEST: "Get spec summary from spec-lite.md"
    - REQUEST: "Get technical approach from technical-spec.md"
  PROCESS: Returned information
</instructions>

<context_gathering>
<essential_docs> - tasks.md for task breakdown
</essential_docs>
<conditional_docs> - mission-lite.md for product alignment - spec-lite.md for feature summary - technical-spec.md for implementation details
</conditional_docs>
</context_gathering>

</step>

<step number="3" name="development_server_check">

### Step 3: Check for Development Server

Check for any running development server and ask user permission to shut it down if found to prevent port conflicts.

<server_check_flow>
<if_running>
ASK user to shut down
WAIT for response
</if_running>
<if_not_running>
PROCEED immediately
</if_not_running>
</server_check_flow>

<user_prompt>
A development server is currently running.
Should I shut it down before proceeding? (yes/no)
</user_prompt>

<instructions>
  ACTION: Check for running local development server
  CONDITIONAL: Ask permission only if server is running
  PROCEED: Immediately if no server detected
</instructions>

</step>

<step number="4" subagent="git-workflow" name="git_branch_management">

### Step 4: Git Branch Management

Use the git-workflow subagent to manage git branches to ensure proper isolation by creating or switching to the appropriate branch for the spec.

<instructions>
  ACTION: Use git-workflow subagent
  REQUEST: "Check and manage branch for spec: [SPEC_FOLDER]
            - Create branch if needed
            - Switch to correct branch
            - Handle any uncommitted changes"
  WAIT: For branch setup completion
</instructions>

<branch_naming>

  <source>spec folder name</source>
  <format>exclude date prefix</format>
  <example>
    - folder: 2025-03-15-password-reset
    - branch: password-reset
  </example>
</branch_naming>

</step>

<step number="5" name="pre_execution_review">

### Step 5: Pre-Execution Review

Review lessons learned and code style guidelines before beginning task execution to avoid repeating known mistakes and ensure compliance with established patterns.

<review_checklist>
<lessons_check>
IF lessons.md NOT already in context:
READ @~/.agent-os/product/lessons.md
REVIEW: Lessons relevant to current task type and technology stack
APPLY: Documented best practices and avoid known mistakes
ELSE:
SKIP loading (use existing context)
</lessons_check>

<code_style_check>
IF code-style.md NOT already in context:
READ @~/.agent-os/standards/code-style.md
FOLLOW: Conditional blocks for technologies being used in tasks
APPLY: Relevant style guides for implementation
ELSE:
SKIP loading (use existing context)
</code_style_check>
</review_checklist>

<instructions>
  ACTION: Review relevant lessons and style guides
  FOCUS: Current task types and technology stack
  PREPARE: Implementation approach following established patterns
  VERIFY: Understanding of common pitfalls to avoid
</instructions>

</step>

<step number="6" name="task_execution_loop">

### Step 6: Multi-Agent Task Execution Loop

Execute all assigned parent tasks and their subtasks using the multi-agent role system defined in @~/.agent-os/instructions/core/execute-task.md, continuing until all tasks are complete with proper review, testing, and quality assurance.

<execution_flow>
LOAD @~/.agent-os/instructions/core/execute-task.md ONCE

FOR each parent_task assigned in Step 1:
EXECUTE multi-agent workflow from execute-task.md with: - parent_task_number - all associated subtasks - Senior Software Developer implementation - Tech Lead review and feedback - Senior QA Automation Engineer testing
WAIT for task completion with all tests passing
UPDATE tasks.md status
END FOR
</execution_flow>

<loop_logic>
<continue_conditions> - More unfinished parent tasks exist - User has not requested stop - Agent workflow cycles continue until completion
</continue_conditions>
<exit_conditions> - All assigned tasks marked complete with tests passing - User requests early termination - Blocking issue prevents continuation - Agent timeout protection triggers
</exit_conditions>
</loop_logic>

<task_status_check>
AFTER each task execution:
CHECK tasks.md for remaining tasks
VERIFY all tests are passing for completed tasks
IF all assigned tasks complete with tests passing:
PROCEED to next step
ELSE:
CONTINUE with next task using multi-agent workflow
</task_status_check>

<instructions>
  ACTION: Load execute-task.md instructions once at start
  REUSE: Same multi-agent workflow for each parent task iteration
  LOOP: Through all assigned parent tasks with agent role switching
  UPDATE: Task status after each completion with test verification
  VERIFY: All tasks complete with tests passing before proceeding
  HANDLE: Blocking issues and agent timeout protection appropriately
  DOCUMENT: All agent decisions and reviews in task spec folder
  
  **CONTEXT MANAGEMENT**:
  - **MONITOR**: Continuously check context fill level during task execution
  - **THRESHOLD**: When context >90% filled, trigger memory preservation
  - **PRESERVE**: Write current progress to memory.md in task spec folder
  - **CLEAR**: Free context space after memory preservation
  - **RESTORE**: Review specs and memory.md to restore working context
  - **CONTINUE**: Resume work with full context awareness
  
  **CRITICAL TEST EXECUTION SAFETY**:
  - **ALWAYS** use agent-timeout-protector.js for test execution
  - **NEVER** run `npx playwright test` directly without timeout protection
  - **ALWAYS** set reasonable timeouts (30-60 seconds maximum)
  - **NEVER** allow tests to run indefinitely
  - **ALWAYS** monitor test progress and force termination if stuck
</instructions>

</step>

<step number="7" subagent="test-runner" name="test_suite_verification">

### Step 7: Run All Tests

Use the test-runner subagent to run the entire test suite to ensure no regressions and fix any failures until all tests pass.

<instructions>
  ACTION: Use test-runner subagent
  REQUEST: "Run the full test suite"
  WAIT: For test-runner analysis
  PROCESS: Fix any reported failures
  REPEAT: Until all tests pass
</instructions>

<test_execution>
<order> 1. Run entire test suite 2. Fix any failures
</order>
<requirement>100% pass rate</requirement>
</test_execution>

<failure_handling>
<action>troubleshoot and fix</action>
<priority>before proceeding</priority>
</failure_handling>

</step>

<step number="8" subagent="git-workflow" name="git_workflow">

### Step 8: Git Workflow

Use the git-workflow subagent to create git commit, push to GitHub, and create pull request for the implemented features.

<instructions>
  ACTION: Use git-workflow subagent
  REQUEST: "Complete git workflow for [SPEC_NAME] feature:
            - Spec: [SPEC_FOLDER_PATH]
            - Changes: All modified files
            - Target: main branch
            - Description: [SUMMARY_OF_IMPLEMENTED_FEATURES]"
  WAIT: For workflow completion
  PROCESS: Save PR URL for summary
</instructions>

<commit_process>
<commit>
<message>descriptive summary of changes</message>
<format>conventional commits if applicable</format>
</commit>
<push>
<target>spec branch</target>
<remote>origin</remote>
</push>
<pull_request>

<title>descriptive PR title</title>
<description>functionality recap</description>
</pull_request>
</commit_process>

</step>

<step number="9" name="roadmap_progress_check">

### Step 9: Roadmap Progress Check (Conditional)

Check @.agent-os/product/roadmap.md (if not in context) and update roadmap progress only if the executed tasks may have completed a roadmap item and the spec completes that item.

<conditional_execution>
<preliminary_check>
EVALUATE: Did executed tasks potentially complete a roadmap item?
IF NO:
SKIP this entire step
PROCEED to step 9
IF YES:
CONTINUE with roadmap check
</preliminary_check>
</conditional_execution>

<conditional_loading>
IF roadmap.md NOT already in context:
LOAD @.agent-os/product/roadmap.md
ELSE:
SKIP loading (use existing context)
</conditional_loading>

<roadmap_criteria>
<update_when> - spec fully implements roadmap feature - all related tasks completed - tests passing
</update_when>
<caution>only mark complete if absolutely certain</caution>
</roadmap_criteria>

<instructions>
  ACTION: First evaluate if roadmap check is needed
  SKIP: If tasks clearly don't complete roadmap items
  CHECK: If roadmap.md already in context
  LOAD: Only if needed and not in context
  EVALUATE: If current spec completes roadmap goals
  UPDATE: Mark roadmap items complete if applicable
  VERIFY: Certainty before marking complete
</instructions>

</step>

<step number="10" name="completion_notification">

### Step 10: Task Completion Notification

Play a system sound to alert the user that tasks are complete.

<notification_command>
afplay /System/Library/Sounds/Glass.aiff
</notification_command>

<instructions>
  ACTION: Play completion sound
  PURPOSE: Alert user that task is complete
</instructions>

</step>

<step number="11" name="completion_summary">

### Step 11: Completion Summary

Create a structured summary message with emojis showing what was done, any issues, testing instructions, and PR link.

<summary_template>

## ✅ What's been done

1. **[FEATURE_1]** - [ONE_SENTENCE_DESCRIPTION]
2. **[FEATURE_2]** - [ONE_SENTENCE_DESCRIPTION]

## ⚠️ Issues encountered

[ONLY_IF_APPLICABLE]

- **[ISSUE_1]** - [DESCRIPTION_AND_REASON]

## 👀 Ready to test in browser

[ONLY_IF_APPLICABLE]

1. [STEP_1_TO_TEST]
2. [STEP_2_TO_TEST]

## 📦 Pull Request

View PR: [GITHUB_PR_URL]
</summary_template>

<summary_sections>
<required> - functionality recap - pull request info
</required>
<conditional> - issues encountered (if any) - testing instructions (if testable in browser)
</conditional>
</summary_sections>

<instructions>
  ACTION: Create comprehensive summary
  INCLUDE: All required sections
  ADD: Conditional sections if applicable
  FORMAT: Use emoji headers for scannability
</instructions>

</step>

</process_flow>

## Error Handling

<error_protocols>
<blocking_issues> - document in tasks.md - mark with ⚠️ emoji - include in summary
</blocking_issues>
<test_failures> - fix before proceeding - never commit broken tests - use appropriate agent for resolution
</test_failures>
<technical_roadblocks> - attempt 3 approaches - document if unresolved - seek user input
</technical_roadblocks>
<agent_timeout> - use timeout protection mechanisms - force termination after 30 seconds - document stuck states
</agent_timeout>
<agent_communication> - preserve all agent conversations - document review findings - track implementation changes
</agent_communication>
</error_protocols>

<final_checklist>
<verify> - [ ] Task implementation complete - [ ] All tests passing - [ ] tasks.md updated - [ ] Code committed and pushed - [ ] Pull request created - [ ] Roadmap checked/updated - [ ] Summary provided to user
</verify>
</final_checklist>

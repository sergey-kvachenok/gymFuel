---
description: Multi-Role Issue Investigation and Solution Design
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Issue Investigation and Solution Design

## Overview

Investigate complex technical issues through multi-role analysis, discussion, and collaborative solution design. This process ensures comprehensive problem understanding from different technical perspectives before creating implementation specifications.

## 🚀 Getting Started - Quick Guide

### **Step 1: Choose Your Approach**

**First, decide which process to use:**

**For Complex Issues (High Impact, Multiple Components):**

- Use **Full Process** (7 roles, comprehensive analysis)
- Time needed: 2-4 hours

**For Most Issues (Medium Complexity, Limited Time):**

- Use **Simplified Process** (3-4 roles, focused analysis)
- Time needed: 30 minutes - 2 hours

**For Simple Issues (Bug Fixes, Minor Improvements):**

- Use **Simplified Process** (2-3 roles, quick analysis)
- Time needed: 30 minutes - 1 hour

### **Step 2: Select Relevant Roles**

**Choose roles based on your issue type:**

- **Frontend Issues**: Frontend + Backend + Tech Lead
- **Backend Issues**: Backend + DevOps + Tech Lead
- **Data/Offline Issues**: Data/Offline + Fullstack + Tech Lead
- **Architecture Issues**: Architect + Tech Lead + relevant specialist
- **Always include Tech Lead** for overall feasibility

### **Step 3: Follow the Process**

**Use the appropriate process section below:**

- **Full Process**: Complete multi-role investigation (see "Full Investigation Process")
- **Simplified Process**: Focused investigation (see "Simplified Process for Single Agent")

### **Step 4: Create Deliverables**

**Always create these files:**

- `conclusions.md` - Investigation summary and decisions
- `spec.md` - Implementation specification
- `tasks.md` - Implementation tasks

**CRITICAL FILE LOCATION REQUIREMENT:**

- **ALL files MUST be created in `.agent-os/specs/YYYY-MM-DD-issue-name/`**
- **NEVER create files outside of the `.agent-os` directory**
- **Use date-checker subagent** for current date
- **Use kebab-case** for issue name (max 5 words)

**QUICK DECISION TREE:**

```
Is this a complex, high-impact issue? → Full Process
Is this a medium complexity issue? → Simplified Process (3-4 roles)
Is this a simple bug fix or minor improvement? → Simplified Process (2-3 roles)
```

---

## 🎭 HOW TO ACT - STEP-BY-STEP GUIDE

### **Phase 1: Choose Your Approach**

**STEP 1: Assess the Issue**

1. **Read the problem description** carefully
2. **Determine complexity level**:
   - **High**: Affects multiple system layers, new patterns, architectural changes
   - **Medium**: Affects 2-3 components, existing patterns, significant modifications
   - **Low**: Affects single component, existing patterns, minor modifications

**STEP 2: Choose Process**

- **High complexity + sufficient time** → Use **Full Process** (7 roles)
- **Medium complexity or limited time** → Use **Simplified Process** (3-4 roles)
- **Low complexity** → Use **Simplified Process** (2-3 roles)

**STEP 3: Select Roles**

- **Always include Tech Lead** for overall feasibility
- **Choose 2-3 additional roles** based on issue type:
  - Frontend issues → Frontend + Backend + Tech Lead
  - Backend issues → Backend + DevOps + Tech Lead
  - Data/offline issues → Data/Offline + Fullstack + Tech Lead
  - Architecture issues → Architect + Tech Lead + relevant specialist

### **Phase 2: Conduct Role Analysis**

**FOR EACH ROLE, DO THIS:**

**STEP 1: Switch to Role**

```
[ROLE_NAME MODE]
I'm now analyzing this issue from the [ROLE_NAME] perspective...
```

**STEP 2: Complete Role Analysis**
Use the appropriate format:

**For Full Process:**

```
**ANALYSIS FROM [ROLE_NAME] PERSPECTIVE:**

**Problem Understanding:**
[How this role sees the problem - be specific and technical]

**Key Considerations:**
- **[Technical Area 1]:** [Specific consideration with technical details]
- **[Technical Area 2]:** [Specific consideration with technical details]
- **[Technical Area 3]:** [Specific consideration with technical details]

**Technical Implications:**
[Specific technical implications from this role's perspective - include concrete examples]

**Potential Solutions:**
- **[Solution Approach 1]:** [Detailed description with pros/cons]
- **[Solution Approach 2]:** [Detailed description with pros/cons]

**Risks and Concerns:**
- **[Risk 1]:** [Specific risk with potential impact]
- **[Risk 2]:** [Specific risk with potential impact]

**Questions for Other Roles:**
- **[Question 1]:** [Specific technical question for another role]
- **[Question 2]:** [Specific technical question for another role]

**Recommendations:**
- [Specific recommendation 1]
- [Specific recommendation 2]
```

**For Simplified Process:**

```
**Key Insights:** [2-3 main insights]
**Main Concerns:** [2-3 primary concerns]
**Recommended Approach:** [1-2 solution approaches]
**Questions for Other Roles:** [1-2 key questions]
```

**STEP 3: Switch to Next Role**
Repeat for each selected role until all roles are complete.

### **Phase 3: Collaborative Discussion**

**STEP 1: Identify Key Conflicts**

- Look for **conflicting perspectives** between roles
- Identify **2-3 main issues** that need resolution
- Focus on **most critical concerns**

**STEP 2: Role Discussion**
Switch between roles to discuss conflicts:

```
[ROLE_NAME MODE]
[Natural conversation response, building on previous insights]

**Response to [OTHER_ROLE]'s concern about [SPECIFIC_ISSUE]:**
[Address the specific concern with technical details]

**Additional considerations from [ROLE_NAME] perspective:**
[New insights or considerations]

**Proposed compromise/solution:**
[Suggest how to address conflicting perspectives]

**Questions for clarification:**
[Ask specific technical questions to other roles]
```

**STEP 3: Build Consensus**

- Work toward **agreement on approach**
- **Resolve conflicts** through technical discussion
- **Document key decisions** and rationale

### **Phase 4: Solution Synthesis**

**STEP 1: Review All Perspectives**

- **Summarize key insights** from each role
- **Identify common ground** and areas of agreement
- **List remaining conflicts** and their resolutions

**STEP 2: Create Unified Solution**
Document the final approach:

```
**UNIFIED SOLUTION APPROACH:**

**Core Solution:**
[Clear description of the agreed-upon solution]

**Technical Implementation:**
- **Frontend:** [Specific frontend implementation details]
- **Backend:** [Specific backend implementation details]
- **Integration:** [Specific integration approach]
- **Architecture:** [Specific architectural decisions]
- **DevOps:** [Specific deployment and operational details]
- **Data/Offline:** [Specific data management and sync details]

**Rationale:**
[Why this solution was chosen over alternatives]

**Risk Mitigation:**
[How identified risks will be addressed]

**Success Criteria:**
[How we'll measure the success of this solution]

**Implementation Timeline:**
[High-level timeline for implementation]

**Resource Requirements:**
[What resources and team members are needed]
```

### **Phase 5: Create Deliverables**

**STEP 1: Create conclusions.md**
Use the appropriate template (Full or Simplified) to document:

- Problem summary
- Role analysis summary
- Collaborative discussion summary
- Final decision and rationale
- Implementation approach
- Next steps

**STEP 2: Create Spec Files**
Follow @~/.agent-os/instructions/core/create-spec.md to create:

- spec.md (main specification)
- spec-lite.md (condensed summary)
- sub-specs/technical-spec.md
- tasks.md (implementation tasks)

**CRITICAL REQUIREMENT - FILE LOCATION:**

- **ALL spec files MUST be created in `.agent-os/specs/YYYY-MM-DD-issue-name/`**
- **NEVER create files outside of the `.agent-os` directory**
- **Follow the exact folder structure**: `.agent-os/specs/YYYY-MM-DD-issue-name/`
- **Use the date-checker subagent** to get the current date for folder naming
- **Use kebab-case** for the issue name (max 5 words)

**CORRECT FILE STRUCTURE:**

```
.agent-os/specs/YYYY-MM-DD-issue-name/
├── spec.md                    # Main specification (from @create-spec.md)
├── spec-lite.md              # Condensed summary (from @create-spec.md)
├── sub-specs/
│   ├── technical-spec.md     # Technical details (from @create-spec.md)
│   ├── database-schema.md    # Database changes (if needed)
│   └── api-spec.md          # API changes (if needed)
├── tasks.md                  # Implementation tasks with proper breakdown
└── conclusions.md            # Investigation conclusions (from this instruction)
```

**REQUIRED FILES AND CONTENT:**

**1. spec.md** - Follow @~/.agent-os/instructions/core/create-spec.md exactly

- Overview section
- User Stories section
- Spec Scope section
- Out of Scope section
- Expected Deliverable section

**2. spec-lite.md** - Follow @~/.agent-os/instructions/core/create-spec.md exactly

- 1-3 sentence summary of spec goal and objective

**3. sub-specs/technical-spec.md** - Follow @~/.agent-os/instructions/core/create-spec.md exactly

- Technical Requirements section
- External Dependencies section (if needed)

**4. tasks.md** - Proper task breakdown following @~/.agent-os/instructions/core/create-spec.md

- 1-5 major tasks (numbered checklist)
- Subtasks using decimal notation (1.1, 1.2, etc.)
- First subtask: Write tests for component
- Last subtask: Verify all tests pass
- Follow TDD approach with proper task ordering

**5. conclusions.md** - Use template from this instruction

- Problem Summary
- Role Analysis Summary (all selected roles)
- Collaborative Discussion Summary
- Final Decision with rationale
- Implementation approach
- Next steps

**TASK BREAKDOWN REQUIREMENTS:**

**tasks.md MUST follow this structure:**

```markdown
# Spec Tasks

## Tasks

- [ ] 1. [MAJOR_TASK_DESCRIPTION]
  - [ ] 1.1 Write tests for [COMPONENT]
  - [ ] 1.2 [IMPLEMENTATION_STEP]
  - [ ] 1.3 [IMPLEMENTATION_STEP]
  - [ ] 1.4 Verify all tests pass

- [ ] 2. [MAJOR_TASK_DESCRIPTION]
  - [ ] 2.1 Write tests for [COMPONENT]
  - [ ] 2.2 [IMPLEMENTATION_STEP]
  - [ ] 2.3 Verify all tests pass
```

**TASK BREAKDOWN RULES:**

- **1-5 major tasks** maximum
- **Decimal notation** for subtasks (1.1, 1.2, 2.1, 2.2, etc.)
- **First subtask** always: "Write tests for [COMPONENT]"
- **Last subtask** always: "Verify all tests pass"
- **TDD approach** - tests first, then implementation
- **Consider technical dependencies** when ordering tasks
- **Group related functionality** together
- **Build incrementally** from simple to complex

**INCORRECT LOCATIONS (NEVER USE):**

- ❌ `src/specs/` (outside .agent-os)
- ❌ `docs/specs/` (outside .agent-os)
- ❌ `specs/` (root level, outside .agent-os)
- ❌ Any location outside `.agent-os/` directory

**STEP 3: Quality Check**
Before marking complete, verify:

- [ ] All roles provided specific technical insights
- [ ] Role perspectives are authentic and distinct
- [ ] Multiple solution approaches were considered
- [ ] Risks and mitigation strategies are identified
- [ ] Documentation is complete and actionable
- [ ] Next steps are clear and specific

### **Phase 6: Final Validation**

**BEFORE COMPLETING, ASK YOURSELF:**

1. **Is the analysis specific enough?**
   - ❌ "This might affect performance"
   - ✅ "This will increase API response time by 200-300ms due to additional database joins"

2. **Are the roles authentic?**
   - ❌ All roles having the same perspective
   - ✅ Each role demonstrating their specific technical expertise

3. **Is the solution comprehensive?**
   - ❌ Only one approach considered
   - ✅ Multiple approaches compared with trade-offs

4. **Is the documentation complete?**
   - ❌ Missing rationale or unclear next steps
   - ✅ Complete documentation with clear implementation path

**IF ANY ANSWER IS "NO" → GO BACK AND FIX IT**

---

## 📋 PROCESS OPTIONS

### **Option A: Full Investigation Process**

_Use for complex, high-impact issues requiring comprehensive analysis_

### **Option B: Simplified Process**

_Use for most issues - focused analysis with 3-4 roles_

---

## 🔧 FULL INVESTIGATION PROCESS

### Multi-Role Investigation Team

<investigation_roles>
<senior_frontend_developer>
**ROLE**: Senior Frontend Developer
**PRIMARY FOCUS**: User interface, user experience, frontend architecture, and client-side functionality
**INVESTIGATION AREAS**:

- UI/UX implications and user impact
- Frontend performance and optimization
- Client-side state management
- Browser compatibility and accessibility
- Frontend security considerations
- Component architecture and reusability
- User interaction patterns and workflows
- Frontend testing strategies
- Progressive Web App (PWA) features
- Offline functionality and caching
- Real-time updates and WebSocket integration
- Mobile responsiveness and touch interactions

**ANALYSIS PERSPECTIVE**:

- How does this issue affect the user experience?
- What frontend architectural changes are needed?
- How will this impact UI performance and responsiveness?
- What frontend security considerations apply?
- How does this affect component design and state management?
- What PWA/offline implications does this have?
- How will this impact mobile users and accessibility?
  </senior_frontend_developer>

<senior_backend_developer>
**ROLE**: Senior Backend Developer
**PRIMARY FOCUS**: Server-side logic, database design, API architecture, and backend performance
**INVESTIGATION AREAS**:

- Backend architecture and scalability
- Database design and optimization
- API design and REST/GraphQL patterns
- Server-side security and validation
- Business logic implementation
- Data processing and transformation
- Caching strategies and performance
- Backend testing and monitoring
- Authentication and authorization systems
- Data migration and schema evolution
- Background job processing
- API rate limiting and throttling
- Error handling and logging strategies

**ANALYSIS PERSPECTIVE**:

- How does this issue affect backend architecture and performance?
- What database changes or optimizations are needed?
- How will this impact API design and data processing?
- What backend security and validation considerations apply?
- How does this affect business logic and data integrity?
- What scalability implications does this have?
- How will this impact data consistency and reliability?
  </senior_backend_developer>

<senior_fullstack_developer>
**ROLE**: Senior Fullstack Developer
**PRIMARY FOCUS**: End-to-end system integration, data flow, and cross-layer functionality
**INVESTIGATION AREAS**:

- System-wide data flow and integration points
- API design and communication patterns
- Database interactions and data modeling
- Authentication and authorization flows
- Error handling across layers
- Performance optimization across the stack
- Deployment and infrastructure considerations
- Cross-cutting concerns and shared utilities
- Data synchronization between frontend and backend
- Real-time data updates and state consistency
- Offline-first architecture and sync strategies
- Cross-platform compatibility and testing

**ANALYSIS PERSPECTIVE**:

- How does this issue affect the entire system architecture?
- What integration points need to be considered?
- How will this impact data flow between frontend and backend?
- What cross-layer dependencies and constraints exist?
- How does this affect the overall system performance and reliability?
- What data consistency challenges does this create?
- How will this impact the offline-first architecture?
  </senior_fullstack_developer>

<devops_engineer>
**ROLE**: DevOps Engineer
**PRIMARY FOCUS**: Infrastructure, deployment, monitoring, and operational concerns
**INVESTIGATION AREAS**:

- Infrastructure requirements and scaling
- Deployment strategies and CI/CD pipelines
- Monitoring, logging, and alerting
- Performance monitoring and optimization
- Security and compliance requirements
- Disaster recovery and backup strategies
- Environment management and configuration
- Resource utilization and cost optimization
- Container orchestration and microservices
- Database performance and optimization
- Network security and load balancing
- Automated testing and quality gates

**ANALYSIS PERSPECTIVE**:

- How does this solution impact our infrastructure requirements?
- What deployment and operational challenges does this create?
- How will this affect our monitoring and alerting capabilities?
- What security and compliance implications does this have?
- How does this impact our disaster recovery and backup strategies?
- What performance monitoring and optimization is needed?
- How will this affect our resource utilization and costs?
  </devops_engineer>

<tech_lead>
**ROLE**: Tech Lead
**PRIMARY FOCUS**: Technical strategy, code quality, team coordination, and implementation feasibility
**INVESTIGATION AREAS**:

- Technical feasibility and risk assessment
- Code quality and maintainability
- Team coordination and knowledge sharing
- Implementation timeline and resource allocation
- Technical debt and refactoring needs
- Testing strategy and quality assurance
- Documentation and knowledge transfer
- Technical standards and best practices
- Code review processes and standards
- Performance benchmarks and optimization
- Security best practices and compliance
- Team productivity and development velocity

**ANALYSIS PERSPECTIVE**:

- Is this solution technically feasible and maintainable?
- What are the implementation risks and mitigation strategies?
- How will this affect code quality and team productivity?
- What technical debt or refactoring is needed?
- How does this align with our technical standards and best practices?
- What impact will this have on development velocity?
- How will this affect our testing and quality assurance processes?
  </tech_lead>

<architect>
**ROLE**: Architect
**PRIMARY FOCUS**: System architecture, scalability, long-term strategy, and technical vision
**INVESTIGATION AREAS**:

- System architecture and design patterns
- Scalability and performance at scale
- Technology stack alignment and evolution
- Integration with existing systems
- Future-proofing and extensibility
- Compliance and regulatory requirements
- Disaster recovery and high availability
- Technical roadmap alignment
- Microservices architecture and service boundaries
- Data architecture and modeling strategies
- Security architecture and threat modeling
- Technology selection and vendor evaluation

**ANALYSIS PERSPECTIVE**:

- How does this solution fit into our overall system architecture?
- What are the long-term scalability and maintainability implications?
- How does this align with our technology strategy and roadmap?
- What architectural patterns and principles should guide this solution?
- How does this affect our ability to scale and evolve the system?
- What impact will this have on our technical debt and complexity?
- How does this align with our security and compliance requirements?
  </architect>

<data_offline_specialist>
**ROLE**: Data/Offline Specialist
**PRIMARY FOCUS**: Data management, offline functionality, synchronization, and data consistency
**INVESTIGATION AREAS**:

- Offline data storage and management
- Data synchronization strategies
- Conflict resolution and data consistency
- IndexedDB and local storage optimization
- Real-time data synchronization
- Data migration and versioning
- Offline-first architecture patterns
- Data integrity and validation
- Background sync and queuing
- Data compression and optimization
- Cross-device data synchronization
- Data privacy and security in offline mode

**ANALYSIS PERSPECTIVE**:

- How does this issue affect our offline-first architecture?
- What data synchronization challenges does this create?
- How will this impact data consistency across devices?
- What offline storage and caching implications does this have?
- How does this affect our conflict resolution strategies?
- What data migration and versioning considerations apply?
- How will this impact the user experience in offline mode?
  </data_offline_specialist>
  </investigation_roles>

---

## ⚡ SIMPLIFIED PROCESS FOR SINGLE AGENT

### When to Use Simplified Process

**USE SIMPLIFIED PROCESS FOR:**

- **Most issues** (medium complexity, limited time)
- **Focused, single-component issues** (bug fixes, minor improvements)
- **Quick decisions** needed for immediate implementation
- **Clear technical scope** with obvious role relevance

**TIME NEEDED:** 30 minutes - 2 hours

### Simplified Process Steps

**Phase 1: Focused Role Analysis (3-4 roles)**

- **Select 3-4 most relevant roles** for the specific issue
- **Complete each role's analysis** using simplified format
- **Focus on key insights and concerns** only
- **Document as you go** to preserve insights

**Phase 2: Key Discussion Points**

- **Identify 2-3 key conflicts** between role perspectives
- **Resolve conflicts** through brief role-switching discussion
- **Focus on most critical issues** only

**Phase 3: Solution Synthesis**

- **Combine best approaches** from selected roles
- **Address key concerns** identified in discussion
- **Create unified solution** approach

**Phase 4: Documentation**

- **Create conclusions.md** with focused analysis
- **Create spec files** using unified solution
- **Document key decisions** and rationale

### Simplified Formats

**SIMPLIFIED ROLE ANALYSIS FORMAT:**

```
[ROLE_NAME MODE]
**Key Insights:** [2-3 main insights]
**Main Concerns:** [2-3 primary concerns]
**Recommended Approach:** [1-2 solution approaches]
**Questions for Other Roles:** [1-2 key questions]
```

**SIMPLIFIED DISCUSSION FORMAT:**

```
[ROLE_NAME MODE]
**Response to [CONCERN]:** [Brief response]
**Proposed Solution:** [Concise solution approach]
```

**SIMPLIFIED CONCLUSIONS TEMPLATE:**

```markdown
# Investigation Conclusions

## Problem Summary

[Brief description]

## Key Role Insights

### [Role 1] Analysis

- **Key Insights:** [List]
- **Main Concerns:** [List]
- **Recommended Approach:** [Description]

### [Role 2] Analysis

- **Key Insights:** [List]
- **Main Concerns:** [List]
- **Recommended Approach:** [Description]

### [Role 3] Analysis

- **Key Insights:** [List]
- **Main Concerns:** [List]
- **Recommended Approach:** [Description]

## Key Discussion Points

[2-3 main conflicts resolved]

## Final Decision

**Chosen Solution:** [Description]
**Rationale:** [Why chosen]
**Implementation:** [High-level approach]

## Next Steps

[3-4 key next steps]
```

---

## 📊 PROCESS SELECTION GUIDE

### Decision Matrix

| Issue Complexity | Time Available | Recommended Process            |
| ---------------- | -------------- | ------------------------------ |
| High             | High           | Full Process (7 roles)         |
| High             | Limited        | Simplified Process (3-4 roles) |
| Medium           | High           | Simplified Process (3-4 roles) |
| Medium           | Limited        | Simplified Process (2-3 roles) |
| Low              | Any            | Simplified Process (2-3 roles) |

### Complexity Indicators

**High Complexity:**

- Affects multiple system layers
- New architectural patterns
- Significant system changes
- Multiple stakeholders involved

**Medium Complexity:**

- Affects 2-3 components
- Uses existing patterns
- Significant modifications
- Clear technical scope

**Low Complexity:**

- Affects single component
- Uses existing patterns
- Minor modifications
- Obvious technical approach

### Time Estimates

- **Full Process**: 2-4 hours for complete investigation
- **Simplified Process**: 30 minutes - 2 hours depending on roles selected

---

## 🎯 QUALITY STANDARDS

### Investigation Quality Requirements

**MANDATORY QUALITY CRITERIA:**

**Technical Depth:**

- ✅ **Specific technical details** - No generic statements
- ✅ **Concrete examples** - Include real implementation considerations
- ✅ **Technical reasoning** - Explain why approaches work or don't work
- ✅ **Architectural awareness** - Consider system-wide implications

**Role Authenticity:**

- ✅ **Role-specific perspective** - Each role thinks like their actual role
- ✅ **Technical expertise** - Demonstrate role-specific knowledge
- ✅ **Realistic concerns** - Address actual issues each role would face
- ✅ **Professional judgment** - Make decisions based on role experience

**Analysis Completeness:**

- ✅ **Multiple solution approaches** - Consider alternatives, not just one option
- ✅ **Risk assessment** - Identify and evaluate potential risks
- ✅ **Trade-off analysis** - Compare pros and cons of different approaches
- ✅ **Implementation feasibility** - Consider practical implementation challenges

**Documentation Quality:**

- ✅ **Clear structure** - Well-organized and easy to follow
- ✅ **Actionable insights** - Provide specific, implementable recommendations
- ✅ **Traceable decisions** - Document rationale for all key decisions
- ✅ **Complete coverage** - Address all relevant aspects of the issue

### Quality Validation Checklist

**BEFORE COMPLETING INVESTIGATION:**

**Technical Analysis:**

- [ ] Each role provides specific technical insights (not generic statements)
- [ ] Technical implications are explained with concrete examples
- [ ] Multiple solution approaches are considered and compared
- [ ] Risks and trade-offs are identified and evaluated

**Role Authenticity:**

- [ ] Each role demonstrates their specific technical expertise
- [ ] Role-specific concerns and perspectives are clearly expressed
- [ ] Decisions reflect the role's actual responsibilities and expertise
- [ ] Role interactions feel natural and professional

**Solution Quality:**

- [ ] Final solution addresses all major concerns from all roles
- [ ] Solution is technically feasible and implementable
- [ ] Implementation approach is clear and actionable
- [ ] Risk mitigation strategies are identified

**Documentation Quality:**

- [ ] conclusions.md is complete and well-structured
- [ ] Spec files are created following @create-spec.md guidelines
- [ ] All key decisions and rationale are documented
- [ ] Next steps are clear and actionable
- [ ] **ALL files are created in `.agent-os/specs/YYYY-MM-DD-issue-name/` directory**
- [ ] **NO files are created outside of the `.agent-os` directory**
- [ ] **File structure matches exactly** what's described in this instruction
- [ ] **tasks.md follows proper breakdown** with decimal notation and TDD approach
- [ ] **All required files are present** (spec.md, spec-lite.md, technical-spec.md, tasks.md, conclusions.md)

### Common Quality Issues to Avoid

**❌ POOR QUALITY INDICATORS:**

**Generic Analysis:**

- "This might affect performance" (too vague)
- "We should consider security" (no specific details)
- "This could be a problem" (no technical reasoning)

**Role Confusion:**

- Frontend developer discussing database optimization
- Backend developer focusing on UI/UX concerns
- All roles having the same perspective

**Incomplete Analysis:**

- Only one solution approach considered
- No risk assessment or trade-off analysis
- Missing implementation considerations

**Poor Documentation:**

- Unclear or disorganized conclusions
- Missing rationale for decisions
- Incomplete spec files

**✅ HIGH QUALITY INDICATORS:**

**Specific Technical Analysis:**

- "This will increase API response time by 200-300ms due to additional database joins"
- "We need to implement optimistic locking to prevent race conditions"
- "The frontend will need to handle 3 different loading states for this flow"

**Authentic Role Perspectives:**

- Frontend developer: "Users expect sub-100ms response times for this interaction"
- Backend developer: "We can optimize this with Redis caching and database indexing"
- DevOps engineer: "We need to add monitoring for the new API endpoints"

**Comprehensive Analysis:**

- "Approach A is faster but requires more memory, Approach B is slower but more scalable"
- "This introduces a risk of data inconsistency that we can mitigate with..."
- "Implementation will require changes to 3 components and new database migrations"

**Clear Documentation:**

- Well-structured conclusions with clear decision rationale
- Complete spec files with implementation details
- Actionable next steps with timelines and responsibilities

## Investigation Process

### Phase 1: Initial Problem Analysis

<step number="1" name="problem_presentation">
**STEP 1: Problem Presentation**
- Present the issue or problem to be investigated
- Ensure all roles understand the core problem
- Establish investigation scope and constraints
- Set clear objectives for the investigation

**PROBLEM PRESENTATION FORMAT**:

```
**ISSUE TO INVESTIGATE:**

**Problem Description:**
[Clear, detailed description of the issue]

**Current Impact:**
- [Impact 1]
- [Impact 2]
- [Impact 3]

**Investigation Scope:**
- **In Scope:** [What will be investigated]
- **Out of Scope:** [What will not be investigated]

**Success Criteria:**
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

**Constraints:**
- [Constraint 1]
- [Constraint 2]
- [Constraint 3]
```

</step>

<step number="2" name="individual_analysis">
**STEP 2: Individual Role Analysis**
Each role conducts independent analysis from their perspective:

**ROLE SWITCHING FORMAT**:

```
[ROLE_NAME MODE]
I'm now analyzing this issue from the [ROLE_NAME] perspective...

**ANALYSIS FROM [ROLE_NAME] PERSPECTIVE:**

**Problem Understanding:**
[How this role sees the problem - be specific and technical]

**Key Considerations:**
- **[Technical Area 1]:** [Specific consideration with technical details]
- **[Technical Area 2]:** [Specific consideration with technical details]
- **[Technical Area 3]:** [Specific consideration with technical details]

**Technical Implications:**
[Specific technical implications from this role's perspective - include concrete examples]

**Potential Solutions:**
- **[Solution Approach 1]:** [Detailed description with pros/cons]
- **[Solution Approach 2]:** [Detailed description with pros/cons]

**Risks and Concerns:**
- **[Risk 1]:** [Specific risk with potential impact]
- **[Risk 2]:** [Specific risk with potential impact]

**Questions for Other Roles:**
- **[Question 1]:** [Specific technical question for another role]
- **[Question 2]:** [Specific technical question for another role]

**Recommendations:**
- [Specific recommendation 1]
- [Specific recommendation 2]
```

**REQUIREMENTS FOR EACH ROLE**:

- Provide detailed analysis from their technical perspective
- Identify specific technical implications and considerations
- Propose potential solution approaches with pros/cons
- Highlight risks and concerns with specific impact
- Ask questions to other roles for clarification
- Be specific and technical, not generic
- Include concrete examples and technical details
- Provide actionable recommendations
  </step>

### Phase 2: Collaborative Discussion

<step number="3" name="role_discussion">
**STEP 3: Multi-Role Discussion**
Roles engage in collaborative discussion to explore different perspectives:

**DISCUSSION GUIDELINES**:

- **ACT AS REAL PEOPLE**: Engage in natural conversation, ask follow-up questions, challenge assumptions
- **BUILD ON EACH OTHER**: Reference and build upon insights from other roles
- **EXPLORE CONFLICTS**: Identify and discuss conflicting perspectives or approaches
- **SEEK CONSENSUS**: Work toward agreement on the best approach
- **DOCUMENT DECISIONS**: Record key decisions and rationale

**DISCUSSION FORMAT**:

```
[ROLE_NAME MODE]
[Natural conversation response, building on previous insights]

**Response to [OTHER_ROLE]'s concern about [SPECIFIC_ISSUE]:**
[Address the specific concern with technical details]

**Additional considerations from [ROLE_NAME] perspective:**
[New insights or considerations]

**Proposed compromise/solution:**
[Suggest how to address conflicting perspectives]

**Questions for clarification:**
[Ask specific technical questions to other roles]
```

**EXAMPLE DISCUSSION FLOW**:

```
[SENIOR FRONTEND DEVELOPER MODE]
I see the backend team's concern about API performance, but from a frontend perspective, we need to consider the user experience impact of slower response times...

**Response to Backend Developer's concern about database queries:**
We could implement optimistic updates in the UI while the backend processes the request, which would maintain a responsive user experience.

**Additional considerations from Frontend perspective:**
We also need to consider offline scenarios where users might not have immediate feedback.

[DEVOPS ENGINEER MODE]
That's a good point about offline scenarios. From an infrastructure perspective, we need to ensure our monitoring can track both online and offline user experiences...

**Response to Frontend Developer's optimistic updates approach:**
We'll need to implement proper error handling and rollback mechanisms for failed optimistic updates.

**Proposed compromise:**
What if we implement progressive enhancement - fast UI updates for online users, with graceful degradation for offline scenarios?

[SENIOR BACKEND DEVELOPER MODE]
I understand both concerns. From a backend perspective, we can implement idempotent operations to handle retries safely, and use database transactions to ensure data consistency even with optimistic updates.

**Response to DevOps Engineer's monitoring concern:**
We can add specific metrics for optimistic update success/failure rates and data consistency checks.

**Additional considerations from Backend perspective:**
We should also implement proper conflict resolution for concurrent updates to prevent data corruption.
```

**PHASE 3: Solution Synthesis Example**:

```
[TECH LEAD MODE]
Based on all the perspectives shared, I can see we have a comprehensive understanding of the problem. Let me synthesize the best approach that addresses all concerns.

**UNIFIED SOLUTION APPROACH:**

**Core Solution:**
Implement optimistic UI updates with robust error handling and conflict resolution, supported by comprehensive monitoring and graceful offline degradation.

**Technical Implementation:**
- **Frontend:** Optimistic updates with skeleton loading states and rollback mechanisms
- **Backend:** Idempotent operations with transaction-based consistency and conflict resolution
- **DevOps:** Comprehensive monitoring for both online and offline user experiences
- **Data/Offline:** Proper sync strategies with conflict resolution for offline scenarios

[ARCHITECT MODE]
I agree with the Tech Lead's synthesis. From an architectural perspective, this solution aligns well with our microservices architecture and provides the scalability we need for future growth.

**Additional architectural considerations:**
We should implement this using event-driven patterns to ensure loose coupling between frontend and backend components.
```

### Role-Switching Guidelines

### When to Switch Roles

**PHASE 1: Individual Analysis (Sequential Role Switching)**

- **Complete each role's analysis before moving to the next**
- **Order of analysis**: Frontend → Backend → Fullstack → DevOps → Tech Lead → Architect → Data/Offline Specialist
- **Each role completes their full analysis before the next role begins**
- **No discussion or interaction between roles during this phase**

**PHASE 2: Collaborative Discussion (Interactive Role Switching)**

- **Switch roles to respond to specific questions or concerns**
- **Switch roles to provide detailed technical insights**
- **Switch roles to challenge or build upon other roles' perspectives**
- **Switch roles to propose compromises or solutions**
- **Maintain natural conversation flow between roles**

**PHASE 3: Solution Synthesis (Consensus Building)**

- **Switch roles to validate solutions from different perspectives**
- **Switch roles to address remaining concerns**
- **Switch roles to finalize the unified solution approach**

### Role-Switching Format

**CLEAR ROLE INDICATOR**:

```
[ROLE_NAME MODE]
[Clear indication of role change and perspective]

[Role-specific analysis or response]

[Natural transition to next role or conclusion]
```

**EXAMPLES OF ROLE SWITCHING**:

**Sequential Analysis (Phase 1)**:

```
[SENIOR FRONTEND DEVELOPER MODE]
I'm now analyzing this issue from the Senior Frontend Developer perspective...

**ANALYSIS FROM SENIOR FRONTEND DEVELOPER PERSPECTIVE:**
[Complete analysis]

[SENIOR BACKEND DEVELOPER MODE]
I'm now analyzing this issue from the Senior Backend Developer perspective...

**ANALYSIS FROM SENIOR BACKEND DEVELOPER PERSPECTIVE:**
[Complete analysis]
```

**Interactive Discussion (Phase 2)**:

```
[SENIOR FRONTEND DEVELOPER MODE]
I see the backend team's concern about API performance, but from a frontend perspective, we need to consider the user experience impact of slower response times. Users expect immediate feedback when they interact with the interface.

**Response to Backend Developer's concern about database queries:**
We could implement optimistic updates in the UI while the backend processes the request, which would maintain a responsive user experience.

**Additional considerations from Frontend perspective:**
We also need to consider offline scenarios where users might not have immediate feedback.

[DEVOPS ENGINEER MODE]
That's a good point about offline scenarios. From an infrastructure perspective, we need to ensure our monitoring can track both online and offline user experiences. We'll need to implement proper error handling and rollback mechanisms for failed optimistic updates.

**Response to Frontend Developer's optimistic updates approach:**
We'll need to implement proper error handling and rollback mechanisms for failed optimistic updates.

**Proposed compromise:**
What if we implement progressive enhancement - fast UI updates for online users, with graceful degradation for offline scenarios?

[SENIOR BACKEND DEVELOPER MODE]
I understand both concerns. From a backend perspective, we can implement idempotent operations to handle retries safely, and use database transactions to ensure data consistency even with optimistic updates.

**Response to DevOps Engineer's monitoring concern:**
We can add specific metrics for optimistic update success/failure rates and data consistency checks.

**Additional considerations from Backend perspective:**
We should also implement proper conflict resolution for concurrent updates to prevent data corruption.
```

**PHASE 3: Solution Synthesis Example**:

```
[TECH LEAD MODE]
Based on all the perspectives shared, I can see we have a comprehensive understanding of the problem. Let me synthesize the best approach that addresses all concerns.

**UNIFIED SOLUTION APPROACH:**

**Core Solution:**
Implement optimistic UI updates with robust error handling and conflict resolution, supported by comprehensive monitoring and graceful offline degradation.

**Technical Implementation:**
- **Frontend:** Optimistic updates with skeleton loading states and rollback mechanisms
- **Backend:** Idempotent operations with transaction-based consistency and conflict resolution
- **DevOps:** Comprehensive monitoring for both online and offline user experiences
- **Data/Offline:** Proper sync strategies with conflict resolution for offline scenarios

[ARCHITECT MODE]
I agree with the Tech Lead's synthesis. From an architectural perspective, this solution aligns well with our microservices architecture and provides the scalability we need for future growth.

**Additional architectural considerations:**
We should implement this using event-driven patterns to ensure loose coupling between frontend and backend components.
```

### Role-Switching Best Practices

**DO'S**:

- ✅ Use clear role indicators: `[ROLE_NAME MODE]`
- ✅ Complete each role's analysis before switching in Phase 1
- ✅ Reference previous roles' insights when building upon them
- ✅ Maintain natural conversation flow in Phase 2
- ✅ Act as real people having technical discussions
- ✅ Challenge assumptions constructively from your role's perspective

**DON'TS**:

- ❌ Switch roles mid-analysis in Phase 1
- ❌ Forget to use role indicators
- ❌ Ignore previous roles' insights
- ❌ Be overly formal or robotic in discussions
- ❌ Skip role perspectives that seem less relevant
- ❌ Rush through role analysis without proper depth

### Role-Switching Checklist

**Before Each Role Switch**:

- [ ] Current role's analysis is complete
- [ ] Clear role indicator is used
- [ ] Previous insights are referenced (if applicable)
- [ ] Natural transition is maintained

**During Role Discussion**:

- [ ] Role perspective is maintained throughout response
- [ ] Previous insights are built upon
- [ ] Questions are asked from current role's perspective
- [ ] Compromises are proposed when conflicts arise

**After Role Switch**:

- [ ] Context is preserved
- [ ] Discussion flows naturally
- [ ] All perspectives are considered
- [ ] Decisions are documented

## Quality Standards

### Investigation Quality

- **Comprehensive analysis**: Each role provides detailed, technical analysis
- **Specific insights**: Avoid generic statements, provide specific technical details
- **Evidence-based**: Support conclusions with technical reasoning
- **Collaborative approach**: Build consensus through discussion, not dictation

### Discussion Quality

- **Natural conversation**: Engage as real people would discuss technical problems
- **Respectful disagreement**: Challenge assumptions constructively
- **Technical depth**: Maintain technical rigor throughout discussion
- **Solution-focused**: Work toward practical, implementable solutions

### Documentation Quality

- **Clear conclusions**: Document clear, actionable conclusions
- **Comprehensive coverage**: Include all role perspectives and insights
- **Implementation-ready**: Provide sufficient detail for implementation
- **Traceable decisions**: Document rationale for all key decisions

## Success Criteria

### Investigation Success

- [ ] All roles provided detailed technical analysis
- [ ] Collaborative discussion explored all perspectives
- [ ] Conflicts were resolved through technical discussion
- [ ] Unified solution addresses all role concerns
- [ ] Solution is technically feasible and implementable

### Documentation Success

- [ ] conclusions.md documents all role insights
- [ ] Spec files created following @create-spec.md guidelines
- [ ] Final solution is clearly documented and justified
- [ ] Implementation approach is well-defined
- [ ] Risk mitigation strategies are identified

### Process Success

- [ ] Natural role-switching maintained throughout
- [ ] Discussion flowed as real technical conversation
- [ ] All perspectives were considered and addressed
- [ ] Final solution represents team consensus
- [ ] Documentation is complete and actionable

---

## ✅ FINAL QUALITY VALIDATION

### Before Marking Investigation Complete

**MANDATORY QUALITY CHECK:**

**Technical Analysis Quality:**

- [ ] Each role provided specific, technical insights (not generic statements)
- [ ] Technical implications are explained with concrete examples and metrics
- [ ] Multiple solution approaches were considered and compared
- [ ] Risks and trade-offs are identified with mitigation strategies

**Role Authenticity:**

- [ ] Each role demonstrated their specific technical expertise
- [ ] Role-specific concerns and perspectives are clearly expressed
- [ ] Role interactions feel natural and professional
- [ ] No role confusion or overlapping perspectives

**Solution Quality:**

- [ ] Final solution addresses all major concerns from all roles
- [ ] Solution is technically feasible and implementable
- [ ] Implementation approach is clear and actionable
- [ ] Risk mitigation strategies are identified and documented

**Documentation Quality:**

- [ ] conclusions.md is complete and well-structured
- [ ] Spec files are created following @create-spec.md guidelines
- [ ] All key decisions and rationale are documented
- [ ] Next steps are clear and actionable
- [ ] **ALL files are created in `.agent-os/specs/YYYY-MM-DD-issue-name/` directory**
- [ ] **NO files are created outside of the `.agent-os` directory**
- [ ] **File structure matches exactly** what's described in this instruction
- [ ] **tasks.md follows proper breakdown** with decimal notation and TDD approach
- [ ] **All required files are present** (spec.md, spec-lite.md, technical-spec.md, tasks.md, conclusions.md)

### Quality Red Flags - Stop and Fix

**❌ IMMEDIATE STOP IF YOU SEE:**

- **Generic statements** like "This might affect performance" without specifics
- **Role confusion** where roles have the same perspective
- **Single solution approach** without considering alternatives
- **Missing technical details** in role analysis
- **Incomplete documentation** or missing spec files
- **No risk assessment** or mitigation strategies
- **Unclear decision rationale** in conclusions
- **Files created outside `.agent-os` directory**
- **Incorrect file structure** that doesn't match instruction requirements
- **Poor task breakdown** without decimal notation or TDD approach
- **Missing required files** (spec.md, spec-lite.md, technical-spec.md, tasks.md, conclusions.md)

### Success Indicators

**✅ HIGH QUALITY INVESTIGATION:**

- **Specific technical insights** from each role with concrete examples
- **Authentic role perspectives** that reflect real technical expertise
- **Comprehensive analysis** with multiple approaches and trade-offs
- **Clear decision rationale** with documented reasoning
- **Actionable implementation plan** with specific next steps
- **Complete documentation** following all templates and guidelines

**EXPECTED OUTCOMES:**

- **Well-rounded solution** that addresses all technical concerns
- **Implementation-ready specifications** with clear technical details
- **Comprehensive documentation** for future reference
- **Clear next steps** for implementation team

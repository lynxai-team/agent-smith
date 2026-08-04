# Phase 8: Create project-overview.md

## Context
- **Task ID:** maintain-all-agent-docs
- **Scope:** Project root documentation
- **Path:** `/workspace/agent-smith/`
- **Target File:** `/workspace/agent-smith/.agents/documentation/project-overview.md`
- **Prerequisites:** Phases 1-7 complete

---

## Prerequisites
- **Load the `execute-task-phase` skill** before proceeding. This skill defines the behavioral contract for executor agents running an assigned phase.
- **Load the `smart-explore` skill** before starting. This skill provides instructions about how to explore the codebase effectively.
- Read the exploration summary at `/workspace/.agents/tasks/maintain-all-agent-docs/documents/project-exploration-summary.md`

---

## Phase Goal
Create or update project-overview.md following the procedure's exact template (~1 page).

---

### Step 8.1: Read Existing project-overview.md
**Execution Plan:**
- Read existing `/workspace/agent-smith/.agents/documentation/project-overview.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 8.2: Gather Content
**Execution Plan:**
- **What is Agent Smith?**: One paragraph describing purpose and core capabilities
- **Core Capabilities**: 3-5 key capabilities with brief descriptions
- **Repository Structure**: Table of all 5 repos
- **Runtime Packages**: Table of 7 packages (optional but recommended for monorepo)
- **Key Architecture Patterns**: 2-4 patterns
- **Quick Reference**: Common tasks table
- **Code Snippets**: Typical usage examples
**Success Criteria:**
- [ ] All content gathered

### Step 8.3: Write project-overview.md
**Execution Plan:**
Write using this exact structure (use absolute paths starting with `/workspace`):
```markdown
# Agent Smith — Project Overview

> **Role**: Concise "what is this" for context loading (~1 page overview).
> **See also**: `/workspace/agent-smith/.agents/documentation/decision-tree.md` to find the right doc for your task.
> **See also**: `/workspace/agent-smith/.agents/documentation/project-nav.md` for detailed navigation and task references.

---

## What is Agent Smith?
<One paragraph>

---

## Core Capabilities
- **<Capability>** — <Brief description>
...

---

## Repository Structure
| Repo | Path | Purpose |
|------|------|---------|
...

---

## Runtime Packages (`/workspace/agent-smith/packages/`)
| Package | Purpose |
|---------|---------|
...

---

## Key Architecture Patterns
- **<Pattern>**: <Brief description>
...

---

## Quick Reference: Common Tasks
| Task | Go To |
|------|-------|
...

---

## Code Snippets
### <Snippet Title>
```<language>
# Example code
```

---

## Documentation Links
| Resource | Path |
|----------|------|
...
```
**Success Criteria:**
- [ ] File follows template exactly
- [ ] Approximately 1 page in length

### Step 8.4: Verify
**Execution Plan:**
- Verify header notes reference `/workspace/agent-smith/.agents/documentation/decision-tree.md` and `/workspace/agent-smith/.agents/documentation/project-nav.md`
- Verify core capabilities are current
- Verify repository structure table complete
- Verify code snippets showing typical usage patterns
- Verify documentation links table at end uses absolute paths
**Success Criteria:**
- [ ] All success criteria met

---

## Reporting
At the end of this phase, report all files created or modified. Include the full absolute path (starting with `/workspace`) for each file.

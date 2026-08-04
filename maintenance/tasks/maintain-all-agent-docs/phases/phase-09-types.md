# Phase 9: @agent-smith/types — codebase-summary.md

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `@agent-smith/types` — Shared interfaces (leaf package)
- **Path:** `/workspace/agent-smith/packages/types/`
- **Target File:** `/workspace/agent-smith/packages/types/.agents/documentation/codebase-summary.md`
- **Prerequisites:** Phases 1-8 complete

---

## Prerequisites
- **Load the `execute-task-phase` skill** before proceeding. This skill defines the behavioral contract for executor agents running an assigned phase.
- **Load the `smart-explore` skill** before starting. This skill provides instructions about how to explore the codebase effectively.
- Read the exploration summary at `/workspace/.agents/tasks/maintain-all-agent-docs/documents/project-exploration-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the types package using the 7-section format.

---

### Step 9.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith` (the repo containing this package)
- Run `git log --oneline -10 -- packages/types/` to see recent commits
- Run `git diff HEAD~10 -- packages/types/src/` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 9.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `/workspace/agent-smith/packages/types/` directory tree
- Prioritize files identified as changed in Step 9.0 (git diff)
- Identify entry points (`src/main.ts`, etc.)
- List all type definition files in `src/`
**Success Criteria:**
- [ ] All source files identified

### Step 9.2: Check Existing Documentation
**Execution Plan:**
- Read existing `/workspace/agent-smith/packages/types/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 9.3: Update codebase-summary.md
**Execution Plan:**
Load the `update-codebase-summary` skill and write using 7-section format:
1. **Summary:** Pure `.d.ts` type definitions — no runtime code
2. **Dependencies:** None (leaf package)
3. **Used By:** All other packages (core, agent, cli, wscli, server, ui, plugins, apps)
4. **Entry Point:** `src/main.ts`
5. **Key Files:** Table with all type definition files
6. **Architecture:** Pure type definitions, re-exported via main.ts
7. **Related:** core, agent, cli, wscli, server
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] All key types documented

### Step 9.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references use absolute paths (starting with `/workspace`)
**Success Criteria:**
- [ ] Documentation is accurate and complete

---

## Reporting
At the end of this phase, report all files created or modified. Include the full absolute path (starting with `/workspace`) for each file.

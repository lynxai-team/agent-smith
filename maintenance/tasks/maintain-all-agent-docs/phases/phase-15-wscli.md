# Phase 15: @agent-smith/wscli — codebase-summary.md

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `@agent-smith/wscli` — WebSocket CLI — real-time agent communication
- **Path:** `/workspace/agent-smith/packages/wscli/`
- **Target File:** `/workspace/agent-smith/packages/wscli/.agents/documentation/codebase-summary.md`
- **Prerequisites:** Phases 1-14 complete

---

## Prerequisites
- **Load the `execute-task-phase` skill** before proceeding. This skill defines the behavioral contract for executor agents running an assigned phase.
- **Load the `smart-explore` skill** before starting. This skill provides instructions about how to explore the codebase effectively.
- Read the exploration summary at `/workspace/.agents/tasks/maintain-all-agent-docs/documents/project-exploration-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for @agent-smith/wscli using the 7-section format.

---

### Step 15.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith` (the repo containing this module)
- Run `git log --oneline -10 -- packages/wscli` to see recent commits
- Run `git diff HEAD~10 -- packages/wscli/src/` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 15.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `/workspace/agent-smith/packages/wscli` directory tree
- Prioritize files identified as changed in Step 15.0 (git diff)
- Identify entry points, key files, dependencies
**Success Criteria:**
- [ ] All source files identified

### Step 15.2: Check Existing Documentation
**Execution Plan:**
- Read existing `/workspace/agent-smith/packages/wscli/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 15.3: Update codebase-summary.md
**Execution Plan:**
Load the `update-codebase-summary` skill and write using 7-section format:
1. **Summary:** One sentence describing module purpose
2. **Dependencies:** Internal (other agent-smith packages) + External (npm packages)
3. **Used By:** Which modules depend on this one
4. **Entry Point:** Main entry file path
5. **Key Files:** Table of important files with purpose
6. **Architecture:** 2-4 bullets on patterns, design decisions
7. **Related:** Links to related packages/repos
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] All key files and patterns documented

### Step 15.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references use absolute paths (starting with `/workspace`)
**Success Criteria:**
- [ ] Documentation is accurate and complete

---

## Reporting
At the end of this phase, report all files created or modified. Include the full absolute path (starting with `/workspace`) for each file.

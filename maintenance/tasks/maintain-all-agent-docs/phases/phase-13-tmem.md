# Phase 13: @agent-smith/tmem — codebase-summary.md

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `@agent-smith/tmem` — Long-term memory — persistent storage (SQLite)
- **Path:** `/workspace/agent-smith/packages/tmem/`
- **Target File:** `agent-smith/packages/tmem/.agents/documentation/codebase-summary.md`
- **Prerequisites:** Phases 1-12 complete

---

## Phase Goal
Update or create the codebase-summary.md for @agent-smith/tmem using the 7-section format.

---

### Step 13.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith` (the repo containing this module)
- Run `git log --oneline -10 -- agent-smith/packages/tmem` to see recent commits
- Run `git diff HEAD~10 -- agent-smith/packages/tmem/src/` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 13.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `agent-smith/packages/tmem` directory tree
- Prioritize files identified as changed in Step 13.0 (git diff)
- Identify entry points, key files, dependencies
**Success Criteria:**
- [ ] All source files identified

### Step 13.2: Check Existing Documentation
**Execution Plan:**
- Read existing `agent-smith/packages/tmem/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 13.3: Update codebase-summary.md
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

### Step 13.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

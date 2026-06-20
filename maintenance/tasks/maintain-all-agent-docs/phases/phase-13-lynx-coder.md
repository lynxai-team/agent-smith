# Phase 13: lynx-coder

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `lynx-coder` — Lynx AI coding agents
- **Path:** `/workspace/lynx-coder/`
- **Target File:** `lynx-coder/.agents/documentation/codebase-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the Lynx Coder repo using the 7-section format.

---

### Step 13.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/lynx-coder` (this is a separate git repo)
- Run `git log --oneline -10` to see recent commits
- Run `git diff HEAD~10` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/lynx-coder`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 13.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `lynx-coder/` directory tree
- Prioritize files identified as changed in Step 13.0 (git diff)
- Identify structure: dist/agents/ (16 YAML agents), dist/skills/ (3 skills), dist/actions/, dist/fragments/
- List key agents: lx.yml (coordinator), lx-coder, lx-ts, lx-planner, etc.
**Success Criteria:**
- [ ] All agents, skills, and actions identified

### Step 13.2: Check Existing Documentation
**Execution Plan:**
- Read existing `lynx-coder/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 13.3: Update codebase-summary.md
**Execution Plan:**
Write using 7-section format:
1. **Summary:** Collection of Lynx AI coding agents with skills and actions
2. **Dependencies:** @agent-smith/core (runtime)
3. **Used By:** End users (coding workflows)
4. **Entry Point:** N/A (feature collection)
5. **Key Files:** Table with dist/agents/lx.yml (coordinator), dist/skills/, dist/actions/run-npm-command.js, dist/fragments/
6. **Architecture:** Coordinator pattern — lx.yml delegates to specialists via run-agent tool
7. **Related:** agent-smith (core), agent-smith-plugins
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] Agent hierarchy documented (coordinator → specialists)

### Step 13.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

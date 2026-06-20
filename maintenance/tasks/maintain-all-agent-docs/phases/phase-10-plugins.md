# Phase 10: agent-smith-plugins

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `agent-smith-plugins` — Feature plugins
- **Path:** `/workspace/agent-smith-plugins/`
- **Target File:** `agent-smith-plugins/.agents/documentation/codebase-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the plugins repo using the 7-section format.

---

### Step 10.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith-plugins` (this is a separate git repo)
- Run `git log --oneline -10` to see recent commits
- Run `git diff HEAD~10` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith-plugins`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 10.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `agent-smith-plugins/` directory tree
- Prioritize files identified as changed in Step 10.0 (git diff)
- Identify plugin categories: agents/, code/ (git, sqlite), system/ (fs, shell), web/ (search, video)
- List all 7 plugins and their structure
**Success Criteria:**
- [ ] All plugins identified with categories

### Step 10.2: Check Existing Documentation
**Execution Plan:**
- Read existing `agent-smith-plugins/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 10.3: Update codebase-summary.md
**Execution Plan:**
Write using 7-section format:
1. **Summary:** Feature plugins (agents, git, sqlite, fs, shell, search, video) for Agent Smith
2. **Dependencies:** @agent-smith/core, @agent-smith/types (runtime)
3. **Used By:** agent-smith server, lynx-coder
4. **Entry Point:** N/A (plugin collection)
5. **Key Files:** Table with plugin categories and key files per plugin
6. **Architecture:** 4 categories (AI agents, code management, system utilities, web capabilities)
7. **Related:** agent-smith (core), lynx-coder
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] All 7 plugins documented with categories

### Step 10.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

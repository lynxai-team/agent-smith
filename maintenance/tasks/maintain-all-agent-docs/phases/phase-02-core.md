# Phase 2: @agent-smith/core

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `@agent-smith/core` — Runtime engine
- **Path:** `/workspace/agent-smith/packages/core/`
- **Target File:** `agent-smith/packages/core/.agents/documentation/codebase-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the core package using the 7-section format.

---

### Step 2.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith` (the repo containing this package)
- Run `git log --oneline -10 -- packages/core/` to see recent commits
- Run `git diff HEAD~10 -- packages/core/src/` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 2.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `agent-smith/packages/core/` directory tree
- Prioritize files identified as changed in Step 2.0 (git diff)
- Identify entry points (`src/main.ts`, `src/conf.ts`)
- List key modules: db, state, exec, actions, workflows, mcp
**Success Criteria:**
- [ ] All source files and directories identified

### Step 2.2: Check Existing Documentation
**Execution Plan:**
- Read existing `packages/core/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 2.3: Update codebase-summary.md
**Execution Plan:**
Write using 7-section format:
1. **Summary:** Central runtime — SQLite DB, config management, feature discovery, tool execution
2. **Dependencies:** types
3. **Used By:** agent, cli, wscli, server
4. **Entry Point:** `src/main.ts`
5. **Key Files:** Table with conf.ts, db/schemas.ts, state/features.ts, agents/useagent.ts, actions/cmd.ts, workflows/cmd.ts, mcp.ts
6. **Architecture:** SQLite 17 tables, reactive state, feature discovery from filesystem
7. **Related:** types, agent, cli, wscli, server
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] All key features documented (feature discovery, SQLite, MCP)

### Step 2.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

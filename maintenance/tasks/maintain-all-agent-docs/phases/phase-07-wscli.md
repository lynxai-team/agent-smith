# Phase 7: @agent-smith/wscli

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `@agent-smith/wscli` — WebSocket client
- **Path:** `/workspace/agent-smith/packages/wscli/`
- **Target File:** `agent-smith/packages/wscli/.agents/documentation/codebase-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the wscli package using the 7-section format.

---

### Step 7.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith` (the repo containing this package)
- Run `git log --oneline -10 -- packages/wscli/` to see recent commits
- Run `git diff HEAD~10 -- packages/wscli/src/` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 7.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `agent-smith/packages/wscli/` directory tree
- Prioritize files identified as changed in Step 7.0 (git diff)
- Identify entry points (`src/ws.ts`, `src/server.ts`)
- List key modules: api.ts (REST fallback)
**Success Criteria:**
- [ ] All source files and directories identified

### Step 7.2: Check Existing Documentation
**Execution Plan:**
- Read existing `packages/wscli/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 7.3: Update codebase-summary.md
**Execution Plan:**
Write using 7-section format:
1. **Summary:** Real-time bidirectional WebSocket communication with Agent Smith server
2. **Dependencies:** types
3. **Used By:** ui, apps (debate), plugins
4. **Entry Point:** `src/ws.ts`
5. **Key Files:** Table with ws.ts (WS client), server.ts (client features), api.ts (REST fallback)
6. **Architecture:** Auto-reconnect, message dispatch by type, generic awaiter pattern
7. **Related:** types, server, ui
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] useWsServer() and useClientFeatures() documented

### Step 7.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

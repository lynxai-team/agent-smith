# Phase 8: server

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `server` — Koa v3 backend
- **Path:** `/workspace/agent-smith/server/`
- **Target File:** `agent-smith/server/.agents/documentation/codebase-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the server module using the 7-section format.

---

### Step 8.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith` (the repo containing this module)
- Run `git log --oneline -10 -- server/` to see recent commits
- Run `git diff HEAD~10 -- server/src/` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 8.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `agent-smith/server/` directory tree
- Prioritize files identified as changed in Step 8.0 (git diff)
- Identify entry points (`src/index.ts`, `src/main.ts`)
- List key modules: server/, routes/, callbacks.ts
**Success Criteria:**
- [ ] All source files and directories identified

### Step 8.2: Check Existing Documentation
**Execution Plan:**
- Read existing `server/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 8.3: Update codebase-summary.md
**Execution Plan:**
Write using 7-section format:
1. **Summary:** Koa v3 backend exposing REST /api/* + WebSocket /ws for remote agent execution
2. **Dependencies:** core, types, agent
3. **Used By:** ui, cli (remote mode)
4. **Entry Point:** `src/main.ts` (library) / `src/index.ts` (CLI)
5. **Key Files:** Table with server/server.ts, server/router.ts, callbacks.ts, routes/agents.ts, routes/workflows.ts, utils.ts
6. **Architecture:** Tool call confirmation pattern (createAwaiter), REST + WS dual protocol
7. **Related:** core, types, agent, wscli
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] REST routes and WebSocket handlers documented

### Step 8.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

# Phase 3: @agent-smith/agent

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `@agent-smith/agent` — Agent inference loop
- **Path:** `/workspace/agent-smith/packages/agent/`
- **Target File:** `agent-smith/packages/agent/.agents/documentation/codebase-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the agent package using the 7-section format.

---

### Step 3.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith` (the repo containing this package)
- Run `git log --oneline -10 -- packages/agent/` to see recent commits
- Run `git diff HEAD~10 -- packages/agent/src/` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 3.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `agent-smith/packages/agent/` directory tree
- Prioritize files identified as changed in Step 3.0 (git diff)
- Identify entry points (`src/agent.ts`, `src/client.ts`)
- List key modules: history, variables, tools
**Success Criteria:**
- [ ] All source files and directories identified

### Step 3.2: Check Existing Documentation
**Execution Plan:**
- Read existing `packages/agent/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 3.3: Update codebase-summary.md
**Execution Plan:**
Write using 7-section format:
1. **Summary:** Agent class (recursive tool-calling loop) + Lm class (OpenAI-compatible HTTP client)
2. **Dependencies:** core, types
3. **Used By:** server, ui, plugins, apps, lynx-coder
4. **Entry Point:** `src/agent.ts`
5. **Key Files:** Table with agent.ts, client.ts (Lm), tools.ts, history/build.ts, variables.ts
6. **Architecture:** Recursive tool-calling loop, SSE streaming, OpenAI-compatible API
7. **Related:** core, types, server
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] Agent and Lm classes documented

### Step 3.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

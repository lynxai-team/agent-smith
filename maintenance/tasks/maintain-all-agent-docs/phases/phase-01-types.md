# Phase 1: @agent-smith/types

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `@agent-smith/types` — Shared interfaces (leaf package)
- **Path:** `/workspace/agent-smith/packages/types/`
- **Target File:** `agent-smith/packages/types/.agents/documentation/codebase-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the types package using the 7-section format.

---

### Step 1.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith` (the repo containing this package)
- Run `git log --oneline -10 -- packages/types/` to see recent commits
- Run `git diff HEAD~10 -- packages/types/src/` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 1.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `agent-smith/packages/types/` directory tree
- Prioritize files identified as changed in Step 1.0 (git diff)
- Identify entry points (`src/main.ts`, etc.)
- List all type definition files in `src/`
**Success Criteria:**
- [ ] All source files identified

### Step 1.2: Check Existing Documentation
**Execution Plan:**
- Read existing `packages/types/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 1.3: Update codebase-summary.md
**Execution Plan:**
Write using 7-section format:
1. **Summary:** Pure `.d.ts` type definitions — no runtime code
2. **Dependencies:** None (leaf package)
3. **Used By:** All other packages (core, agent, cli, wscli, server, ui, plugins, apps)
4. **Entry Point:** `src/main.ts`
5. **Key Files:** Table with `src/agent.ts`, `src/tools.ts`, `src/callbacks.ts`, `src/ws.ts`, `src/conf.ts`, `src/history.ts`
6. **Architecture:** Pure type definitions, re-exported via main.ts
7. **Related:** core, agent, cli, wscli, server
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] All key types documented (AgentParams, ToolSpec, InferenceCallbacks, etc.)

### Step 1.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

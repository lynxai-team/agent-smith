# Phase 4: @agent-smith/smem

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `@agent-smith/smem` — Semantic memory
- **Path:** `/workspace/agent-smith/packages/smem/`
- **Target File:** `agent-smith/packages/smem/.agents/documentation/codebase-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the smem package using the 7-section format.

---

### Step 4.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith` (the repo containing this package)
- Run `git log --oneline -10 -- packages/smem/` to see recent commits
- Run `git diff HEAD~10 -- packages/smem/src/` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 4.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `agent-smith/packages/smem/` directory tree
- Prioritize files identified as changed in Step 4.0 (git diff)
- Identify entry points (`src/useSmem.ts`)
- List key modules: snode, interfaces
**Success Criteria:**
- [ ] All source files and directories identified

### Step 4.2: Check Existing Documentation
**Execution Plan:**
- Read existing `packages/smem/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 4.3: Update codebase-summary.md
**Execution Plan:**
Write using 7-section format:
1. **Summary:** Vector-based semantic memory using LanceDB + Xenova embeddings
2. **Dependencies:** types
3. **Used By:** plugins (agents plugin uses smem for context)
4. **Entry Point:** `src/useSmem.ts`
5. **Key Files:** Table with useSmem.ts, useSnode.ts, smeminterfaces.ts
6. **Architecture:** LanceDB vector store, 384-dim embeddings, generic typed tables
7. **Related:** types, tmem
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] Vector search and embedding patterns documented

### Step 4.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

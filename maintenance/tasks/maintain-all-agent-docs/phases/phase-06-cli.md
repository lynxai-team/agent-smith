# Phase 6: @agent-smith/cli

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `@agent-smith/cli` — Terminal REPL
- **Path:** `/workspace/agent-smith/packages/cli/`
- **Target File:** `agent-smith/packages/cli/.agents/documentation/codebase-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the cli package using the 7-section format.

---

### Step 6.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith` (the repo containing this package)
- Run `git log --oneline -10 -- packages/cli/` to see recent commits
- Run `git diff HEAD~10 -- packages/cli/src/` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 6.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `agent-smith/packages/cli/` directory tree
- Prioritize files identified as changed in Step 6.0 (git diff)
- Identify entry points (`bin/index.ts`, `bin/cli.ts`)
- List key modules: cmd/ (base.ts, features.ts, aliases.ts, callbacks.ts)
**Success Criteria:**
- [ ] All source files and directories identified

### Step 6.2: Check Existing Documentation
**Execution Plan:**
- Read existing `packages/cli/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 6.3: Update codebase-summary.md
**Execution Plan:**
Write using 7-section format:
1. **Summary:** Commander.js CLI (`lm` binary) for interactive agent execution
2. **Dependencies:** core, types
3. **Used By:** End users (terminal), plugins (for feature registration)
4. **Entry Point:** `bin/index.ts`
5. **Key Files:** Table with bin/cli.ts, bin/cmd/base.ts, bin/cmd/features.ts, bin/cmd/aliases.ts, bin/cmd/callbacks.ts
6. **Architecture:** Dynamic command assembly, reactive mode state, feature-based commands
7. **Related:** core, types, wscli
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] CLI patterns documented (buildCmds, reactive mode)

### Step 6.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

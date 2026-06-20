# Phase 9: agent-smith (root)

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `agent-smith` — Root repository
- **Path:** `/workspace/agent-smith/`
- **Target File:** `agent-smith/.agents/documentation/codebase-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the agent-smith root repo using the 7-section format.

---

### Step 9.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith` (the repo root)
- Run `git log --oneline -10` to see recent commits
- Run `git diff HEAD~10` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 9.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `agent-smith/` root directory tree
- Prioritize files identified as changed in Step 9.0 (git diff)
- Identify structure: packages/, server/, docsite/, examples/
- Note monorepo organization
**Success Criteria:**
- [ ] Root structure mapped (packages, server, docsite, examples)

### Step 9.2: Check Existing Documentation
**Execution Plan:**
- Read existing `agent-smith/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 9.3: Update codebase-summary.md
**Execution Plan:**
Write using 7-section format:
1. **Summary:** Runtime packages + Koa server — the core framework for local-first AI agents
2. **Dependencies:** None (root repo)
3. **Used By:** agent-smith-plugins, agent-smith-ui, agent-smith-apps, lynx-coder
4. **Entry Point:** N/A (monorepo root)
5. **Key Files:** Table with packages/ (7 sub-packages), server/, docsite/, examples/
6. **Architecture:** Monorepo with 7 packages + server, TypeScript, feature discovery from filesystem
7. **Related:** agent-smith-plugins, agent-smith-ui, agent-smith-apps, lynx-coder
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] Monorepo structure documented

### Step 9.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

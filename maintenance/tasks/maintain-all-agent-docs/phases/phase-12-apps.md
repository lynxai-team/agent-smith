# Phase 12: agent-smith-apps

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `agent-smith-apps` — Vue 3 apps extending the dashboard
- **Path:** `/workspace/agent-smith-apps/`
- **Target File:** `agent-smith-apps/.agents/documentation/codebase-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the apps repo using the 7-section format.

---

### Step 12.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith-apps` (this is a separate git repo)
- Run `git log --oneline -10` to see recent commits
- Run `git diff HEAD~10` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith-apps`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 12.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `agent-smith-apps/` directory tree
- Prioritize files identified as changed in Step 12.0 (git diff)
- Identify debate app structure: debate/src/, debate/features/
- List key modules: debate.ts (useDebate composable), interfaces.ts, state.ts, conf.ts
**Success Criteria:**
- [ ] All source files and directories identified

### Step 12.2: Check Existing Documentation
**Execution Plan:**
- Read existing `agent-smith-apps/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 12.3: Update codebase-summary.md
**Execution Plan:**
Write using 7-section format:
1. **Summary:** Vue 3 applications extending the dashboard (debate app)
2. **Dependencies:** @agent-smith/types, @agent-smith/wscli (runtime)
3. **Used By:** agent-smith-ui (plugin integration)
4. **Entry Point:** `debate/src/main.ts`
5. **Key Files:** Table with debate/debate.ts, debate/interfaces.ts, debate/state.ts, debate/conf.ts, debate/AppComponent.vue, debate/AppSidebar.vue
6. **Architecture:** Multi-agent debate pattern, orchestrator/participant/advisor coordination
7. **Related:** agent-smith-ui, agent-smith-plugins (agents plugin)
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] Debate app patterns documented (orchestrator, participants, advisors)

### Step 12.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

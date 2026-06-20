# Phase 11: agent-smith-ui

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** `agent-smith-ui` — Vue 3 + PrimeVue web dashboard
- **Path:** `/workspace/agent-smith-ui/`
- **Target File:** `agent-smith-ui/.agents/documentation/codebase-summary.md`

---

## Phase Goal
Update or create the codebase-summary.md for the UI repo using the 7-section format.

---

### Step 11.0: Check Recent Changes (Git)
**Execution Plan:**
- cd into `/workspace/agent-smith-ui` (this is a separate git repo)
- Run `git log --oneline -10` to see recent commits
- Run `git diff HEAD~10` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory (`/workspace/agent-smith-ui`) cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 11.1: Explore Directory Structure
**Execution Plan:**
- Use the `smart-explore` skill to walk `agent-smith-ui/` directory tree
- Prioritize files identified as changed in Step 11.0 (git diff)
- Identify entry points (`src/main.ts`, `src/App.vue`)
- List key modules: state.ts, router.ts, services/, components/, apps/, scss/
**Success Criteria:**
- [ ] All source files and directories identified

### Step 11.2: Check Existing Documentation
**Execution Plan:**
- Read existing `agent-smith-ui/.agents/documentation/codebase-summary.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 11.3: Update codebase-summary.md
**Execution Plan:**
Write using 7-section format:
1. **Summary:** Vue 3 + PrimeVue dashboard for managing agents, workflows, tasks, and model configurations
2. **Dependencies:** @agent-smith/types, @agent-smith/wscli (runtime)
3. **Used By:** End users (web interface), agent-smith-apps
4. **Entry Point:** `src/main.ts`
5. **Key Files:** Table with main.ts, App.vue, state.ts, router.ts, services/api.ts, bin/index.ts
6. **Architecture:** Reactive state (Vue ref/reactive), WebSocket integration, 6 SCSS themes
7. **Related:** agent-smith (server), agent-smith-apps
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] Dashboard patterns documented (services, components, themes)

### Step 11.4: Verify
**Execution Plan:**
- Verify file format matches template
- Verify all cross-references are valid
**Success Criteria:**
- [ ] Documentation is accurate and complete

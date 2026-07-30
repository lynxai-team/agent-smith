# Phase 1: Explore the Project

## Context
- **Task ID:** maintain-all-agent-docs
- **Scope:** All repos and packages in the Agent Smith project
- **Target:** Gather comprehensive project knowledge for documentation creation

---

## Phase Goal
Walk the directory tree across all repos, identify structure, conventions, and patterns to inform all subsequent documentation phases.

---

### Step 1.1: Walk Directory Tree
**Execution Plan:**
- Explore `/workspace/agent-smith/` — root repo with packages and server
- Explore `/workspace/agent-smith-plugins/` — plugins repo
- Explore `/workspace/agent-smith-ui/` — UI repo
- Explore `/workspace/agent-smith-apps/` — apps repo
- Explore `/workspace/lynx-coder/` — Lynx Coder repo
- Use `smart-explore` skill for each repo (excludes node_modules, .git, build artifacts)
**Success Criteria:**
- [ ] All 5 repos explored
- [ ] Directory structure documented for each repo

### Step 1.2: Identify Key Elements
**Execution Plan:**
- For each repo/package, identify:
  - Entry points (main.ts, index.ts, bin files)
  - Dependencies (package.json, internal references)
  - Key files (config, core logic, tests)
- Read manifest files (package.json, tsconfig.json) to understand structure
**Success Criteria:**
- [ ] Entry points identified for all modules
- [ ] Dependencies cataloged
- [ ] Key files listed

### Step 1.3: Document Conventions and Patterns
**Execution Plan:**
- Identify key conventions used by the project:
  - Tool formats (how tools are defined)
  - File structures (naming patterns, directory organization)
  - State management patterns
  - Package interdependencies
- Create exploration notes document at `.agents/tasks/maintain-all-agent-docs/documents/exploration-notes.md`
**Success Criteria:**
- [ ] 3-5 key conventions documented
- [ ] Exploration notes file created for subsequent agents to reference

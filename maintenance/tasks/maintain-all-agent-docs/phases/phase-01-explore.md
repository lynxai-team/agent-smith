# Phase 1: Explore the Project

## Context
- **Task ID:** maintain-all-agent-docs
- **Scope:** All repos and packages in the Agent Smith project
- **Target:** Gather comprehensive project knowledge for documentation creation

---

## Phase Goal
Walk the directory tree across all repos, identify structure, conventions, and patterns to inform all subsequent documentation phases. Produce a summary document that other agents will use to understand the codebase faster.

---

## Prerequisites
- **Load the `execute-task-phase` skill** before proceeding. This skill defines the behavioral contract for executor agents running an assigned phase.
- **Load the `smart-explore` skill** before starting exploration. This skill provides instructions about how to explore the codebase effectively.

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
**Success Criteria:**
- [ ] 3-5 key conventions documented

### Step 1.4: Produce Summary Document
**Execution Plan:**
- Create a comprehensive summary document at `/workspace/.agents/tasks/maintain-all-agent-docs/documents/project-exploration-summary.md`
- The summary must include:
  - Repository map with paths and purposes
  - Package/module dependency graph
  - Key entry points for each module
  - Conventions and patterns observed
  - Notes on recent changes (from git history)
- **This document will be used by all subsequent agents** to understand the codebase faster. Ensure it is clear, well-structured, and information-dense.
**Success Criteria:**
- [ ] Summary document created at `/workspace/.agents/tasks/maintain-all-agent-docs/documents/project-exploration-summary.md`
- [ ] Document covers all 5 repos and 13 modules
- [ ] Document is structured for quick reference by other agents

---

## Reporting
At the end of this phase, report all files created or modified. Include the full absolute path (starting with `/workspace`) for each file.

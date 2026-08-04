# Phase 22: Create project-nav.md

## Context
- **Task ID:** maintain-all-agent-docs
- **Scope:** Project root documentation
- **Path:** `/workspace/agent-smith/`
- **Target File:** `/workspace/agent-smith/.agents/documentation/project-nav.md`
- **Prerequisites:** All phases 1-21 complete

---

## Prerequisites
- **Load the `execute-task-phase` skill** before proceeding. This skill defines the behavioral contract for executor agents running an assigned phase.
- **Load the `smart-explore` skill** before starting. This skill provides instructions about how to explore the codebase effectively.
- Read the exploration summary at `/workspace/.agents/tasks/maintain-all-agent-docs/documents/project-exploration-summary.md`

---

## Phase Goal
Create or update project-nav.md following the procedure's exact template — the comprehensive navigation map.

---

### Step 22.1: Read Existing project-nav.md
**Execution Plan:**
- Read existing `/workspace/agent-smith/.agents/documentation/project-nav.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 22.2: Load update-project-nav Skill
**Execution Plan:**
- Load the `update-project-nav` skill
- Follow its template for creating/updating project-nav.md
**Success Criteria:**
- [ ] Skill loaded and understood

### Step 22.3: Write project-nav.md
**Execution Plan:**
Write using this exact structure (use absolute paths starting with `/workspace`):
```markdown
# Agent Smith — Project Navigation

> **Role**: Comprehensive navigation map with dependency graph, task references, and code snippets.
> **See also**: `/workspace/agent-smith/.agents/documentation/decision-tree.md` to find the right doc for your task.
> **See also**: `/workspace/agent-smith/.agents/documentation/project-overview.md` for concise overview (~1 page).

---

## Project Overview
<One paragraph>

---

## Architecture Principles
- **<Principle>**: <Brief description>
...

---

## Dependency Graph
```
agent-smith (root)
├── packages/
│   ├── types/ (leaf)
│   ├── core/ → types
│   ├── agent/ → types, core
│   ├── smem/ → types, core, agent
│   ├── tmem/ → types, core, agent
│   ├── cli/ → types, core, agent
│   └── wscli/ → types, core, agent
└── server/ → types, core, agent
```

---

## Packages / Modules
### `@agent-smith/types`
- **Purpose**: Shared interfaces — all packages depend on this
...

---

## Server
- **Purpose**: HTTP/WebSocket server for agent execution
...

---

## Plugins (`/workspace/agent-smith-plugins/`)
- **Purpose**: Plugin system for extending agent capabilities
...

---

## UI (`/workspace/agent-smith-ui/`)
- **Purpose**: Web interface for Agent Smith
...

---

## Apps (`/workspace/agent-smith-apps/`)
- **Purpose**: Applications built on Agent Smith
...

---

## Code Snippets
### <Snippet Title>
```<language>
# Example code
```

---

## Navigation Quick Reference
| Task | Go To |
|------|-------|
...

---

## Documentation Links
| Resource | Path |
|----------|------|
...

---

## Key Conventions & Patterns
- **<Convention>**: <Brief description>
...
```
**Success Criteria:**
- [ ] File follows template exactly
- [ ] All required sections present

### Step 22.4: Verify
**Execution Plan:**
- Verify Project Overview, Architecture Principles, Dependency Graph sections present
- Verify Packages/Modules sections cover all packages
- Verify Navigation Quick Reference current with absolute paths
- Verify Documentation Links complete with absolute paths
- Verify Key Conventions & Patterns documented
- Verify optional sections (Server, Plugins, UI, Apps) included
**Success Criteria:**
- [ ] All success criteria met

---

## Reporting
At the end of this phase, report all files created or modified. Include the full absolute path (starting with `/workspace`) for each file.

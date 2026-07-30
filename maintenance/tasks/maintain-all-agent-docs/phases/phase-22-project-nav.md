# Phase 22: Create project-nav.md

## Context
- **Task ID:** maintain-all-agent-docs
- **Scope:** Project root documentation
- **Path:** `/workspace/agent-smith/`
- **Target File:** `agent-smith/.agents/documentation/project-nav.md`
- **Prerequisites:** All phases 1-21 complete

---

## Phase Goal
Create or update project-nav.md following the procedure's exact template — the comprehensive navigation map.

---

### Step 22.1: Read Existing project-nav.md
**Execution Plan:**
- Read existing `.agents/documentation/project-nav.md` (if exists)
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
Write using this exact structure (from procedure):
```markdown
# Agent Smith — Project Navigation

> **Role**: Comprehensive navigation map with dependency graph, task references, and code snippets.
> **See also**: `.agents/documentation/decision-tree.md` to find the right doc for your task.
> **See also**: `.agents/documentation/project-overview.md` for concise overview (~1 page).

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

## Plugins (`agent-smith-plugins/`)
- **Purpose**: Plugin system for extending agent capabilities
...

---

## UI (`agent-smith-ui/`)
- **Purpose**: Web interface for Agent Smith
...

---

## Apps (`agent-smith-apps/`)
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
- Verify Navigation Quick Reference current
- Verify Documentation Links complete
- Verify Key Conventions & Patterns documented
- Verify optional sections (Server, Plugins, UI, Apps) included
**Success Criteria:**
- [ ] All success criteria met

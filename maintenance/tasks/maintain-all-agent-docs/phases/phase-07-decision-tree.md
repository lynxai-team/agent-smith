# Phase 7: Create decision-tree.md

## Context
- **Task ID:** maintain-all-agent-docs
- **Scope:** Project root documentation
- **Path:** `/workspace/agent-smith/`
- **Target File:** `agent-smith/.agents/documentation/decision-tree.md`
- **Prerequisites:** Phases 1-6 complete

---

## Phase Goal
Create or update decision-tree.md following the procedure's exact template.

---

### Step 7.1: Read Existing decision-tree.md
**Execution Plan:**
- Read existing `.agents/documentation/decision-tree.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 7.2: Map All Repos/Modules
**Execution Plan:**
- List all 5 repos with their codebase-summary.md paths
- List all 7 runtime packages with their codebase-summary.md paths
- Include server, plugins, UI, apps, lynx-coder entries
- Create "Common Tasks" table mapping tasks to paths
**Success Criteria:**
- [ ] All repos and modules have entries
- [ ] Task-to-path mappings complete

### Step 7.3: Write decision-tree.md
**Execution Plan:**
Write using this exact structure:
```markdown
# Documentation Decision Tree

> Quick guide: What to read based on your task

## I need to understand the project
- High-level overview → `.agents/documentation/project-overview.md`
- Full navigation map → `.agents/documentation/project-nav.md`
- Structured summary → `.agents/documentation/codebase-summary.md`

## I need to work on a specific repo/package
- `agent-smith` (root) → `agent-smith/.agents/documentation/codebase-summary.md`
- `@agent-smith/types` → `agent-smith/packages/types/.agents/documentation/codebase-summary.md`
- ... (all packages and repos)

## I need to work on a specific package
- `<package-name>` → `<repo>/packages/<package>/.agents/documentation/codebase-summary.md`
- ...

## I need detailed documentation
- `<topic>` → `<path-to-docs>`
- ...

## Common Tasks (Quick Reference)
| Task | Go To |
|------|-------|
| <Task description> | `<path>` |

## Conventions
- <Convention> — <Brief description>

→ See `AGENTS.md` for full conventions summary.
```
**Success Criteria:**
- [ ] File follows template exactly
- [ ] Ends with reference to AGENTS.md for conventions

### Step 7.4: Verify
**Execution Plan:**
- Verify organized by task type
- Verify "Common Tasks" table maps tasks to paths
- Verify all repos/modules have entries
- Verify ends with link to root AGENTS.md for conventions
**Success Criteria:**
- [ ] All success criteria met

# Task Plan: maintain-all-agent-docs

> **Project:** Agent Smith
> **Scope:** Create/update all agent navigation docs following the standardized procedure
> **Type:** Team task — coordinator delegates phases to executor agents (sequential execution)

---

## Procedure Workflow

This task follows the documentation procedure's 8-step workflow:

1. **Explore the Project** — Walk directory tree, identify repos, packages, entry points
2. **Create Root AGENTS.md** — Project index with mission, conventions, quick start
3. **Create Per-Repo AGENTS.md** — Localized context for each external repo (4 repos)
4. **Create decision-tree.md** — Quick guide to find the right doc for your task
5. **Create project-overview.md** — Concise ~1 page overview
6. **Create codebase-summary.md** — For every repo/module (13 modules)
7. **Create project-nav.md** — Comprehensive navigation map
8. **Cross-Reference and Verify** — Ensure no duplication, all links valid

---

## Phase Structure

### Phase Group A: Foundation (2 phases)
Explore the project and create the root AGENTS.md.

| Phase | Scope | Path | Phase File |
|-------|-------|------|------------|
| 1 | Explore the Project | All repos | `phases/phase-01-explore.md` |
| 2 | Create Root AGENTS.md | `agent-smith/` | `phases/phase-02-root-agents.md` |

### Phase Group B: Per-Repo AGENTS.md (4 phases)
Create localized AGENTS.md for each external repo.

| Phase | Repo | Path | Phase File |
|-------|------|------|------------|
| 3 | `agent-smith-plugins` | `/workspace/agent-smith-plugins/` | `phases/phase-03-agents-plugins.md` |
| 4 | `agent-smith-ui` | `/workspace/agent-smith-ui/` | `phases/phase-04-agents-ui.md` |
| 5 | `agent-smith-apps` | `/workspace/agent-smith-apps/` | `phases/phase-05-agents-apps.md` |
| 6 | `lynx-coder` | `/workspace/lynx-coder/` | `phases/phase-06-agents-lynx.md` |

### Phase Group C: Project-Level Docs (2 phases)
Create decision-tree.md and project-overview.md.

| Phase | File | Phase File |
|-------|------|------------|
| 7 | `decision-tree.md` | `phases/phase-07-decision-tree.md` |
| 8 | `project-overview.md` | `phases/phase-08-project-overview.md` |

### Phase Group D: codebase-summary.md (13 phases)
Create/update codebase-summary.md for every module using the `update-codebase-summary` skill.

| Phase | Module | Path | Phase File |
|-------|--------|------|------------|
| 9 | `@agent-smith/types` | `agent-smith/packages/types/` | `phases/phase-09-types.md` |
| 10 | `@agent-smith/core` | `agent-smith/packages/core/` | `phases/phase-10-core.md` |
| 11 | `@agent-smith/agent` | `agent-smith/packages/agent/` | `phases/phase-11-agent.md` |
| 12 | `@agent-smith/smem` | `agent-smith/packages/smem/` | `phases/phase-12-smem.md` |
| 13 | `@agent-smith/tmem` | `agent-smith/packages/tmem/` | `phases/phase-13-tmem.md` |
| 14 | `@agent-smith/cli` | `agent-smith/packages/cli/` | `phases/phase-14-cli.md` |
| 15 | `@agent-smith/wscli` | `agent-smith/packages/wscli/` | `phases/phase-15-wscli.md` |
| 16 | `server` | `agent-smith/server/` | `phases/phase-16-server.md` |
| 17 | `agent-smith` (root) | `agent-smith/` | `phases/phase-17-agent-smith-root.md` |
| 18 | `agent-smith-plugins` | `agent-smith-plugins/` | `phases/phase-18-plugins.md` |
| 19 | `agent-smith-ui` | `agent-smith-ui/` | `phases/phase-19-ui.md` |
| 20 | `agent-smith-apps` | `agent-smith-apps/` | `phases/phase-20-apps.md` |
| 21 | `lynx-coder` | `lynx-coder/` | `phases/phase-21-lynx-coder.md` |

### Phase Group E: Navigation & Verification (2 phases)
Create project-nav.md and perform cross-reference verification.

| Phase | Scope | Phase File |
|-------|-------|------------|
| 22 | Create `project-nav.md` | `phases/phase-22-project-nav.md` |
| 23 | Cross-reference verification & final quality check | `phases/phase-23-cross-reference.md` |

---

## Phase Execution Pattern

### Phases 1-8: Foundation & Project-Level Docs
Each phase creates one documentation file following the procedure's exact templates.

**Step Pattern:**
1. Read existing file (if exists) to identify gaps
2. Explore relevant directories for current state
3. Create/update file using the procedure's template
4. Verify against success criteria

### Phases 9-21: Module codebase-summary.md
Each phase follows the same workflow using the `update-codebase-summary` skill:

**Step Pattern:**
1. **Check Recent Changes (Git)**
   - Determine which git repository the module belongs to
   - cd into the correct repo directory
   - Run `git log --oneline -10 -- <relative-module-path>`
   - Run `git diff HEAD~10 -- <relative-module-path>/src/`
2. **Explore the Module**
   - Use `smart-explore` skill to walk directory tree
   - Prioritize files identified as changed in git diff
   - Identify entry points, key files, dependencies
3. **Check Existing Documentation**
   - Read existing `codebase-summary.md` (if exists)
   - Identify gaps, inaccuracies, outdated information
4. **Update or Create codebase-summary.md**
   - Write using the 7-section format (Summary, Dependencies, Used By, Entry Point, Key Files, Architecture, Related)
   - Include optional "Documentation" section ONLY for root codebase-summary.md
5. **Verify**
   - File follows 7-section format exactly
   - Information is accurate and current
   - Cross-references point to existing files

### Phase 22: Create project-nav.md
- Load and follow the `update-project-nav` skill
- Include all required sections (Project Overview, Architecture Principles, Dependency Graph, Packages/Modules, Code Snippets, Navigation Quick Reference, Documentation Links, Key Conventions & Patterns)
- Include optional sections (Server, Plugins, UI, Apps) as applicable

### Phase 23: Cross-Reference Verification
**Step 23.1: Check for Duplicated Content**
- Project description → ONLY in `project-nav.md` and `project-overview.md`
- Architecture patterns → ONLY in `project-nav.md`
- Code snippets → ONLY in `project-nav.md` and `project-overview.md`
- Module technical details → ONLY in `codebase-summary.md`
- Conventions → ONLY in root `AGENTS.md` (referenced by `decision-tree.md`)
- Per-repo context → ONLY in per-repo `AGENTS.md`

**Step 23.2: Verify Cross-References**
- Root `AGENTS.md` → links to decision-tree.md, project-overview.md, project-nav.md, codebase-summary.md, per-repo AGENTS.md
- Per-repo `AGENTS.md` → links to local codebase-summary.md; links back to root `../../AGENTS.md`
- `decision-tree.md` → references all doc files; ends with link to root AGENTS.md
- `project-overview.md` → header notes reference decision-tree.md and project-nav.md
- `codebase-summary.md` → Related section points to related modules
- `project-nav.md` → no external cross-references needed (primary source)

**Step 23.3: Final Quality Check**
- Files are information-dense (tables, bullets, one-line descriptions)
- No verbose explanations or filler content
- Paths are correct and consistent

---

## Rules Summary

| Rule | Detail |
|------|--------|
| No redundancy | Each piece of information lives in exactly one file |
| Standardized format | `codebase-summary.md` uses 7-section structure exactly |
| Information-dense | Keep files short. Use tables, bullets, one-line descriptions |
| project-nav.md is canonical | Single source of truth for project overview, architecture, snippets |
| decision-tree.md first | Always the first file agents should read to find the right doc |
| Language-agnostic | Adapt examples and conventions to the project's language |
| Optional sections | Include only when they add value for the specific project |

## Skills to Use

| Skill | When |
|-------|------|
| `smart-explore` | All phases — explore module directory tree |
| `update-codebase-summary` | Phases 9-21 — create/update module summaries |
| `update-project-nav` | Phase 22 — create/update navigation map |

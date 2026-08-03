# Task State: maintain-all-agent-docs

## Status: planned

## Project Context
- **Project:** Agent Smith
- **Scope:** Create/update all agent navigation docs following the standardized procedure
- **Modules to Document:** 13 codebase-summary.md + 4 per-repo AGENTS.md + 5 project-level docs = 22 files
- **Procedure:** Follow the documentation procedure's 8-step workflow

## Phase Files
| Phase Group | Phase | Module/Scope | File | Steps |
|-------------|-------|--------------|------|-------|
| **A: Foundation** | 1 | Explore the Project + produce summary | `phases/phase-01-explore.md` | 4 |
| | 2 | Root AGENTS.md | `phases/phase-02-root-agents.md` | 4 |
| **B: Per-Repo AGENTS.md** | 3 | `agent-smith-plugins` AGENTS.md | `phases/phase-03-agents-plugins.md` | 4 |
| | 4 | `agent-smith-ui` AGENTS.md | `phases/phase-04-agents-ui.md` | 4 |
| | 5 | `agent-smith-apps` AGENTS.md | `phases/phase-05-agents-apps.md` | 4 |
| | 6 | `lynx-coder` AGENTS.md | `phases/phase-06-agents-lynx.md` | 4 |
| **C: Project-Level Docs** | 7 | `decision-tree.md` | `phases/phase-07-decision-tree.md` | 4 |
| | 8 | `project-overview.md` | `phases/phase-08-project-overview.md` | 4 |
| **D: codebase-summary.md** | 9 | `@agent-smith/types` | `phases/phase-09-types.md` | 5 |
| | 10 | `@agent-smith/core` | `phases/phase-10-core.md` | 5 |
| | 11 | `@agent-smith/agent` | `phases/phase-11-agent.md` | 5 |
| | 12 | `@agent-smith/smem` | `phases/phase-12-smem.md` | 5 |
| | 13 | `@agent-smith/tmem` | `phases/phase-13-tmem.md` | 5 |
| | 14 | `@agent-smith/cli` | `phases/phase-14-cli.md` | 5 |
| | 15 | `@agent-smith/wscli` | `phases/phase-15-wscli.md` | 5 |
| | 16 | `server` | `phases/phase-16-server.md` | 5 |
| | 17 | `agent-smith` (root) | `phases/phase-17-agent-smith-root.md` | 5 |
| | 18 | `agent-smith-plugins` | `phases/phase-18-plugins.md` | 5 |
| | 19 | `agent-smith-ui` | `phases/phase-19-ui.md` | 5 |
| | 20 | `agent-smith-apps` | `phases/phase-20-apps.md` | 5 |
| | 21 | `lynx-coder` | `phases/phase-21-lynx-coder.md` | 5 |
| **E: Navigation & Verify** | 22 | `project-nav.md` | `phases/phase-22-project-nav.md` | 4 |
| | 23 | Cross-reference verification | `phases/phase-23-cross-reference.md` | 3 |

## Progress

### Phase Group A: Foundation
- [ ] Phase 1: Explore the Project
  - [ ] Step 1.1: Walk directory tree across all repos
  - [ ] Step 1.2: Identify repos, packages, entry points, dependencies
  - [ ] Step 1.3: Document key conventions and patterns
  - [ ] Step 1.4: Produce summary document at `.agents/tasks/maintain-all-agent-docs/documents/project-exploration-summary.md`

- [ ] Phase 2: Create Root AGENTS.md
  - [ ] Step 2.1: Read existing AGENTS.md (if exists)
  - [ ] Step 2.2: Determine mission statement, repos table, conventions
  - [ ] Step 2.3: Write AGENTS.md using procedure template
  - [ ] Step 2.4: Verify against success criteria

### Phase Group B: Per-Repo AGENTS.md
- [ ] Phase 3: `agent-smith-plugins` AGENTS.md
  - [ ] Step 3.1: Explore plugins repo structure
  - [ ] Step 3.2: Read existing AGENTS.md (if exists)
  - [ ] Step 3.3: Write per-repo AGENTS.md using procedure template
  - [ ] Step 3.4: Verify against success criteria

- [ ] Phase 4: `agent-smith-ui` AGENTS.md
  - [ ] Step 4.1: Explore UI repo structure
  - [ ] Step 4.2: Read existing AGENTS.md (if exists)
  - [ ] Step 4.3: Write per-repo AGENTS.md using procedure template
  - [ ] Step 4.4: Verify against success criteria

- [ ] Phase 5: `agent-smith-apps` AGENTS.md
  - [ ] Step 5.1: Explore apps repo structure
  - [ ] Step 5.2: Read existing AGENTS.md (if exists)
  - [ ] Step 5.3: Write per-repo AGENTS.md using procedure template
  - [ ] Step 5.4: Verify against success criteria

- [ ] Phase 6: `lynx-coder` AGENTS.md
  - [ ] Step 6.1: Explore lynx-coder repo structure
  - [ ] Step 6.2: Read existing AGENTS.md (if exists)
  - [ ] Step 6.3: Write per-repo AGENTS.md using procedure template
  - [ ] Step 6.4: Verify against success criteria

### Phase Group C: Project-Level Docs
- [ ] Phase 7: Create decision-tree.md
  - [ ] Step 7.1: Read existing decision-tree.md (if exists)
  - [ ] Step 7.2: Map all repos/modules to documentation paths
  - [ ] Step 7.3: Write decision-tree.md using procedure template
  - [ ] Step 7.4: Verify against success criteria

- [ ] Phase 8: Create project-overview.md
  - [ ] Step 8.1: Read existing project-overview.md (if exists)
  - [ ] Step 8.2: Gather core capabilities, architecture patterns
  - [ ] Step 8.3: Write project-overview.md using procedure template
  - [ ] Step 8.4: Verify against success criteria

### Phase Group D: codebase-summary.md
- [ ] Phase 9: `@agent-smith/types`
  - [ ] Step 9.1: Check recent changes (git)
  - [ ] Step 9.2: Explore module directory
  - [ ] Step 9.3: Check existing codebase-summary.md
  - [ ] Step 9.4: Update/create codebase-summary.md (7-section format)
  - [ ] Step 9.5: Verify accuracy and format

- [ ] Phase 10: `@agent-smith/core`
  - [ ] Step 10.1: Check recent changes (git)
  - [ ] Step 10.2: Explore module directory
  - [ ] Step 10.3: Check existing codebase-summary.md
  - [ ] Step 10.4: Update/create codebase-summary.md (7-section format)
  - [ ] Step 10.5: Verify accuracy and format

- [ ] Phase 11: `@agent-smith/agent`
  - [ ] Step 11.1: Check recent changes (git)
  - [ ] Step 11.2: Explore module directory
  - [ ] Step 11.3: Check existing codebase-summary.md
  - [ ] Step 11.4: Update/create codebase-summary.md (7-section format)
  - [ ] Step 11.5: Verify accuracy and format

- [ ] Phase 12: `@agent-smith/smem`
  - [ ] Step 12.1: Check recent changes (git)
  - [ ] Step 12.2: Explore module directory
  - [ ] Step 12.3: Check existing codebase-summary.md
  - [ ] Step 12.4: Update/create codebase-summary.md (7-section format)
  - [ ] Step 12.5: Verify accuracy and format

- [ ] Phase 13: `@agent-smith/tmem`
  - [ ] Step 13.1: Check recent changes (git)
  - [ ] Step 13.2: Explore module directory
  - [ ] Step 13.3: Check existing codebase-summary.md
  - [ ] Step 13.4: Update/create codebase-summary.md (7-section format)
  - [ ] Step 13.5: Verify accuracy and format

- [ ] Phase 14: `@agent-smith/cli`
  - [ ] Step 14.1: Check recent changes (git)
  - [ ] Step 14.2: Explore module directory
  - [ ] Step 14.3: Check existing codebase-summary.md
  - [ ] Step 14.4: Update/create codebase-summary.md (7-section format)
  - [ ] Step 14.5: Verify accuracy and format

- [ ] Phase 15: `@agent-smith/wscli`
  - [ ] Step 15.1: Check recent changes (git)
  - [ ] Step 15.2: Explore module directory
  - [ ] Step 15.3: Check existing codebase-summary.md
  - [ ] Step 15.4: Update/create codebase-summary.md (7-section format)
  - [ ] Step 15.5: Verify accuracy and format

- [ ] Phase 16: `server`
  - [ ] Step 16.1: Check recent changes (git)
  - [ ] Step 16.2: Explore module directory
  - [ ] Step 16.3: Check existing codebase-summary.md
  - [ ] Step 16.4: Update/create codebase-summary.md (7-section format)
  - [ ] Step 16.5: Verify accuracy and format

- [ ] Phase 17: `agent-smith` (root)
  - [ ] Step 17.1: Check recent changes (git)
  - [ ] Step 17.2: Explore root directory structure
  - [ ] Step 17.3: Check existing codebase-summary.md
  - [ ] Step 17.4: Update/create codebase-summary.md (7-section format + Documentation)
  - [ ] Step 17.5: Verify accuracy and format

- [ ] Phase 18: `agent-smith-plugins`
  - [ ] Step 18.1: Check recent changes (git)
  - [ ] Step 18.2: Explore plugins repo directory
  - [ ] Step 18.3: Check existing codebase-summary.md
  - [ ] Step 18.4: Update/create codebase-summary.md (7-section format)
  - [ ] Step 18.5: Verify accuracy and format

- [ ] Phase 19: `agent-smith-ui`
  - [ ] Step 19.1: Check recent changes (git)
  - [ ] Step 19.2: Explore UI repo directory
  - [ ] Step 19.3: Check existing codebase-summary.md
  - [ ] Step 19.4: Update/create codebase-summary.md (7-section format)
  - [ ] Step 19.5: Verify accuracy and format

- [ ] Phase 20: `agent-smith-apps`
  - [ ] Step 20.1: Check recent changes (git)
  - [ ] Step 20.2: Explore apps repo directory
  - [ ] Step 20.3: Check existing codebase-summary.md
  - [ ] Step 20.4: Update/create codebase-summary.md (7-section format)
  - [ ] Step 20.5: Verify accuracy and format

- [ ] Phase 21: `lynx-coder`
  - [ ] Step 21.1: Check recent changes (git)
  - [ ] Step 21.2: Explore lynx-coder repo directory
  - [ ] Step 21.3: Check existing codebase-summary.md
  - [ ] Step 21.4: Update/create codebase-summary.md (7-section format)
  - [ ] Step 21.5: Verify accuracy and format

### Phase Group E: Navigation & Verification
- [ ] Phase 22: Create project-nav.md
  - [ ] Step 22.1: Read existing project-nav.md (if exists)
  - [ ] Step 22.2: Load `update-project-nav` skill
  - [ ] Step 22.3: Write project-nav.md using skill template
  - [ ] Step 22.4: Verify against success criteria

- [ ] Phase 23: Cross-reference verification & final quality check
  - [ ] Step 23.1: Check for duplicated content across all files
  - [ ] Step 23.2: Verify all cross-references point to existing files
  - [ ] Step 23.3: Final quality check — information-dense, accurate, consistent

## Skills to Use

| Skill | When |
|-------|------|
| `smart-explore` | **All phases (1-23)** — every executor agent must load this skill before starting |
| `update-codebase-summary` | Phases 9-21 — create/update module summaries |
| `update-project-nav` | Phase 22 — create/update navigation map |

## Notes
- Next phase to execute: Phase 1
- **All phases execute sequentially** — no parallel execution supported yet
- Each phase must complete before moving to the next
- Phase 22 depends on all phases 1-21 being complete
- Phase 23 depends on Phase 22 being complete
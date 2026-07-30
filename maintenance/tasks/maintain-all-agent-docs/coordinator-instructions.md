# Coordinator Instructions: maintain-all-agent-docs

## Phase Files
| Phase Group | Phase | Module/Scope | File | Steps |
|-------------|-------|--------------|------|-------|
| **A: Foundation** | 1 | Explore the Project | `phases/phase-01-explore.md` | 3 |
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

## Execution Workflow

**All phases execute sequentially — one agent per phase.**

For each phase (1 through 23), follow this loop:

1. **Read `state.md`** — identify the next incomplete phase
2. **Read the phase file** — e.g., `phases/phase-01-explore.md` for Phase 1
3. **Delegate to one executor agent** — pass the phase file path and instructions
4. **Wait for the agent to complete** — do not proceed until the agent reports success
5. **Verify success criteria** — check that the phase file's checklist items are all marked `[x]`
6. **Update `state.md`** — mark the phase steps as completed (`- [x]`)
7. **Repeat** — go to step 1 for the next phase

## Execution Order

```
Phase 1 → Phase 2 → Phase 3 → ... → Phase 21 → Phase 22 → Phase 23 → COMPLETE
```

## Per-Phase Instructions

### Phase 1: Explore the Project
- Executor agent walks all repo directories
- Identifies repos, packages, entry points, dependencies, key files
- Documents conventions and patterns for use in subsequent phases
- Output: Exploration notes for coordinator to share with subsequent agents

### Phases 2-8: Foundation & Project-Level Docs
- Executor agent creates documentation files following procedure templates
- Each phase targets one specific file (AGENTS.md, decision-tree.md, project-overview.md)
- Per-repo AGENTS.md phases (3-6) create localized context for each external repo

### Phases 9-21: Module codebase-summary.md
- Executor agent uses `update-codebase-summary` skill
- Target: `<module-path>/.agents/documentation/codebase-summary.md`
- Write using the 7-section format (Summary, Dependencies, Used By, Entry Point, Key Files, Architecture, Related)
- Include optional "Documentation" section ONLY for Phase 17 (root codebase-summary.md)

### Phase 22: project-nav.md
- Executor agent loads `update-project-nav` skill
- Creates comprehensive navigation map with all required sections
- Include optional sections (Server, Plugins, UI, Apps) as applicable

### Phase 23: Cross-reference verification
- Executor agent checks for duplicated content, broken links, and quality across all docs
- Ensures each piece of information lives in exactly one file

## Rules

- **One agent per phase** — never spawn multiple agents simultaneously
- **Wait for completion** — verify the agent finished before moving to the next phase
- **Update state.md after each phase** — track progress incrementally
- **Verify success criteria** — check the phase file's checklist before marking complete
- **Share exploration data** — Phase 1's exploration notes should be shared with subsequent agents via the documents directory
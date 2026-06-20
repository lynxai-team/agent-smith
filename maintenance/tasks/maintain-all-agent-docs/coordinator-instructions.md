# Coordinator Instructions: maintain-all-agent-docs

## Phase Files
| Phase Group | Phase | Module/Scope | File | Steps |
|-------------|-------|--------------|------|-------|
| **A: Runtime Packages** | 1 | `@agent-smith/types` | `phases/phase-01-types.md` | 4 |
| | 2 | `@agent-smith/core` | `phases/phase-02-core.md` | 4 |
| | 3 | `@agent-smith/agent` | `phases/phase-03-agent.md` | 4 |
| | 4 | `@agent-smith/smem` | `phases/phase-04-smem.md` | 4 |
| | 5 | `@agent-smith/tmem` | `phases/phase-05-tmem.md` | 4 |
| | 6 | `@agent-smith/cli` | `phases/phase-06-cli.md` | 4 |
| | 7 | `@agent-smith/wscli` | `phases/phase-07-wscli.md` | 4 |
| **B: Server & Root** | 8 | `server` | `phases/phase-08-server.md` | 4 |
| | 9 | `agent-smith` (root) | `phases/phase-09-agent-smith-root.md` | 4 |
| **C: External Repos** | 10 | `agent-smith-plugins` | `phases/phase-10-plugins.md` | 4 |
| | 11 | `agent-smith-ui` | `phases/phase-11-ui.md` | 4 |
| | 12 | `agent-smith-apps` | `phases/phase-12-apps.md` | 4 |
| | 13 | `lynx-coder` | `phases/phase-13-lynx-coder.md` | 4 |
| **D: Project-Level** | 14 | project-nav, decision-tree, project-overview, AGENTS.md | `phases/phase-14-project-nav.md` | 4 |
| | 15 | Cross-reference verification & final quality check | `phases/phase-15-cross-reference.md` | 3 |

## Execution Workflow

**All phases execute sequentially — one agent per phase.**

For each phase (1 through 15), follow this loop:

1. **Read `state.md`** — identify the next incomplete phase
2. **Read the phase file** — e.g., `phases/phase-01-types.md` for Phase 1
3. **Delegate to one executor agent** — pass the phase file path and instructions
4. **Wait for the agent to complete** — do not proceed until the agent reports success
5. **Verify success criteria** — check that the phase file's checklist items are all marked `[x]`
6. **Update `state.md`** — mark the phase steps as completed (`- [x]`)
7. **Repeat** — go to step 1 for the next phase

## Execution Order

```
Phase 1 → Phase 2 → Phase 3 → ... → Phase 13 → Phase 14 → Phase 15 → COMPLETE
```

## Per-Phase Instructions

### Phases 1-13: Module codebase-summary.md
- Executor agent uses `update-codebase-summary` skill
- Target: `<module-path>/.agents/documentation/codebase-summary.md`
- Write using the 7-section format (Summary, Dependencies, Used By, Entry Point, Key Files, Architecture, Related)

### Phase 14: Project-level documentation
- Executor agent updates 4 files: `project-nav.md`, `decision-tree.md`, `project-overview.md`, `AGENTS.md`
- Use `update-project-nav` skill for `project-nav.md`

### Phase 15: Cross-reference verification
- Executor agent checks for duplicated content, broken links, and quality across all docs

## Rules

- **One agent per phase** — never spawn multiple agents simultaneously
- **Wait for completion** — verify the agent finished before moving to the next phase
- **Update state.md after each phase** — track progress incrementally
- **Verify success criteria** — check the phase file's checklist before marking complete

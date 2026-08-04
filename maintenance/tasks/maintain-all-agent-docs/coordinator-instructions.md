# Coordinator Instructions: maintain-all-agent-docs

## Phase Files
| Phase Group | Phase | Module/Scope | File | Steps |
|-------------|-------|--------------|------|-------|
| **A: Foundation** | 1 | Explore the Project + produce summary | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-01-explore.md` | 4 |
| | 2 | Root AGENTS.md | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-02-root-agents.md` | 4 |
| **B: Per-Repo AGENTS.md** | 3 | `agent-smith-plugins` AGENTS.md | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-03-agents-plugins.md` | 4 |
| | 4 | `agent-smith-ui` AGENTS.md | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-04-agents-ui.md` | 4 |
| | 5 | `agent-smith-apps` AGENTS.md | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-05-agents-apps.md` | 4 |
| | 6 | `lynx-coder` AGENTS.md | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-06-agents-lynx.md` | 4 |
| **C: Project-Level Docs** | 7 | `decision-tree.md` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-07-decision-tree.md` | 4 |
| | 8 | `project-overview.md` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-08-project-overview.md` | 4 |
| **D: codebase-summary.md** | 9 | `@agent-smith/types` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-09-types.md` | 5 |
| | 10 | `@agent-smith/core` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-10-core.md` | 5 |
| | 11 | `@agent-smith/agent` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-11-agent.md` | 5 |
| | 12 | `@agent-smith/smem` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-12-smem.md` | 5 |
| | 13 | `@agent-smith/tmem` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-13-tmem.md` | 5 |
| | 14 | `@agent-smith/cli` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-14-cli.md` | 5 |
| | 15 | `@agent-smith/wscli` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-15-wscli.md` | 5 |
| | 16 | `server` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-16-server.md` | 5 |
| | 17 | `agent-smith` (root) | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-17-agent-smith-root.md` | 5 |
| | 18 | `agent-smith-plugins` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-18-plugins.md` | 5 |
| | 19 | `agent-smith-ui` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-19-ui.md` | 5 |
| | 20 | `agent-smith-apps` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-20-apps.md` | 5 |
| | 21 | `lynx-coder` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-21-lynx-coder.md` | 5 |
| **E: Navigation & Verify** | 22 | `project-nav.md` | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-22-project-nav.md` | 4 |
| | 23 | Cross-reference verification | `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-23-cross-reference.md` | 3 |

## Execution Workflow

**All phases execute sequentially — one agent per phase.**

For each phase (1 through 23), follow this loop:

1. **Read `/workspace/.agents/tasks/maintain-all-agent-docs/state.md`** — identify the next incomplete phase
2. **Read the phase file** — e.g., `/workspace/.agents/tasks/maintain-all-agent-docs/phases/phase-01-explore.md` for Phase 1
3. **Delegate to one executor agent** — pass the phase file path and instructions
4. **Wait for the agent to complete** — do not proceed until the agent reports success
5. **Verify success criteria** — check that the phase file's checklist items are all marked `[x]`
6. **Update `/workspace/.agents/tasks/maintain-all-agent-docs/state.md`** — mark the phase steps as completed (`- [x]`)
7. **Repeat** — go to step 1 for the next phase

## Execution Order

```
Phase 1 → Phase 2 → Phase 3 → ... → Phase 21 → Phase 22 → Phase 23 → COMPLETE
```

## Per-Phase Instructions

### All Phases (1-23): Common Requirements
- **Every executor agent must load the `execute-task-phase` skill** before proceeding. This skill defines the behavioral contract for executor agents running an assigned phase.
- **Every executor agent must load the `smart-explore` skill** before starting their phase. This skill provides instructions about how to explore the codebase effectively.
- **Every executor agent must read the exploration summary** at `/workspace/.agents/tasks/maintain-all-agent-docs/documents/project-exploration-summary.md` (after Phase 1 completes) to understand the codebase faster.
- **Every executor agent must report what files it created or modified** at the end of its phase. Include a list of all file paths (absolute, starting with `/workspace`) that were created or updated.

### Phase 1: Explore the Project
- Walks all repo directories using the smart-explore skill
- Identifies repos, packages, entry points, dependencies, key files
- Documents conventions and patterns for use in subsequent phases
- **Produces a summary document** at `/workspace/.agents/tasks/maintain-all-agent-docs/documents/project-exploration-summary.md`
- **All subsequent agents must read this summary document** to understand the codebase faster

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
- **Absolute file paths**: you always use absolute file paths that starts with `/workspace` when communicating file paths to agents
- **Wait for completion** — verify the agent finished before moving to the next phase
- **Update state.md after each phase** — track progress incrementally
- **Verify success criteria** — check the phase file's checklist before marking complete
- **Share exploration data** — Phase 1's exploration notes should be shared with subsequent agents via the documents directory
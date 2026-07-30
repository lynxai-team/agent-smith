# Goals and Success Criteria: maintain-all-agent-docs

## Primary Goal
Create or update all AI agent navigation documentation files across the entire Agent Smith project following the standardized documentation procedure — covering all 5 repositories, 7 runtime packages, server, plugins, UI, apps, and Lynx Coder.

## Scope
- **Project:** Agent Smith (all repos and packages)
- **Target Documentation:** All files per the documentation procedure
- **Task Type:** Team task — coordinator delegates phases to executor agents

## Files to Create/Update

### Project Root (`/workspace/agent-smith/`)
| File | Purpose |
|------|---------|
| `AGENTS.md` | Project index with mission, conventions, quick start, doc links |
| `.agents/documentation/decision-tree.md` | Quick guide: find the right doc for your task |
| `.agents/documentation/project-overview.md` | Concise project overview (~1 page) |
| `.agents/documentation/codebase-summary.md` | Root codebase summary (7 sections + Documentation) |
| `.agents/documentation/project-nav.md` | Comprehensive navigation map |

### Per-Repo AGENTS.md (Multi-Repo Only)
| Repo | Path | File |
|------|------|------|
| `agent-smith` | `/workspace/agent-smith/` | Already covered by root AGENTS.md |
| `agent-smith-plugins` | `/workspace/agent-smith-plugins/` | `AGENTS.md` |
| `agent-smith-ui` | `/workspace/agent-smith-ui/` | `AGENTS.md` |
| `agent-smith-apps` | `/workspace/agent-smith-apps/` | `AGENTS.md` |
| `lynx-coder` | `/workspace/lynx-coder/` | `AGENTS.md` |

### codebase-summary.md (Every Repo/Module)
| # | Module | Path | Summary File |
|---|--------|------|-------------|
| 1 | `agent-smith` (root) | `/workspace/agent-smith/` | `.agents/documentation/codebase-summary.md` |
| 2 | `@agent-smith/types` | `agent-smith/packages/types/` | `packages/types/.agents/documentation/codebase-summary.md` |
| 3 | `@agent-smith/core` | `agent-smith/packages/core/` | `packages/core/.agents/documentation/codebase-summary.md` |
| 4 | `@agent-smith/agent` | `agent-smith/packages/agent/` | `packages/agent/.agents/documentation/codebase-summary.md` |
| 5 | `@agent-smith/smem` | `agent-smith/packages/smem/` | `packages/smem/.agents/documentation/codebase-summary.md` |
| 6 | `@agent-smith/tmem` | `agent-smith/packages/tmem/` | `packages/tmem/.agents/documentation/codebase-summary.md` |
| 7 | `@agent-smith/cli` | `agent-smith/packages/cli/` | `packages/cli/.agents/documentation/codebase-summary.md` |
| 8 | `@agent-smith/wscli` | `agent-smith/packages/wscli/` | `packages/wscli/.agents/documentation/codebase-summary.md` |
| 9 | `server` | `agent-smith/server/` | `server/.agents/documentation/codebase-summary.md` |
| 10 | `agent-smith-plugins` | `/workspace/agent-smith-plugins/` | `.agents/documentation/codebase-summary.md` |
| 11 | `agent-smith-ui` | `/workspace/agent-smith-ui/` | `.agents/documentation/codebase-summary.md` |
| 12 | `agent-smith-apps` | `/workspace/agent-smith-apps/` | `.agents/documentation/codebase-summary.md` |
| 13 | `lynx-coder` | `/workspace/lynx-coder/` | `.agents/documentation/codebase-summary.md` |

## Success Criteria

### For Each codebase-summary.md
- [ ] Summary accurately describes module purpose (one sentence)
- [ ] Dependencies list is current (internal and external)
- [ ] "Used By" section lists all consumers
- [ ] Entry point path is correct
- [ ] Key Files table includes all important files
- [ ] Architecture section reflects current patterns (2-4 bullets)
- [ ] Related modules section links to dependent modules
- [ ] Follows 7-section format exactly (Summary, Dependencies, Used By, Entry Point, Key Files, Architecture, Related)

### For Root AGENTS.md
- [ ] Mission statement is one concise sentence
- [ ] Repositories table includes all 5 repos with path and purpose
- [ ] Conventions section lists 3-5 key patterns
- [ ] Quick Start lists decision-tree.md FIRST, then project-overview.md, project-nav.md, per-repo summaries
- [ ] Documentation section lists all doc files with descriptions

### For Per-Repo AGENTS.md (4 repos)
- [ ] Self-contained context for agents working in that repo
- [ ] Structure table lists key directories
- [ ] Conventions include repo-specific patterns
- [ ] Quick Start references local codebase-summary.md first
- [ ] Documentation links back to root `../../AGENTS.md`

### For decision-tree.md
- [ ] Organized by task type (understand project, work on specific area, detailed docs)
- [ ] "Common Tasks" table maps tasks to paths
- [ ] All repos/modules have entries
- [ ] Ends with reference to AGENTS.md for conventions

### For project-overview.md
- [ ] ~1 page concise overview
- [ ] Header notes reference decision-tree.md and project-nav.md
- [ ] Core capabilities section current
- [ ] Repository structure table complete
- [ ] Code snippets showing typical usage patterns
- [ ] Documentation links table at end

### For project-nav.md
- [ ] Project Overview, Architecture Principles, Dependency Graph sections present
- [ ] Packages/Modules sections cover all packages
- [ ] Navigation Quick Reference current
- [ ] Documentation Links complete
- [ ] Key Conventions & Patterns documented

### Cross-Reference Rules
- [ ] No duplicated content across files
- [ ] All cross-references point to existing files
- [ ] project-nav.md is canonical for architecture/snippets
- [ ] codebase-summary.md contains module-specific details only
- [ ] AGENTS.md conventions referenced by decision-tree.md

## Files Modified (Total: 23)
- 1x Root `AGENTS.md`
- 4x Per-repo `AGENTS.md` (plugins, ui, apps, lynx-coder)
- 1x `decision-tree.md`
- 1x `project-overview.md`
- 1x `project-nav.md`
- 13x `codebase-summary.md` files (one per repo/package/server)

## Exclusions
- Package-specific docsite documentation (use `document-package` skill)
- README files (use `create-readme` skill)
- CLI usage patterns
- Individual plugin sub-module summaries (covered in parent repo summary)

## Notes
- Use `git log` and `git diff` to identify recent changes before exploring each module
- Focus documentation updates on areas that have changed since last update
- Each phase should check git history for its specific module path
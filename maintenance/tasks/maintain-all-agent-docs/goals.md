# Goals and Success Criteria: maintain-all-agent-docs

## Primary Goal
Perform a comprehensive audit and maintenance of all AI agent navigation documentation across the entire Agent Smith project — covering all 5 repositories, 7 runtime packages, server, plugins, UI, apps, and Lynx Coder.

## Scope
- **Project:** Agent Smith (all repos and packages)
- **Target Documentation:** `codebase-summary.md` files for every package/plugin, plus project-level docs (`project-nav.md`, `project-overview.md`, `decision-tree.md`, `AGENTS.md`)
- **Task Type:** Team task — coordinator delegates phases to executor agents

## Modules to Document

### Repositories (5)
| # | Repo | Path | Summary File |
|---|------|------|-------------|
| 1 | `agent-smith` (root) | `/workspace/agent-smith/` | `agent-smith/.agents/documentation/codebase-summary.md` |
| 2 | `agent-smith-plugins` | `/workspace/agent-smith-plugins/` | `agent-smith-plugins/.agents/documentation/codebase-summary.md` |
| 3 | `agent-smith-ui` | `/workspace/agent-smith-ui/` | `agent-smith-ui/.agents/documentation/codebase-summary.md` |
| 4 | `agent-smith-apps` | `/workspace/agent-smith-apps/` | `agent-smith-apps/.agents/documentation/codebase-summary.md` |
| 5 | `lynx-coder` | `/workspace/lynx-coder/` | `lynx-coder/.agents/documentation/codebase-summary.md` |

### Runtime Packages (7)
| # | Package | Path | Summary File |
|---|---------|------|-------------|
| 6 | `@agent-smith/types` | `agent-smith/packages/types/` | `packages/types/.agents/documentation/codebase-summary.md` |
| 7 | `@agent-smith/core` | `agent-smith/packages/core/` | `packages/core/.agents/documentation/codebase-summary.md` |
| 8 | `@agent-smith/agent` | `agent-smith/packages/agent/` | `packages/agent/.agents/documentation/codebase-summary.md` |
| 9 | `@agent-smith/smem` | `agent-smith/packages/smem/` | `packages/smem/.agents/documentation/codebase-summary.md` |
| 10 | `@agent-smith/tmem` | `agent-smith/packages/tmem/` | `packages/tmem/.agents/documentation/codebase-summary.md` |
| 11 | `@agent-smith/cli` | `agent-smith/packages/cli/` | `packages/cli/.agents/documentation/codebase-summary.md` |
| 12 | `@agent-smith/wscli` | `agent-smith/packages/wscli/` | `packages/wscli/.agents/documentation/codebase-summary.md` |

### Server (1)
| # | Module | Path | Summary File |
|---|--------|------|-------------|
| 13 | `server` | `agent-smith/server/` | `server/.agents/documentation/codebase-summary.md` |

### Plugins (7)
| # | Plugin | Path | Notes |
|---|--------|------|-------|
| 14-20 | agents, git, sqlite, fs, shell, search, video | `agent-smith-plugins/{category}/{plugin}/` | Covered in plugins repo summary |

### Apps (1)
| # | App | Path | Notes |
|---|-----|------|-------|
| 21 | debate | `agent-smith-apps/debate/` | Covered in apps repo summary |

## Success Criteria

### For Each codebase-summary.md
- [ ] Summary accurately describes module purpose (one sentence)
- [ ] Dependencies list is current (internal and external)
- [ ] "Used By" section lists all consumers
- [ ] Entry point path is correct
- [ ] Key Files table includes all important files
- [ ] Architecture section reflects current patterns (2-4 bullets)
- [ ] Related modules section links to dependent modules

### For Project-Level Docs
- [ ] `project-nav.md` — All repos/packages listed, dependency graph accurate, navigation quick reference current
- [ ] `project-overview.md` — Core capabilities current, architecture patterns reflect current design
- [ ] `decision-tree.md` — All task-to-path mappings current, all repos/modules have entries
- [ ] `AGENTS.md` — Mission statement current, repos table complete, conventions section accurate

### Cross-Reference Rules
- [ ] No duplicated content across files
- [ ] All cross-references point to existing files
- [ ] `project-nav.md` is canonical for architecture/snippets
- [ ] `codebase-summary.md` contains module-specific details only
- [ ] `AGENTS.md` conventions referenced by `decision-tree.md`

## Files Modified
- 13x `codebase-summary.md` files (one per repo/package/server)
- `.agents/documentation/project-nav.md` — Project navigation map
- `AGENTS.md` — Project index
- `.agents/documentation/decision-tree.md` — Task decision guide
- `.agents/documentation/project-overview.md` — Project overview

## Exclusions
- Package-specific docsite documentation (use `document-package` skill)
- README files (use `create-readme` skill)
- CLI usage patterns
- Individual plugin sub-module summaries (covered in parent repo summary)

## Notes
- Use `git log` and `git diff` to identify recent changes before exploring each module
- Focus documentation updates on areas that have changed since last update
- Each phase should check git history for its specific module path

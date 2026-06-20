# Goals and Success Criteria: maintain-agent-docs

## Primary Goal
Audit and maintain the AI agent navigation documentation (`codebase-summary.md`) for a single package or module within the Agent Smith project.

## Scope
- **Project:** Agent Smith
- **Target Documentation:** `codebase-summary.md` file for one specific package/module
- **Task Type:** Solo task — single agent executes all steps

## Task Parameters

This task accepts one parameter:
- **`package`** — The name/path of the package to document (e.g., `@agent-smith/core`, `server`, `agent-smith-plugins`)

## Available Modules

### Runtime Packages (7)
| Package | Path | Summary File |
|---------|------|-------------|
| `@agent-smith/types` | `agent-smith/packages/types/` | `packages/types/.agents/documentation/codebase-summary.md` |
| `@agent-smith/core` | `agent-smith/packages/core/` | `packages/core/.agents/documentation/codebase-summary.md` |
| `@agent-smith/agent` | `agent-smith/packages/agent/` | `packages/agent/.agents/documentation/codebase-summary.md` |
| `@agent-smith/smem` | `agent-smith/packages/smem/` | `packages/smem/.agents/documentation/codebase-summary.md` |
| `@agent-smith/tmem` | `agent-smith/packages/tmem/` | `packages/tmem/.agents/documentation/codebase-summary.md` |
| `@agent-smith/cli` | `agent-smith/packages/cli/` | `packages/cli/.agents/documentation/codebase-summary.md` |
| `@agent-smith/wscli` | `agent-smith/packages/wscli/` | `packages/wscli/.agents/documentation/codebase-summary.md` |

### Server & Root
| Module | Path | Summary File |
|--------|------|-------------|
| `server` | `agent-smith/server/` | `server/.agents/documentation/codebase-summary.md` |
| `agent-smith` (root) | `agent-smith/` | `agent-smith/.agents/documentation/codebase-summary.md` |

### External Repos
| Repo | Path | Summary File |
|------|------|-------------|
| `agent-smith-plugins` | `agent-smith-plugins/` | `agent-smith-plugins/.agents/documentation/codebase-summary.md` |
| `agent-smith-ui` | `agent-smith-ui/` | `agent-smith-ui/.agents/documentation/codebase-summary.md` |
| `agent-smith-apps` | `agent-smith-apps/` | `agent-smith-apps/.agents/documentation/codebase-summary.md` |
| `lynx-coder` | `lynx-coder/` | `lynx-coder/.agents/documentation/codebase-summary.md` |

## Success Criteria

### For codebase-summary.md
- [ ] Summary accurately describes module purpose (one sentence)
- [ ] Dependencies list is current (internal and external)
- [ ] "Used By" section lists all consumers
- [ ] Entry point path is correct
- [ ] Key Files table includes all important files
- [ ] Architecture section reflects current patterns (2-4 bullets)
- [ ] Related modules section links to dependent modules

## Files Modified
- 1x `codebase-summary.md` file (for the specified package)

## Exclusions
- Package-specific docsite documentation (use `document-agent-smith-package` skill)
- README files (use `create-readme` skill)
- CLI usage patterns
- Project-level docs (`project-nav.md`, `decision-tree.md`, etc.) — use `maintain-all-agent-docs` task

## Notes
- Use `git log` and `git diff` to identify recent changes before exploring the module
- Focus documentation updates on areas that have changed since last update

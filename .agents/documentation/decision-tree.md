# Documentation Decision Tree

> Quick guide: What to read based on your task

## I need to understand the project
- High-level overview → `/workspace/agent-smith/.agents/documentation/project-overview.md`
- Full navigation map → `/workspace/agent-smith/.agents/documentation/project-nav.md`
- Structured summary → `/workspace/agent-smith/.agents/documentation/codebase-summary.md`

## I need to work on a specific repo/package
- `agent-smith` (root) → `/workspace/agent-smith/.agents/documentation/codebase-summary.md`
- `@agent-smith/types` → `/workspace/agent-smith/packages/types/.agents/documentation/codebase-summary.md`
- `@agent-smith/browser` → `/workspace/agent-smith/packages/browser/.agents/documentation/codebase-summary.md`
- `@agent-smith/tmem` → `/workspace/agent-smith/packages/tmem/.agents/documentation/codebase-summary.md`
- `@agent-smith/smem` → `/workspace/agent-smith/packages/smem/.agents/documentation/codebase-summary.md`
- `@agent-smith/agent` → `/workspace/agent-smith/packages/agent/.agents/documentation/codebase-summary.md`
- `@agent-smith/core` → `/workspace/agent-smith/packages/core/.agents/documentation/codebase-summary.md`
- `@agent-smith/cli` → `/workspace/agent-smith/packages/cli/.agents/documentation/codebase-summary.md`
- `@agent-smith/wscli` → `/workspace/agent-smith/packages/wscli/.agents/documentation/codebase-summary.md`
- `agent-smith/server/node` → `/workspace/agent-smith/server/node/.agents/documentation/codebase-summary.md`
- `agent-smith/server/go` → `/workspace/agent-smith/server/go/.agents/documentation/codebase-summary.md`
- `agent-smith-plugins` → `/workspace/agent-smith-plugins/.agents/documentation/codebase-summary.md`
- `agent-smith-ui` → `/workspace/agent-smith-ui/.agents/documentation/codebase-summary.md`
- `agent-smith-apps` → `/workspace/agent-smith-apps/.agents/documentation/codebase-summary.md`
- `lynx-coder` → `/workspace/lynx-coder/.agents/documentation/codebase-summary.md`

## I need to work on a specific package
- `<package-name>` → `/workspace/<repo>/packages/<package>/.agents/documentation/codebase-summary.md`
- `@agent-smith/types` → `/workspace/agent-smith/packages/types/.agents/documentation/codebase-summary.md`
- `@agent-smith/agent` → `/workspace/agent-smith/packages/agent/.agents/documentation/codebase-summary.md`
- `@agent-smith/core` → `/workspace/agent-smith/packages/core/.agents/documentation/codebase-summary.md`
- `@agent-smith/cli` → `/workspace/agent-smith/packages/cli/.agents/documentation/codebase-summary.md`
- `@agent-smith/wscli` → `/workspace/agent-smith/packages/wscli/.agents/documentation/codebase-summary.md`
- `@agent-smith/smem` → `/workspace/agent-smith/packages/smem/.agents/documentation/codebase-summary.md`
- `@agent-smith/tmem` → `/workspace/agent-smith/packages/tmem/.agents/documentation/codebase-summary.md`
- `@agent-smith/browser` → `/workspace/agent-smith/packages/browser/.agents/documentation/codebase-summary.md`

## I need detailed documentation
- Project conventions → `/workspace/agent-smith/AGENTS.md`
- Plugin system docs → `/workspace/agent-smith-plugins/README.md`
- UI dashboard docs → `/workspace/agent-smith-ui/README.md`
- Debate app docs → `/workspace/agent-smith-apps/README.md`
- Lynx Coder docs → `/workspace/lynx-coder/README.md`
- Full docsite → `/workspace/agent-smith/docsite/public/doc`

## Common Tasks (Quick Reference)
| Task | Go To |
|------|-------|
| Understand project structure | `/workspace/agent-smith/.agents/documentation/project-overview.md` |
| Navigate codebase dependencies | `/workspace/agent-smith/.agents/documentation/project-nav.md` |
| Work on core types | `/workspace/agent-smith/packages/types/.agents/documentation/codebase-summary.md` |
| Work on agent runtime | `/workspace/agent-smith/packages/agent/.agents/documentation/codebase-summary.md` |
| Work on core framework | `/workspace/agent-smith/packages/core/.agents/documentation/codebase-summary.md` |
| Work on CLI | `/workspace/agent-smith/packages/cli/.agents/documentation/codebase-summary.md` |
| Work on WebSocket client | `/workspace/agent-smith/packages/wscli/.agents/documentation/codebase-summary.md` |
| Work on semantic memory | `/workspace/agent-smith/packages/smem/.agents/documentation/codebase-summary.md` |
| Work on transient memory | `/workspace/agent-smith/packages/tmem/.agents/documentation/codebase-summary.md` |
| Work on browser LM | `/workspace/agent-smith/packages/browser/.agents/documentation/codebase-summary.md` |
| Work on Node server | `/workspace/agent-smith/server/node/.agents/documentation/codebase-summary.md` |
| Work on Go server | `/workspace/agent-smith/server/go/.agents/documentation/codebase-summary.md` |
| Work on plugins | `/workspace/agent-smith-plugins/.agents/documentation/codebase-summary.md` |
| Work on UI dashboard | `/workspace/agent-smith-ui/.agents/documentation/codebase-summary.md` |
| Work on apps (debate) | `/workspace/agent-smith-apps/.agents/documentation/codebase-summary.md` |
| Work on Lynx Coder agents | `/workspace/lynx-coder/.agents/documentation/codebase-summary.md` |
| Understand agent conventions | `/workspace/agent-smith/AGENTS.md` |

## Conventions
- **Tool comment block**: JS/Python actions use `# tool` docblock for metadata (`name`, `description`, `arguments`)
- **YAML features**: Agents/workflows/actions defined as YAML, discovered from filesystem, registered in SQLite
- **Variable substitution**: `{prompt}` and custom vars in agent prompts — resolved at runtime
- **Reactive state**: Vue `ref`/`reactive` everywhere (not Redux/Pinia)
- **Coordinator pattern**: Coordinators delegate to specialists via `run-agent` tool
- **Import convention**: Always use `.js` extension for relative TypeScript imports

→ See `/workspace/agent-smith/AGENTS.md` for full conventions summary.

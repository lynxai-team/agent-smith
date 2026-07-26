# Documentation Decision Tree

> Quick guide: What to read based on your task

## I need to understand the project

- High-level overview → `.agents/documentation/project-overview.md`
- Full navigation map → `.agents/documentation/project-nav.md`
- Structured summary → `.agents/documentation/codebase-summary.md`

## I need to work on a specific route/endpoint

| Feature | Go To |
|---------|-------|
| Agents (list, get) | `src/routes/agents.ts` |
| Workflows (list, get) | `src/routes/workflows.ts` |
| Backends (list, set) | `src/routes/backends.ts` |
| Models (list, presets CRUD) | `src/routes/models.ts` |
| Agent settings (get, update) | `src/routes/agent_settings.ts` |
| Tools (read definitions) | `src/routes/tools.ts` |
| Configuration (read, create) | `src/routes/conf.ts` |
| State (read) | `src/routes/state.ts` |
| Plugins (install) | `src/routes/plugins.ts` |
| Folders (add feature paths) | `src/routes/folders.ts` |
| Apps (config CRUD) | `src/routes/apps.ts` |
| Workspace (CRUD, default) | `src/routes/workspace.ts` |
| Settings (read) | `src/routes/settings.ts` |
| Skills (list) | `src/routes/skills.ts` |
| Templates (apply) | `src/routes/templates.ts` |

## I need to understand the server infrastructure

- Koa app setup, WebSocket handler, middleware stack → `src/server/server.ts`
- Router composition (base + API routers) → `src/server/router.ts`
- WebSocket callback mapping (tokens, tool calls, thinking) → `src/callbacks.ts`
- Route aggregation → `src/routes/index.ts`

## I need to understand the entry points

- CLI entry (script execution) → `src/index.ts`
- Library entry (`runServer()` export) → `src/main.ts`

## Common Tasks (Quick Reference)

| Task | Go To |
|------|-------|
| Add a new REST endpoint | Create file in `src/routes/`, add route function to `src/routes/index.ts` |
| Modify WebSocket message types | Update `@agent-smith/types` package, then update `src/callbacks.ts` |
| Change server port or middleware | Edit `src/server/server.ts` |
| Fix agent execution flow | `src/server/server.ts` (WebSocket message handler) + `src/callbacks.ts` |
| Update config file handling | `src/routes/conf.ts` and `src/utils.ts` (`getConfig`) |
| Add a new feature type (e.g., skill) | New route file in `src/routes/`, add to `src/routes/index.ts` |

## Conventions

- **Route functions**: `(r: Router) => void` — always mount on the passed router instance
- **Core package**: All data operations go through `@agent-smith/core` (`db`, `conf`, `state`, `fs`)
- **ES Modules only**: `import`/`export`, no `require()`
- **WebSocket JSON**: All messages use `{ type, from, msg }` structure

→ See `AGENTS.md` for full conventions summary.

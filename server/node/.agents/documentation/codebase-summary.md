# Agent Smith Server (Node)

## Summary
Node.js Koa v3 backend server (`@agent-smith/server` v0.2.4) providing REST API (`/api/*`) and WebSocket (`/ws`) endpoints for remote AI agent execution with real-time token streaming, model management, and configuration CRUD.

## Dependencies
- **Internal**: `@agent-smith/core` (v0.0.16+) — DB operations, configuration, feature management (`db`, `conf`, `state`, `fs`, `utils`); `@agent-smith/types` (v0.0.9) — shared interfaces and WebSocket message types (`WsClientMsg`, `WsRawServerMsg`).
- **External**: `koa` v3, `@koa/router` v15, `koa-route` v4, `koa-websocket` v7, `koa-bodyparser` v4, `@koa/cors` v5, `koa-static` v5, `ansi-colors` v4, `yaml` v2.
- **Dev**: TypeScript v7, `ts-node`, type definitions for all Koa packages.

## Used By
- `@agent-smith/wscli` — WebSocket client connects to `/ws`; REST calls to `/api/*`.
- `@agent-smith/cli` — remote mode connects to server for agent execution.
- `agent-smith-ui` — Vue dashboard consumes REST API for agent/workflow management.
- Browser UIs and external clients via HTTP/WebSocket API.

## Entry Point
- `src/index.ts` — CLI entry: resolves paths, respects `NODE_ENV` for static serving, calls `runserver()`.
- `src/main.ts` — Library entry: exports `runServer(routes?, staticDir?, port?)` for programmatic usage.

## Key Files
| File | Purpose |
|------|---------|
| `src/server/server.ts` | Koa app bootstrap: WebSocket handler for agent/workflow execution, tool call confirmations, REST routing, SPA 404 fallback |
| `src/server/router.ts` | `useRouter()` factory: creates base router (`/ping`) and API router (`/api/*` prefix) |
| `src/server/state.ts` | Path utilities: exports `dirpath` for resolving relative module paths |
| `src/callbacks.ts` | `buildCallbacks()`: WebSocket event handlers for tokens, tool calls, thinking phases, turn events, and tool confirmation |
| `src/utils.ts` | `getConfig()` (read config YAML from DB), `createAwaiter()` (promise-based async confirmation), `excludedTaskTypes` |
| `src/routes/index.ts` | Route composition: aggregates 25+ feature route functions into `baseRoutes` array |
| `src/routes/agents.ts` | GET `/agent/:id` and GET `/agents` — agent spec retrieval |
| `src/routes/workflows.ts` | GET `/workflow/:id` and GET `/workflows` — workflow spec retrieval |
| `src/routes/backends.ts` | GET `/backends` and GET `/backend/:name` — backend listing and activation |
| `src/routes/models.ts` | GET `/models/:backend`, preset CRUD (`/models/presets/read`, `/models/preset/update`, `/models/preset/delete/:name`) |
| `src/routes/agent_settings.ts` | GET `/agentsettings` and POST `/agentsettings/update` — agent settings CRUD |
| `src/routes/workspace.ts` | GET `/workspace`, POST `/workspace`, POST `/workspace/update` — workspace CRUD and default selection |
| `src/routes/plugins.ts` | POST `/plugins/install` — plugin installation via npm + config update |
| `src/routes/conf.ts` | GET `/conf` and GET `/conf/create` — configuration file reading/creation |
| `src/routes/apps.ts` | GET `/app/:name/conf` and POST `/app/:name/update` — app config YAML CRUD |
| `src/routes/tools.ts` | POST `/tools` — bulk tool definition lookup by name |
| `src/routes/settings.ts` | GET `/settings` — general settings from DB |
| `src/routes/skills.ts` | GET `/skills` — skills list from DB |
| `src/routes/templates.ts` | POST `/templates/apply` — template application via LLM executor |
| `src/routes/state.ts` | GET `/state` — state initialization and config retrieval |
| `src/routes/folders.ts` | POST `/folders/add` — add feature folders to config |

## Architecture
- **Koa v3 + @koa/router**: Web framework with two-router pattern (base for health checks, API for all feature endpoints under `/api` prefix).
- **WebSocket Agent Execution**: Single `/ws` endpoint handles bidirectional JSON messaging for agent/workflow inference with streaming tokens, tool calls, thinking phases, and turn events.
- **Route Composition**: Routes defined as pure functions `(r: Router) => void`, composed in `src/routes/index.ts` into the exported `baseRoutes` array.
- **Tool Call Confirmation**: Async `createAwaiter` pattern in `callbacks.ts` enables user-confirmed tool executions over WebSocket via `confirmtool` system messages.
- **Middleware Stack**: `bodyParser` → CORS (credentials enabled) → WebSocket (`app.ws.use`) → static files → logging → routers → SPA 404 fallback.
- **Core Delegation**: All DB, config, and feature operations delegate to `@agent-smith/core`; server handles only HTTP/WebSocket transport.

## Related
- See `/workspace/agent-smith/packages/wscli` — the WebSocket client that connects to `/ws`.
- See `/workspace/agent-smith/packages/core` — server delegates DB/config/feature operations to core.
- See `/workspace/agent-smith/packages/types` — WebSocket message protocol types (`WsRawServerMsg`, `WsClientMsg`).
- See `/workspace/agent-smith/server/go` — Go Echo server alternative.
- See `/workspace/agent-smith-ui` — Vue dashboard consuming this server's REST API.

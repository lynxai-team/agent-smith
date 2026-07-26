# Agent Smith Server

## Summary
Node.js backend service providing REST API (`/api/*`) and WebSocket (`/ws`) endpoints for managing AI agents, workflows, models, and configurations. Built on Koa v3. Handles agent execution with streaming token/tool-call events over WebSocket.

## Dependencies
- `@agent-smith/core` — DB operations, configuration, feature management (`db`, `conf`, `state`, `fs`, `utils`).
- `@agent-smith/types` — shared interfaces, WebSocket message types (`WsClientMsg`, `WsRawServerMsg`).
- External: `koa` v3, `@koa/router`, `koa-websocket`, `koa-bodyparser`, `@koa/cors`, `koa-static`, `ansi-colors`, `yaml`.

## Used By
- `@agent-smith/wscli` — WebSocket client connects to `/ws`; REST calls to `/api/*`.
- `@agent-smith/cli` — remote mode connects to server for agent execution.
- Browser UIs and external clients via HTTP API.

## Entry Point
- `src/index.ts` — CLI entry: resolves paths, respects `NODE_ENV` for static serving, calls `runserver()`.
- `src/main.ts` — Library entry: exports `runServer(routes?, staticDir?, port?)` for programmatic usage.

## Key Files
| File | Purpose |
|------|---------|
| `src/server/server.ts` | Koa app setup: WebSocket handler for agent/workflow execution, tool call confirmations, REST routing |
| `src/server/router.ts` | Two routers: base (`/ping`) and API (`/api/*` prefix for all feature endpoints) |
| `src/callbacks.ts` | WebSocket callback handlers: tokens, tool calls, thinking phases, turn events |
| `src/utils.ts` | `getConfig()` (read config YAML), `createAwaiter()` (promise-based async confirmation) |
| `src/routes/index.ts` | Route composition: aggregates all feature route functions into `baseRoutes` array |
| `src/routes/agents.ts` | GET agents list and individual agent specs |
| `src/routes/workflows.ts` | GET workflows list and individual workflow specs |
| `src/routes/backends.ts` | Backend listing and activation |
| `src/routes/models.ts` | Model info retrieval, sampling preset CRUD |
| `src/routes/agent_settings.ts` | Agent settings CRUD (model, tokens, temperature, etc.) |
| `src/routes/workspace.ts` | Workspace CRUD operations |
| `src/routes/plugins.ts` | Plugin installation via npm |
| `src/routes/conf.ts` | Configuration file reading and creation |
| `src/routes/apps.ts` | App config file CRUD (YAML) |
| `src/routes/tools.ts` | Tool definition lookup by name |
| `src/routes/settings.ts` | General settings endpoints |
| `src/routes/skills.ts` | Skills list endpoint |
| `src/routes/templates.ts` | Template application via LLM executor |

## Architecture
- **Koa v3 + Router**: Web framework with `@koa/router` for REST routing under `/api` prefix.
- **WebSocket Agent Execution**: Single `/ws` endpoint handles bidirectional JSON messaging for agent inference with streaming tokens and tool calls.
- **Route Composition**: Routes defined as functions accepting a Router instance, composed in `routes/index.ts`.
- **Tool Call Confirmation**: Async `createAwaiter` pattern for user-confirmed tool executions over WebSocket.
- **Middleware Stack**: Body parser → CORS → WebSocket → static files → logging → routers → 404 fallback.

## Related
- See `@agent-smith/wscli` — the WebSocket client that connects to `/ws`.
- See `@agent-smith/core` — server delegates DB/config/feature operations to core.
- See `@agent-smith/types` — WebSocket message protocol types (`WsRawServerMsg`, `WsClientMsg`).

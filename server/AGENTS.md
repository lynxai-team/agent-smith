# Agent Smith Server

## Mission

A Koa v3 backend server that exposes the Agent Smith runtime via REST API (`/api/*`) and WebSocket (`/ws`), enabling remote AI agent execution with real-time token streaming.

## Conventions (for AI Agents)

- **TypeScript ES Modules**: Use `import`/`export` syntax, never CommonJS `require`. Target ES2022, module resolution `nodenext`.
- **Route Functions**: Routes are pure functions `(r: Router) => void` that mount handlers on a router instance. Composed in `src/routes/index.ts` into the `baseRoutes` array.
- **Koa Middleware Order**: bodyParser → CORS → WebSocket (`app.ws.use`) → static files → logging → routers → 404 fallback.
- **WebSocket Message Protocol**: All WS messages are JSON with `type`, `from`, and `msg` fields (`WsRawServerMsg`). Client sends `WsClientMsg` with `type: 'command' | 'system'`.
- **Core Delegation**: All DB, config, and feature operations go through `@agent-smith/core` (`db`, `conf`, `state`, `fs`, `utils`). The server only handles HTTP/WebSocket transport.

## Quick Start for AI Agents

1. Read `.agents/documentation/decision-tree.md` to find the right doc for your task
2. Read `.agents/documentation/project-overview.md` for high-level context
3. Read `.agents/documentation/project-nav.md` for detailed navigation and dependency graph
4. Read `.agents/documentation/codebase-summary.md` for technical summary of this package

## Documentation

- `.agents/documentation/decision-tree.md` — Quick guide: find the right doc for your task
- `.agents/documentation/codebase-summary.md` — Technical codebase summary (7-section structure)
- `.agents/documentation/project-overview.md` — Concise project overview (~1 page)
- `.agents/documentation/project-nav.md` — Detailed navigation map with dependency graph
- `README.md` — User-facing documentation with API reference and examples

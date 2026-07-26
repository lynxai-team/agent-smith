# Agent Smith Server — Project Navigation Map

> Purpose: Single-reference map for AI coding agents to understand, navigate, and modify the Agent Smith Server codebase.
> **Role**: Canonical reference for navigating the entire project.
> **See also**: `.agents/documentation/decision-tree.md` to find the right doc for your task.
> **See also**: `.agents/documentation/project-overview.md` for concise overview.

---

## 1. Project Overview

A Node.js/Koa v3 backend server exposing the Agent Smith AI runtime via REST API (`/api/*`) and WebSocket (`/ws`). Manages agents, workflows, backends, models, tools, plugins, and configurations. Enables remote AI agent execution with real-time token streaming.

### Repository Structure

| Directory | Purpose |
|-----------|---------|
| `src/index.ts` | CLI entry point: resolves paths, calls `runserver()` |
| `src/main.ts` | Library entry: exports `runServer()` for programmatic embedding |
| `src/server/` | Koa app, WebSocket handler, router composition |
| `src/routes/` | 14 feature route modules (agents, workflows, backends, models, etc.) |
| `src/callbacks.ts` | WebSocket message → inference lifecycle callback mapping |
| `src/utils.ts` | Config file reader, async awaiter helper |

---

## 2. Architecture Principles

| Principle | Detail | Key Files |
|-----------|--------|-----------|
| Route Composition | Routes are `(r: Router) => void` functions, aggregated in `routes/index.ts` | `src/routes/*.ts`, `src/routes/index.ts` |
| Core Delegation | Server never touches DB directly; all ops go through `@agent-smith/core` | All route files, `src/utils.ts` |
| WebSocket Protocol | Single `/ws` endpoint, JSON `{type, from, msg}`, system commands inline | `src/server/server.ts`, `src/callbacks.ts` |
| Middleware Pipeline | bodyParser → CORS → WS → static → logger → routers → 404 fallback | `src/server/server.ts` |
| Tool Confirmation | Async `createAwaiter` pattern for user approve/deny of tool calls | `src/callbacks.ts`, `src/utils.ts` |

---

## 3. Dependency Graph

```
@agent-smith/types          ← shared interfaces (WsClientMsg, WsRawServerMsg)
        ↕
@agent-smith/core           ← DB, config, features, state management
        ↑
@agent-smith/server         ← this package (HTTP/WebSocket transport layer)
        ↑
@agent-smith/wscli          ← WebSocket client that connects to /ws
```

**Prose**: The server depends on `@agent-smith/core` for all data operations and `@agent-smith/types` for message protocol types. It is consumed by `@agent-smith/wscli` (WebSocket client) and any HTTP API consumer.

---

## 4. Packages/Modules

### `src/server/` — Server Infrastructure

- **Purpose**: Koa app setup, WebSocket handling, router composition
- **Detail**: See `.agents/documentation/codebase-summary.md` for full file listing

### `src/routes/` — Feature Endpoints

- **Purpose**: REST API route handlers (14 modules, one per feature domain)
- **Detail**: See `.agents/documentation/codebase-summary.md` Key Files section for complete listing

### `src/callbacks.ts` — WebSocket Callback Mapper

- **Purpose**: Maps inference lifecycle events to WebSocket JSON messages
- **Detail**: See `.agents/documentation/codebase-summary.md` for full architecture description

### `src/utils.ts` — Utilities

- **Purpose**: Config file reading, async awaiter for tool confirmation
- **Detail**: See `.agents/documentation/codebase-summary.md` for full architecture description

### Entry Points

- `src/index.ts` — CLI entry point
- `src/main.ts` — Library entry (`runServer()` export)

---

## 5. Server/API

### REST Endpoints (all prefixed `/api`)

| Method | Endpoint | Route File |
|--------|----------|------------|
| GET | `/ping` | `src/server/router.ts` |
| GET | `/api/agents` | `src/routes/agents.ts` |
| GET | `/api/agent/:id` | `src/routes/agents.ts` |
| GET | `/api/workflows` | `src/routes/workflows.ts` |
| GET | `/api/workflow/:id` | `src/routes/workflows.ts` |
| GET | `/api/backends` | `src/routes/backends.ts` |
| GET | `/api/backend/:name` | `src/routes/backends.ts` |
| POST | `/api/tools` | `src/routes/tools.ts` |
| GET | `/api/models/:backend` | `src/routes/models.ts` |
| GET | `/api/models/presets/read` | `src/routes/models.ts` |
| POST | `/api/models/preset/update` | `src/routes/models.ts` |
| DELETE | `/api/models/preset/delete/:name` | `src/routes/models.ts` |
| GET | `/api/agentsettings` | `src/routes/agent_settings.ts` |
| POST | `/api/agentsettings/update` | `src/routes/agent_settings.ts` |
| GET | `/api/conf` | `src/routes/conf.ts` |
| GET | `/api/conf/create` | `src/routes/conf.ts` |
| GET | `/api/state` | `src/routes/state.ts` |
| POST | `/api/plugins/install` | `src/routes/plugins.ts` |
| POST | `/api/folders/add` | `src/routes/folders.ts` |
| GET | `/api/app/:name/conf` | `src/routes/apps.ts` |
| POST | `/api/app/:name/update` | `src/routes/apps.ts` |
| GET | `/api/workspace` | `src/routes/workspace.ts` |
| POST | `/api/workspace` | `src/routes/workspace.ts` |
| POST | `/api/workspace/update` | `src/routes/workspace.ts` |
| GET | `/api/settings` | `src/routes/settings.ts` |
| POST | `/api/templates/apply` | `src/routes/templates.ts` |
| GET | `/api/skills` | `src/routes/skills.ts` |

### WebSocket Protocol

**Endpoint**: `ws://localhost:5184/ws`

**Client → Server** (`WsClientMsg`):
```typescript
{ type: 'command' | 'system', command: string, feature?: 'agent' | 'workflow', payload?: any, options?: object }
```

**Server → Client** (`WsRawServerMsg`): `{ type, from, msg }`

| Type | Direction | Description |
|------|-----------|-------------|
| `startemit` | S→C | Inference started |
| `token` | S→C | Generated token |
| `thinkingtoken` | S→C | Thinking/reasoning token |
| `turnstart` | S→C | New conversation turn |
| `turnend` | S→C | Turn completed |
| `assistant` | S→C | Assistant text output |
| `think` | S→C | Model thinking content |
| `toolcall` | S→C | Tool call initiated |
| `toolcallend` | S→C | Tool call completed |
| `toolcallconfirm` | S→C | Awaiting tool confirmation |
| `endemit` | S→C | Inference complete |
| `error` | S→C | Error message |
| `stop` | C→S | Abort current execution |
| `confirmtool` | C→S | Approve/deny tool call |

---

## 6. Code Snippets

### Adding a New REST Endpoint

```typescript
// 1. Create src/routes/my_feature.ts
import type Router from '@koa/router';
import { db } from '@agent-smith/core';
import type { Context, Next } from 'koa';

function getMyFeatureRoute(r: Router) {
    r.get('/myfeature', async (ctx: Context, next: Next) => {
        const data = db.readMyFeature();
        ctx.body = data;
        ctx.status = 200;
    });
}
export { getMyFeatureRoute };

// 2. Register in src/routes/index.ts
import { getMyFeatureRoute } from "./my_feature.js";
const baseRoutes = new Array<((r: Router) => void)>(
    // ... existing routes
    getMyFeatureRoute,
);
```

### Adding a WebSocket Event

```typescript
// 1. Add type to @agent-smith/types (WsRawServerMsg type field)
// 2. Update src/callbacks.ts — add callback mapping in buildCallbacks()
msg.options.onCustomEvent = (data: any, from: string) => {
    const rsm: WsRawServerMsg = {
        type: "customevent",
        from: from,
        msg: JSON.stringify(data),
    };
    ctx.websocket.send(JSON.stringify(rsm));
};
```

### Programmatic Server Usage

```typescript
import { runServer } from "@agent-smith/server";

runServer(
    [(r) => r.get('/custom', (ctx) => { ctx.body = 'hello'; })],
    '/path/to/static'
);
```

---

## 7. Navigation Quick Reference

| Task | Go To |
|------|-------|
| Add a new REST endpoint | New file in `src/routes/`, register in `src/routes/index.ts` |
| Modify WebSocket message types | Update `@agent-smith/types`, then `src/callbacks.ts` |
| Change server port or middleware | Edit `src/server/server.ts` |
| Debug agent execution flow | `src/server/server.ts` (WS handler) + `src/callbacks.ts` |
| Update config file handling | `src/routes/conf.ts`, `src/utils.ts` |
| Add a new feature type | New route file in `src/routes/`, add to `src/routes/index.ts` |
| Embed server in another app | Import `runServer` from `src/main.ts` |
| Install a plugin via API | POST `/api/plugins/install` |
| Confirm/deny tool calls | Client sends `{type: 'system', command: 'confirmtool', payload: {id, confirm}}` |

---

## 8. Documentation Links

| Resource | Path |
|----------|------|
| Decision Tree | `.agents/documentation/decision-tree.md` |
| Codebase Summary | `.agents/documentation/codebase-summary.md` |
| Project Overview | `.agents/documentation/project-overview.md` |
| Project Navigation | `.agents/documentation/project-nav.md` (this file) |
| User README | `README.md` |
| API Reference (raw) | https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/server/2.api.md |
| Client Usage (raw) | https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/server/3.client-usage.md |
| Deployment (raw) | https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/server/4.deployment.md |
| Get Started (web) | https://lynxai-team.github.io/agent-smith/server/get-started |
| API Reference (web) | https://lynxai-team.github.io/agent-smith/server/api |

---

## 9. Key Conventions & Patterns

| Convention | Detail |
|------------|--------|
| Route functions | `(r: Router) => void` — mount handlers on passed router, never create new routers |
| ES Modules | `import`/`export` only, no CommonJS. Target ES2022, moduleResolution `nodenext` |
| Core delegation | All DB/config ops via `@agent-smith/core`; server handles transport only |
| WebSocket JSON | All messages: `{ type, from, msg }`. Client sends `WsClientMsg`, server sends `WsRawServerMsg` |
| Tool confirmation | Async pattern: server sends `toolcallconfirm`, client replies with `{type:'system', command:'confirmtool'}` |
| Middleware order | bodyParser → CORS (credentials) → WS handler → static files → logger → routers → 404 fallback |
| Config files | YAML format, managed by `@agent-smith/core` conf module |
| Static serving | Enabled when `NODE_ENV != "development"`; serves from project root or custom `staticDir` |

# Agent Smith Server — Project Overview

> **Role**: Concise "what is this" for context loading (~1 page overview).
> **See also**: `.agents/documentation/decision-tree.md` to find the right doc for your task.
> **See also**: `.agents/documentation/project-nav.md` for detailed navigation and task references.

---

## What is Agent Smith Server?

A Node.js backend service (Koa v3) that exposes the Agent Smith AI runtime via REST API (`/api/*`) and WebSocket (`/ws`). It handles remote agent execution with real-time token streaming, tool-call confirmation, and full lifecycle management of agents, workflows, backends, models, and configurations.

---

## Core Capabilities

- **REST API** — Full CRUD for agents, workflows, backends, models, settings, tools, plugins, apps, and workspaces
- **WebSocket Execution** — Bidirectional JSON protocol for agent inference with streaming tokens, thinking tokens, tool calls, and turn events
- **Tool Call Confirmation** — Async confirmation pattern: server sends `toolcallconfirm`, client replies with approve/deny
- **Plugin System** — Install npm packages as plugins; add custom feature search folders via API
- **Programmatic API** — Use `runServer()` from `src/main.ts` to embed in other applications

---

## Repository Structure

| Directory | Purpose |
|-----------|---------|
| `src/index.ts` | CLI entry point: resolves paths, calls `runserver()` |
| `src/main.ts` | Library entry: exports `runServer(routes?, staticDir?, port?)` |
| `src/server/server.ts` | Koa app: WebSocket handler, middleware stack, routing |
| `src/server/router.ts` | Router composition: base router (`/ping`) + API router (`/api/*`) |
| `src/callbacks.ts` | Maps WS messages to inference lifecycle callbacks |
| `src/utils.ts` | Config file reader, async awaiter helper |
| `src/routes/` | 14 route modules — one per feature domain |

---

## Key Architecture Patterns

- **Route Composition**: Each route is a `(r: Router) => void` function. All are aggregated in `src/routes/index.ts` and passed to the server constructor.
- **Core Delegation**: The server never touches the database directly — all operations go through `@agent-smith/core` (`db`, `conf`, `state`, `fs`).
- **WebSocket Protocol**: Single `/ws` endpoint. Client sends commands; server streams events (tokens, tool calls, thinking, turns). System commands (stop, confirmtool) handled inline.
- **Middleware Pipeline**: bodyParser → CORS (credentials) → WS handler → static files → logger → routers → 404 fallback.

---

## Quick Reference: Common Tasks

| Task | Go To |
|------|-------|
| Add a new REST endpoint | New file in `src/routes/`, register in `src/routes/index.ts` |
| Modify WebSocket events | Update `@agent-smith/types` + `src/callbacks.ts` |
| Change server configuration | `src/server/server.ts` |
| Debug agent execution flow | `src/server/server.ts` (WS message handler) |
| Update config file handling | `src/routes/conf.ts`, `src/utils.ts` |

---

## Code Snippets

### Adding a New Route

```typescript
// src/routes/my_feature.ts
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
```

Then register in `src/routes/index.ts`:

```typescript
import { getMyFeatureRoute } from "./my_feature.js";

const baseRoutes = new Array<((r: Router) => void)>(
    // ... existing routes
    getMyFeatureRoute,
);
```

### Programmatic Usage

```typescript
import { runServer } from "@agent-smith/server";

// With custom routes and static directory
runServer(
    [(r) => r.get('/custom', (ctx) => { ctx.body = 'hello'; })],
    '/path/to/static'
);
```

---

## Documentation Links

| Resource | Path |
|----------|------|
| Decision Tree | `.agents/documentation/decision-tree.md` |
| Codebase Summary | `.agents/documentation/codebase-summary.md` |
| Project Overview | `.agents/documentation/project-overview.md` (this file) |
| Project Navigation | `.agents/documentation/project-nav.md` |
| User README | `README.md` |
| API Docs (raw) | https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/server/2.api.md |
| Deployment Guide | https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/server/4.deployment.md |

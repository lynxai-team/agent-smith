# @agent-smith/server

A Koa v3 backend server that exposes the Agent Smith runtime via REST API (`/api/*`) and WebSocket (`/ws`), enabling remote AI agent execution with real-time token streaming. Part of the [Agent Smith toolkit](https://github.com/lynxai-team/agent-smith).

## Features

- 🌐 **REST API** — Full CRUD for agents, workflows, backends, models, settings, and configurations
- 🔌 **WebSocket Execution** — Real-time bidirectional communication for agent inference with streaming tokens
- ⚒️ **Tool Call Confirmation** — Async confirmation pattern for user-approved tool executions
- 📡 **Streaming Events** — Token, thinking, tool call, and turn events streamed over WebSocket
- 🔧 **Plugin Support** — Install npm plugins and add feature search folders via API
- 🏗️ **Programmatic API** — Use `runServer()` to embed the server in your own applications
- 🌍 **CORS Enabled** — Cross-origin requests supported with credentials

## Documentation

### For AI Agents

- [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns for the server package
- [API Reference](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/server/2.api.md) — Complete REST endpoints and WebSocket protocol
- [Client Usage](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/server/3.client-usage.md) — Integration patterns with wscli and HTTP clients
- [Deployment](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/server/4.deployment.md) — Production deployment considerations

### For Humans

- [Get Started](https://lynxai-team.github.io/agent-smith/server/get-started) — Installation and basic usage
- [API Reference](https://lynxai-team.github.io/agent-smith/server/api) — Complete REST endpoints and WebSocket protocol
- [Client Usage](https://lynxai-team.github.io/agent-smith/server/client-usage) — Integration patterns with wscli and HTTP clients
- [Deployment](https://lynxai-team.github.io/agent-smith/server/deployment) — Production deployment considerations

## Installation

```bash
npm install @agent-smith/server
```

Or build from source:

```bash
cd agent-smith/server
npm install
npm run build
```

## Quick Start

### Running the Server

```bash
# Development mode with hot-reload
npm run devserver

# Production mode
npm run server
```

The server listens on port **5184** by default. Verify it's running:

```bash
curl http://localhost:5184/ping
# Response: { "ok": true }
```

### Executing an Agent via WebSocket

```typescript
import { useWsServer } from "@agent-smith/wscli";

const ws = useWsServer({
    url: "ws://localhost:5184/ws",
    onToken: (token) => process.stdout.write(token),
});

ws.executeAgent("my-agent", { prompt: "Hello, world!" });
```

## Usage

### Programmatic Server Startup

Use `runServer()` to embed the server in your application:

```typescript
import { runServer } from "@agent-smith/server";

// Start with default routes and no static directory
runServer();

// Or with custom routes and static file serving
runServer(
    undefined,           // Custom route functions (optional)
    "/path/to/static"   // Static file directory (optional)
);
```

### REST API Examples

```typescript
// List all agents
const agentsRes = await fetch("http://localhost:5184/api/agents");
const agents = await agentsRes.json();

// Get a specific agent
const agentRes = await fetch("http://localhost:5184/api/agent/my-agent");
const agent = await agentRes.json();

// List inference backends
const backendsRes = await fetch("http://localhost:5184/api/backends");
const backends = await backendsRes.json();

// Get available models for a backend
const modelsRes = await fetch("http://localhost:5184/api/models/openai");
const models = await modelsRes.json();

// Update agent settings
const settingsRes = await fetch("http://localhost:5184/api/agentSettings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "my-agent", settings: { temperature: 0.5 } }),
});
```

### WebSocket Agent Execution

Connect directly to the WebSocket endpoint for real-time streaming:

```typescript
const ws = new WebSocket('ws://localhost:5184/ws');

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    switch (msg.type) {
        case 'token':
            process.stdout.write(msg.msg);
            break;
        case 'thinkingtoken':
            console.log(`\x1b[2m${msg.msg}\x1b[0m`);
            break;
        case 'toolcall':
            const payload = JSON.parse(msg.msg);
            console.log(`Tool call: ${payload.tc.name}`);
            break;
        case 'endemit':
            const result = JSON.parse(msg.msg);
            console.log('\nDone:', result);
            ws.close();
            break;
        case 'error':
            console.error('Error:', msg.msg);
            ws.close();
            break;
    }
};

ws.onopen = () => {
    ws.send(JSON.stringify({
        type: "command",
        command: "my-agent",
        feature: "agent",
        payload: { prompt: "Write a poem" },
        options: {}
    }));
};
```

### System Commands (Stop & Confirm)

```typescript
// Stop current execution
ws.send(JSON.stringify({
    type: "system",
    command: "stop"
}));

// Confirm or reject a tool call
ws.send(JSON.stringify({
    type: "system",
    command: "confirmtool",
    payload: { confirm: true, id: "tool-call-uuid" }
}));
```

### Full Callback Example with wscli

```typescript
import { useWsServer } from "@agent-smith/wscli";
import type { ToolCallSpec } from "@agent-smith/types";

const ws = useWsServer({
    url: "ws://localhost:5184/ws",
    onToken: (token, from) => process.stdout.write(token),
    onThinkingToken: (token, from) => console.log(`\x1b[2m${token}\x1b[0m`),
    onToolCall: (tc, type, from) => {
        console.log(`\n⚒️ Tool: ${tc.name}`);
    },
    onToolCallEnd: (tc, content, type, from) => {
        console.log(`  Result: ${content?.slice(0, 100)}`);
    },
    onConfirmToolUsage: async (tool: ToolCallSpec) => {
        return true; // Return false to deny
    },
    onEndEmit: (result, from) => {
        console.log(`\nInference complete. Tokens: ${result.stats?.totalTokens}`);
    },
    onError: (msg, from) => {
        console.error(`[${from}] ${msg}`);
    },
});

ws.executeAgent("code-review", { prompt: "Review this function" });
```

## Complete Example

```typescript
import { useWsServer } from "@agent-smith/wscli";

async function runAgent() {
    const tokenStream: string[] = [];

    const ws = useWsServer({
        url: "ws://localhost:5184/ws",
        onToken: (token) => tokenStream.push(token),
        onThinkingToken: (token) => console.log(`[thinking] ${token}`),
        onError: (msg) => console.error(`Error: ${msg}`),
    });

    try {
        await ws.executeAgent("summarize", {
            prompt: "Summarize the key points of quantum computing"
        });

        const fullText = tokenStream.join("");
        console.log("\nFull response:", fullText);
    } catch (err) {
        console.error("Execution failed:", err);
    } finally {
        ws.close();
    }
}

runAgent();
```

## API Reference

### Factory Function: `runServer()`

```typescript
function runServer(
    routes?: ((r: Router) => void)[],
    staticDir?: string
): void;
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `routes` | `(r: Router) => void[]` | Optional custom route functions to compose with base routes |
| `staticDir` | `string` | Optional directory path for static file serving |

### REST Endpoints

All REST routes are prefixed with `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ping` | Health check — returns `{ ok: true }` |
| `GET` | `/api/agents` | List all agents |
| `GET` | `/api/agent/:id` | Get agent spec by ID |
| `GET` | `/api/workflows` | List all workflows |
| `GET` | `/api/workflow/:id` | Get workflow spec by ID |
| `GET` | `/api/backends` | List inference backends |
| `GET` | `/api/backend/:name` | Set default backend |
| `POST` | `/api/tools` | Get tool definitions for tool names |
| `GET` | `/api/models/:backend` | List models for a backend |
| `GET` | `/api/models/presets/read` | List model sampling presets |
| `POST` | `/api/models/preset/update` | Create or update a preset |
| `DELETE` | `/api/models/preset/delete/:name` | Delete a preset |
| `GET` | `/api/agentsettings` | Get per-agent inference config |
| `POST` | `/api/agentsettings/update` | Update agent settings |
| `GET` | `/api/state` | Get server state |
| `GET` | `/api/conf` | Get current configuration |
| `GET` | `/api/conf/create` | Create config file if missing |
| `POST` | `/api/plugins/install` | Install npm plugins |
| `POST` | `/api/folders/add` | Add feature search folders |
| `GET` | `/api/app/:name/conf` | Get app config |
| `POST` | `/api/app/:name/update` | Update app config |
| `GET` | `/api/workspace` | Get workspace info |
| `POST` | `/api/workspace` | Create or update workspace |
| `POST` | `/api/workspace/update` | Set default workspace |
| `GET` | `/api/settings` | Get application settings |

### WebSocket Protocol

**Endpoint:** `ws://localhost:5184/ws`

#### Client Messages (`WsClientMsg`)

```typescript
interface WsClientMsg {
    command: string;           // Agent or workflow name
    type: 'command' | 'system';
    feature?: 'agent' | 'workflow';
    payload?: any;             // Prompt and execution context
    options?: Record<string, any>;  // Abort controller, variables, etc.
}
```

#### Server Messages (`WsRawServerMsg`)

```typescript
interface WsRawServerMsg {
    type: string;
    from: string;
    msg: string;
}
```

| Type | Description |
|------|-------------|
| `error` | Error message |
| `startemit` | Inference started |
| `token` | Generated token |
| `thinkingtoken` | Thinking/reasoning token |
| `turnstart` | New conversation turn |
| `turnend` | Turn completed |
| `assistant` | Assistant text output |
| `think` | Model thinking content |
| `toolcall` | Tool call initiated |
| `toolcallend` | Tool call completed |
| `toolcallconfirm` | Awaiting tool confirmation |
| `finalresult` | Final inference result |
| `endemit` | Inference complete |

## Important Notes

- **Port**: The server listens on port **5184** by default. Change it in `src/server/server.ts` or use a reverse proxy.
- **Authentication**: No built-in authentication — intended for local use. Deploy behind a reverse proxy for production.
- **CORS**: Enabled with credentials by default. Restrict origins in production deployments.
- **Static Files**: Served from project root when `NODE_ENV` is not `"development"`.
- **Dependencies**: Requires `@agent-smith/core` and `@agent-smith/types` packages.
- **Related Packages**:
  - [`@agent-smith/wscli`](https://www.npmjs.com/package/@agent-smith/wscli) — WebSocket client for the server
  - [`@agent-smith/core`](https://www.npmjs.com/package/@agent-smith/core) — Runtime engine (DB, features, execution)
  - [`@agent-smith/types`](https://www.npmjs.com/package/@agent-smith/types) — Shared interfaces

## License

MIT

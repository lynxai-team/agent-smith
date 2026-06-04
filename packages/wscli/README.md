[![npm package](https://img.shields.io/npm/v/@agent-smith/wscli)](https://www.npmjs.com/package/@agent-smith/wscli)

# @agent-smith/wscli — WebSocket Client for Agent Smith

Real-time bidirectional WebSocket client for the [Agent Smith](https://github.com/lynxai-team/agent-smith) toolkit — enables streaming inference tokens, tool call notifications, and agent/workflow orchestration with automatic reconnection.

## Features

- 🔌 **Auto-Reconnect** — Exponential backoff reconnection via `reconnecting-websocket` (1s → 5s max)
- 📡 **Real-Time Streaming** — Receive inference tokens, thinking tokens, and tool call events as they happen
- 🔄 **Dual Transport** — WebSocket for streaming + REST API (`restmix`) for configuration queries
- ⚡ **Event-Driven Callbacks** — Dispatch messages by type (token, toolcall, turnstart/end, errors) to registered handlers
- 🤖 **High-Level Orchestration** — `useClientFeatures` provides reactive state, variable management, and sync/async execution modes
- 🛡️ **Tool Confirmation** — Built-in support for human-in-the-loop tool authorization via `onConfirmToolUsage`

## Documentation

### For AI Agents

- [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns for the wscli package
- [Get Started](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/wscli/1.get_started.md) — Installation and basic usage
- [API Reference](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/wscli/2.api.md) — Complete API surface, message protocol, and callback types

### For Humans

- [Get Started](https://lynxai-team.github.io/agent-smith/libraries/wscli/1.get_started/) — Installation and basic usage
- [API Reference](https://lynxai-team.github.io/agent-smith/libraries/wscli/2.api/) — Complete API surface, message protocol, and callback types

## Installation

```bash
npm install @agent-smith/wscli
```

**Dependencies:** `reconnecting-websocket` (auto-reconnect), `@vue/reactivity` (reactive state for high-level service).

## Quick Start

Connect to the server and execute an agent with streaming output:

```typescript
import { useWsServer } from "@agent-smith/wscli";

const ws = useWsServer({
    url: "ws://localhost:5184/ws",
    onToken: (token, from) => process.stdout.write(token),
    onError: (err, from) => console.error(`[${from}] ${err}`),
});

// Execute an agent
ws.executeAgent("my-agent", { prompt: "Hello, world!" });

// Or execute a workflow
ws.executeWorkflow("my-workflow", { input: "data" });

// Cancel a running operation
await ws.cancel();
```

## Usage

### Low-Level WebSocket Client (`useWsServer`)

The factory function creates a WebSocket connection with automatic reconnection and message dispatching to callbacks.

#### Connection Setup

```typescript
import { useWsServer } from "@agent-smith/wscli";
import type { ServerParams } from "@agent-smith/types";

const ws = useWsServer({
    url: "ws://localhost:5184/ws",  // defaults to ws://localhost:5184/ws
    onToken: (token, from) => console.log(`[${from}] ${token}`),
    onError: (err, from) => console.error(`[${from}] Error: ${err}`),
});
```

#### Executing Agents and Workflows

```typescript
// Execute an agent with prompt and options
ws.executeAgent("my-agent", { prompt: "Analyze this data" }, { temperature: 0.7 });

// Execute a workflow with payload
ws.executeWorkflow("data-pipeline", { input: "file.csv", format: "json" });

// Cancel running inference
await ws.cancel();
```

#### Streaming Callbacks

All callbacks receive `(data, from)` where `from` is the source identifier:

```typescript
const ws = useWsServer({
    onTurnStart: (from) => console.log(`\n=== New turn from ${from} ===`),
    onToken: (token, from) => process.stdout.write(token),
    onThinkingToken: (token, from) => console.log(`[thinking] ${token}`),
    onToolCall: (tc, type, from) => {
        console.log(`Tool call: ${tc.name}(${JSON.stringify(tc.arguments)})`);
    },
    onToolCallEnd: (tc, content, type, from) => {
        console.log(`Tool "${tc.name}" completed: ${content}`);
    },
    onTurnEnd: (history, from) => {
        console.log(`\n=== Turn ended from ${from} ===`);
    },
});

ws.executeAgent("my-agent", { prompt: "Process the data" });
```

#### Tool Confirmation

When the server requires human authorization for a tool call, `onConfirmToolUsage` is triggered:

```typescript
const ws = useWsServer({
    onConfirmToolUsage: async (tool) => {
        const confirmed = await askUser(`Allow tool "${tool.name}"?`);
        return confirmed;  // Client automatically sends confirmation back
    },
});
```

### High-Level Service (`useClientFeatures`)

Provides reactive state, variable management, and REST API integration on top of the WebSocket client.

```typescript
import { useClientFeatures } from "@agent-smith/wscli";

const client = useClientFeatures({
    onToken: (token, from) => process.stdout.write(token),
});

// Load an agent spec and its variables
await client.load("my-agent");

// Execute with reactive variable values
await client.executeAgent("Analyze the data", {
    variables: { workspace: "/path/to/project" },
});

// Or use sync mode (waits for turn completion)
await client.executeAgentSync("Analyze the data", {
    variables: { workspace: "/path/to/project" },
});

// Load server resources via REST
const models = await client.loadModels("ollama");
const workspaces = await client.loadWorkspaces();
const settings = await client.loadSettings();

// Reactive state
console.log(client.isReady.value);        // boolean
console.log(client.agentSpec.value.name); // string
```

#### Available Methods

| Method | Description |
|--------|-------------|
| `load(name)` | Load agent spec and populate variables |
| `executeAgent(prompt, opts)` | Async execution (fire-and-forget) |
| `executeAgentSync(prompt, opts)` | Sync execution (waits for completion) |
| `executeWorkflow(name, payload, opts)` | Execute a workflow |
| `executeWorkflowSync(name, payload, opts)` | Sync workflow execution |
| `cancel()` | Cancel running inference |
| `loadModels(backend)` | Load available models for a backend |
| `loadSamplingPresets()` | Load model sampling presets |
| `loadAgentSettings()` | Load agent settings |
| `loadBackends()` | Load configured backends |
| `setBackend(name)` | Set active backend |
| `getTools(tools)` | Get tool definitions |
| `checkState()` | Check initialization state |
| `loadWorkspaces()` | Load available workspaces |
| `loadSettings()` | Load global settings |

## Complete Example

Full working async function demonstrating all operations:

```typescript
import { useClientFeatures } from "@agent-smith/wscli";
import type { ClientFeaturesOptions } from "@agent-smith/types";

async function runAgentWithCallbacks() {
    const client = useClientFeatures({
        onToken: (token, from) => process.stdout.write(token),
        onThinkingToken: (token) => console.log(`[thinking] ${token}`),
        onToolCall: (tc) => console.log(`🔧 ${tc.name}(${JSON.stringify(tc.arguments)})`),
        onTurnStart: () => console.log("\n=== Starting ==="),
        onTurnEnd: () => console.log("\n=== Done ==="),
        onError: (err) => console.error(`❌ ${err}`),
    });

    // Load agent configuration
    await client.load("general-agent");

    // Prepare variables
    client.variables.values.required.workspace = "/workspace/project";

    // Execute with options
    const opts: ClientFeaturesOptions = {
        backend: "ollama",
        model: "qwen4b",
        variables: { workspace: "/workspace/project" },
    };

    try {
        await client.executeAgentSync("Analyze the project structure", opts);
    } catch (err) {
        console.error("Execution failed:", err);
    }

    // Cleanup
    await client.cancel();
}

runAgentWithCallbacks();
```

## API Reference

### Factory Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `useWsServer` | `(params: ServerParams) => WsServerHandle` | Low-level WebSocket client with auto-reconnect and callback dispatch |
| `useClientFeatures` | `(params?: ServerParams) => ClientFeaturesService` | High-level service with reactive state, variable management, and REST integration |

### WsServerHandle

```typescript
interface WsServerHandle {
    executeWorkflow: (name: string, payload: any, options?: Record<string, any>) => void;
    executeAgent: (name: string, payload: any, options?: Record<string, any>) => void;
    cancel: () => Promise<void>;
    onToken: ((t: string, from: string) => void) | undefined;
    onToolCall: ((tc: ToolCallSpec, type: string, from: string) => void) | undefined;
    onToolCallEnd: ((tc: ToolCallSpec, tr: any, type: string, from: string) => void) | undefined;
    onError: ((err: any, from: string) => void) | undefined;
    onConfirmToolUsage: ((tool: ToolCallSpec) => Promise<boolean>) | undefined;
}
```

### ServerParams

```typescript
interface ServerParams extends AllCallbacks {
    url?: string;                          // WebSocket URL (default: ws://localhost:5184/ws)
    defaultInferenceParams?: InferenceParams;
    onConfirmToolUsage?: (tool: ToolCallSpec) => Promise<boolean>;
}
```

`ServerParams` extends `AllCallbacks` which combines `InferenceCallbacks` and `AgentCallbacks`. All callbacks are optional.

### Message Types

| Type | Callback | Description |
|------|----------|-------------|
| `'token'` | `onToken(token, from)` | Generated output token |
| `'thinkingtoken'` | `onThinkingToken(token, from)` | Thinking/reasoning token |
| `'toolcall'` | `onToolCall(tc, type, from)` | Tool call initiated |
| `'toolcallend'` | `onToolCallEnd(tc, content, type, from)` | Tool call completed |
| `'toolcallconfirm'` | `onConfirmToolUsage(tool)` | Awaiting tool authorization |
| `'turnstart'` | `onTurnStart(from)` | New conversation turn |
| `'turnend'` | `onTurnEnd(history, from)` | Turn completed with history |
| `'endemit'` | `onEndEmit(result, from)` | Inference complete |
| `'error'` | `onError(err, from)` | Error message |

## Important Notes

- **Server Required** — This package connects to a running Agent Smith server (default: `ws://localhost:5184/ws`). Start the server before using this client.
- **Browser Compatible** — Works in browsers and Node.js environments.
- **Reactive State** — `useClientFeatures` uses `@vue/reactivity` for reactive state (`isReady`, `agentSpec`, `variables`). These are Vue refs/reactives, not plain values.
- **REST Fallback** — Configuration queries (models, settings, workspaces) use the REST API at `/api/*` via `restmix`. Default server URL is `http://localhost:5184/api`.
- **Auto-Reconnect** — Connection drops trigger automatic reconnection with exponential backoff (1s → 5s max). In-flight message sends retry internally if connection is not yet open.

## Related Packages

- [`@agent-smith/types`](../types/) — Shared TypeScript interfaces for WebSocket messages, callbacks, and tool specs
- [`@agent-smith/server`](../../server/) — Koa server exposing `/ws` (WebSocket) and `/api/*` (REST) endpoints
- [`@agent-smith/cli`](../cli/) — Terminal REPL for interactive agent execution

## Documentation Links

- [Get Started Guide](https://lynxai-team.github.io/agent-smith/libraries/wscli/1.get_started/)
- [API Reference](https://lynxai-team.github.io/agent-smith/libraries/wscli/2.api/)
- [Project Documentation](https://lynxai-team.github.io/agent-smith/)

## License

MIT

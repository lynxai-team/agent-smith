# @agent-smith/wscli

## Summary
WebSocket client library providing real-time bidirectional communication with the Agent Smith server for agent/workflow execution, auto-reconnection, and REST fallback API access.

## Dependencies
- `@agent-smith/types` — `WsRawServerMsg`, `WsClientMsg`, `ServerParams`, `AgentSpec`, `InferenceCallbacks`, `ToolDefSpec`, `ModelInfo`, `Workspace`, `ConfigFile`, `SamplingPreset`, `HistoryTurn`
- External: `reconnecting-websocket` (auto-reconnect with exponential backoff), `@vue/reactivity` (reactive state for `useClientFeatures`), `restmix` (REST API client for configuration queries)

## Used By
- `ui` — Vue dashboard imports `useClientFeatures` for real-time agent execution and result streaming
- `apps` (debate) — debate app consumes wscli for WebSocket-based multi-agent communication
- `cli` — terminal REPL uses wscli for interactive agent execution over WebSocket

## Entry Point
- `src/main.ts` — Re-exports `useWsServer` (low-level WS client) and `useClientFeatures` (high-level orchestration service)

## Key Files
| File | Purpose |
|------|---------|
| `src/ws.ts` | Low-level WebSocket client: auto-reconnect via `reconnecting-websocket`, message parsing by type (token, thinking, toolcall, turnstart/end, toolcallconfirm, etc.), callback dispatch, agent/workflow execution |
| `src/server.ts` | High-level client features service: agent/workflow execution with sync/async modes, variable handling, model/settings loading, reactive state via Vue reactivity (`isReady`, `agentSpec`, `variables`, `mcp`) |
| `src/utils.ts` | `createAwaiter<T>()`: promise factory with external resolve/reject for sync-like async execution pattern |

## Architecture
- **Event-Driven WebSocket**: Messages parsed by `type` field and dispatched to typed callbacks (token, thinkingtoken, toolcall, toolcallend, toolcallconfirm, turnstart/end, error, etc.)
- **Dual Transport Layer**: WebSocket (`/ws`) for real-time streaming; REST (`/api/*`) via `restmix` `useApi()` for configuration queries (models, settings, workspaces, backends, agents)
- **Reactive Orchestration**: `useClientFeatures` wraps `useWsServer` and uses `@vue/reactivity` `ref`/`reactive` to manage `agentSpec`, `variables`, `mcp`, `isReady` state
- **Promise-Based Sync Pattern**: `createAwaiter` enables synchronous-style execution of async agent/workflow operations — wraps a promise with externally exposed `unblock`/`reject` for completion signaling
- **Tool Confirmation Flow**: Server sends `toolcallconfirm` messages; client invokes `onConfirmToolUsage` callback and sends confirmation back via `system` command message

## Related
- See `server` — provides `/ws` WebSocket endpoint and `/api/*` REST endpoints consumed by wscli
- See `packages/types` — defines `WsRawServerMsg`, `WsClientMsg`, `ServerParams`, `AgentSpec`, `InferenceCallbacks`, `ToolCallSpec` types
- See `packages/ui` — Vue dashboard consumes `useClientFeatures()` for agent execution UI
- See `packages/cli` — terminal REPL uses wscli for interactive agent execution


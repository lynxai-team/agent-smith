# @agent-smith/wscli

## Summary
WebSocket client library providing real-time bidirectional communication with the Agent Smith server for agent/workflow execution, auto-reconnection, and REST fallback API access.

## Dependencies
- `@agent-smith/types` — `WsRawServerMsg`, `WsClientMsg`, `ServerParams`, `AgentSpec`, `InferenceCallbacks`
- External: `reconnecting-websocket` (auto-reconnect), `@vue/reactivity` (reactive state), `restmix` (REST API client)

## Used By
- `ui` — Vue dashboard imports `useClientFeatures` for real-time agent execution and result streaming
- `apps` (debate) — debate app consumes wscli for WebSocket-based multi-agent communication

## Entry Point
- `src/main.ts` — Re-exports `useWsServer` (low-level WS client) and `useClientFeatures` (high-level orchestration service)

## Key Files
| File | Purpose |
|------|---------|
| `src/ws.ts` | Low-level WebSocket client: auto-reconnect, message parsing by type (token, thinking, toolcall, turnstart/end), callback dispatch |
| `src/server.ts` | High-level client features service: agent/workflow execution with sync/async modes, variable handling, model/settings loading; reactive state via Vue reactivity |
| `src/api.ts` | REST API client (`restmix`): queries server at `http://localhost:5184/api` for models, agents, settings, workspaces |
| `src/utils.ts` | `createAwaiter<T>()`: promise factory with external resolve/reject for sync-like async execution |

## Architecture
- **Event-Driven WebSocket**: Messages parsed by type and dispatched to typed callbacks (token, toolcall, turn events, etc.)
- **Dual Transport Layer**: WebSocket (`/ws`) for real-time streaming; REST (`/api/*`) for configuration queries
- **Reactive Orchestration**: Vue `ref`/`reactive` manages `agentSpec`, `variables`, `mcp`, `isReady` state
- **Promise-Based Sync Pattern**: `createAwaiter` enables synchronous-style execution of async agent/workflow operations with await/unblock

## Related
- See `server` — connects to server's `/ws` WebSocket endpoint and `/api/*` REST endpoints
- See `packages/types` — defines `WsRawServerMsg`, `WsClientMsg`, `ServerParams`, `AgentSpec` types
- See `packages/ui` — Vue dashboard consumes `useClientFeatures()` for agent execution UI


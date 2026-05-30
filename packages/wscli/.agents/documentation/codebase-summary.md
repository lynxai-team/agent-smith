# @agent-smith/wscli

## Summary
WebSocket client library for the Agent Smith server. Provides real-time bidirectional communication for executing agents and workflows with automatic reconnection, message parsing by type, and event-driven callbacks for token streaming, tool calls, and turn management.

## Dependencies
- `@agent-smith/types` — `WsRawServerMsg`, `WsClientMsg`, `InferenceCallbacks`.
- External: `reconnecting-websocket` (auto-reconnect), `@vue/reactivity` (reactive state), `restmix` (REST fallback).

## Used By
- Browser-based Agent Smith UIs and web applications.
- Any client needing real-time agent execution via WebSocket.

## Entry Point
- `src/main.ts` — Exports `useWsServer` (low-level WebSocket client) and `useClientFeatures` (high-level agent/workflow orchestration service).

## Key Files
| File | Purpose |
|------|---------|
| `src/ws.ts` | WebSocket client with auto-reconnect; parses messages by type (token, thinking, toolcall, turnstart/end) and dispatches to callbacks |
| `src/server.ts` | Client features service: agent/workflow execution, variable handling, model loading, settings mgmt; reactive state (`isReady`, `agentSpec`, `variables`) |
| `src/api.ts` | REST API client (`restmix`): fetches models, agents, settings, workspaces from server at `http://localhost:5184/api` |
| `src/utils.ts` | `createAwaiter<T>()`: creates promise with external resolve/reject for sync-like async execution |

## Architecture
- **Event-Driven**: WebSocket messages parsed and dispatched to callback handlers by type.
- **Dual Transport**: WebSocket for real-time streaming (tokens, tool calls); REST API for queries (models, settings).
- **Reactive State**: Vue `reactive`/`ref` for `agentSpec`, `variables`, `mcp`, `isReady`.
- **Promise-Based Sync**: `createAwaiter` enables sync-like execution of async agent/workflow operations.
- **Auto-Reconnect**: Exponential backoff up to 5 seconds via `reconnecting-websocket`.

## Related
- See `server` — wscli connects to the server's `/ws` endpoint for real-time communication; REST calls go to `/api/*`.
- See `packages/types` — WebSocket message types (`WsRawServerMsg`, `WsClientMsg`) defined in `types/src/ws.ts`.
- See `packages/ui` — UI components consume `useClientFeatures` for agent execution and result display.


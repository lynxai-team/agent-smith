# @agent-smith/wscli

## Summary
WebSocket client library providing real-time bidirectional communication with the Agent Smith server for agent/workflow execution, auto-reconnection, and REST fallback API access.

## Dependencies
- Internal: `@agent-smith/types` (v0.0.9) — `WsRawServerMsg`, `WsClientMsg`, `ServerParams`, `AgentSpec`, `InferenceCallbacks`, `ToolDefSpec`, `ModelInfo`, `Workspace`, `ConfigFile`, `SamplingPreset`, `HistoryTurn`
- External: `reconnecting-websocket` (v4.4.0) — auto-reconnect with exponential backoff; `@vue/reactivity` (v3.5.38) — reactive state for `useClientFeatures`; `restmix` (v0.6.1) — REST API client for configuration queries

## Used By
- `/workspace/agent-smith-ui/src/main.ts` — Vue dashboard imports `useClientFeatures` for real-time agent execution and result streaming
- `/workspace/agent-smith-apps/debate/src/main.ts` — debate app consumes wscli for WebSocket-based multi-agent communication
- `/workspace/agent-smith/packages/cli/bin/index.ts` — terminal REPL uses wscli for interactive agent execution over WebSocket

## Entry Point
- `/workspace/agent-smith/packages/wscli/src/main.ts` — Re-exports `useWsServer` (low-level WS client) and `useClientFeatures` (high-level orchestration service)
- Build: Rollup bundles to `dist/api.es.js` (ESM) and `dist/api.min.js` (IIFE); TypeScript compiles to `dist/` for type declarations

## Key Files
| File | Purpose |
|------|---------|
| `/workspace/agent-smith/packages/wscli/src/ws.ts` | Low-level WebSocket client: auto-reconnect via `reconnecting-websocket`, message parsing by type (token, thinking, toolcall, turnstart/end, toolcallconfirm, etc.), callback dispatch, agent/workflow execution |
| `/workspace/agent-smith/packages/wscli/src/server.ts` | High-level client features service: agent/workflow execution with sync/async modes, variable handling, model/settings loading, reactive state via Vue reactivity (`isReady`, `agentSpec`, `variables`, `mcp`) |
| `/workspace/agent-smith/packages/wscli/src/utils.ts` | `createAwaiter<T>()`: promise factory with external resolve/reject for sync-like async execution pattern |
| `/workspace/agent-smith/packages/wscli/src/main.ts` | Barrel export file re-exporting `useWsServer` and `useClientFeatures` |
| `/workspace/agent-smith/packages/wscli/package.json` | Package manifest: v0.0.8, ESM-only, rollup build config |
| `/workspace/agent-smith/packages/wscli/rollup.config.js` | Rollup bundling to ESM + IIFE outputs with TypeScript and terser plugins |

## Architecture
- **Event-Driven WebSocket**: Messages parsed by `type` field and dispatched to typed callbacks (token, thinkingtoken, toolcall, toolcallend, toolcallconfirm, turnstart/end, error, etc.)
- **Dual Transport Layer**: WebSocket (`/ws`) for real-time streaming; REST (`/api/*`) via `restmix` `useApi()` for configuration queries (models, settings, workspaces, backends, agents)
- **Reactive Orchestration**: `useClientFeatures` wraps `useWsServer` and uses `@vue/reactivity` `ref`/`reactive` to manage `agentSpec`, `variables`, `mcp`, `isReady` state
- **Promise-Based Sync Pattern**: `createAwaiter` enables synchronous-style execution of async agent/workflow operations — wraps a promise with externally exposed `unblock`/`reject` for completion signaling
- **Tool Confirmation Flow**: Server sends `toolcallconfirm` messages; client invokes `onConfirmToolUsage` callback and sends confirmation back via `system` command message
- **Configurable Server Port**: Default port 5184; URL can be overridden via `ServerParams.url` for non-local deployments

## Related
- See `/workspace/agent-smith/server/node/src/main.ts` — provides `/ws` WebSocket endpoint and `/api/*` REST endpoints consumed by wscli
- See `/workspace/agent-smith/packages/types/src/ws.ts` — defines `WsRawServerMsg`, `WsClientMsg`, `ServerParams` types
- See `/workspace/agent-smith-ui/src/main.ts` — Vue dashboard consumes `useClientFeatures()` for agent execution UI
- See `/workspace/agent-smith/packages/cli/bin/index.ts` — terminal REPL uses wscli for interactive agent execution


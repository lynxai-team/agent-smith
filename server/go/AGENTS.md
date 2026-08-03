# Agent Smith — Go WebSocket Server

## Mission
A Go WebSocket server that handles bidirectional communication with AI agent clients, streaming inference results and managing tool call confirmations via the external `lm` binary.

## Conventions (for AI Agents)

- **WebSocket auth handshake**: Client must send `WsAuthMsg{Type:"auth", Key}` as the first frame within 5s; validates against main key or group keys before any message processing
- **Callback bridge pattern**: `callbacks.CallbackHandlers` maps 19+ execution events from the `lm` binary to WebSocket messages — all server message types flow through this layer
- **Channel-based promise pattern**: `utils.Awaiter` implements async tool confirmation via buffered channels (`chan bool`) with mutex-protected map
- **Per-session state**: `state.WsSession` holds per-connection state including `AbortController` (atomic.Pointer[context.CancelFunc]), `ConfirmToolCalls` map, and `ApiKey`
- **YAML config via Viper**: Configuration loaded from `server.config.yaml` with support for API keys, CORS origins, and group-based command authorization

## Quick Start for AI Agents

1. Read `.agents/documentation/decision-tree.md` to find the right doc for your task
2. Read `.agents/documentation/project-overview.md` for high-level context
3. Read `.agents/documentation/project-nav.md` for detailed navigation and dependency graph
4. Read `.agents/documentation/codebase-summary.md` for technical module details

## Documentation

- `.agents/documentation/decision-tree.md` — Quick guide: find the right doc for your task
- `.agents/documentation/project-overview.md` — Concise project overview (~1 page)
- `.agents/documentation/project-nav.md` — Detailed navigation map with dependency graph
- `.agents/documentation/codebase-summary.md` — Top-level codebase summary (structured, machine-readable)

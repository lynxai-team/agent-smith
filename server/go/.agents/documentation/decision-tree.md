# Documentation Decision Tree

> Quick guide: What to read based on your task

## I need to understand the project

- High-level overview → `.agents/documentation/project-overview.md`
- Full navigation map → `.agents/documentation/project-nav.md`
- Structured summary → `.agents/documentation/codebase-summary.md`

## I need to work on a specific module

| Module | Go To |
|--------|-------|
| Authentication | `httpserver/ws_handler.go` — Auth handshake, validateApiKey, 5s timeout |
| Configuration | `conf/conf.go` — Viper-based YAML config, API key generation |
| State management | `state/state.go` — Global state vars and per-session WsSession struct |
| Type definitions | `types/types.go` — WebSocket protocol types, config, inference results, PerformanceMetrics |
| HTTP server setup | `httpserver/router.go` — Echo server, CORS, routes, KeyAuth middleware |
| WebSocket handler | `httpserver/ws_handler.go` — Connection handling, message routing, command execution |
| Callback bridge | `callbacks/callbacks.go` — 19+ event handlers mapping lm binary output to WebSocket messages |
| LM binary execution | `lm/cmd.go` — External `lm` process execution with streaming output |
| Utility helpers | `lm/utils.go`, `utils/awaiter.go` — Interface conversion and channel-based promise pattern |
| WebSocket abstraction | `websock/websock.go` — WSConn interface for testability |
| Command execution | `cmdexec/cmdexec.go`, `cmdexec/real_cmd.go` — Cmd/CmdRunner interfaces for external process execution |
| CLI entry point | `main.go` — Flag parsing, config generation, server bootstrap |
| Test utilities | `testutil/mock_wsconn.go`, `testutil/mock_cmdrunner.go` — Mock implementations for testing |

## I need to understand the WebSocket protocol

- **Auth handshake**: Client sends `WsAuthMsg{Type:"auth", Key}` as first frame (5s timeout) → `httpserver/ws_handler.go`
- Message types (client → server): `WsClientMsg` in `types/types.go`
- Message types (server → client): 20 `WsServerMsgType` constants in `types/types.go`
- Protocol flow: `httpserver/ws_handler.go` → `callbacks/callbacks.go`

## I need to add a new server message type

1. Add new constant to `types/types.go` (e.g., `NewMessageType WsServerMsgType = "newtype"`)
2. Add handler in `callbacks/callbacks.go` `BuildOptions()` map
3. Update this decision tree

## I need to handle authentication

- Auth flow: `httpserver/ws_handler.go` → `validateApiKey()` → checks main key or group keys
- New API key: `conf/conf.go` → `GenerateRandomKey()`
- Config update: `server.config.yaml` → `api_key` and `groups` sections

## Common Tasks (Quick Reference)

| Task | Go To |
|------|-------|
| Understand project architecture | `.agents/documentation/project-nav.md` |
| Add new CLI flag | `main.go` |
| Modify WebSocket message format | `types/types.go` + `callbacks/callbacks.go` |
| Change server port or CORS | `server.config.yaml` + `conf/conf.go` |
| Implement tool confirmation flow | `utils/awaiter.go` + `callbacks/callbacks.go` + `httpserver/ws_handler.go` |
| Add new command authorization rule | `httpserver/ws_handler.go` (`isCommandAuthorized`) + `types/types.go` |
| Debug streaming output | `lm/cmd.go` (rune-by-rune scanner) |
| Add test for a module | `testutil/` — MockWSConn, MockCmdRunner |
| Handle auth timeout or errors | `httpserver/ws_handler.go` → `ws.SetReadDeadline()` |
| Add new callback handler | `callbacks/callbacks.go` → `BuildOptions()` map |
| Update PerformanceMetrics format | `types/types.go` → `PerformanceMetrics` struct |

## Conventions

- **WebSocket auth**: First frame must be `{"type":"auth","key":"..."}` — rejected if invalid or missing within 5s
- **Tool confirmation**: Uses `Awaiter` channel pattern — server sends `toolcallconfirm`, blocks on channel, client resolves via `system` message
- **AbortController**: Atomic pointer to context.CancelFunc — use `GetAbortController()` and `ClearAbortController()` methods
- **Error handling**: Errors sent as `WsRawServerMsg` with `type: "error"`; debug errors only in verbose mode
- **API key auth**: Main key allows all commands; group keys restricted to authorized command lists; **no API key = rejected** (no dev bypass)
- **Interface-based testing**: `websock.WSConn` and `cmdexec.CmdRunner` interfaces enable mocking for tests

→ See `AGENTS.md` for full conventions summary.

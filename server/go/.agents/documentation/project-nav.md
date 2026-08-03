# Agent Smith — Go WebSocket Server — Navigation Map

> Purpose: Single-reference map for AI coding agents to understand, navigate, and modify the Agent Smith Go WebSocket server codebase.

---

## 1. Project Overview

| Module | Path | Purpose |
|--------|------|---------|
| `go` | `/workspace/` | Go WebSocket server — real-time agent communication, inference streaming, tool call management |

**Module**: `github.com/synw/agent-smith/server/go`
**Go Version**: 1.25.0

---

## 2. Architecture Principles

| Principle | Detail | Key Files |
|-----------|--------|-----------|
| Auth-First Handshake | Every WS connection requires `WsAuthMsg{Type:"auth", Key}` as first frame within 5s — no auth = disconnect | `httpserver/ws_handler.go` |
| Callback Bridge | All lm binary events flow through `callbacks.CallbackHandlers` which maps them to WebSocket messages | `callbacks/callbacks.go` |
| Channel-Based Promises | Async tool confirmation via buffered channels (`chan bool`) — no goroutines needed | `utils/awaiter.go` |
| Per-Session State | Each WebSocket connection has independent `WsSession` with `AbortController` (atomic.Pointer), `ConfirmToolCalls`, and `ApiKey` | `state/state.go`, `httpserver/ws_handler.go` |
| Rune-by-Rune Streaming | Real-time token streaming via `bufio.ScanRunes` from lm process stdout | `lm/cmd.go` |
| Viper Config | YAML-based configuration with API keys, CORS origins, and group command authorization | `conf/conf.go`, `server.config.yaml` |
| Interface-Based Testing | `websock.WSConn` and `cmdexec.CmdRunner` interfaces enable mocking for unit tests | `websock/websock.go`, `cmdexec/cmdexec.go` |

---

## 3. Dependency Graph

```
main.go
  ├── conf.InitConf() → state.Conf (types.Conf)
  ├── state.IsVerbose, state.IsDebug
  └── httpserver.RunServer(port)
        ├── GET /ping → health check
        ├── GET /ws → WsHandler
        │     ├── Auth handshake (5s timeout): WsAuthMsg{Type:"auth", Key}
        │     │     └── validateApiKey: main key or group keys
        │     ├── handleSystemMessage (stop, confirmtool)
        │     └── handleCommandMessage
        │           ├── feature="agent" → executeAgent
        │           │     ├── callbacks.NewCallbackHandlers(ws, cmdName)
        │           │     │     └── BuildOptions() → 19+ handler functions
        │           │     ├── isCommandAuthorized(apiKey, cmdName)
        │           │     └── lm.RunCmd(cmdName, params, ws, cbHandler, session, runner)
        │           │           └── runner.CommandContext("lm", ...)
        │           │                 └── bufio.ScanRunes → cbHandler.SendToken(token)
        │           └── feature="workflow" → not implemented
        └── /api/* → KeyAuth middleware (future REST endpoints)
```

**Prose**: `main.go` bootstraps the server by loading config via `conf.InitConf()` into `state.Conf`, then starts the Echo HTTP server. The `/ws` endpoint handles WebSocket connections with an auth-first handshake (5s timeout for `WsAuthMsg{Type:"auth", Key}`), routing messages to `handleSystemMessage` (stop/confirmtool) or `handleCommandMessage` (agent/workflow execution). Command execution calls `callbacks.NewCallbackHandlers()` to create a bridge, then invokes `lm.RunCmd()` which executes the external `lm` binary via `cmdexec.CmdRunner` and streams output rune-by-rune through the callback handlers to the WebSocket client.

---

## 4. Packages/Modules

### `main` — CLI Entry Point

- **Purpose**: Application bootstrap, flag parsing, config/key generation
- **Key files**: `main.go`
- **Key flags**: `-q` (quiet), `-debug`, `-conf` (generate config), `-key` (generate API key), `-port` (default 5187)

### `conf` — Configuration Management

- **Purpose**: Viper-based YAML config loading, API key generation
- **Key files**: `conf/conf.go`
- **Key functions**: `InitConf()`, `InitConfFromReader()`, `Create()`, `GenerateRandomKey()`
- **Config file**: `server.config.yaml` — contains `api_key`, `origins`, and optional `groups`

### `state` — Global & Session State

- **Purpose**: Application-wide state variables and per-WebSocket-session state
- **Key files**: `state/state.go`
- **Key types**: `WsSession` (AbortController atomic.Pointer[context.CancelFunc], ConfirmToolCalls map[string]chan bool, ApiKey string)
- **Global vars**: `IsVerbose`, `IsDebug`, `IsInfering`, `Conf`
- **Key methods**: `GetConf()`, `SetConf()`, `WsSession.GetAbortController()`, `WsSession.ClearAbortController()`

### `types` — Type Definitions

- **Purpose**: All shared type definitions — config, WebSocket protocol, inference results
- **Key files**: `types/types.go`
- **Key types**: `Conf`, `ValidApiKey`, `GroupApiKey`, `AuthorizedCmds`, `WsClientMsg`, `WsAuthMsg`, `WsRawServerMsg`, `WsServerMsgType` (20 constants), `ToolCallSpec`, `PerformanceMetrics`, `InferenceResult`, `PromptProcessingInProgressStats`
- **Message types**: error, startemit, token, thinkingtoken, turnstart, turnend, assistant, thinkingstart, thinkingend, toolcallinprogress, promptprocessingprogress, toolcalltoken, toolsturnstart, toolsturnend, toolcall, toolcallend, toolcallconfirm, finalresult, think, endemit

### `httpserver` — HTTP & WebSocket Server

- **Purpose**: Echo server setup, CORS, routes, KeyAuth middleware, WebSocket message routing with auth
- **Key files**: `httpserver/router.go`, `httpserver/ws_handler.go`
- **Routes**: `GET /ping`, `GET /ws`, `GET /api/*` (future REST)
- **Key functions**: `RunServer()`, `WsHandler()`, `validateApiKey()`, `handleSystemMessage()`, `handleCommandMessage()`, `executeAgent()`, `isCommandAuthorized()`, `sendWsError()`
- **Auth flow**: First frame must be `{"type":"auth","key":"..."}` within 5s — validates against main key or group keys

### `callbacks` — Event Bridge

- **Purpose**: Maps lm binary execution events to WebSocket messages (19+ handlers)
- **Key files**: `callbacks/callbacks.go`
- **Key type**: `CallbackHandlers` — holds ws conn, from string, confirmToolCalls map[string]*Awaiter, mutex
- **Key functions**: `NewCallbackHandlers()`, `BuildOptions()`, `sendMsg()`, `ResolveToolConfirmation()`, `generateUUID()`
- **Handler functions**: onStartEmit, onToken, onThinkingToken, onStartThinking, onEndThinking, onTurnStart, onTurnEnd, onAssistant, onThink, onEndEmit, onToolCallToken, onToolCallInProgress, onPromptProcessingProgress, onToolsTurnStart, onToolsTurnEnd, onToolCall, onToolCallEnd, onConfirmToolUsage

### `lm` — External Binary Execution

- **Purpose**: Execute the `lm` binary and stream its output via WebSocket
- **Key files**: `lm/cmd.go`, `lm/utils.go`
- **Key functions**: `RunCmd()`, `InterfaceToStringArray()`
- **Pattern**: `cmdexec.CmdRunner.CommandContext()` with `bufio.ScanRunes` for real-time token streaming

### `utils` — Utilities

- **Purpose**: Channel-based promise pattern for async operations
- **Key files**: `utils/awaiter.go`
- **Key type**: `Awaiter` — buffered channel (`chan bool`) wrapper
- **Key functions**: `CreateAwaiter()`, `Wait()`, `Resolve()`

### `websock` — WebSocket Abstraction

- **Purpose**: `WSConn` interface for testable WebSocket connections
- **Key files**: `websock/websock.go`
- **Key types**: `WSConn` interface, `RealWSConn` adapter
- **Key functions**: `NewRealWSConn()`

### `cmdexec` — Command Execution

- **Purpose**: Abstract external command execution for testability
- **Key files**: `cmdexec/cmdexec.go`, `cmdexec/real_cmd.go`
- **Key types**: `Cmd` interface, `CmdRunner` interface, `RealCmdRunner`, `realCmd`
- **Key functions**: `NewRealCmdRunner()`

### `testutil` — Test Helpers

- **Purpose**: Mock implementations for unit testing
- **Key files**: `testutil/mock_wsconn.go`, `testutil/mock_cmdrunner.go`
- **Key types**: `MockWSConn`, `MockCmd`, `MockCmdRunner`

---

## 5. Server/API

### Routes

| Method | Path | Handler | Auth | Description |
|--------|------|---------|------|-------------|
| GET | `/ping` | inline | None | Health check — returns `{"status":"ok"}` |
| GET | `/ws` | `WsHandler` | Auth (first frame) | WebSocket connection endpoint — requires `WsAuthMsg` within 5s |
| GET | `/api/*` | future | KeyAuth | Reserved for future REST endpoints |

### WebSocket Protocol

**Auth Handshake** (`WsAuthMsg`):
- Client sends `{"type":"auth","key":"..."}` as the first frame
- Server validates against main key or group keys within 5s
- Invalid/missing auth → disconnect with error

**Client → Server** (`WsClientMsg`):
- `type: "command"` + `feature: "agent"` + `command` + `payload.{prompt}` → runs agent inference
- `type: "system"` + `command: "stop"` → abort (TODO)
- `type: "system"` + `command: "confirmtool"` + `payload.{id, confirm}` → resolve tool confirmation

**Server → Client** (`WsRawServerMsg`): 20 message types covering the full inference lifecycle (startemit → token/thinkingtoken → turnstart → assistant/think → toolcall/toolcallend → turnend → endemit/finalresult)

---

## 6. Code Snippets

### Running the Server

```go
// Build and run
go build -o agent-smith-server .
./agent-smith-server -port 5187

# Generate config and API key
./agent-smith-server -conf -key
```

### Sending a Command via WebSocket (Authenticated)

```go
// 1. Auth handshake (first frame)
authMsg := types.WsAuthMsg{Type: "auth", Key: "your-api-key"}

// 2. Client sends command message
msg := types.WsClientMsg{
    Type:    "command",
    Feature: "agent",
    Command: "some-agent-cmd",
    Payload: map[string]interface{}{"prompt": "user prompt text"},
    Options: map[string]interface{}{"nocli": true},
}
```

### Adding a New Server Message Type

```go
// 1. types/types.go — add constant
const NewMsgType WsServerMsgType = "newmsg"

// 2. callbacks/callbacks.go — add handler in BuildOptions()
"onNewEvent": func(data string, from string) {
    cb.sendMsg(types.NewMsgType, data)
},
```

---

## 7. Navigation Quick Reference

| Task | Go To |
|------|-------|
| Understand project architecture | This file (`project-nav.md`) |
| Find the right doc for my task | `.agents/documentation/decision-tree.md` |
| High-level project overview | `.agents/documentation/project-overview.md` |
| Add new CLI flag | `main.go` |
| Modify WebSocket message format | `types/types.go` + `callbacks/callbacks.go` |
| Change server port or CORS | `server.config.yaml` + `conf/conf.go` |
| Implement tool confirmation | `utils/awaiter.go` + `callbacks/callbacks.go` + `httpserver/ws_handler.go` |
| Debug streaming output | `lm/cmd.go` |
| Add command authorization | `httpserver/ws_handler.go` (`isCommandAuthorized`) + `types/types.go` |
| View module technical details | `.agents/documentation/codebase-summary.md` |
| Write unit tests | `testutil/` — MockWSConn, MockCmdRunner |
| Handle auth timeout/errors | `httpserver/ws_handler.go` → `ws.SetReadDeadline()` |
| Add new callback handler | `callbacks/callbacks.go` → `BuildOptions()` |
| Update PerformanceMetrics format | `types/types.go` → `PerformanceMetrics` struct |

---

## 8. Documentation Links

| Resource | Path |
|----------|------|
| Decision Tree | `.agents/documentation/decision-tree.md` |
| Project Overview | `.agents/documentation/project-overview.md` |
| Navigation Map | `.agents/documentation/project-nav.md` (this file) |
| Codebase Summary | `.agents/documentation/codebase-summary.md` |
| AGENTS.md | `AGENTS.md` |

---

## 9. Key Conventions & Patterns

| Convention | Detail |
|------------|--------|
| WebSocket auth | First frame must be `{"type":"auth","key":"..."}` — rejected if invalid or missing within 5s |
| WebSocket message format | All messages are JSON `WsRawServerMsg{Type, From, Msg}` |
| Tool confirmation pattern | Server sends `toolcallconfirm`, blocks on `Awaiter` channel, client resolves via `system` message with `command: "confirmtool"` |
| AbortController | Atomic pointer to context.CancelFunc — use `GetAbortController()` and `ClearAbortController()` methods |
| Error handling | Errors sent as `WsRawServerMsg` with `type: "error"`; debug-level errors only in verbose mode |
| API key authorization | Main key allows all commands; group keys restricted to authorized command lists; **no API key = rejected** |
| Streaming pattern | `bufio.ScanRunes` for real-time token output from lm binary |
| Config management | Viper reads `server.config.yaml`; supports `api_key`, `origins`, and `groups` |
| Testing pattern | Use `MockWSConn` and `MockCmdRunner` from `testutil/` for unit tests |

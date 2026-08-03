# Agent Smith — Go WebSocket Server — Project Overview

> **Role**: Concise "what is this" for context loading (~1 page overview).
> **See also**: `.agents/documentation/decision-tree.md` to find the right doc for your task.
> **See also**: `.agents/documentation/project-nav.md` for detailed navigation and task references.

---

## What is Agent Smith Go Server?

A Go WebSocket server that provides real-time bidirectional communication between AI agent clients and the inference engine (`lm` binary). It handles authentication, token streaming, thinking tokens, tool call confirmations, and structured inference results. The server manages per-session state, API key authorization (main key + group-based), and CORS configuration.

---

## Core Capabilities

- **WebSocket Communication** — Bidirectional real-time messaging with authenticated clients using `golang.org/x/net/websocket`
- **Authentication Handshake** — First-frame auth (`WsAuthMsg`) with 5s timeout; validates against main API key or group keys
- **Inference Streaming** — Streams tokens, thinking tokens, and full results from the external `lm` binary via callback handlers
- **Tool Call Confirmation** — Channel-based promise pattern (`Awaiter`) for async tool execution approval (client confirms/denies)
- **API Key Authorization** — Main key allows all commands; group keys restricted to authorized command lists; no key = rejected
- **CORS Support** — Configurable allowed origins for browser-based clients

---

## Repository Structure

| Module | Path | Purpose |
|--------|------|---------|
| `main` | `/workspace/main.go` | CLI entry point with flags for config generation, key generation, debug mode |
| `conf` | `/workspace/conf/conf.go` | Viper-based YAML config initialization and API key generation |
| `state` | `/workspace/state/state.go` | Global state (verbose/debug) and per-session WebSocket state |
| `types` | `/workspace/types/types.go` | All type definitions — config, WebSocket protocol, inference results, PerformanceMetrics |
| `httpserver` | `/workspace/httpserver/` | Echo HTTP server setup, CORS, routes, KeyAuth middleware, WebSocket handler |
| `callbacks` | `/workspace/callbacks/callbacks.go` | 19+ callback handlers bridging lm binary events to WebSocket messages |
| `lm` | `/workspace/lm/` | External `lm` binary execution with streaming output parsing |
| `utils` | `/workspace/utils/awaiter.go` | Channel-based promise pattern for async tool confirmation |
| `websock` | `/workspace/websock/websock.go` | WSConn interface abstraction for testability |
| `cmdexec` | `/workspace/cmdexec/` | Cmd/CmdRunner interfaces for external process execution |
| `testutil` | `/workspace/testutil/` | Mock implementations (MockWSConn, MockCmdRunner) for testing |

---

## Key Architecture Patterns

- **Auth-First Handshake**: Every WebSocket connection requires a `WsAuthMsg{Type:"auth", Key}` as the first frame within 5s — no auth, no connection
- **Callback Bridge**: `callbacks.CallbackHandlers` receives events from the `lm` process and converts them to WebSocket messages — all server message types flow through this single layer
- **Channel-Based Promises**: `utils.Awaiter` uses buffered channels (`chan bool`) to implement async tool confirmation without goroutine complexity
- **Per-Session State Isolation**: Each WebSocket connection gets its own `WsSession` with independent `AbortController` (atomic.Pointer), `ConfirmToolCalls` map, and stored `ApiKey`
- **Rune-by-Rune Streaming**: `lm/cmd.go` reads output one rune at a time via `bufio.ScanRunes` for real-time token streaming
- **Interface-Based Design**: `websock.WSConn` and `cmdexec.CmdRunner` interfaces enable mocking and testability

---

## Quick Reference: Common Tasks

| Task | Go To |
|------|-------|
| Add new CLI flag | `main.go` |
| Modify WebSocket message format | `types/types.go` + `callbacks/callbacks.go` |
| Change server port or CORS | `server.config.yaml` + `conf/conf.go` |
| Implement new tool confirmation flow | `utils/awaiter.go` + `callbacks/callbacks.go` |
| Debug streaming output | `lm/cmd.go` |
| Add command authorization rule | `httpserver/ws_handler.go` |
| Handle auth timeout or errors | `httpserver/ws_handler.go` → `ws.SetReadDeadline()` |
| Add new callback handler | `callbacks/callbacks.go` → `BuildOptions()` |
| Update inference result format | `types/types.go` → `InferenceResult` + `PerformanceMetrics` |

---

## Code Snippets

### Starting the Server

```go
// main.go — CLI entry point
flag.Int("port", 5187, "server port")
flag.Bool("conf", false, "generate a config file")
flag.Bool("key", false, "generate a random api key")
httpserver.RunServer(*port)
```

### WebSocket Message Flow (Authenticated)

```go
// types/types.go — Auth message (first frame)
type WsAuthMsg struct {
    Type string `json:"type"`  // must be "auth"
    Key  string `json:"key"`   // main key or group key
}

// types/types.go — Client message structure
type WsClientMsg struct {
    Command  string                 `json:"command"`
    Type     WsClientMsgType        `json:"type"`       // "command" or "system"
    Feature  string                 `json:"feature,omitempty"`
    Payload  map[string]interface{} `json:"payload,omitempty"`
    Options  map[string]interface{} `json:"options,omitempty"`
}

// types/types.go — Server message structure
type WsRawServerMsg struct {
    Type WsServerMsgType `json:"type"`  // e.g., "token", "assistant", "toolcallconfirm"
    From string          `json:"from"`
    Msg  string          `json:"msg"`
}
```

### Tool Call Confirmation Flow

```go
// callbacks/callbacks.go — onConfirmToolUsage handler
awaiter := utils.CreateAwaiter()
tcID := tc["id"].(string)
cb.mu.Lock()
cb.confirmToolCalls[tcID] = awaiter
cb.mu.Unlock()
result := awaiter.Wait()  // blocks until client confirms/denies
```

---

## Documentation Links

| Resource | Path |
|----------|------|
| Decision Tree | `.agents/documentation/decision-tree.md` |
| Project Overview | `.agents/documentation/project-overview.md` |
| Navigation Map | `.agents/documentation/project-nav.md` |
| Codebase Summary | `.agents/documentation/codebase-summary.md` |

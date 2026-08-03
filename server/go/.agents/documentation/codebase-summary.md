# Go WebSocket Server

## Summary
A Go WebSocket server that handles bidirectional communication with AI agent clients, streaming inference results and managing tool call confirmations via the external `lm` binary. Built on Echo framework with `golang.org/x/net/websocket`. Includes first-frame authentication, per-session state isolation, and group-based command authorization.

## Dependencies
- `github.com/labstack/echo/v4 v4.15.4` — HTTP web framework
- `github.com/spf13/viper v1.21.0` — Configuration management (YAML)
- `golang.org/x/net v0.57.0` — WebSocket support
- `gopkg.in/yaml.v3 v3.0.1` — YAML config parsing
- `github.com/labstack/gommon v0.5.0` — Logging utilities

## Used By
- External `wscli` client (WebSocket client for agent communication)
- External `lm` binary (inference engine, executed as subprocess)

## Entry Point
`main.go` — CLI entry with flags: `-q` (quiet), `-debug`, `-conf` (generate config), `-key` (generate API key), `-port` (default 5187)

## Key Files

| File | Purpose |
|------|---------|
| `main.go` | CLI entry point, flag parsing, server bootstrap |
| `go.mod` | Go module definition (`github.com/synw/agent-smith/server/go`) |
| `conf/conf.go` | Viper-based YAML config initialization and API key generation |
| `state/state.go` | Global state vars + per-session WsSession struct (AbortController, ConfirmToolCalls, ApiKey) |
| `types/types.go` | All type definitions (config, WebSocket protocol, tool calls, inference results, PerformanceMetrics) |
| `httpserver/router.go` | Echo server setup with CORS and routes |
| `httpserver/ws_handler.go` | WebSocket handler with auth handshake (5s timeout), message routing, command authorization |
| `callbacks/callbacks.go` | Callback bridge — 19+ handlers mapping lm binary events to WebSocket messages, UUID generation |
| `lm/cmd.go` | External lm binary execution with rune-by-rune streaming |
| `lm/utils.go` | Utility helpers (InterfaceToStringArray) |
| `utils/awaiter.go` | Channel-based promise pattern for tool confirmation |
| `websock/websock.go` | WSConn interface abstraction for testability |
| `cmdexec/cmdexec.go` | Cmd/CmdRunner interfaces for external process execution |
| `cmdexec/real_cmd.go` | Production implementation wrapping os/exec |
| `testutil/mock_wsconn.go` | MockWSConn for testing WebSocket handlers |
| `testutil/mock_cmdrunner.go` | MockCmdRunner for testing lm command execution |
| `server.config.yaml` | Config template (api_key, origins, groups) |

## Architecture
```
main.go
  └── conf.InitConf() → state.Conf
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
        └── /api/* → KeyAuth middleware (future REST)
```

## Related
- `wscli` — WebSocket client that connects to this server
- `lm` — External inference binary executed as a subprocess

## Documentation
- `.agents/documentation/decision-tree.md` — Quick guide: find the right doc for your task
- `.agents/documentation/project-overview.md` — Concise project overview (~1 page)
- `.agents/documentation/project-nav.md` — Detailed navigation map with dependency graph
- `AGENTS.md` — Project conventions and quick start

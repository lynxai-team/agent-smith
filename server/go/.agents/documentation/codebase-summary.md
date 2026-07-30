# Go WebSocket Server

## Summary
A Go WebSocket server that handles bidirectional communication with AI agent clients, streaming inference results and managing tool call confirmations via the external `lm` binary. Built on Echo framework with `golang.org/x/net/websocket`.

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
`main.go` — CLI entry with flags: `-q` (quiet), `-debug`, `-conf` (generate config), `-key` (generate API key), `-port` (default 5184)

## Key Files

| File | Purpose |
|------|---------|
| `main.go` | CLI entry point, flag parsing, server bootstrap |
| `go.mod` | Go module definition (`github.com/synw/agent-smith/server/go`) |
| `conf/conf.go` | Viper-based YAML config initialization and API key generation |
| `state/state.go` | Global state vars + per-session WsSession struct |
| `types/types.go` | All type definitions (config, WebSocket protocol, tool calls, inference results) |
| `httpserver/router.go` | Echo server setup with CORS and routes |
| `httpserver/ws_handler.go` | WebSocket handler with message routing and command authorization |
| `callbacks/callbacks.go` | Callback bridge — 19+ handlers mapping lm binary events to WebSocket messages |
| `utils/awaiter.go` | Channel-based promise pattern for tool confirmation |
| `lm/cmd.go` | External lm binary execution with rune-by-rune streaming |
| `lm/utils.go` | Utility helpers (InterfaceToStringArray) |
| `server.config.yaml` | Config template (api_key, origins, groups) |

## Architecture
```
main.go
  └── conf.InitConf() → state.Conf
  └── httpserver.RunServer(port)
        ├── GET /ping → health check
        ├── GET /ws → WsHandler
        │     ├── handleSystemMessage (stop, confirmtool)
        │     └── handleCommandMessage
        │           └── executeAgent
        │                 ├── callbacks.NewCallbackHandlers()
        │                 ├── cbHandler.BuildOptions()
        │                 └── lm.RunCmd()
        │                       └── exec.Command("lm", ...)
        └── /api/* → KeyAuth middleware (future REST)
```

## Related
- `wscli` — WebSocket client that connects to this server
- `lm` — External inference binary executed as a subprocess

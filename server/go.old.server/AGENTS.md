# Agent Smith Go Old Server

## Mission
Archived Go HTTP server that provided `POST /cmd/execute` with SSE token streaming — replaced by the Node.js/Koa server at `server/node/`.

## Structure

| Directory | Purpose |
|-----------|---------|
| `httpserver/` | Echo v4 app: CORS, API key auth middleware, route registration, server bootstrap |
| `lm/` | External `lm` CLI invocation + SSE streaming utilities |
| `conf/` | Viper-based YAML config management, API key generation, config creation |
| `types/` | Go type definitions: Conf, ValidApiKey, StreamedMessage, InferenceResult |
| `state/` | Global state vars (verbose, debug, inference flag) |

## Conventions

- **Echo v4**: HTTP framework with middleware chain (logger → CORS → key auth → routes)
- **SSE Streaming**: `data: {...}\n` format; tokens streamed rune-by-rune from `lm` binary stdout
- **Two-tier API Key Auth**: Main key = all commands; group keys = whitelisted commands only
- **Viper Config**: YAML file (`server.config.yaml`) for origins, api_key, groups→commands
- **Context Cancellation**: HTTP request context kills `lm` subprocess on client disconnect

## Quick Start for AI Agents

1. Read `.agents/documentation/codebase-summary.md` for technical summary
2. Explore key files listed in codebase-summary.md
3. Note: this server is archived — use `server/node/` for the current implementation

## Build Commands

```bash
go build -o server
GOOS=windows GOARCH=amd64 go build -o server.exe
go vet ./...
go test ./...
```

## Documentation

- `.agents/documentation/codebase-summary.md` — Technical summary of this module
- `../../.agents/documentation/codebase-summary.md` — Top-level project summary
- `../node/.agents/documentation/codebase-summary.md` — Replacement Node.js server summary

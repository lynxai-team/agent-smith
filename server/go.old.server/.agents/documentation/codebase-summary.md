# Agent Smith Go Old Server

## Summary
Archived Go HTTP server (Echo v4) providing a single REST endpoint `POST /cmd/execute` that streams LLM inference tokens via Server-Sent Events (SSE). Calls an external `lm` CLI binary for inference. Replaced by the Node.js/Koa server at `server/node/`.

## Dependencies
- **Internal**: None — self-contained Go module (`github.com/synw/agent-smith/server`)
- `github.com/labstack/echo/v4` v4.13.3 — HTTP framework
- `github.com/spf13/viper` v1.19.0 — YAML config management
- `gopkg.in/yaml.v3` v3.0.1 — YAML serialization
- `github.com/labstack/gommon` v0.4.2 — logging utilities

## Used By
- **No active consumers** — this server has been replaced by `server/node/` (Node.js/Koa).
- External clients previously connected via HTTP to `POST /cmd/execute` on port 5042.

## Entry Point
- `main.go` — CLI entry: parses flags (`-q`, `-debug`, `-conf`, `-key`), initializes config, calls `httpserver.RunServer()`
- No library entry point — runs as standalone binary

## Key Files
| File | Purpose |
|------|---------|
| `main.go` | Entry point: flag parsing, config init, server bootstrap |
| `httpserver/router.go` | Echo app setup: CORS, API key auth middleware, route registration, starts on `:5042` |
| `httpserver/cmd.go` | `ExecuteCmdHandler`: validates API key, checks command authorization, streams `lm` output via SSE |
| `lm/cmd.go` | `RunCmd()`: executes external `lm` CLI binary, streams stdout token-by-token as SSE events |
| `lm/utils.go` | `StreamMsg()`: writes SSE-formatted JSON to response; `InterfaceToStringArray()` helper |
| `conf/conf.go` | Viper-based config: reads `server.config.yaml`, generates random API keys, parses group→commands map |
| `types/types.go` | Shared types: `Conf`, `ValidApiKey`, `StreamedMessage`, `InferenceResult`, `InferenceStats` |
| `state/state.go` | Global state vars: `IsVerbose`, `IsDebug`, `IsInfering`, `Conf` |
| `server.config.yaml` | Runtime config: origins, api_key |

## Architecture
- **Single Endpoint**: `POST /cmd/execute` accepts `{"cmd": "...", "params": [...]}` — the only HTTP interface.
- **SSE Streaming**: Tokens streamed character-by-character via `data: {...}\n` SSE format; `lm.RunCmd()` scans stdout rune-by-rune.
- **External Inference**: Delegates all LLM work to the `lm` CLI binary (Node.js-based) via `exec.CommandContext`.
- **API Key Auth**: Two-tier auth — main API key allows all commands; group keys restrict to whitelisted commands.
- **Config-Driven**: Viper reads `server.config.yaml` for origins, api_key, and groups→authorized_cmds mapping.
- **Context Cancellation**: Uses `context.Context` from HTTP request to kill `lm` process on client disconnect.

## Related
- See `server/node/` — replacement Node.js/Koa server with expanded REST API and WebSocket support.
- See `agent-smith/packages/types` — current shared TypeScript interfaces (replaces Go types here).
- See `agent-smith/.agents/documentation/codebase-summary.md` — top-level project summary.

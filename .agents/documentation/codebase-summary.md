# Agent Smith

## Summary
Agent Smith is a TypeScript monorepo framework for building local-first AI agents that can think (LLM inference), work (tool calling), remember (semantic/transient memory), and interact (CLI/WebSocket I/O).

## Dependencies
- `@agent-smith/types` — shared interfaces for agents, tools, callbacks, WebSocket protocol (leaf package)
- `@agent-smith/core` — runtime engine: SQLite DB, config, feature discovery, tool execution, MCP client
- `@agent-smith/agent` — Agent class with inference loop and Lm client for OpenAI-compatible backends
- `@agent-smith/smem` — semantic memory via LanceDB + Xenova embeddings (384d vectors)
- `@agent-smith/tmem` — transient key-value store via localForage/IndexedDB
- `@agent-smith/cli` — terminal REPL with Commander.js for agent execution and config management
- `@agent-smith/wscli` — WebSocket client for real-time server communication with auto-reconnect
- `server` — Koa backend exposing REST API (`/api/*`) and WebSocket (`/ws`) for remote agent execution

## Used By
- All packages depend transitively on `types` for shared interfaces
- `cli` and `wscli` use `core` for feature discovery and tool execution
- `agent` uses `core` for config, DB access, and tool invocation
- `server` uses `core` and `types` to expose agent workflows over HTTP/WebSocket

## Entry Point
- `packages/*/src/index.ts` — public API exports for each package
- `server/src/main.ts` — Koa server bootstrap with route registration
- `packages/cli/bin/cmd/` — CLI entry point for `lm` command

## Key Files
| File | Purpose |
|------|---------|
| `packages/types/src/main.ts` | All shared interfaces: agent, tool, callback, inference, WebSocket protocol |
| `packages/core/src/db/schemas.ts` | SQLite schema definitions (17 tables for features, backends, plugins, etc.) |
| `packages/core/src/conf.ts` | Configuration loading and management from DB |
| `packages/core/src/features/` | Feature discovery: agents, actions, workflows, adapters, commands from filesystem |
| `packages/core/src/actions/` | Action execution engine for tool calling and plugin invocation |
| `packages/agent/src/agent.ts` | Agent class: recursive tool-calling inference loop with history management |
| `packages/agent/src/main.ts` | Agent runtime exports: Agent, Lm client for OpenAI-compatible HTTP inference |
| `packages/smem/src/useSmem.ts` | Semantic memory factory using LanceDB vector search |
| `packages/tmem/src/tmem.ts` | Transient memory factory wrapping localForage key-value store |
| `packages/cli/bin/cmd/` | Commander.js CLI commands: base, dynamic features, aliases |
| `server/src/routes/` | REST API route handlers — one file per domain (agents, workflows, models, etc.) |
| `server/src/server/` | Koa server setup with WebSocket upgrade and middleware pipeline |

## Architecture
- **Feature-Based Discovery**: Agents, actions, workflows, adapters, and commands are defined as YAML/JS files in user directories, discovered from the filesystem, and registered in SQLite for fast lookup.
- **Database-Driven Runtime**: Better-sqlite3 stores all configuration (17 tables) including features, backends, plugins, tools, settings, and workspaces — no hardcoded defaults.
- **Tool Abstraction**: Actions, agents, workflows, and commands are unified as `ToolSpec`, callable interchangeably in workflows and agent prompts. Multi-language support (JS ESM, Python, YAML/shell).
- **Reactive State + Callbacks**: Vue's `ref`/`reactive` manages cross-module state; inference events (tokens, thinking, tool calls) flow through callback interfaces for real-time streaming.

## Related
- See `@agent-smith/types` — all shared data shapes referenced by every package
- See `@agent-smith/core` — DB-stored agent specs executed by `@agent-smith/agent`
- See `@agent-smith/smem` and `@agent-smith/tmem` — memory backends consumed by the agent loop
- See `server` — exposes agent execution over WebSocket using types from `wscli` and runtime from `core`
- See `agent-smith-plugins` — plugin extensions (git, sqlite, fs, shell, search, video)
- See `agent-smith-ui` — web interface for Agent Smith
- See `agent-smith-apps` — application examples using the framework
- See `lynx-coder` — code generation tool built on Agent Smith

## Documentation

Each packages has an `.agents/documentation/codebase-summary.md` file with detailled information for the package

The documentation files for the project are located in `docsite/public/doc`

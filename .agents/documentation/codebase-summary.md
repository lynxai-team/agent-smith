# Agent Smith

## Summary
Agent Smith is a TypeScript monorepo framework for building local-first AI agents that can think (LLM inference), work (tool calling), remember (semantic/transient memory), and interact (CLI/WebSocket I/O), with dual Go + Node servers and a Vue docsite.

## Dependencies
- `@agent-smith/types` — shared interfaces for agents, tools, callbacks, inference, history, WebSocket protocol (leaf package)
- `@agent-smith/core` — runtime engine: SQLite DB, config, feature discovery, tool execution, MCP client, state management
- `@agent-smith/agent` — Agent class with inference loop, history builder, and Lm client for OpenAI-compatible backends
- `@agent-smith/smem` — semantic memory via LanceDB + Xenova embeddings (384d vectors)
- `@agent-smith/tmem` — transient key-value store via localForage/IndexedDB
- `@agent-smith/browser` — browser-side WLLAMA integration for on-device LLM inference
- `@agent-smith/cli` — terminal REPL (`lm` command) with Commander.js for agent execution and config management
- `@agent-smith/wscli` — WebSocket client for real-time server communication with auto-reconnect
- `server/node` — Koa backend exposing REST API (`/api/*`) and WebSocket (`/ws`) for remote agent execution
- `server/go` — Echo-based Go server with HTTP, WebSocket handler, and CLI (`lm` subcommand)
- `docsite` — Vue 3 + Vite documentation site with sidebar navigation and code examples

## Used By
- All packages depend transitively on `types` for shared interfaces
- `cli` and `wscli` use `core` for feature discovery and tool execution
- `agent` uses `core` for config, DB access, and tool invocation
- `server/node` and `server/go` use `core` and `types` to expose agent workflows over HTTP/WebSocket
- `docsite` depends on `@agent-smith/smem` and `@agent-smith/tmem` for interactive memory examples
- `examples` depends on `@agent-smith/smem`, `@agent-smith/tfm`, and `@inquirer/prompts` for demo scripts

## Entry Point
- `packages/*/src/main.ts` — public API exports for each package
- `server/node/src/index.ts` — Koa server bootstrap with route registration
- `server/go/main.go` — Go server entry with Echo router and CLI
- `packages/cli/bin/main.ts` — CLI entry point for `lm` command
- `docsite/src/main.ts` — Vue app bootstrap

## Key Files
| File | Purpose |
|------|---------|
| `packages/types/src/main.ts` | All shared interfaces: agent, tool, callback, inference, WebSocket protocol |
| `packages/types/src/{agent,callbacks,conf,core,history,inference,lm,model,stats,tools,verbosity,workspace,ws}.ts` | Domain-specific type definitions |
| `packages/core/src/db/schemas.ts` | SQLite schema definitions (17 tables for features, backends, plugins, etc.) |
| `packages/core/src/db/db.ts` | SQLite database connection and lifecycle management |
| `packages/core/src/conf.ts` | Configuration loading and management from DB |
| `packages/core/src/mcp.ts` | Model Context Protocol client for external tool servers |
| `packages/core/src/features/actions/` | Action feature loaders: run-agent, run-worker, load-skill, notify-user, show-feature |
| `packages/core/src/actions/` | Action execution engine for tool calling and plugin invocation |
| `packages/core/src/workflows/` | Workflow execution: cmd and read-based workflow handlers |
| `packages/core/src/state/` | Reactive state: backends, features, plugins, tasks, and root state |
| `packages/core/src/utils/sys/` | System utilities: execute, read, delete, dirs, clipboard, Python runner |
| `packages/agent/src/agent.ts` | Agent class: recursive tool-calling inference loop with history management |
| `packages/agent/src/history/` | History builder and display for conversation management |
| `packages/agent/src/client.ts` | Agent client for remote execution |
| `packages/browser/src/wllama.ts` | Browser-side WLLAMA integration for on-device inference |
| `packages/smem/src/useSmem.ts` | Semantic memory factory using LanceDB vector search |
| `packages/tmem/src/tmem.ts` | Transient memory factory wrapping localForage key-value store |
| `packages/cli/bin/cli.ts` | Commander.js CLI: command registration and REPL loop |
| `server/node/src/main.ts` | Koa server setup with WebSocket upgrade and middleware pipeline |
| `server/go/main.go` | Go Echo server with router, config, and state management |
| `server/go/httpserver/ws_handler.go` | Go WebSocket handler for real-time agent communication |
| `docsite/src/App.vue` | Vue docsite shell with header, sidebar, and content routing |

## Architecture
- **Feature-Based Discovery**: Agents, actions, workflows, adapters, and commands are defined as YAML/JS files on disk, auto-discovered from user directories, and registered in SQLite for fast lookup.
- **Database-Driven Runtime**: Better-sqlite3 stores all configuration (17 tables) including features, backends, plugins, tools, settings, and workspaces — no hardcoded defaults.
- **Dual Server Architecture**: Node/Koa server provides REST + WebSocket for browser clients; Go/Echo server provides a lightweight alternative with its own CLI (`lm`) for headless execution.
- **Unified Tool Abstraction**: Actions, agents, workflows, and commands are all `ToolSpec` objects callable interchangeably; multi-language support (JS ESM, Python, YAML/shell).

## Related
- See `@agent-smith/types` — all shared data shapes referenced by every package
- See `@agent-smith/core` — DB-stored agent specs executed by `@agent-smith/agent`
- See `@agent-smith/smem` and `@agent-smith/tmem` — memory backends consumed by the agent loop
- See `server/node` and `server/go` — dual servers exposing agent execution over HTTP/WebSocket
- See `agent-smith-plugins` — plugin extensions (git, sqlite, fs, shell, search, video)
- See `agent-smith-ui` — web interface for Agent Smith
- See `agent-smith-apps` — application examples using the framework
- See `lynx-coder` — code generation tool built on Agent Smith

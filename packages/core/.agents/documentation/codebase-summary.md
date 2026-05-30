# @agent-smith/core

## Summary
Central runtime engine for Agent Smith. Manages SQLite database (17 tables), configuration, feature discovery from filesystem directories, tool execution, MCP client integration, and reactive state management via Vue.

## Dependencies
- `@agent-smith/types` — all shared interfaces (`FeatureSpec`, `ToolSpec`, `AgentParams`, etc.).
- External: `better-sqlite3`, `@vue/reactivity`, `python-shell`, `restmix`.

## Used By
- `@agent-smith/cli` — for DB operations, config, feature loading, agent/workflow execution.
- `server` — for DB access, configuration, and feature management.

## Entry Point
- `src/main.ts` — Aggregates and exports all public APIs: DB ops, config, state, agent/action/workflow execution.

## Key Files
| File | Purpose |
|------|---------|
| `src/conf.ts` | Configuration management: platform-specific paths, YAML config parsing, backend/feature/plugin processing |
| `src/mcp.ts` | MCP (Model Context Protocol) client for external tool servers with authorization controls |
| `src/tools.ts` | Tool documentation extraction from JS/Python/YAML files; parses `ToolSpec` and agent variables |
| `src/updateconf.ts` | Orchestrates config updates: feature discovery, DB sync, config file processing |
| `src/db/db.ts` | SQLite initialization via better-sqlite3; creates tables on first run |
| `src/db/schemas.ts` | 17 table schemas: features, agents, workflows, actions, tools, backends, settings, workspaces, etc. |
| `src/db/read.ts` | Read operations for all entities (features, backends, plugins, tools, settings, workspaces) |
| `src/db/write.ts` | Write/upsert operations for all entities including feature management and backend config |
| `src/agents/cmd.ts` | Agent execution entry point: generates prompt, delegates to `useagent.ts` |
| `src/agents/read.ts` | Reads agent YAML specs, resolves variables, sets up MCP servers, loads tools |
| `src/agents/useagent.ts` | Full agent executor: backend selection, inference params, grammar compilation, streaming, error handling |
| `src/actions/cmd.ts` | Action execution engine: JavaScript (dynamic import), Python (python-shell), YAML (shell commands) |
| `src/workflows/cmd.ts` | Multi-step workflow executor: chains agent/action/adaptater/cmd steps with result passing |
| `src/state/state.ts` | Reactive state (Vue `ref`): modes, filepaths, data directory, initialization flow |
| `src/state/features.ts` | Feature discovery: scans directories for agents/, workflows/, actions/, adaptaters/, cmds/, skills/ |
| `src/state/backends.ts` | Inference backend management: init from config, probe connectivity, switch active backend |

## Architecture
- **Feature-Based**: Agents, actions, workflows, adaptaters, commands, skills are "features" discovered from filesystem and registered in SQLite.
- **Database-Driven Config**: SQLite stores all configuration, features, backends, settings. Features scanned from disk but looked up from DB.
- **Reactive State**: Vue `ref`/`reactive` for cross-module state (no Redux).
- **Tool Abstraction**: Actions, agents, workflows unified as `ToolSpec` — callable interchangeably in workflows and agent prompts.
- **MCP Integration**: External tool servers via Model Context Protocol with authorization controls.
- **Multi-Language Actions**: JS (ESM), Python (python-shell), YAML (shell commands).
- **Workflow Orchestration**: YAML-defined pipelines chaining multiple step types with result passing.
- **Backend Agnostic**: Multiple inference backends (OpenAI-compatible, local llamacpp) with per-agent selection.

## Related
- See `packages/types` — provides all shared interfaces used throughout core.
- See `packages/agent` — core's agent execution (`useagent.ts`) uses the `Agent` class from the agent package.
- See `packages/cli` — cli depends on core for DB, config, and feature execution.
- See `server` — server depends on core for DB access and configuration.

# @agent-smith/core

## Summary
Central runtime engine for Agent Smith. Manages SQLite database (18 tables), configuration, feature discovery from filesystem directories, tool execution, inline workflow support, MCP client integration, and reactive state management via Vue.

## Dependencies
- `@agent-smith/agent` — Agent class wrapper for inference loop.
- `@agent-smith/types` — all shared interfaces (`FeatureSpec`, `ToolSpec`, `AgentParams`, `WorkflowStep`, etc.).
- External: `better-sqlite3`, `@vue/reactivity`, `python-shell`, `@intrinsicai/gbnfgen`, `@modelcontextprotocol/sdk`, `front-matter`, `yaml`, `clipboardy`, `node-notifier`.

## Used By
- `@agent-smith/agent` — wraps core's config/DB with inference loop.
- `@agent-smith/cli` — for DB operations, config, feature loading, agent/workflow execution.
- `@agent-smith/wscli` — uses core for client features service.
- `server` — for DB access, configuration, and feature management.
- Plugins — consume core for feature discovery and execution.

## Entry Point
- `src/main.ts` — Aggregates and exports all public APIs: DB ops, config, state, agent/action/workflow execution, MCP client.

## Key Files
| File | Purpose |
|------|---------|
| `src/main.ts` | Public API aggregator: exports db, conf, fs, utils, state namespaces plus execution functions |
| `src/conf.ts` | Configuration management: platform-specific paths, YAML config parsing, backend/feature/plugin processing |
| `src/mcp.ts` | MCP (Model Context Protocol) client for external tool servers with authorization controls |
| `src/tools.ts` | Tool documentation extraction from JS/Python/YAML files; parses `ToolSpec` and agent variables |
| `src/updateconf.ts` | Orchestrates config updates: feature discovery, DB sync, config file processing |
| `src/db/db.ts` | SQLite initialization via better-sqlite3; creates tables on first run |
| `src/db/schemas.ts` | 18 table schemas: features, agents, workflows, actions, tools, backends, settings, workspaces, task, tasktemplate |
| `src/db/read.ts` | Read operations for all entities including new `task` and `tasktemplate` types |
| `src/db/write.ts` | Write/upsert operations for all entities including feature management |
| `src/agents/cmd.ts` | Agent execution entry point: generates prompt, delegates to `useagent.ts` |
| `src/agents/useagent.ts` | Full agent executor: backend selection, inline workflow before/after hooks, grammar compilation, streaming |
| `src/actions/cmd.ts` | Action execution engine: JavaScript (dynamic import), Python (python-shell), YAML (shell commands) |
| `src/workflows/cmd.ts` | Multi-step workflow executor with inline workflow support; chains agent/action/adaptater/cmd steps |
| `src/utils/workflow.ts` | New utility for reading inline workflow definitions from agent specs |
| `src/state/state.ts` | Reactive state (Vue `ref`): modes, filepaths, data directory, initialization flow |
| `src/state/features.ts` | Feature discovery: scans directories for agents, workflows, actions, adaptaters, tasks, tasktemplates |
| `src/state/backends.ts` | Inference backend management: init from config, probe connectivity, switch active backend |
| `src/features/actions/load-task.ts` | Feature action to load a task into the workspace |
| `src/features/actions/show-feature.ts` | Feature action to display details of an Agent Smith feature (renamed from read-feature) |
| `src/features/actions/run-agent.ts` | Feature action to run an agent with prompt matching and workflow hooks |
| `src/features/adaptaters/prequery.ts` | Pre-query adaptater for workflow preprocessing |

## Architecture
- **Feature-Based**: Agents, actions, workflows, adaptaters, commands, skills, tasks, and tasktemplates are "features" discovered from filesystem directories and registered in SQLite.
- **Database-Driven Config**: SQLite stores all configuration, features, backends, settings. Features scanned from disk but looked up from DB.
- **Reactive State**: Vue `ref`/`reactive` for cross-module state (no Redux).
- **Tool Abstraction**: Actions, agents, workflows unified as `ToolSpec` — callable interchangeably in workflows and agent prompts.
- **Inline Workflow Support**: Agents can define `before`/`after` inline workflows that execute before/after inference, enabling prompt transformation and post-processing.
- **MCP Integration**: External tool servers via Model Context Protocol with authorization controls.
- **Multi-Language Actions**: JS (ESM), Python (python-shell), YAML (shell commands).
- **Workflow Orchestration**: Enhanced executor supports both YAML-defined pipelines and inline workflows with result passing between steps.
- **Backend Agnostic**: Multiple inference backends (OpenAI-compatible, local llamacpp) with per-agent selection.
- **Improved Prompt Matching**: Regex-based skill name matching with proper escaping and negative lookahead to prevent partial matches.

## Related
- See `packages/types` — provides all shared interfaces used throughout core.
- See `packages/agent` — core's agent execution (`useagent.ts`) uses the `Agent` class from the agent package.
- See `packages/cli` — cli depends on core for DB, config, and feature execution.
- See `server` — server depends on core for DB access and configuration.

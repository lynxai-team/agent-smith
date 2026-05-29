# Agent Smith Core

## Summary

Agent Smith Core is the central package of the Agent Smith framework, providing the foundation for building and executing AI agents. It manages configuration, database storage (SQLite), feature discovery (agents, actions, workflows, adaptaters, commands, skills), tool execution, MCP (Model Context Protocol) integration, and state management. The package serves as the runtime engine that orchestrates agent inference, tool calls, and workflow execution.

## File Structure

```
src/
├── main.ts                          # Main entry point - exports all public APIs
├── conf.ts                          # Configuration management (paths, config file handling)
├── const.ts                         # Constants (local backends defaults)
├── mcp.ts                           # MCP client implementation for external tool servers
├── tools.ts                         # Tool documentation extraction utilities
├── updateconf.ts                    # Configuration and feature update commands
├── actions/
│   ├── cmd.ts                       # Action execution engine (JS, PY, YML)
│   └── read.ts                      # JS action factory function
├── adaptaters/
│   └── cmd.ts                       # Adaptater execution (JS only)
├── agents/
│   ├── cmd.ts                       # Agent execution entry point
│   ├── conf.ts                      # Inference parameters merging
│   ├── files.ts                     # File placeholder resolution in agent specs
│   ├── read.ts                      # Agent spec reading and tool setup
│   └── useagent.ts                  # Agent executor with MCP, settings, streaming
├── db/
│   ├── db.ts                        # SQLite database initialization
│   ├── schemas.ts                   # Database schema definitions (17 tables)
│   ├── read.ts                      # Database read operations
│   └── write.ts                     # Database write/upsert operations
├── features/
│   ├── adaptaters/prequery.ts       # (feature file)
│   ├── agents/infer.yml             # (feature file)
│   └── workflows/q.yml              # (feature file)
├── state/
│   ├── state.ts                     # Core state management (Vue reactivity)
│   ├── features.ts                  # Feature discovery and spec reading
│   ├── backends.ts                  # Inference backend management
│   ├── plugins.ts                   # Plugin path resolution
│   └── tasks.ts                     # Agent settings management
├── utils/
│   ├── io.ts                        # I/O utilities (clipboard, prompt files)
│   ├── perf.ts                      # Performance timer utilities
│   ├── text.ts                      # Text extraction utilities
│   ├── user_msgs.ts                 # Runtime error/warning message helpers
│   └── sys/
│       ├── clipboard.ts             # Clipboard read/write operations
│       ├── delete_file.ts           # File deletion utility
│       ├── dirs.ts                  # Directory creation utility
│       ├── execute.ts               # Shell command execution (spawn)
│       ├── read.ts                  # File reading utilities
│       ├── read_agent.ts            # Agent YAML file reading
│       ├── read_cmds.ts             # User command module loading
│       ├── read_conf.ts             # Config YAML file reading
│       ├── read_features.ts         # Feature directory scanning
│       ├── read_yml_file.ts         # Generic YAML file reading
│       └── run_python.ts            # Python script execution wrapper
└── workflows/
    ├── cmd.ts                       # Workflow execution engine (multi-step)
    └── read.ts                      # Workflow spec reading and parsing
```

## File Descriptions

### Core Files

- **main.ts**: Main entry point that aggregates and exports all public APIs including database operations, filesystem helpers, configuration utilities, state management, and execution functions for agents, actions, and workflows.

- **conf.ts**: Manages application configuration paths (platform-specific: Linux ~/.config, macOS ~/Library/Application Support, Windows %APPDATA%). Handles config file creation, parsing, and processing of backends, features, plugins, agents, and workspaces from YAML config.

- **const.ts**: Defines default local inference backends (llamacpp with OpenAI-compatible API).

- **mcp.ts**: Implements MCP (Model Context Protocol) client for connecting to external tool servers. Supports authorized tools, user-confirmation workflows, and dynamic tool extraction.

- **tools.ts**: Extracts tool documentation from JS (/* */), Python (""" """), and YAML files. Parses tool specifications and agent variables.

- **updateconf.ts**: Orchestrates configuration updates including feature discovery, database synchronization, and config file processing.

### Database Layer (db/)

- **db.ts**: Initializes SQLite database using better-sqlite3. Creates tables on first run.

- **schemas.ts**: Defines 17 database tables: filepath, featurespath, plugin, agent, workflow, action, adaptater, skill, cmd, tool, aliases, backend, agentsettings, workspace, setting, modelpreset.

- **read.ts**: Read operations for all entities - features, backends, plugins, tools, settings, workspaces, sampling presets.

- **write.ts**: Write/upsert operations for all entities including feature management, backend configuration, agent settings, and workspace management.

### Agent System (agents/)

- **cmd.ts**: Entry point for agent execution. Generates prompt and delegates to useagent.ts.

- **conf.ts**: Merges user-provided inference parameters with agent-defined defaults.

- **files.ts**: Resolves {file:path} placeholders in agent prompts and templates by reading file contents.

- **read.ts**: Reads agent specifications, resolves variables, sets up MCP servers, loads tools (actions, agents, workflows), and applies file placeholders.

- **useagent.ts**: Full agent executor with backend selection, MCP server management, inference parameter application, grammar compilation, streaming output, and error handling for HTTP errors (502, 404, 400).

### Execution Engines

- **actions/cmd.ts**: Executes actions in three formats: JavaScript (dynamic import), Python (python-shell), and YAML (shell command execution).

- **adaptaters/cmd.ts**: Executes JS-based adaptaters with input handling.

- **workflows/cmd.ts**: Multi-step workflow executor supporting agent, action, adaptater, and cmd step types. Passes results between steps.

### State Management (state/)

- **state.ts**: Core reactive state using Vue's reactivity system. Manages modes (input/output/format), filepaths, data directory, and initialization flow.

- **features.ts**: Discovers features from directories by scanning subdirectories (agents/, workflows/, actions/, adaptaters/, cmds/, skills/).

- **backends.ts**: Manages inference backends (Lm instances). Initializes backends from config, probes connectivity, allows switching.

- **plugins.ts**: Resolves global npm plugin paths for feature loading.

- **tasks.ts**: Manages agent-specific settings (model, tokens, temperature, etc.) loaded from database.

### Utilities (utils/)

- **io.ts**: Clipboard operations, prompt file reading, input extraction from options, agent prompt generation.

- **perf.ts**: Performance timer with measurements, percentages, and formatted duration output.

- **text.ts**: Extracts content between XML-like tags.

- **user_msgs.ts**: Colored runtime error/warning/info message helpers with exit on critical errors.

- **sys/execute.ts**: Shell command execution via Node.js spawn with stdout/stderr handling.

- **sys/run_python.ts**: Python script execution wrapper using python-shell library.

## Architectural Patterns

1. **Feature-Based Architecture**: The system is organized around "features" - agents, actions, workflows, adaptaters, commands, and skills. Each feature type has its own directory structure and execution pipeline.

2. **Database-Driven Configuration**: SQLite stores all configuration, features, backends, and settings. Features are discovered from filesystem directories but registered in the database for fast lookup.

3. **Reactive State Management**: Uses Vue's reactivity system (ref, reactive) for state management instead of traditional Redux-style patterns.

4. **Tool Abstraction**: Tools (actions, agents, workflows) are abstracted into a unified ToolSpec interface with execute functions, enabling them to be called interchangeably within workflows and agent prompts.

5. **MCP Integration**: Supports Model Context Protocol for external tool servers, allowing agents to use tools from external services with authorization controls.

6. **Multi-Language Support**: Actions can be written in JavaScript (ES modules), Python (via python-shell), or YAML (shell commands).

7. **Workflow Orchestration**: Workflows are YAML-defined pipelines that chain multiple step types (agent, action, adaptater, cmd) with result passing between steps.

8. **Backend Agnostic**: Supports multiple inference backends (OpenAI-compatible, local llamacpp) with configurable defaults and per-agent backend selection.

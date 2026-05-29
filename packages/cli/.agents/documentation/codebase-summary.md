# Agent Smith CLI

## Summary

Agent Smith CLI is a terminal client for language model agents. It provides a command-line interface to interact with AI agents, execute workflows, manage configurations, and run inference tasks through a feature-rich CLI built with Commander.js.

## File Structure

```
packages/cli/
├── bin/
│   ├── index.ts          # Entry point - handles CLI execution mode and command routing
│   ├── main.ts           # Exports options and argument parsing utilities
│   ├── cli.ts            # Interactive query loop for REPL-style CLI mode
│   ├── state.ts          # Reactive state management (run mode, chat mode, inference params)
│   ├── options.ts        # CLI option definitions (display, IO, inference options)
│   ├── utils.ts          # Utility functions (arg parsing, tool confirmation, token printing)
│   ├── user_msgs.ts      # Runtime message utilities (error, warning, info helpers)
│   └── cmd/
│       ├── build.ts      # Command builder - assembles the full CLI program
│       ├── base.ts       # Base commands (exit, agents, agent, backend, conf, reset, regendb)
│       ├── aliases.ts    # Dynamic command creation from alias definitions
│       ├── features.ts   # Execute workflows, tasks, actions, and agents
│       ├── cmds.ts       # User command initialization and agent management commands
│       ├── callbacks.ts  # Inference event callbacks (tokens, thinking, tool calls)
│       ├── read_cmds.ts  # Dynamic command loading from feature files
│       └── user_cmds.ts  # User command data extraction from features
├── package.json          # Package configuration and dependencies
├── tsconfig.json         # TypeScript compiler configuration
└── .gitignore            # Git ignore rules
```

## File Descriptions

### Core Files

- **bin/index.ts**: Main entry point. Handles argument parsing, initializes state, builds commands via `buildCmds()`, and routes execution based on run mode (CLI REPL or command-line). Supports special flags like `conf` and `reset`.

- **bin/main.ts**: Re-exports all option groups (`displayOptions`, `ioOptions`, `inferenceOptions`, `allOptions`) and the `parseCommandArgs` utility for use by other modules.

- **bin/cli.ts**: Implements the interactive REPL query loop. Prompts user for input, parses it as command arguments, and executes via Commander. Exits on chat mode completion.

- **bin/state.ts**: Manages reactive application state using Vue's `ref`. Tracks `runMode` (cmd vs cli), `isChatMode`, and chat inference parameters.

- **bin/options.ts**: Defines all CLI options organized into categories:
  - `displayOptions`: verbose, debug modes
  - `inferenceOptions`: model, temperature, top_k, backend, context window, etc.
  - `ioOptions`: input/output mode selectors (clipboard, file, markdown)
  - Includes argument parsers for string, integer, and float values

- **bin/utils.ts**: Core utilities including:
  - `parseCommandArgs`: Extracts positional args and options from Commander arguments
  - `confirmToolUsage`: Interactive tool execution confirmation prompt
  - `printToken`: Styled token output with optional dimming and striping

- **bin/user_msgs.ts**: Standardized runtime message helpers with emoji prefixes for errors, warnings, data errors, and info messages.

### Command System

- **bin/cmd/build.ts**: Central command builder. Initializes base commands, reads aliases and features from the database, creates dynamic commands from aliases, and registers user commands from features. Exports `buildCmds()`, `chat()`, and `parseCmd()`.

- **bin/cmd/base.ts**: Registers built-in CLI commands: `exit`, `agents`, `agent <name>`, `backend <name>`, `backends`, `update`, `conf <path>`, `reset`, `regendb`. Each command has specific actions for agent management, configuration updates, and database operations.

- **bin/cmd/aliases.ts**: Dynamically creates CLI commands from alias definitions read from the database. Supports `agent` and `workflow` alias types, automatically attaching inference options and required/optional variables.

- **bin/cmd/features.ts**: Execution layer for features:
  - `executeWorkflowCmd`: Runs named workflows with arguments
  - `executeAgentCmd`: Executes agents with prompt generation and tool execution
  - `executeTaskCmd`: Similar to agent but focused on task inference
  - `executeActionCmd`: Executes actions with input from options

- **bin/cmd/cmds.ts**: User command initialization from feature specs. Creates Commander commands dynamically based on feature definitions, attaching appropriate option sets (all, display, inference, io). Also handles agent listing and configuration display.

- **bin/cmd/callbacks.ts**: Inference event callback factory (`useInferenceCallbacks`). Provides handlers for:
  - Token streaming output
  - Thinking state (start/end/token) with spinner UI
  - Tool call lifecycle (in progress, execution, end)
  - Performance timing integration

- **bin/cmd/read_cmds.ts**: Dynamic module loader. Imports command definitions from feature files using `pathToFileURL` and ESM imports. Handles errors gracefully with runtime warnings.

- **bin/cmd/user_cmds.ts**: Extracts user command metadata (name, description, options) from feature specifications by loading and parsing the command modules.

### Configuration

- **package.json**: Defines the package as `@agent-smith/cli`, version 0.0.117. Dependencies include Commander.js for CLI parsing, @inquirer/prompts for interactive prompts, ansi-colors for terminal styling, ora for spinners, and @agent-smith/core for shared functionality.

- **tsconfig.json**: TypeScript 6.0 configuration targeting ES2022 modules with strict mode enabled. Compiles `bin/**/*.ts` to `dist/` directory.

## Architecture & Patterns

### Command Pattern
The CLI uses Commander.js as its command framework. Commands are built dynamically at runtime by:
1. Initializing base commands (static)
2. Reading aliases from the database and creating corresponding commands
3. Loading user-defined commands from feature specifications
4. Attaching option groups based on feature requirements

### Reactive State Management
Application state uses Vue's reactivity system (`@vue/reactivity`) with `ref()` for tracking mode changes, chat state, and inference parameters across modules.

### Dynamic Feature Loading
Features (agents, workflows, actions) are loaded dynamically from the database. Commands are generated on-the-fly based on feature specifications, allowing hot-reloading of features without restarting the CLI.

### Callback-Based Inference
Inference operations use a callback pattern where event handlers (tokens, thinking, tool calls) are injected into the agent executor. This enables consistent UI feedback (spinners, token display, progress indicators) across all agent interactions.

### Separation of Concerns
- **bin/**: Core CLI infrastructure and utilities
- **bin/cmd/**: Command definitions and execution logic
- Options are categorized and reusable across commands
- State is centralized and reactive

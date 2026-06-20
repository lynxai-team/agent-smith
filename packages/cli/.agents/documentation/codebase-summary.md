# @agent-smith/cli

## Summary
Commander.js CLI (`lm` binary) providing an interactive REPL and one-shot command mode for executing AI agents, workflows, and actions, managing configuration, and running LLM inference with real-time streaming output.

## Dependencies
- `@agent-smith/core` — DB operations, config management, feature discovery, agent/workflow/action execution.
- `@agent-smith/types` — shared TypeScript type definitions.
- `@agent-smith/agent` — agent inference loop class.
- External: `commander` (CLI argument parsing), `@inquirer/prompts` (interactive prompts), `ora` (terminal spinners), `ansi-colors` (styled output), `@vue/reactivity` (reactive refs), `yaml` (config parsing), `marked-terminal` (markdown rendering), `clipboardy` (clipboard I/O).

## Used By
- End users — terminal interaction via `lm` binary.
- Plugins — feature registration (agents, workflows, actions) discovered at runtime.

## Entry Point
- `bin/index.ts` — CLI entry: parses CLI args, initializes state/DB, builds commands via `buildCmds()`, routes to REPL (`query`) or one-shot command mode (`parseCmd`).

## Key Files
| File | Purpose |
|------|---------|
| `bin/index.ts` | CLI entry point: arg dispatch, state init, command building, REPL/cmd routing |
| `bin/cli.ts` | Interactive REPL loop: prompts user input, parses as Commander args, recurses for continuous interaction |
| `bin/main.ts` | Library entry: re-exports options and utility functions for programmatic use |
| `bin/state.ts` | Reactive state via Vue `ref`: `runMode` (cmd/cli), `isChatMode`, chat inference params |
| `bin/options.ts` | CLI option definitions: display (verbose/debug), inference (model, temp, backend, mcp), IO (clipboard/file/output format) |
| `bin/utils.ts` | Utilities: `parseCommandArgs`, `confirmToolUsage` (interactive tool approval), `printToken` (styled streaming output) |
| `bin/cmd/build.ts` | Command builder: assembles base commands + DB alias commands + dynamic user command features |
| `bin/cmd/base.ts` | Built-in commands: exit, agents, agent, backend, backends, conf, reset, regendb, update |
| `bin/cmd/aliases.ts` | Dynamic command generation from DB aliases (agent and workflow types with inference options) |
| `bin/cmd/features.ts` | Feature execution: `executeWorkflowCmd`, `executeAgentCmd`, `executeActionCmd` |
| `bin/cmd/callbacks.ts` | Inference event callbacks: token streaming, thinking spinner, tool call lifecycle UI |
| `bin/cmd/cmds.ts` | Command handlers: `initUserCmds` (dynamic feature commands), `processAgentsCmd`, `processAgentCmd`, `resetDbCmd`, `recreateDbCmd` |
| `bin/cmd/read_cmds.ts` | Dynamic ESM module loader for user command files via `pathToFileURL` |
| `bin/user_msgs.ts` | Runtime message helpers: `runtimeError`, `runtimeWarning`, `runtimeDataError`, `runtimeInfo` |

## Architecture
- **Dynamic Command Assembly**: Commands built at startup from three sources — static base commands, DB alias definitions, and feature-spec user commands (hot-reloadable).
- **Reactive State Management**: Vue `ref` objects track `runMode`, `isChatMode`, and inference params across all modules without a centralized store.
- **Callback-Driven UI**: Inference callbacks (`useInferenceCallbacks`) inject real-time token streaming, thinking-phase spinners, and tool call progress into the agent executor output.
- **Two Execution Modes**: REPL mode (`query` loop for interactive chat) and one-shot command mode (`parseCmd` for scriptable invocations).

## Related
- See `packages/core` — cli delegates agent/workflow/action execution to core's executors.
- See `packages/agent` — cli wraps the `Agent` class with inference callbacks for real-time output.
- See `packages/wscli` — alternative WebSocket-based client for remote agent communication.

# @agent-smith/cli

## Summary
Commander.js CLI (`lm` binary) providing an interactive REPL and one-shot command mode for executing AI agents, workflows, and actions, managing configuration, and running LLM inference with real-time streaming output.

## Dependencies
- `@agent-smith/core` (^0.0.16) — DB operations, config management, feature discovery, agent/workflow/action execution.
- `@agent-smith/types` (^0.0.9) — shared TypeScript type definitions (runtime type imports).
- `@agent-smith/agent` (^0.6.3) — agent inference loop class (runtime import for `Agent` type).
- External: `commander` (^15.0.0, CLI argument parsing), `@inquirer/prompts` (^8.5.2, interactive prompts), `ora` (^9.4.1, terminal spinners), `ansi-colors` (^4.1.3, styled output), `@vue/reactivity` (^3.5.40, reactive refs), `yaml` (^2.9.0, config parsing), `marked-terminal` (^7.3.0, markdown rendering), `clipboardy` (^5.3.2, clipboard I/O).

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
| `bin/options.ts` | CLI option definitions: display (verbose/debug/**nocli**), inference (model, temp, backend, mcp), IO (clipboard/file/output format) |
| `bin/utils.ts` | Utilities: `parseCommandArgs`, `confirmToolUsage` (interactive tool approval), `printToken` (styled streaming output) |
| `bin/cmd/build.ts` | Command builder: assembles base commands + DB alias commands + dynamic user command features |
| `bin/cmd/base.ts` | Built-in commands: exit, agents, agent, backend, backends, conf, reset, regendb, update |
| `bin/cmd/aliases.ts` | Dynamic command generation from DB aliases (agent and workflow types with inference options) |
| `bin/cmd/features.ts` | Feature execution: `executeWorkflowCmd`, `executeAgentCmd`, `executeActionCmd` |
| `bin/cmd/callbacks.ts` | Inference event callbacks: token streaming (with **nocli** raw output support), thinking spinner, tool call lifecycle UI |
| `bin/cmd/cmds.ts` | Command handlers: `initUserCmds` (dynamic feature commands), `processAgentsCmd`, `processAgentCmd`, `resetDbCmd`, `recreateDbCmd` |
| `bin/cmd/read_cmds.ts` | Dynamic ESM module loader for user command files via `pathToFileURL` |
| `bin/user_msgs.ts` | Runtime message helpers: `runtimeError`, `runtimeWarning`, `runtimeDataError`, `runtimeInfo` |

## Architecture
- **Dynamic Command Assembly**: Commands built at startup from three sources — static base commands, DB alias definitions, and feature-spec user commands (hot-reloadable).
- **Reactive State Management**: Vue `ref` objects track `runMode`, `isChatMode`, and inference params across all modules without a centralized store.
- **Callback-Driven UI**: Inference callbacks (`useInferenceCallbacks`) inject real-time token streaming, thinking-phase spinners, and tool call progress into the agent executor output.
- **Two Execution Modes**: REPL mode (`query` loop for interactive chat) and one-shot command mode (`parseCmd` for scriptable invocations).

## Recent Changes
- Added `--nocli` option for raw output without CLI formatting (bin/options.ts, bin/cmd/callbacks.ts)
- Upgraded `@agent-smith/core` to ^0.0.16, `@agent-smith/agent` to ^0.6.3
- Updated token display logic to respect `--nocli` flag in callbacks

## Related
- See `packages/core` — cli delegates agent/workflow/action execution to core's executors.
- See `packages/agent` — cli wraps the `Agent` class with inference callbacks for real-time output.
- See `packages/wscli` — alternative WebSocket-based client for remote agent communication.

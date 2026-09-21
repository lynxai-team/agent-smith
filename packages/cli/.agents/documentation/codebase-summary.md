# @agent-smith/cli

## Summary
Commander.js CLI (`lm` binary) providing an interactive REPL and one-shot command mode for executing AI agents, workflows, and actions, managing configuration, and running LLM inference with real-time streaming output.

## Dependencies
- `@agent-smith/core` (^0.0.22) — DB operations, config management, feature discovery, agent/workflow/action execution.
- `@agent-smith/types` (^0.0.11) — shared TypeScript type definitions (runtime type imports).
- `@agent-smith/agent` (^0.7.3) — agent inference loop class (runtime import for `Agent` type).
- External: `commander` (^15.0.0, CLI argument parsing), `@inquirer/prompts` (^8.7.2, interactive prompts), `ora` (^9.4.1, terminal spinners), `ansi-colors` (^4.1.3, styled output), `@vue/reactivity` (^3.5.42, reactive refs), `yaml` (^2.9.1, config parsing), `marked-terminal` (^7.3.0, markdown rendering), `clipboardy` (^5.3.2, clipboard I/O).

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
| `bin/user_msgs.ts` | Runtime message helpers: `runtimeError`, `runtimeWarning`, `runtimeDataError`, `runtimeInfo` |
| `bin/cmd/build.ts` | Command builder: assembles base commands + DB alias commands + dynamic user command features; also exports `chat()` for multi-turn agent interaction |
| `bin/cmd/base.ts` | Built-in commands: exit, agents, agent, backend, backends, conf, reset, regendb, update, **plugin, init, updateplugins**, ws (workspace management) |
| `bin/cmd/install.ts` | Plugin management: `installPlugin()` (npm i -g + config register), `installAll()` (default plugins + GUI via <kbd>init</kbd>), `updateAll()` via <kbd>updateplugins</kbd> |
| `bin/cmd/aliases.ts` | Dynamic command generation from DB aliases (agent and workflow types with inference options) |
| `bin/cmd/features.ts` | Feature execution: `executeWorkflowCmd`, `executeAgentCmd`, `executeActionCmd` |
| `bin/cmd/callbacks.ts` | Inference event callbacks: token streaming (with **nocli** raw output support), thinking spinner, tool call lifecycle UI |
| `bin/cmd/cmds.ts` | Command handlers: `initUserCmds` (dynamic feature commands), `processAgentsCmd`, `processAgentCmd`, `resetDbCmd`, `recreateDbCmd`, `manageWorkspaces` |
| `bin/cmd/read_cmds.ts` | Dynamic ESM module loader for user command files via `pathToFileURL` |
| `bin/cmd/user_cmds.ts` | Loads user-defined command metadata from filesystem features for dynamic command registration |

## Architecture
- **Dynamic Command Assembly**: Commands built at startup from three sources — static base commands, DB alias definitions, and feature-spec user commands (hot-reloadable via ESM `import()`).
- **Reactive State Management**: Vue `ref` objects track `runMode`, `isChatMode`, and inference params across all modules without a centralized store.
- **Callback-Driven UI**: Inference callbacks (`useInferenceCallbacks`) inject real-time token streaming, thinking-phase spinners (via `ora`), and tool call progress into the agent executor output.
- **Two Execution Modes**: REPL mode (`query` loop for interactive chat) and one-shot command mode (`parseCmd` for scriptable invocations).
- **User Command System**: User-defined commands are ESM modules exported from feature directories; discovered at runtime via `read_cmds.ts` and registered as Commander commands with optional inference options.

## Related
- See `packages/core` — cli delegates agent/workflow/action execution to core's executors.
- See `packages/agent` — cli wraps the `Agent` class with inference callbacks for real-time output.
- See `packages/wscli` — alternative WebSocket-based client for remote agent communication.
- See `docsite/public/doc/terminal_client/` — full terminal client documentation (47+ files).

# @agent-smith/cli

## Summary
Terminal REPL for Agent Smith. Provides a command-line interface (Commander.js) to interact with AI agents, execute workflows and actions, manage configuration, and run inference. Supports both interactive chat mode and one-shot command mode.

## Dependencies
- `@agent-smith/core` — DB operations, config, feature loading, agent/workflow/action execution.
- `@agent-smith/types` — shared interfaces.
- External: `commander` (CLI parsing), `@inquirer/prompts` (interactive prompts), `ansi-colors`, `ora` (spinners), `@vue/reactivity`.

## Used By
- End users via the `lm` CLI binary.
- Not imported by other packages (terminal client, not a library).

## Entry Point
- `bin/index.ts` — CLI entry: parses args, initializes state, builds commands via `buildCmds()`, routes to REPL or command mode.

## Key Files
| File | Purpose |
|------|---------|
| `bin/cli.ts` | Interactive REPL query loop: prompts user, parses input as Commander args, executes commands |
| `bin/state.ts` | Reactive state (Vue `ref`): `runMode` (cmd/cli), `isChatMode`, chat inference params |
| `bin/options.ts` | CLI option definitions: display (verbose/debug), inference (model, temp, top_k, backend), IO (clipboard/file/md) |
| `bin/utils.ts` | Utilities: `parseCommandArgs`, `confirmToolUsage` (interactive prompt), `printToken` (styled output) |
| `bin/cmd/build.ts` | Command builder: assembles base commands + dynamic aliases + user commands from DB features |
| `bin/cmd/base.ts` | Built-in commands: exit, agents, agent, backend, conf, reset, regendb, update |
| `bin/cmd/aliases.ts` | Dynamic commands from DB alias definitions (agent/workflow types with inference options) |
| `bin/cmd/features.ts` | Feature execution: `executeWorkflowCmd`, `executeAgentCmd`, `executeTaskCmd`, `executeActionCmd` |
| `bin/cmd/callbacks.ts` | Inference event callbacks: token streaming, thinking spinner, tool call lifecycle UI |
| `bin/cmd/read_cmds.ts` | Dynamic ESM module loader for user command files via `pathToFileURL` |

## Architecture
- **Dynamic Command Building**: Commands assembled at runtime — base commands + DB aliases + feature-spec user commands.
- **Reactive State**: Vue `ref` tracks mode (cmd vs REPL), chat state, inference params across modules.
- **Hot-Reloadable Features**: Commands generated on-the-fly from DB; features can be added without restart.
- **Callback-Based UI**: Inference callbacks inject token streaming, thinking spinners, tool call progress into the agent executor.

## Related
- See `packages/core` — cli's execution layer delegates to core for agent/workflow/action running.
- See `packages/agent` — agent class provides the inference loop that cli wraps with callbacks.

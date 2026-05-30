# @agent-smith/types

## Summary
Pure TypeScript type definitions library shared across all Agent Smith packages. Defines interfaces for agents, inference, tools, callbacks, history, configuration, models, workspaces, and WebSocket messaging. Contains no runtime code — only `.d.ts` declarations.

## Dependencies
- None (leaf package; all other packages depend on this one).
- External: `openai`, `restmix`, `@vue/reactivity` (for `Ref`/`Reactive` types).

## Used By
- Every other `@agent-smith/*` package and the `server`.
- Key types consumed: `AgentParams`, `ToolSpec`, `InferenceCallbacks`, `HistoryTurn`, `LmProvider`, `WsRawServerMsg`.

## Entry Point
- `src/main.ts` — Re-exports all types from every module file for single-import usage.

## Key Files
| File | Purpose |
|------|---------|
| `src/agent.ts` | Agent config: `AgentParams`, `AgentSpec`, `AgentSettings`, callbacks, LM provider refs |
| `src/callbacks.ts` | Event callback interfaces: `InferenceCallbacks`, `AgentCallbacks`, `AllCallbacks` |
| `src/client.ts` | Client-side features service: `ClientFeaturesOptions`, `ClientFeaturesService` |
| `src/conf.ts` | Config & backend defs: `ConfInferenceBackend`, `ConfigFile`, `InferenceBackend` |
| `src/core.ts` | Fundamental types: `FeatureSpec`, `Features`, `InputMode`, `OutputMode`, extensions |
| `src/history.ts` | Conversation history: `HistoryTurn`, `UiHistoryTurn`, `ToolTurn`, `ImgData` |
| `src/inference.ts` | Inference params & results: `InferenceParams`, `InferenceOptions`, `InferenceResult`, sampling presets |
| `src/lm.ts` | LM provider abstraction: `LmProvider`, `LmProviderParams`, `LmProviderType` |
| `src/model.ts` | Model management: `ModelInfo`, `ModelState`, `ModelStatus` (discriminated union) |
| `src/stats.ts` | Performance metrics: `InferenceStats`, `PerformanceMetrics`, `CtxStats` |
| `src/tools.ts` | Tool specs: `ToolSpec`, `ToolDefSpec`, `ToolCallSpec` |
| `src/ws.ts` | WebSocket protocol: message types for token streaming, tool calls, turn events |

## Architecture
- **Type-only library**: No runtime code; all files contain interfaces, type aliases, and exports. Output is `.d.ts` declarations.
- **Modular by layer**: Files grouped by concern — agent, client, LM, inference, stats, tooling, communication.
- **Callback-driven**: Events handled through typed callback interfaces (`InferenceCallbacks`, `AgentCallbacks`).
- **Discriminated unions**: `ModelStatus` uses `{ value: 'unloaded' | 'loading' | 'loaded' | 'failed' }`.
- **Vue reactive support**: Uses `Ref<T>` and `Reactive<T>` from `@vue/reactivity` for reactive state types.

### Module Dependency Flow
```
main.ts → (all modules)
agent.ts → callbacks, lm, inference, tools
client.ts → conf, inference, tools, workspace, agent, model
conf.ts → lm, core
inference.ts → callbacks, stats
ws.ts → history, inference, tools
```

## Related
- See `packages/core` — uses types for DB schema definitions and feature specs.
- See `packages/agent` — uses `AgentParams`, `ToolSpec`, `HistoryTurn` for the inference loop.
- See `server` — uses `WsRawServerMsg` / `WsClientMsg` for WebSocket protocol.

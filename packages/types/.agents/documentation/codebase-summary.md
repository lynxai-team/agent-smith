# @agent-smith/types

## Summary
Pure TypeScript type definitions library shared across all Agent Smith packages. Defines interfaces for agents, inference, tools, callbacks, history, configuration, models, workspaces, and WebSocket messaging. Contains no runtime code — only `.d.ts` declarations.

## Dependencies
- None (leaf package; all other packages depend on this one).
- External (dependencies): `openai` (^6.49.0) for `ChatCompletionRole`, `ChatCompletionMessageToolCall`, `ChatCompletionContentPart` types; `vue-reactivity` (^1.0.3) for `Ref<T>`, `ShallowReactive<T>` reactive types.
- External (devDependencies): `restmix` (^0.6.1) for `useApi` return type; `typescript` (^7.0.2); `vue` (3.5.40).

## Used By
- Every other `@agent-smith/*` package and the `server`.
- Key types consumed: `AgentParams`, `ToolSpec`, `InferenceCallbacks`, `HistoryTurn`, `LmProvider`, `WsRawServerMsg`, `ModelInfo`, `SamplingPreset`.

## Entry Point
- `src/main.ts` — Re-exports all types from every module file for single-import usage.

## Key Files
| File | Purpose |
|------|---------|
| `src/agent.ts` | Agent definitions: `AgentParams`, `AgentSpec` (with `isEditable`), `AgentSettings`, `AgentState`, `AgentVariables`, `AgentVariableDef`, `AgentOptionalVariableDef`, `UserAgentVariables`, `TemplateSpec`, `AgentWorkflow` |
| `src/callbacks.ts` | Event callback interfaces: `InferenceCallbacks`, `AgentCallbacks`, `AllCallbacks` |
| `src/client.ts` | Client-side features service: `ClientFeaturesOptions`, `ClientFeaturesService` (uses `vue-reactivity` `Ref`/`ShallowReactive`) |
| `src/conf.ts` | Config & backend defs: `ConfInferenceBackend`, `ConfigFile`, `InferenceBackend`, `BackendEntries` |
| `src/core.ts` | Fundamental types: `FeatureSpec`, `Features` (includes agent, cmd, action, workflow, adaptater, skill, task, tasktemplate), `Settings`, `InputMode`, `OutputMode`, extension types, `McpServerSpec`, `UserCmdDef`, `FeatureType` |
| `src/history.ts` | Conversation history: `HistoryTurn`, `UiHistoryTurn` (with `agentTurn`), `ToolTurn`, `ImgData`, `ChatCompletionHistoryTurn` (OpenAI-compatible, supports multimodal content arrays) |
| `src/inference.ts` | Inference params & results: `InferenceParams`, `InferenceOptions`, `InferenceResult`, `AgentInferenceOptions` (with optional `caller`), `ClientInferenceOptions`, `SamplingPreset` |
| `src/lm.ts` | LM provider abstraction: `LmProvider` (with `applyTemplate` method), `LmProviderParams`, `LmProviderType`, `LmDefaults`, loading progress types |
| `src/model.ts` | Model management: `ModelInfo`, `ModelState`, `ModelData`, `ModelApiResponse`, `ModelStatus` (discriminated union), `ModelTemplate`, status subtypes |
| `src/stats.ts` | Performance metrics: `InferenceStats`, `PerformanceMetrics`, `PromptProcessingProgress`, `PromptProcessingInProgressStats` |
| `src/tools.ts` | Tool specs: `ToolSpec` (with optional `agentType`), `ToolDefSpec`, `ToolCallSpec` |
| `src/ws.ts` | WebSocket protocol: `WsClientMsg`, `WsClientMsgType`, `WsServerMsgType`, `WsRawClientMsg`, `WsRawServerMsg`, `MsgType`, `ServerParams`, `StreamedMessage` |
| `src/workspace.ts` | Workspace definition: `Workspace` interface |
| `src/verbosity.ts` | Verbosity configuration: `VerbosityOptions` |

## Architecture
- **Type-only library**: No runtime code; all files contain interfaces, type aliases, and exports. Output compiled to `.d.ts` declarations via `tsc`.
- **Modular by concern**: Files grouped by domain — agent lifecycle, callbacks/events, inference pipeline, model management, tooling, communication (WebSocket), configuration, and core feature system.
- **Callback-driven event system**: `InferenceCallbacks` and `AgentCallbacks` compose into `AllCallbacks` for granular inference/agent event handling (tokens, tool calls, turns).
- **Discriminated unions**: `ModelStatus` uses `{ value: 'unloaded' | 'loading' | 'loaded' | 'failed' }` for type-safe state narrowing.
- **Vue reactive types**: `ClientFeaturesService` uses `Ref<T>` and `ShallowReactive<T>` from `vue-reactivity` for reactive state management in client-side features.
- **OpenAI compatibility**: `ChatCompletionHistoryTurn` aligns with OpenAI's chat completion message format, supporting multimodal content arrays and optional tool calls for interoperability.
- **Feature system**: `Features` interface supports 8 feature types (agent, cmd, action, workflow, adaptater, skill, task, tasktemplate) with `FeatureType` union and `FeatureSpec` for registration.
- **Chat templating**: `LmProvider.applyTemplate` method enables applying model-specific chat templates to message histories.

### Module Dependency Flow
```
main.ts → (re-exports all modules)
agent.ts    → callbacks, lm, inference, tools, history, workspace, conf, stats
callbacks.ts → history, inference, stats, tools
client.ts    → vue-reactivity, conf, inference, tools, workspace, agent, model
conf.ts      → lm, agent
core.ts      → agent (AgentVariables)
history.ts   → openai/resources, stats, tools
inference.ts → callbacks, history, stats, tools, verbosity
lm.ts        → restmix, inference, model, callbacks, tools, history (OpenAI types)
model.ts     → standalone
stats.ts     → standalone (no imports)
tools.ts     → inference
ws.ts        → core, tools, history, inference, callbacks
workspace.ts → standalone
verbosity.ts → standalone
```

## Related
- See `/workspace/agent-smith/packages/core` — uses types for DB schema definitions and feature specs.
- See `/workspace/agent-smith/packages/agent` — uses `AgentParams`, `ToolSpec`, `HistoryTurn` for the inference loop.
- See `/workspace/agent-smith/packages/cli` — uses `Settings`, `InputMode`, `OutputMode`, `RunMode` for CLI configuration.
- See `/workspace/agent-smith/server` — uses `WsRawServerMsg` / `WsClientMsg` for WebSocket protocol.

# @agent-smith/types - Codebase Summary

## Project Summary

**@agent-smith/types** is a TypeScript type definitions library that provides a comprehensive set of interfaces and types for building AI agent applications. It defines the data structures, callbacks, inference parameters, model management, task definitions, tool specifications, and WebSocket communication protocols needed to create intelligent agents that can interact with various language model backends (like OpenAI, Ollama, KoboldCPP, etc.).

The library is designed to be backend-agnostic, allowing developers to plug in different LM providers while maintaining a consistent API.

## File Structure

```
/workspace/
├── package.json          # NPM package configuration
├── package-lock.json     # Dependency lock file
├── tsconfig.json         # TypeScript compiler configuration
├── src/
│   ├── main.ts           # Main entry point - re-exports all types
│   ├── agent.ts          # Agent parameters and configuration
│   ├── callbacks.ts      # Callback interfaces for inference and agent events
│   ├── client.ts         # Client-side features service and options
│   ├── conf.ts           # Configuration file and backend definitions
│   ├── core.ts           # Core types: features, settings, extensions
│   ├── history.ts        # Conversation history structures
│   ├── inference.ts      # Inference parameters, options, and results
│   ├── lm.ts             # Language model provider interfaces
│   ├── model.ts          # Model information and state management
│   ├── stats.ts          # Inference statistics and performance metrics
│   ├── tools.ts          # Tool specifications and call specs
│   ├── verbosity.ts      # Verbosity/logging options
│   ├── workspace.ts      # Workspace definition
│   └── ws.ts             # WebSocket message types and communication
└── dist/                 # Compiled JavaScript and declaration files
```

## File Descriptions

| File | Purpose |
|------|---------|
| **main.ts** | Central export file that re-exports all types from the library for convenient single-import usage |
| **agent.ts** | Defines `AgentParams`, `AgentSpec`, `AgentSettings`, `AgentState`, and related interfaces for agent configuration including callbacks and LM provider |
| **callbacks.ts** | Defines callback interfaces (`InferenceCallbacks`, `AgentCallbacks`, `AllCallbacks`) for handling inference events, tool calls, and conversation turns |
| **client.ts** | Defines `ClientFeaturesOptions` and `ClientFeaturesService` interfaces for client-side agent execution, model loading, and workflow management |
| **conf.ts** | Configuration structures including backend definitions (`ConfInferenceBackend`, `ConfigFile`, `BackendEntries`, `InferenceBackend`) for managing multiple LM backends |
| **core.ts** | Core type definitions including feature types (`FeatureSpec`, `Features`), settings modes (`InputMode`, `OutputMode`, etc.), extensions, and utility types |
| **history.ts** | Conversation history structures (`HistoryTurn`, `UiHistoryTurn`, `ToolTurn`, `ImgData`) for tracking multi-turn interactions with tools and images |
| **inference.ts** | Inference-related types including parameters (`InferenceParams`, `AgentInferenceOptions`, `ClientInferenceOptions`), options (`InferenceOptions`), results (`InferenceResult`), sampling presets, and prompt processing progress |
| **lm.ts** | Language model provider interfaces (`LmProvider`, `LmProviderParams`, `LmDefaults`, `LmProviderType`) defining how to interact with different LM backends, including loading/unloading models and making inferences |
| **model.ts** | Model management types including `ModelInfo`, `ModelTemplate`, `ModelState`, `ModelStatus` (unloaded/loading/loaded/failed discriminated unions), and API response structures |
| **stats.ts** | Inference statistics (`InferenceStats`) and performance metrics (`PerformanceMetrics`, `CtxStats`) for tracking token processing, cache usage, and timing |
| **tools.ts** | Tool specification types (`ToolSpec`, `ToolDefSpec`, `ToolCallSpec`) for defining and executing tools within agent conversations |
| **verbosity.ts** | Logging verbosity options (`VerbosityOptions`) for controlling output detail levels |
| **workspace.ts** | Workspace definition interface for managing project contexts |
| **ws.ts** | WebSocket communication types for real-time streaming of inference results, tokens, tool calls, and conversation events |

## Architecture & Code Patterns

### Type-Only Library
This is a pure TypeScript type definitions library - all source files contain only interfaces, type aliases, and type exports. There are no runtime implementations. The `dist/` directory contains compiled `.d.ts` declaration files (with minimal JS stubs).

### Modular Design
The codebase follows a modular architecture where each file defines related types:
- **Agent layer**: `agent.ts`, `callbacks.ts` - Agent configuration and event handling
- **Client layer**: `client.ts` - Client-side features service for agent execution and model management
- **LM layer**: `lm.ts`, `model.ts` - Language model provider abstraction
- **Inference layer**: `inference.ts` - Inference request/response structures and options
- **Stats layer**: `stats.ts` - Performance metrics and inference statistics
- **Task layer**: `conf.ts` - Configuration and backend definitions
- **Communication layer**: `ws.ts`, `history.ts` - WebSocket and conversation history
- **Tooling layer**: `tools.ts` - Tool definitions and execution specs
- **Core layer**: `core.ts` - Fundamental types shared across modules

### Dependency Flow
```
main.ts → (all modules)
agent.ts → callbacks.ts, lm.ts, inference.ts, tools.ts
callbacks.ts → history.ts, inference.ts, tools.ts
client.ts → conf.js, inference.js, tools.js, workspace.js, agent.js, model.js
conf.ts → lm.ts, core.ts
core.ts → (minimal dependencies)
history.ts → (minimal dependencies)
inference.ts → callbacks.ts, stats.ts
lm.ts → inference.ts, model.ts, callbacks.ts, tools.ts
model.ts → inference.ts
stats.ts → (standalone)
tools.ts → (minimal dependencies)
ws.ts → history.ts, inference.ts, tools.ts
```

### Key Patterns
1. **Interface-based abstraction**: All components use TypeScript interfaces for maximum flexibility
2. **Callback-driven architecture**: Events are handled through callback interfaces rather than promises
3. **Discriminated unions**: `ModelStatus` uses discriminated union pattern with `value` property (unloaded/loading/loaded/failed)
4. **Reactive support**: Uses Vue's `Ref` and `Reactive` types for reactive state management
5. **Extension system**: Feature types support extensibility through extension type markers (`.yml`, `.js`, `.md`, etc.)
6. **WebSocket streaming**: Real-time token streaming with typed message protocols
7. **Client service pattern**: `ClientFeaturesService` provides a unified interface for client-side operations including agent execution, workflow management, and model loading

### Dependencies
- **openai** (^6.33.0): OpenAI API client
- **restmix** (^0.6.1): REST API utility
- **vue** (3.5.32): Reactive state management
- **typescript** (^6.0.2): TypeScript compiler
- **@types/node** (^25.5.2): Node.js type definitions

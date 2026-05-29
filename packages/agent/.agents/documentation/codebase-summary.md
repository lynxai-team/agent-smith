# Agent Smith - Codebase Summary

## Project Overview
Agent Smith is a TypeScript-based agent runtime that provides AI agents with tool calling capabilities, streaming inference, and conversation history management. It connects to OpenAI-compatible inference servers (e.g., llama.cpp, vLLM, Ollama).

## File Structure

```
/workspace/packages/agent/
├── .agents/documentation/
│   ├── codebase-summary.md           # This documentation file
│   ├── CODEBASE_OVERVIEW.md          # Additional overview documentation
│   └── OVERVIEW.md                   # Overview documentation
├── src/
│   ├── main.ts                       # Public API exports (Lm, Agent)
│   ├── agent.ts                      # Agent class - orchestrates inference & tool execution
│   ├── client.ts                     # Lm class - OpenAI-compatible LM provider
│   ├── tools.ts                      # Utility functions for tool spec conversion and image handling
│   ├── params.ts                     # Inference parameter formatting utilities
│   ├── stats.ts                      # Performance metrics and statistics conversion
│   ├── utils.ts                      # General utility functions (duration formatting, text limiting)
│   ├── variables.ts                  # Template variable substitution for agent specs
│   └── history/
│       ├── build.ts                  # Conversation history to OpenAI messages format converter
│       └── display.ts                # Human-readable message history display
├── dist/                             # Compiled output directory
├── node_modules/                     # npm dependencies
├── package.json                      # Project configuration and dependencies
├── rollup.config.js                  # Rollup bundler configuration
└── tsconfig.json                     # TypeScript compiler configuration
```

## File Descriptions

### src/main.ts
- Exports the main public API: `Lm` and `Agent` classes
- Provides module entry point for users of the @agent-smith/agent package

### src/agent.ts
- Core Agent class that orchestrates inference loops and tool execution
- Manages conversation history as an array of HistoryTurn objects
- Implements recursive inference: after tool calls, re-invokes inference with updated context
- Provides comprehensive callback system for real-time events (tokens, thinking, tool calls)
- Key methods: `run(prompt, options)` and `_runAgent(it, prompt, options)`

### src/client.ts
- Lm class - OpenAI-compatible language model provider
- Handles HTTP requests to inference servers via restmix library
- Supports both streaming and non-streaming inference modes
- Uses eventsource-parser for SSE event parsing during streaming
- Manages tool call accumulation and reasoning content (thinking) tokens
- Key methods: `loadModel()`, `tokenize()`, `detokenize()`, `infer(prompt, options)`

### src/tools.ts
- Utility functions for converting tool specifications to OpenAI function format
- Helper functions for image handling (base64 conversion from Buffer or URL)
- Generates unique IDs for tool calls
- Key functions: `convertToolCallSpec()`, `convertImageDataToBase64()`, `convertImageUrlToBase64()`, `generateId()`

### src/params.ts
- Handles inference parameter formatting and merging
- Merges user-provided options with default InferenceParams
- Key function: `formatInferParams(ip, options)`

### src/stats.ts
- Converts raw performance metrics from inference servers into structured statistics
- Calculates cache hit rates, draft token acceptance rates, and throughput metrics
- Tracks prompt processing progress with human-readable timing
- Key functions: `convertStats()`, `calcPromptProcessingProgress()`

### src/utils.ts
- General utility functions used across the codebase
- `formatDuration(ms)`: Formats millisecond durations into human-readable strings (ms, s, mn)
- `formatLimitTxt(txt)`: Truncates and escapes long text for display (max 75 chars)

### src/variables.ts
- Template variable substitution for agent specifications
- Validates required variables and applies optional variables with defaults
- Substitutes variables in prompts, system templates, and few-shot examples
- Key function: `applyVariables(agentSpec, options)`

### src/history/build.ts
- Converts internal HistoryTurn array to OpenAI-compatible message format
- Handles system messages, user messages, assistant responses, tool calls, and tool responses
- Supports reasoning_content (thinking tokens) preservation based on configuration
- Key function: `buildMessagesHistory(history, options)`

### src/history/display.ts
- Displays conversation history in a human-readable format to console
- Formats each message type (system, user, assistant, tool) with appropriate labels
- Handles tool call display with function names and arguments
- Key function: `displayMessagesHistory(msgs)`

## Architecture and Code Patterns

### Core Components
1. **Agent Class** - Orchestrates the inference loop and manages conversation state
2. **Lm Class** - OpenAI-compatible LM provider that handles HTTP communication with inference servers
3. **Tool System** - Dynamic tool registration and execution with callback support
4. **History Module** - Converts and displays conversation history in various formats
5. **Statistics Module** - Processes and presents performance metrics from inference servers
6. **Variables Module** - Template variable substitution for dynamic agent specifications

### Key Design Patterns
- **Callback-driven architecture**: All events flow through a comprehensive callback system for maximum flexibility
- **Recursive inference loop**: Tools are executed synchronously, results fed back as new conversation turns
- **Streaming-first approach**: Default inference mode uses SSE streaming for real-time token output
- **OpenAI-compatible API**: The Lm class speaks the OpenAI chat completions API, making it compatible with any OpenAI-compatible server
- **Template system**: Agent specs support variable substitution for dynamic prompts and few-shot examples

### Type System
All types are defined in the sibling package `@agent-smith/types` and include:
- AgentParams, LmProvider, InferenceCallbacks, ToolSpec, HistoryTurn, etc.
- Comprehensive callback interfaces for real-time event handling
- PerformanceMetrics, InferenceStats for statistics tracking

### Build System
- TypeScript compilation via tsc with strict mode enabled
- Module bundling via Rollup for distribution
- Target ES2022 with Node.js module resolution

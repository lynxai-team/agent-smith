# Agent Smith - Codebase Overview

## Project Summary
`@agent-smith/agent` is the **agent runtime** for the Agent Smith project. It provides a TypeScript-based framework for building AI agents with tool calling capabilities, streaming inference, and conversation history management. The runtime connects to OpenAI-compatible inference servers (e.g., llama.cpp, vLLM, Ollama).

## Architecture

```
@agent-smith/agent/
├── src/
│   ├── main.ts       # Public API exports (Lm, Agent)
│   ├── agent.ts      # Agent class - orchestrates inference & tool execution
│   ├── client.ts     # Lm class - OpenAI-compatible LM provider
│   ├── tools.ts      # Utility functions (tool spec conversion, image handling)
│   └── stats.ts      # Inference statistics tracking
├── package.json
└── tsconfig.json
```

## Key Components

### 1. `Agent` Class (`src/agent.ts`)
The core agent that orchestrates the inference loop and tool execution.

**Key Properties:**
- `name`: Agent identifier
- `lm`: Language model provider (`Lm` instance)
- `tools`: Registry of available tools (`Record<string, ToolSpec>`)
- `history`: Conversation history (`Array<HistoryTurn>`)

**Key Methods:**
- `run(prompt, options)`: Entry point for inference. Sets up tools and history, then calls `runAgent()`.
- `runAgent(it, prompt, options)`: Recursive inference loop. Handles tool calls by executing them and re-invoking inference with updated history.

**Flow:**
1. User calls `run(prompt)` with optional tools and history
2. Agent sends prompt to LM via `lm.infer()`
3. If LM returns `toolCalls`, agent executes each tool and pushes results to history
4. Agent recursively calls `runAgent()` with tool results as new context
5. If no tool calls, returns final text response

**Callbacks:** Supports rich callback system for real-time events:
- `onToken`, `onThinkingToken`: Token streaming
- `onStartThinking`, `onEndThinking`: Thinking/reasoning phase boundaries
- `onToolCall`, `onToolCallEnd`: Tool execution lifecycle
- `onToolsTurnStart`, `onToolsTurnEnd`: Tool batch boundaries
- `onTurnEnd`: End of each conversation turn
- `onAssistant`, `onThink`: Final text/thinking output

### 2. `Lm` Class (`src/client.ts`)
OpenAI-compatible language model provider that handles HTTP requests to inference servers.

**Key Properties:**
- `name`: Provider identifier
- `serverUrl`: Inference server URL (e.g., `http://localhost:8080/v1`)
- `apiKey`: Optional authentication key
- `model`: Active model name
- `models`: Available models list
- `abortController`: For cancelling requests

**Key Methods:**
- `loadModel(name, ctx)`: Select a model (no-op for remote servers)
- `unloadModel(name)`: Not implemented for remote providers
- `tokenize(text)`: Tokenize text via server endpoint
- `detokenize(tokens)`: Detokenize via server endpoint
- `infer(prompt, options)`: Main inference method

**`infer()` Method Details:**
- Supports both **streaming** and **non-streaming** modes
- Builds message array from history, system prompt, and current prompt
- Handles multimodal inputs (base64 images)
- Converts tool specs to OpenAI function tool format
- For streaming: Uses `eventsource-parser` to parse SSE events, accumulates tool calls and text
- For non-streaming: POSTs to `/chat/completions` and parses response
- Tracks inference statistics (ingestion time, inference time, tokens/sec)

**Events handled during inference:**
- `onStartThinking` / `onEndThinking`: When `reasoning_content` delta appears/disappears
- `onToken`: Regular text tokens
- `onThinkingToken`: Reasoning/thinking tokens
- `onToolCallInProgress`: Tool calls being accumulated during streaming
- `onStartEmit` / `onEndEmit`: Inference lifecycle boundaries

### 3. `tools.ts` Utilities (`src/tools.ts`)
Helper functions for tool and image handling.

- `convertToolCallSpec(toolSpec)`: Converts `ToolSpec` to OpenAI `ChatCompletionFunctionTool` format
- `convertImageDataToBase64(imageData)`: Converts Buffer to base64 string
- `convertImageUrlToBase64(imageUrl)`: Fetches image from URL and converts to base64
- `generateId(length)`: Generates random ID string

### 4. `stats.ts` (`src/stats.ts`)
Statistics tracking utility.

- `useStats()`: Factory function returning stats tracker
- `start()`: Records start time
- `inferenceStarts()`: Records ingestion time (time before tokens start arriving)
- `inferenceEnds(totalTokens)`: Records inference time and calculates tokens/sec

## Type System (from `@agent-smith/types`)

All types are defined in the sibling package `@agent-smith/types`:

### Core Types
| Type | File | Description |
|------|------|-------------|
| `AgentParams` | `agent.ts` | Agent configuration (name, lm provider, callbacks) |
| `LmProvider` | `lm.ts` | Interface for language model providers |
| `LmProviderParams` | `lm.ts` | Constructor params for LM providers |

### Inference Types
| Type | File | Description |
|------|------|-------------|
| `InferenceParams` | `inference.ts` | Sampling parameters (temperature, top_k, etc.) |
| `InferenceOptions` | `inference.ts` | Inference request options (model, tools, history, etc.) |
| `ClientInferenceOptions` | `inference.ts` | Client-side inference options + callbacks |
| `AgentInferenceOptions` | `inference.ts` | Agent-side inference options + all callbacks |
| `InferenceResult` | `inference.ts` | Result from inference (text, stats, toolCalls) |

### Tool Types
| Type | File | Description |
|------|------|-------------|
| `ToolDefSpec` | `tools.ts` | Tool definition (name, description, arguments schema) |
| `ToolSpec` | `tools.ts` | Full tool spec with `execute()` and optional `canRun()` |
| `ToolCallSpec` | `tools.ts` | Tool call from LM (id, name, arguments) |

### History Types
| Type | File | Description |
|------|------|-------------|
| `HistoryTurn` | `history.ts` | Single conversation turn (user, assistant, think, images, tools) |
| `ToolTurn` | `history.ts` | Tool call + response pair |
| `UiHistoryTurn` | `history.ts` | History turn with UI state |

### Callback Types
| Type | File | Description |
|------|------|-------------|
| `InferenceCallbacks` | `callbacks.ts` | LM-level callbacks (tokens, thinking, errors) |
| `AgentCallbacks` | `callbacks.ts` | Agent-level callbacks (tool calls, turns) |
| `AllCallbacks` | `callbacks.ts` | Combined inference + agent callbacks |

### Stats Types
| Type | File | Description |
|------|------|-------------|
| `IngestionStats` | `stats.ts` | Input processing time stats |
| `InferenceStats` | `stats.ts` | Full inference stats (times, tokens/sec) |

## Dependencies
- **Runtime:** `eventsource-parser` (SSE parsing), `restmix` (HTTP API wrapper)
- **Dev:** `openai` (type definitions), `typescript`, `rollup`

## Usage Pattern

```typescript
import { Agent, Lm } from '@agent-smith/agent';

// Create LM provider
const lm = new Lm({
    name: 'llama',
    serverUrl: 'http://localhost:8080/v1',
    apiKey: 'optional-key',
    onToken: (t) => process.stdout.write(t),
});

// Create agent with tools
const agent = new Agent({
    name: 'MyAgent',
    lm: lm,
    onToolCall: (tc) => console.log('Calling:', tc.name),
    onTurnEnd: (turn) => console.log('Turn complete'),
});

// Run with tools
const result = await agent.run('What is the weather?', {
    tools: [weatherTool],
    history: [{ user: 'Hello' }, { assistant: 'Hi!' }],
    params: { temperature: 0.7, max_tokens: 500 },
});
```

## Key Design Decisions
1. **OpenAI-compatible API:** The `Lm` class speaks the OpenAI chat completions API, making it compatible with any OpenAI-compatible server (llama.cpp, Ollama, vLLM, etc.)
2. **Recursive tool execution:** Tools are executed synchronously within the inference loop, with results fed back as new conversation turns
3. **Streaming-first:** Default inference mode is streaming with SSE parsing for real-time token output
4. **Thinking/reasoning support:** Distinguishes between `reasoning_content` (thinking) and regular content tokens
5. **Callback-driven:** All events flow through a callback system for maximum flexibility in UI integration

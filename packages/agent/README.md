# @agent-smith/agent — AI Agent Runtime & Inference Engine

**Run autonomous AI agents with recursive tool calling, streaming inference, and OpenAI-compatible backends.**

---

## ✨ Features

- 🧠 **Recursive Inference Loop** — Agents autonomously call tools, process results, and re-invoke the LLM until a final answer is reached
- 🔌 **OpenAI-Compatible API** — Works with any OpenAI-compatible backend: llama.cpp, Ollama, vLLM, OpenRouter, and more
- ⚡ **SSE Streaming** — Real-time token output with `eventsource-parser` for live feedback
- 🛠️ **Tool Calling** — Full tool-calling support with parallel execution, supervision (`canRun`), and error handling
- 💭 **Thinking/Reasoning Support** — Captures `reasoning_content` streams (e.g., DeepSeek-style thinking)
- 📋 **Conversation History** — Automatic history management across multi-turn tool-call loops
- 🔧 **YAML Agent Specs** — Define reusable agents with system prompts, templates, shots, and variables via YAML
- 🌐 **Dual Environment Support** — Runs in both Node.js and browsers
- 📊 **Performance Metrics** — Built-in stats tracking: cache hits, token throughput, draft acceptance

---

## 📦 Installation

```bash
npm install @agent-smith/agent
```

**Dependencies** (installed automatically): `eventsource-parser`, `restmix`, `yaml`

---

## 🚀 Quick Start

A minimal working example — create an agent, connect to a local backend, and run inference:

```typescript
import { Agent, Lm } from "@agent-smith/agent";

// 1. Create the language model client
const lm = new Lm({
    name: "llamacpp",
    serverUrl: "http://localhost:8080/v1",
});

// 2. Initialize the agent with callbacks
const agent = new Agent({
    name: "my-agent",
    lm,
    onToken: (t) => process.stdout.write(t),
    onError: (err) => console.error(`[error] ${err}`),
});

// 3. Run an inference query
const result = await agent.run("Explain quantum computing in one sentence", {
    params: {
        model: "qwen35b",
        temperature: 0.6,
        top_k: 40,
        max_tokens: 1024,
    },
});

console.log("\nDone! Stats:", result.stats);
```

---

## 📖 Usage

### Creating a Language Model Client

The `Lm` class wraps any OpenAI-compatible HTTP endpoint. It handles SSE streaming, tokenization, and tool call parsing.

```typescript
import { Lm } from "@agent-smith/agent";

// Local llama.cpp / Ollama server
const lm = new Lm({
    name: "llamacpp",
    serverUrl: "http://localhost:8080/v1",
});

// Remote OpenRouter backend with API key
const lmRemote = new Lm({
    name: "openrouter",
    serverUrl: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

// OpenAI-compatible with custom callbacks
const lmWithCallbacks = new Lm({
    name: "my-backend",
    serverUrl: "http://localhost:8080/v1",
    onToken: (t) => process.stdout.write(t),
    onThinkingToken: (t) => console.log(`[thinking] ${t}`),
    onError: (err) => console.error(err),
});
```

### Initializing an Agent

The `Agent` constructor accepts an `AgentParams` object with the LM provider and optional callbacks:

```typescript
import { Agent } from "@agent-smith/agent";

const agent = new Agent({
    name: "weather-agent",
    lm,
    // Inference callbacks
    onToken: (t) => process.stdout.write(t),
    onThinkingToken: (t) => console.log(`[thinking] ${t}`),
    onStartThinking: () => console.log("[start thinking]"),
    onEndThinking: () => console.log("[end thinking]"),
    // Agent callbacks
    onToolCall: (tc) => console.log(`[tool call] ${tc.name}(${JSON.stringify(tc.arguments)})`),
    onToolCallEnd: (tc, result) => console.log(`[tool done] ${tc.name}:`, result),
    onTurnStart: () => console.log("[turn start]"),
    onTurnEnd: (ht) => console.log("[turn end]", ht),
    onAssistant: (txt) => console.log(`[assistant] ${txt}`),
    onError: (err) => console.error(err),
});
```

### Running Inference

The `run()` method takes a prompt and an options object. Model and sampling parameters go in the `params` field:

```typescript
const result = await agent.run("What's the weather in Barcelona?", {
    params: {
        model: "qwen35b",
        temperature: 0.4,
        top_k: 40,
        top_p: 0.95,
        min_p: 0,
        max_tokens: 4096,
    },
});

console.log("Response:", result.text);
console.log("Thinking:", result.thinkingText);
console.log("Stats:", result.stats);
```

### Using Tools

Define a tool as a `ToolSpec` object and pass it to `run()`:

```typescript
import type { ToolSpec } from "@agent-smith/types";

// 1. Define the execution function
async function getCurrentWeather(args: { location?: string }) {
    const location = args?.location ?? "unknown";
    return { temp: 20.5, weather: "rain", location };
}

// 2. Create the tool definition
const weatherTool: ToolSpec = {
    name: "get_current_weather",
    description: "Get the current weather for a location",
    arguments: {
        location: {
            description: "The city and state, e.g. San Francisco, CA",
            type: "string",
            required: true,
        },
    },
    type: "action",
    parallelCalls: false,
    execute: getCurrentWeather,
};

// 3. Run the agent with tools
const result = await agent.run(
    "I am landing in Barcelona soon. How are the conditions in the city?",
    {
        params: {
            model: "qwen35b",
            temperature: 0.4,
            max_tokens: 16384,
        },
        tools: [weatherTool],
    }
);
```

The agent will autonomously call `get_current_weather` when it determines the tool is useful, process the result, and continue the conversation.

### Supervised Tools (Human-in-the-Loop)

Require user authorization before a tool executes by adding a `canRun` callback:

```typescript
import type { ToolCallSpec } from "@agent-smith/types";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = createInterface({ input, output });

async function askUser(question: string): Promise<boolean> {
    const answer = await rl.question(`${question} (y/n): `);
    return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}

// Add canRun to the tool definition
const deleteFileTool: ToolSpec = {
    name: "delete_file",
    description: "Delete a file from the filesystem",
    arguments: {
        path: { description: "The file path to delete", type: "string", required: true },
    },
    type: "action",
    parallelCalls: false,
    execute: async (args) => {
        const fs = await import("fs/promises");
        await fs.rm(args?.path ?? "", { force: true });
        return { deleted: args?.path };
    },
    canRun: async (tc: ToolCallSpec) => askUser(`Execute delete_file on ${tc.arguments?.path}`),
};

// When the agent calls this tool, the user is prompted first
const result = await agent.run("Delete /tmp/test.txt", {
    params: { model: "qwen35b", max_tokens: 1024 },
    tools: [deleteFileTool],
});
```

### System Prompts & Templates

Set a system prompt directly in `run()` options:

```typescript
const result = await agent.run("What is AI?", {
    params: { model: "qwen35b", max_tokens: 2048 },
    system: "You are a concise, factual assistant. Answer in 1-2 sentences.",
});
```

### YAML Agent Specs

Define reusable agents in YAML and load them programmatically:

```typescript
import { readFileSync } from "fs";
import { Agent } from "@agent-smith/agent";

// Load agent spec from YAML file
const yamlContent = readFileSync("agents/chat.yml", "utf-8");
const agent = Agent.fromYaml({ lm }, yamlContent);

const result = await agent.run("Tell me about Barcelona weather", {
    params: { model: "qwen35b", max_tokens: 16384 },
});
```

Corresponding YAML (`agents/chat.yml`):

```yaml
name: chat
prompt: "{prompt}"
description: "A helpful chat agent"
model: "qwen35b"
template:
    system: "You are a helpful assistant that uses tools when needed."
    stop: ["\n"]
inferParams:
    temperature: 0.4
    max_tokens: 16384
shots:
    - user: "What is AI?"
      assistant: "Artificial Intelligence is the simulation of human intelligence..."
```

### Verbose / Debug Mode

Enable detailed logging for troubleshooting:

```typescript
const result = await agent.run("Hello", {
    params: { model: "qwen35b", max_tokens: 512 },
    debug: true,   // Prints prompt, system, model, tools, and inference params
    verbosity: {   // Controls what gets logged
        events: true,     // Log tool call lifecycle
        toolResults: true, // Log tool execution results
        history: true,    // Log conversation history
        options: true,    // Log full options object
    },
});
```

### Aborting Inference

Cancel a running inference at any time:

```typescript
const lm = new Lm({ name: "llamacpp", serverUrl: "http://localhost:8080/v1" });
const agent = new Agent({ name: "my-agent", lm });

// Start a long-running inference
const promise = agent.run("Write a 5000-word essay on philosophy", {
    params: { model: "qwen35b", max_tokens: 5000 },
});

// Abort after 3 seconds
setTimeout(() => lm.abort(), 3000);

try {
    const result = await promise;
} catch (err) {
    console.log("Inference was aborted:", err);
}
```

---

## 🧩 Complete Example

A full working async function demonstrating creation, tool usage, supervision, and error handling:

```typescript
import { Agent, Lm } from "@agent-smith/agent";
import type { ToolSpec, ToolCallSpec } from "@agent-smith/types";

async function runWeatherAgent() {
    // 1. Create LM client
    const lm = new Lm({
        name: "llamacpp",
        serverUrl: "http://localhost:8080/v1",
        onError: (err) => console.error(`[LM error] ${JSON.stringify(err)}`),
    });

    // 2. Define a supervised tool
    async function getWeather(args: { location?: string }): Promise<{ temp: number; weather: string }> {
        const location = args?.location ?? "unknown";
        console.log(`→ Fetching weather for: ${location}`);
        return { temp: 22, weather: "sunny" };
    }

    const weatherTool: ToolSpec = {
        name: "get_current_weather",
        description: "Get the current weather for a location",
        arguments: {
            location: {
                description: "The city and state, e.g. San Francisco, CA",
                type: "string",
                required: true,
            },
        },
        type: "action",
        parallelCalls: false,
        execute: getWeather,
        canRun: async (tc: ToolCallSpec) => {
            console.log(`[supervision] Allow tool "${tc.name}"? (y/n)`);
            return true; // In production, use readline or a UI confirmation
        },
    };

    // 3. Initialize agent
    const agent = new Agent({
        name: "weather-agent",
        lm,
        onToken: (t) => process.stdout.write(t),
        onToolCall: (tc) => console.log(`\n[tool start] ${tc.name}`),
        onToolCallEnd: (tc, result) => console.log(`\n[tool end] ${tc.name}:`, result),
        onThink: (t) => console.log(`[thinking] ${t}`),
        onError: (err) => console.error(`[error] ${err}`),
    });

    // 4. Run with tools
    try {
        const result = await agent.run(
            "I'm visiting Paris next week. What should I pack based on the weather?",
            {
                params: {
                    model: "qwen35b",
                    temperature: 0.5,
                    top_k: 40,
                    max_tokens: 4096,
                },
                tools: [weatherTool],
                debug: true,
            }
        );

        console.log("\n\n✅ Final response:", result.text);
        console.log("⏱️  Tokens predicted:", result.stats.predicted_n);
        console.log("⏱️  Tokens/sec:", result.stats.predicted_per_second);
    } catch (err) {
        console.error("Agent execution failed:", err);
    }
}

runWeatherAgent();
```

---

## 📚 API Reference

### `Lm` — Language Model Provider

OpenAI-compatible HTTP client with SSE streaming, tokenization, and tool call parsing.

```typescript
constructor(params: LmProviderParams)
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | ✅ | Identifier for the provider (e.g., `"llamacpp"`, `"openrouter"`) |
| `serverUrl` | `string` | ✅ | Base URL of the inference server (e.g., `http://localhost:8080/v1`) |
| `apiKey` | `string` | ❌ | API key for authenticated backends (sent as `Bearer` token) |
| `onToken` | `(t: string, from: string) => void` | ❌ | Callback for each generated token |
| `onThinkingToken` | `(t: string, from: string) => void` | ❌ | Callback for reasoning/thinking tokens (`reasoning_content`) |
| `onStartThinking` | `(from: string) => void` | ❌ | Callback when thinking/ reasoning phase starts |
| `onEndThinking` | `(from: string) => void` | ❌ | Callback when thinking/ reasoning phase ends |
| `onStartEmit` | `(data: PromptProcessingInProgressStats, from: string) => void` | ❌ | Callback when inference begins |
| `onEndEmit` | `(result: InferenceResult, from: string) => void` | ❌ | Callback when inference completes |
| `onError` | `(err: any, from: string) => void` | ❌ | Callback for errors during inference |
| `onToolCallInProgress` | `(tc: Array<ToolCallSpec>, from: string) => void` | ❌ | Callback when partial tool calls are received |
| `onPromptProcessingProgress` | `(progress: PromptProcessingInProgressStats, from: string) => void` | ❌ | Callback for prompt processing progress updates |

**Key Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `infer()` | `(prompt: string, options?: ClientInferenceOptions) => Promise<InferenceResult>` | Run inference against the backend |
| `abort()` | `() => Promise<void>` | Abort a currently running inference |
| `modelsInfo()` | `() => Promise<Array<ModelInfo>>` | List available models from the server |
| `tokenize()` | `(text: string) => Promise<Array<number>>` | Tokenize text (requires `/tokenize` endpoint) |
| `detokenize()` | `(tokens: Array<number>) => Promise<string>` | Detokenize tokens to text |

---

### `Agent` — Autonomous Agent Runtime

Orchestrates the recursive inference loop with tool calling, history management, and YAML spec loading.

```typescript
constructor(params: AgentParams, spec?: AgentSpec)
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `params.name` | `string` | ❌ | Agent identifier (defaults to `"unamed"`) |
| `params.lm` | `LmProvider` | ✅ | Language model provider instance |
| `params.onToken` | `(t: string, from: string) => void` | ❌ | Token emission callback |
| `params.onThinkingToken` | `(t: string, from: string) => void` | ❌ | Thinking token callback |
| `params.onStartThinking` | `(from: string) => void` | ❌ | Thinking phase start callback |
| `params.onEndThinking` | `(from: string) => void` | ❌ | Thinking phase end callback |
| `params.onStartEmit` | `(data, from: string) => void` | ❌ | Inference start callback |
| `params.onEndEmit` | `(result, from: string) => void` | ❌ | Inference end callback |
| `params.onError` | `(err: any, from: string) => void` | ❌ | Error callback |
| `params.onToolCall` | `(tc, type, from) => void` | ❌ | Tool call start callback |
| `params.onToolCallEnd` | `(tc, result, type, from) => void` | ❌ | Tool call completion callback |
| `params.onToolsTurnStart` | `(tc: Array<ToolCallSpec>, from: string) => void` | ❌ | Multi-tool turn start |
| `params.onToolsTurnEnd` | `(tt: Array<ToolTurn>, from: string) => void` | ❌ | Multi-tool turn end |
| `params.onTurnStart` | `(from: string) => void` | ❌ | Agent turn start |
| `params.onTurnEnd` | `(ht: HistoryTurn, from: string) => void` | ❌ | Agent turn end |
| `params.onAssistant` | `(txt: string, from: string) => void` | ❌ | Assistant text callback |
| `spec` | `AgentSpec` | ❌ | YAML-parsed agent specification |

**Static Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `fromYaml()` | `(params: AgentParams, txt: string) => Agent` | Create an agent from a YAML string definition |

**Instance Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `run()` | `(prompt: string, options?: AgentInferenceOptions) => Promise<InferenceResult>` | Run inference with optional tools, history, and parameters |

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Agent identifier |
| `lm` | `Lm` | Language model provider |
| `history` | `Array<HistoryTurn>` | Conversation history (auto-managed) |
| `spec` | `AgentSpec \| undefined` | Loaded agent specification |

---

### Core Types

```typescript
interface InferenceResult {
    text: string;                // Final assistant response
    thinkingText: string;        // Reasoning/thinking content
    stats: PerformanceMetrics;   // Token counts, throughput, cache stats
    toolCalls?: Array<ToolCallSpec>;  // Tool calls made during this turn
}

interface ToolSpec {
    name: string;                        // Unique tool identifier
    description: string;                 // What the tool does
    arguments: { [key: string]: { description: string; type?: string; required?: boolean } };
    type: string;                        // e.g., "action", "agent"
    parallelCalls: boolean;              // Whether multiple calls can run in parallel
    execute: (args: Record<string, any>) => Promise<any>;
    canRun?: (tool: ToolCallSpec) => Promise<boolean>;  // Supervision callback
}

interface ToolCallSpec {
    id: string;
    name: string;
    arguments?: { [key: string]: string };
}

interface AgentParams extends AllCallbacks {
    name?: string;
    lm: LmProvider;
}

interface AgentInferenceOptions extends InferenceOptions, AllCallbacks {
    model?: string;
    params?: InferenceParams;
    tools?: Array<ToolSpec>;
    history?: Array<HistoryTurn>;
    system?: string;
    debug?: boolean;
    verbosity?: VerbosityOptions;
}

interface InferenceParams {
    model?: string;
    temperature?: number;
    top_k?: number;
    top_p?: number;
    min_p?: number;
    max_tokens?: number;
    stop?: Array<string>;
    grammar?: string;
    schema?: Record<string, any>;
    images?: Array<string>;  // Base64 or URL for multimodal
    extra?: Record<string, any>;
}
```

---

## ⚠️ Important Notes

- **Environment**: Works in both **Node.js** and **browsers**. In browsers, the `/tokenize` and `/detokenize` endpoints must be supported by your backend.
- **Backend Compatibility**: Requires an OpenAI-compatible API endpoint (`/chat/completions`). Tested with llama.cpp, Ollama, vLLM, and OpenRouter.
- **Streaming Default**: Streaming is enabled by default (`stream: true`). Set `params: { stream: false }` for non-streaming responses.
- **Tool Errors**: Tool execution errors are caught and returned as string results — they do not throw unless you add custom error handling in your `execute` function.
- **Subagents**: Agents can call other agents as tools (`type: "agent"`). Set `propagateModel: true` to pass the parent agent's model down.
- **No Server Dependency**: This package is a client library — it does not bundle or start any server. You must run your own inference backend separately.

---

## 🔗 Documentation

| Resource | Link |
|----------|------|
| 📖 Get Started | [libraries/agent/get_started](https://lynxai-team.github.io/agent-smith/libraries/agent/get_started) |
| 🛠️ Tools & Tool Calling | [libraries/agent/tools](https://lynxai-team.github.io/agent-smith/libraries/agent/tools) |
| 📝 Templates & YAML Specs | [libraries/agent/templates](https://lynxai-team.github.io/agent-smith/libraries/agent/templates) |
| 👁️ Supervised Agents | [libraries/agent/supervision](https://lynxai-team.github.io/agent-smith/libraries/agent/supervision) |
| 📐 Shared Types | [@agent-smith/types](https://lynxai-team.github.io/agent-smith/libraries/types) |
| ⚙️ Runtime Engine | [@agent-smith/core](https://lynxai-team.github.io/agent-smith/libraries/core) |
| 💾 Semantic Memory | [@agent-smith/smem](https://lynxai-team.github.io/agent-smith/libraries/smem) |
| 💽 Transient Memory | [@agent-smith/tmem](https://lynxai-team.github.io/agent-smith/libraries/tmem) |

---

## 📄 License

MIT

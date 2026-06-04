# @agent-smith/agent

**Recursive tool-calling agent runtime with streaming inference for OpenAI-compatible backends.**

## Features

- 🔄 **Recursive Inference Loop** — Automatically iterates when the model calls tools, feeding results back into context until no more tools are needed
- 🔌 **Tool Calling** — Autonomous or supervised tool execution with `canRun` authorization callbacks
- 📡 **SSE Streaming** — Real-time token streaming with eventsource-parser for progressive output
- 🧠 **Thinking/Reasoning Support** — Dedicated callbacks for reasoning_content (think tokens) separate from response text
- 🌐 **OpenAI-Compatible API** — Works with any OpenAI-compatible server: llama.cpp, Ollama, vLLM, OpenRouter, etc.
- 🖥️ **Dual Environment** — Runs in both Node.js and browsers
- 📝 **Template System** — YAML-based `AgentSpec` with variable substitution, system prompts, and few-shot shots
- 📊 **Performance Metrics** — Cache hit rates, token throughput, prompt processing progress tracking

## Documentation

### For AI Agents
- [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns for the agent package
- [Get Started](https://lynxai-team.github.io/agent-smith/libraries/agent/1.get_started.md) — Installation and basic usage
- [Tools](https://lynxai-team.github.io/agent-smith/libraries/agent/2.tools.md) — Defining and configuring tools for agents
- [Templates](https://lynxai-team.github.io/agent-smith/libraries/agent/3.templates.md) — System prompts, YAML specs, and few-shot examples
- [Supervision](https://lynxai-team.github.io/agent-smith/libraries/agent/4.supervision.md) — Human-in-the-loop tool authorization

### For Humans
- [Complete doc](https://lynxai-team.github.io/agent-smith/libraries/agent/)

## Installation

```bash
npm install @agent-smith/agent
```

**Dependencies:** `@agent-smith/types`, `eventsource-parser`, `restmix`, `yaml`

## Quick Start

Create an agent, connect it to a local llama.cpp server, and run your first inference:

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
    onThinkingToken: (t) => console.log(`[thinking] ${t}`),
});

// 3. Run an inference query
const result = await agent.run("Explain quantum computing in simple terms", {
    params: {
        model: "qwen35b",
        temperature: 0.6,
        top_k: 40,
        max_tokens: 2048,
    },
});

console.log("\n\nResponse:", result.text);
```

## Usage

### Running with Tools

Enable autonomous tool calling by passing `ToolSpec` definitions to the `run()` method:

```typescript
import { Agent, Lm } from "@agent-smith/agent";

const lm = new Lm({
    name: "openrouter",
    serverUrl: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

const agent = new Agent({
    name: "weather-agent",
    lm,
    onToken: (t) => process.stdout.write(t),
});

// Define a tool
const weatherTool = {
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
    execute: async (args) => {
        const location = args?.location ?? "unknown";
        return { temp: 20.5, weather: "rainy", location };
    },
};

// Run with tools — the agent will autonomously call get_current_weather
const result = await agent.run(
    "I'm landing in Barcelona tomorrow. What's the weather like?",
    {
        params: {
            model: "qwen3-30b-a3b",
            temperature: 0.4,
            top_k: 40,
            max_tokens: 16384,
        },
        tools: [weatherTool],
    }
);

// Check if tool calls were made
if (result.toolCalls) {
    console.log("Tools called:", result.toolCalls.map(tc => tc.name));
}
```

### Using AgentSpec Templates (YAML)

Load agent definitions from YAML for reusable, configuration-driven agents:

```typescript
import { Agent, Lm } from "@agent-smith/agent";
import { readFileSync } from "fs";

const lm = new Lm({
    name: "llamacpp",
    serverUrl: "http://localhost:8080/v1",
    onToken: (t) => process.stdout.write(t),
});

// Load agent spec from YAML file
const yamlContent = readFileSync("./agents/chat.yml", "utf-8");
const agent = Agent.fromYaml({ lm }, yamlContent);

// The prompt gets substituted into the {prompt} placeholder in the YAML
const result = await agent.run("Tell me about Barcelona weather");
```

Example `agents/chat.yml`:

```yaml
name: chat
prompt: "{prompt}"
description: "A helpful chat agent"
model: "qwen3-30b"
template:
    system: "You are a helpful assistant that uses tools when needed."
inferParams:
    temperature: 0.4
    max_tokens: 16384
shots:
    - user: "What is AI?"
      assistant: "Artificial Intelligence is..."
```

### Supervised Tool Execution

Require human authorization before a tool executes:

```typescript
import { Agent, Lm } from "@agent-smith/agent";
import type { ToolCallSpec } from "@agent-smith/types";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";

const rl = createInterface({ input, output });

async function askPermission(tool: ToolCallSpec): Promise<boolean> {
    const args = Object.keys(tool.arguments ?? {}).join(", ");
    const answer = await rl.question(
        `Execute ${tool.name}(${args})? (y/n): `
    );
    return answer.toLowerCase() === "y";
}

const deleteFileTool = {
    name: "delete_file",
    description: "Delete a file from the filesystem",
    arguments: {
        path: { type: "string", required: true, description: "File path to delete" },
    },
    type: "action",
    parallelCalls: false,
    execute: async (args) => {
        const fs = await import("fs/promises");
        await fs.unlink(args.path);
        return { deleted: args.path };
    },
    canRun: askPermission, // ← human gate
};

const agent = new Agent({ lm });
await agent.run("Delete the temp file", {
    params: { model: "qwen3-30b", max_tokens: 1024 },
    tools: [deleteFileTool],
});
```

### Error Handling

Wrap inference calls in try/catch to handle server errors, tool failures, and aborts:

```typescript
import { Agent, Lm } from "@agent-smith/agent";

const lm = new Lm({
    name: "llamacpp",
    serverUrl: "http://localhost:8080/v1",
    onError: (err, from) => {
        console.error(`[${from}] Error:`, err);
    },
});

const agent = new Agent({ name: "safe-agent", lm });

try {
    const result = await agent.run("Do something complex", {
        params: { model: "qwen3-30b", max_tokens: 4096 },
    });
    console.log("Result:", result.text);
} catch (err) {
    if (err instanceof Error) {
        console.error("Inference failed:", err.message);
    }
}
```

### Aborting a Running Inference

Use the `Lm.abort()` method to cancel a long-running inference:

```typescript
const lm = new Lm({ name: "llamacpp", serverUrl: "http://localhost:8080/v1" });
const agent = new Agent({ name: "abortable", lm });

// Start inference
const promise = agent.run("Generate a long essay", {
    params: { model: "qwen3-30b", max_tokens: 8192 },
});

// Abort after 5 seconds
setTimeout(() => lm.abort(), 5000);

try {
    const result = await promise;
    console.log("Completed or aborted:", result.text);
} catch (err) {
    console.log("Aborted:", err.message);
}
```

## Complete Example

Here's a full working example demonstrating creation, initialization, tool usage, and error handling:

```typescript
import { Agent, Lm } from "@agent-smith/agent";
import type { ToolCallSpec, ToolSpec } from "@agent-smith/types";

async function main() {
    // 1. Create LM client
    const lm = new Lm({
        name: "llamacpp",
        serverUrl: "http://localhost:8080/v1",
        onToken: (t) => process.stdout.write(t),
        onThinkingToken: (t) => console.log(`\n[🧠] ${t}`),
        onError: (err) => console.error("[❌]", err),
    });

    // 2. Define tools
    const calculatorTool: ToolSpec = {
        name: "calculator",
        description: "Perform arithmetic calculations",
        arguments: {
            expression: {
                type: "string",
                required: true,
                description: "Mathematical expression, e.g. '2 + 2 * 3'",
            },
        },
        type: "action",
        parallelCalls: false,
        execute: async (args) => {
            const result = eval(args.expression); // In production, use a safe evaluator
            return { expression: args.expression, result };
        },
    };

    const current_time_tool: ToolSpec = {
        name: "current_time",
        description: "Get the current date and time",
        arguments: {},
        type: "action",
        parallelCalls: false,
        execute: async () => ({
            time: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
    };

    // 3. Create agent
    const agent = new Agent({
        name: "assistant",
        lm,
        onToolCall: (tc) => console.log(`\n[🔧] Calling tool: ${tc.name}`),
        onToolCallEnd: (tc, result) => console.log(`[✅] Tool ${tc.name} returned:`, result),
        onTurnStart: () => console.log("\n[💬] New turn"),
        onTurnEnd: (ht) => console.log("[🏁] Turn complete"),
    });

    // 4. Run inference with tools
    try {
        const result = await agent.run(
            "What is the current time, and what is 17 times 23?",
            {
                params: {
                    model: "qwen3-30b",
                    temperature: 0.3,
                    top_k: 20,
                    max_tokens: 4096,
                },
                tools: [calculatorTool, current_time_tool],
            }
        );

        console.log("\n\n=== Final Response ===");
        console.log(result.text);
        if (result.toolCalls) {
            console.log("\nTools used:", result.toolCalls.map(tc => tc.name).join(", "));
        }
    } catch (err) {
        console.error("Failed:", err);
    }
}

main();
```

## API Reference

### `new Lm(params: LmProviderParams)`

Creates an OpenAI-compatible HTTP client for streaming inference.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Identifier for this provider instance |
| `serverUrl` | `string` | Base URL of the inference server (e.g., `http://localhost:8080/v1`) |
| `apiKey` | `string` _(optional)_ | Bearer token for authentication |
| `onToken` | `(t: string, from: string) => void` _(optional)_ | Callback for each generated token |
| `onThinkingToken` | `(t: string, from: string) => void` _(optional)_ | Callback for reasoning/thinking tokens |
| `onStartThinking` | `(from: string) => void` _(optional)_ | Callback when thinking phase starts |
| `onEndThinking` | `(from: string) => void` _(optional)_ | Callback when thinking phase ends |
| `onError` | `(err: any, from: string) => void` _(optional)_ | Error callback |
| `onToolCallInProgress` | `(tc: ToolCallSpec[], from: string) => void` _(optional)_ | Callback as tool calls are being parsed |

**Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `infer()` | `(prompt: string, options?: ClientInferenceOptions) => Promise<InferenceResult>` | Run inference with streaming or non-streaming mode |
| `abort()` | `() => Promise<void>` | Abort the currently running inference |
| `modelsInfo()` | `() => Promise<ModelInfo[]>` | List available models on the server |
| `tokenize()` | `(text: string) => Promise<number[]>` | Tokenize text via the server |
| `detokenize()` | `(tokens: number[]) => Promise<string>` | Detokenize tokens back to text |

### `new Agent(params: AgentParams, spec?: AgentSpec)`

Creates an agent with recursive tool-calling inference loop.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` _(optional)_ | Agent identifier for callback context |
| `lm` | `LmProvider` | Language model client instance |
| `onToken` | `(t: string, from: string) => void` _(optional)_ | Token callback (delegated to `lm`) |
| `onThinkingToken` | `(t: string, from: string) => void` _(optional)_ | Thinking token callback (delegated to `lm`) |
| `onToolCall` | `(tc: ToolCallSpec, type: string, from: string) => void` _(optional)_ | Called before a tool executes |
| `onToolCallEnd` | `(tc: ToolCallSpec, result: any, type: string, from: string) => void` _(optional)_ | Called after a tool completes |
| `onToolsTurnStart` | `(tcs: ToolCallSpec[], from: string) => void` _(optional)_ | Called when a batch of tool calls starts |
| `onToolsTurnEnd` | `(tts: ToolTurn[], from: string) => void` _(optional)_ | Called when all tools in a turn complete |
| `onTurnStart` | `(from: string) => void` _(optional)_ | Called at the start of each inference turn |
| `onTurnEnd` | `(ht: HistoryTurn, from: string) => void` _(optional)_ | Called at the end of each turn |
| `onAssistant` | `(txt: string, from: string) => void` _(optional)_ | Callback for assistant response text |
| `onThink` | `(txt: string, from: string) => void` _(optional)_ | Callback for thinking/reasoning text |

**Static Factory:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `fromYaml()` | `(params: AgentParams, yaml: string) => Agent` | Create an agent from a YAML `AgentSpec` string |

### `agent.run(prompt: string, options?: AgentInferenceOptions)`

Runs the inference loop. Returns when no more tool calls are needed or the model produces final text.

| Option | Type | Description |
|--------|------|-------------|
| `params` | `InferenceParams` | Sampling parameters (model, temperature, top_k, max_tokens, etc.) |
| `tools` | `ToolSpec[]` | Available tools for the agent to call |
| `history` | `HistoryTurn[]` | Conversation history to prepend |
| `system` | `string` | System prompt (overrides spec if provided) |
| `debug` | `boolean` | Enable verbose debug logging |
| `verbosity` | `VerbosityOptions` | Control output detail level |

**Returns:** `Promise<InferenceResult>`

```typescript
interface InferenceResult {
    text: string;           // Final assistant response
    thinkingText: string;   // Reasoning/thinking content (if any)
    stats: PerformanceMetrics;  // Token throughput, cache hits, timing
    toolCalls?: ToolCallSpec[]; // Tool calls made in the last turn
}
```

### `AgentSpec` (YAML Agent Definition)

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Agent identifier |
| `prompt` | `string` | Prompt template with `{prompt}` placeholder |
| `description` | `string` | Human-readable description |
| `model` | `string` | Default model name |
| `template.system` | `string` | System message template |
| `inferParams` | `InferenceParams` | Default sampling parameters |
| `shots` | `HistoryTurn[]` | Few-shot example turns (prepended to history) |
| `variables` | `AgentVariables` | Required/optional variable definitions |

## Important Notes

- **Environment**: Works in both Node.js and browser environments. In browsers, the server must support CORS.
- **Streaming First**: Default inference mode is streaming (SSE). Set `stream: false` in params for non-streaming.
- **Recursive Loop**: The agent automatically loops when tool calls are returned, feeding results back as new history turns until no more tools are called.
- **Tool Authorization**: Tools with `canRun` returning `false` are skipped — the agent receives an error message and continues to the next turn.
- **Parallel Calls**: Set `parallelCalls: true` on a `ToolSpec` to run multiple instances concurrently via `Promise.allSettled`.
- **Subagents**: Agents can call other agents as tools (type: `"agent"`). Subagents receive a fresh context by default unless `propagateModel`/`propagateInferParams` are set.
- **Abort Safety**: Calling `lm.abort()` during inference cancels the underlying fetch request. The agent may still complete its current tool calls before returning.

## Documentation Links

| Resource | Link |
|----------|------|
| 📖 Get Started Guide | https://lynxai-team.github.io/agent-smith/libraries/agent/get_started |
| 🔌 Tools Guide | https://lynxai-team.github.io/agent-smith/libraries/agent/tools |
| 📝 Templates Guide | https://lynxai-team.github.io/agent-smith/libraries/agent/templates |
| 👁️ Supervision Guide | https://lynxai-team.github.io/agent-smith/libraries/agent/supervision |
| 🗺️ Full Docsite | https://lynxai-team.github.io/agent-smith/ |

## License

MIT

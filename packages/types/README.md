[![npm package](https://img.shields.io/npm/v/@agent-smith/types)](https://www.npmjs.com/package/@agent-smith/types)

# @agent-smith/types

**Shared TypeScript interfaces for the Agent Smith framework** — pure type definitions with zero runtime code. Part of the [Agent Smith toolkit](https://github.com/lynxai-team/agent-smith).

## Features

- 📦 **Leaf Package**: Zero dependencies, no runtime code — only `.d.ts` type definitions
- 🧠 **Agent Types**: `AgentSpec`, `AgentParams`, `AgentSettings`, `AgentState` for agent configuration and lifecycle
- 🔧 **Tool Abstraction**: `ToolSpec`, `ToolCallSpec`, `ToolTurn` — unified tool definitions callable interchangeably
- ⚡ **Inference Types**: `InferenceParams`, `InferenceOptions`, `InferenceResult`, `LmProvider` interface for LLM backends
- 💬 **History Management**: `HistoryTurn`, `UiHistoryTurn`, `ToolTurn` for conversation state
- 🌐 **WebSocket Protocol**: `WsClientMsg`, `WsServerMsgType`, `StreamedMessage` for real-time communication
- 🔁 **Callback Interfaces**: `InferenceCallbacks`, `AgentCallbacks`, `AllCallbacks` for event streaming
- ⚙️ **Configuration Types**: `ConfigFile`, `InferenceBackend`, `Settings` for app configuration
- 📊 **Performance Metrics**: `InferenceStats`, `PerformanceMetrics`, `PromptProcessingProgress`
- 🔌 **Feature Discovery**: `FeatureSpec`, `Features`, `FeatureType` for agents, actions, workflows, skills

## Documentation

### For AI Agents
- [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns for the Agent Smith libraries
- [Get Started](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/types/1.get_started.md) — Overview and installation
- [Interfaces](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/types/2.interfaces.md) — Complete API reference of all exported types

### For Humans
- [Get Started](https://lynxai-team.github.io/agent-smith/libraries/types/) — Overview and usage guide
- [Interfaces](https://lynxai-team.github.io/agent-smith/libraries/types/interfaces) — Full interface reference with tables

## Installation

This package is a dependency of all other Agent Smith packages. Install it directly:

```bash
npm install @agent-smith/types
```

Or in a monorepo workspace:

```json
{
  "dependencies": {
    "@agent-smith/types": "workspace:*"
  }
}
```

## Quick Start

Import types from the package root for type annotations and interfaces:

```typescript
import type { AgentSpec, ToolSpec, InferenceParams, HistoryTurn } from "@agent-smith/types";

// Define an agent specification
const agent: AgentSpec = {
  name: "assistant",
  prompt: "You are a helpful assistant.",
  model: "llama3",
  description: "General purpose assistant"
};

// Define a tool
const tool: ToolSpec = {
  name: "calculator",
  description: "Performs arithmetic calculations",
  arguments: {
    expression: {
      description: "The math expression to evaluate",
      type: "string",
      required: true
    }
  },
  type: "action",
  parallelCalls: false,
  execute: async (args) => {
    return eval(args.expression);
  }
};

// Use inference parameters
const params: InferenceParams = {
  temperature: 0.7,
  top_p: 0.95,
  max_tokens: 2048
};
```

## Usage

### Agent Types

Define agent specifications with prompts, models, and tool bindings:

```typescript
import type { AgentSpec, AgentSettings, AgentVariables } from "@agent-smith/types";

const agentWithVars: AgentSpec = {
  name: "researcher",
  prompt: "You are a research assistant that searches the web.",
  model: "qwen4b",
  description: "Web research agent",
  inferParams: {
    temperature: 0.4,
    top_k: 20,
    top_p: 0.95
  },
  variables: {
    required: {
      topic: {
        type: "string",
        description: "The research topic"
      }
    },
    optional: {
      depth: {
        type: "string",
        description: "Research depth level",
        default: "medium"
      }
    }
  },
  toolsList: ["websearch", "readfile"]
};
```

### Tool Types

Create unified tool specifications executable by the agent:

```typescript
import type { ToolSpec, ToolCallSpec, ToolTurn } from "@agent-smith/types";

const fileTool: ToolSpec = {
  name: "readfile",
  description: "Reads a file from the filesystem",
  arguments: {
    path: {
      description: "File path to read",
      type: "string",
      required: true
    }
  },
  type: "action",
  parallelCalls: false,
  execute: async (args) => {
    const fs = await import("fs/promises");
    return await fs.readFile(args.path, "utf-8");
  }
};

// Tool call during inference
const toolCall: ToolCallSpec = {
  id: "call_abc123",
  name: "readfile",
  arguments: { path: "/workspace/data.txt" }
};

// Tool turn with response
const toolTurn: ToolTurn = {
  call: toolCall,
  response: "File contents here...",
  from: "agent",
  type: "action"
};
```

### Callback Interfaces

Handle inference and agent events in real-time:

```typescript
import type { InferenceCallbacks, AgentCallbacks, AllCallbacks } from "@agent-smith/types";

// Inference callbacks for token streaming
const inferenceCbs: InferenceCallbacks = {
  onToken: (token: string, from: string) => {
    process.stdout.write(token);
  },
  onThinkingToken: (token: string, from: string) => {
    console.log(`[thinking] ${token}`);
  },
  onError: (err: any, from: string) => {
    console.error(`Error from ${from}:`, err.message);
  },
  onToolCallInProgress: (calls: ToolCallSpec[], from: string) => {
    console.log(`Pending tool calls:`, calls.map(c => c.name));
  }
};

// Agent callbacks for turn-level events
const agentCbs: AgentCallbacks = {
  onTurnStart: (from: string) => {
    console.log("New turn started");
  },
  onToolCall: (tc: ToolCallSpec, type: string, from: string) => {
    console.log(`Calling tool: ${tc.name}`);
  },
  onTurnEnd: (turn: HistoryTurn, from: string) => {
    console.log("Turn complete", turn.stats);
  }
};

// Combined callbacks
const allCbs: AllCallbacks = { ...inferenceCbs, ...agentCbs };
```

### WebSocket Protocol Types

Work with real-time server communication:

```typescript
import type { WsClientMsg, WsServerMsgType, StreamedMessage } from "@agent-smith/types";

// Client message to execute an agent
const clientMsg: WsClientMsg = {
  command: "execute",
  type: "command",
  feature: "agent",
  payload: { name: "assistant", prompt: "Hello" },
  options: {
    model: "llama3",
    params: { temperature: 0.7 }
  }
};

// Server message types you might receive
type ServerMessageType = WsServerMsgType;
// 'token' | 'thinkingtoken' | 'turnstart' | 'turnend' | 
// 'assistant' | 'thinkingstart' | 'toolcall' | 'error' | ...

// Streamed message for rendering
const streamed: StreamedMessage = {
  content: "Hello, how can I help you?",
  type: "token",
  num: 1
};
```

### Configuration Types

Manage application configuration:

```typescript
import type { ConfigFile, InferenceBackend } from "@agent-smith/types";

const config: ConfigFile = {
  datadir: "~/.agent-smith",
  features: ["agents", "actions", "workflows"],
  backends: {
    default: "ollama",
    ollama: {
      type: "llamacpp",
      url: "http://localhost:11434/v1"
    },
    openai: {
      type: "openai",
      url: "https://api.openai.com/v1",
      apiKey: "sk-..."
    }
  },
  agents: {
    assistant: {
      model: "qwen4b",
      temperature: 0.7
    }
  },
  workspaces: {
    project: "/workspace/my-project"
  }
};
```

## Complete Example

Full working example combining agent definition, tool execution, and callbacks:

```typescript
import type {
  AgentSpec,
  ToolSpec,
  InferenceParams,
  AllCallbacks,
  HistoryTurn
} from "@agent-smith/types";

async function runAgent() {
  // Define the agent
  const agent: AgentSpec = {
    name: "calculator",
    prompt: "You are a precise calculator. Always show your work.",
    model: "llama3",
    description: "Math assistant with tool calling"
  };

  // Define a tool
  const calcTool: ToolSpec = {
    name: "calculate",
    description: "Evaluate a math expression",
    arguments: {
      expression: {
        description: "Math expression to evaluate",
        type: "string",
        required: true
      }
    },
    type: "action",
    parallelCalls: false,
    execute: async (args: { expression: string }) => {
      return eval(args.expression);
    }
  };

  // Set up callbacks
  const callbacks: AllCallbacks = {
    onToken: (token: string) => process.stdout.write(token),
    onError: (err: any) => console.error("Error:", err.message),
    onToolCall: (tc) => console.log(`Using tool: ${tc.name}`),
    onTurnEnd: (turn: HistoryTurn) => {
      console.log("\n[Stats]", turn.stats);
    }
  };

  // Inference parameters
  const params: InferenceParams = {
    temperature: 0.3,
    max_tokens: 1024,
    top_p: 0.95
  };

  console.log("Agent ready:", agent.name);
  console.log("Tools available:", calcTool.name);
  console.log("Callbacks configured:", Object.keys(callbacks).length);
}

runAgent();
```

## API Reference

### Exported Types Summary

| Category | Key Types |
|----------|-----------|
| **Agent** | `AgentSpec`, `AgentParams`, `AgentSettings`, `AgentState`, `AgentVariables`, `TemplateSpec` |
| **Tools** | `ToolSpec`, `ToolDefSpec`, `ToolCallSpec`, `ToolTurn` |
| **Inference** | `InferenceParams`, `InferenceOptions`, `InferenceResult`, `LmProvider`, `LmProviderParams` |
| **Callbacks** | `InferenceCallbacks`, `AgentCallbacks`, `AllCallbacks` |
| **History** | `HistoryTurn`, `UiHistoryTurn`, `ToolTurn`, `ImgData` |
| **Models** | `ModelInfo`, `ModelStatus`, `ModelData`, `ModelApiResponse` |
| **WebSocket** | `WsClientMsg`, `WsServerMsgType`, `StreamedMessage`, `ServerParams` |
| **Config** | `ConfigFile`, `InferenceBackend`, `Settings` |
| **Features** | `FeatureSpec`, `Features`, `FeatureType`, `WorkflowStep` |
| **Metrics** | `InferenceStats`, `PerformanceMetrics`, `PromptProcessingProgress` |
| **Utilities** | `VerbosityOptions`, `Workspace`, `SamplingPreset` |

### Key Interfaces

#### AgentSpec
Agent definition structure representing a YAML agent specification.

```typescript
interface AgentSpec {
    name: string;
    prompt: string;
    description: string;
    model: string;
    backend?: string;
    template?: TemplateSpec;
    inferParams?: InferenceParams;
    models?: Array<string>;
    shots?: Array<HistoryTurn>;
    variables?: AgentVariables;
    tools?: Array<ToolSpec>;
    toolsList?: Array<string>;
    mcp?: McpServerSpec;
    skills?: Array<string>;
}
```

#### ToolSpec
Unified tool specification with an executable function.

```typescript
interface ToolSpec extends ToolDefSpec {
    type: string;
    parallelCalls: boolean;
    execute: <O = any>(
        args: { [key: string]: any } & { toolOptions?: AgentInferenceOptions } | undefined
    ) => Promise<O>;
}
```

#### LmProvider
Language model provider interface for inference backends.

```typescript
interface LmProvider extends InferenceCallbacks {
    name: string;
    serverUrl: string;
    model: string;
    loadModel: (name: string) => Promise<void>;
    infer: (prompt: string, options?: InferenceOptions) => Promise<InferenceResult>;
    abort: () => Promise<void>;
}
```

#### InferenceCallbacks
Callback interface for inference events.

```typescript
interface InferenceCallbacks {
    onToken?: (t: string, from: string) => void;
    onThinkingToken?: (t: string, from: string) => void;
    onError?: (err: any, from: string) => void;
    onToolCallInProgress?: (tc: Array<ToolCallSpec>, from: string) => void;
}
```

## Important Notes

- 🌐 **Browser & Node.js**: This is a types-only package that works in both browser and Node.js environments
- 📦 **No Runtime Code**: Contains only TypeScript type definitions (`.d.ts`) — zero JavaScript runtime
- 🔗 **Transitive Dependency**: All Agent Smith packages depend on this package for shared interfaces
- 📝 **Type Safety**: Use `import type` for type-only imports to avoid runtime overhead

## Related Packages

- [`@agent-smith/agent`](https://lynxai-team.github.io/agent-smith/libraries/agent/) — Agent class with inference loop
- [`@agent-smith/core`](https://lynxai-team.github.io/agent-smith/libraries/core/) — Runtime engine and feature discovery
- [`@agent-smith/cli`](https://lynxai-team.github.io/agent-smith/terminal_client/) — Terminal REPL client
- [`@agent-smith/wscli`](https://lynxai-team.github.io/agent-smith/libraries/wscli/) — WebSocket client

## License

MIT

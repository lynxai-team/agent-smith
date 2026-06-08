[![npm version](https://img.shields.io/npm/v/@agent-smith/core)](https://www.npmjs.com/package/@agent-smith/core)

# @agent-smith/core — Runtime Engine

The central runtime engine for the [Agent Smith toolkit](https://github.com/lynxai-team/agent-smith). Provides SQLite-backed configuration management, filesystem-based feature discovery, a unified tool execution engine, and Model Context Protocol (MCP) client integration.

## ✨ Features

- 🗄️ **SQLite Configuration** — 17-table database for features, backends, plugins, settings, and workspaces
- 🔍 **Feature Discovery** — Scans directories for agents, actions, workflows, commands, adaptaters, and skills
- ⚡ **Unified Tool Execution** — Execute actions (JS/Python/YAML), agents, workflows, and commands through a common interface
- 🌐 **MCP Client** — Connect to external MCP servers and expose their tools as `ToolSpec` objects
- 🔧 **Multi-Language Support** — JavaScript (ESM), Python (`python-shell`), and YAML/shell actions
- 📡 **Reactive State** — Vue `ref`/`reactive` for cross-module state management
- 🔄 **Backend Agnostic** — Multiple inference backends (OpenAI-compatible, local llamacpp) with per-agent selection

## Documentation

### For AI Agents
- [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns for the core package
- [Configuration](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/core/2.configuration.md) — Configuration file format, loading, and management
- [Feature Discovery](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/core/3.feature-discovery.md) — Directory structure, discovery process, and SQLite registration
- [Tool Execution](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/core/4.tool-execution.md) — Execution functions, multi-language support, and error handling
- [MCP Client](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/core/5.mcp.md) — MCP server connection, tool extraction, and agent integration

### For Humans
- [Get Started](https://lynxai-team.github.io/agent-smith/libraries/core/get_started) — Installation and basic usage
- [Configuration](https://lynxai-team.github.io/agent-smith/libraries/core/configuration) — Configuration file format, loading, and management
- [Feature Discovery](https://lynxai-team.github.io/agent-smith/libraries/core/feature-discovery) — Directory structure, discovery process, and SQLite registration
- [Tool Execution](https://lynxai-team.github.io/agent-smith/libraries/core/tool-execution) — Execution functions, multi-language support, and error handling
- [MCP Client](https://lynxai-team.github.io/agent-smith/libraries/core/mcp) — MCP server connection, tool extraction, and agent integration

## 📦 Installation

```bash
npm install @agent-smith/core
```

**Dependencies:** `@agent-smith/types`, `better-sqlite3`, `@vue/reactivity`, `yaml`, `@modelcontextprotocol/sdk`, `python-shell`

## 🚀 Quick Start

```typescript
import { conf, db, executeAction, executeWorkflow, McpClient } from "@agent-smith/core";

// Initialize the database and process configuration
await conf.updateConfCmd(["conf"]);

// Discover and register features from configured paths
await conf.updateFeaturesCmd({});

// Execute an action by name
const result = await executeAction("read", ["./file.txt"], {});

// Or run a workflow that chains multiple steps
const workflowResult = await executeWorkflow("my-workflow", ["arg1"], {});
```

## 📖 Usage

### Configuration Management

Load and manage configuration from YAML files:

```typescript
import { conf } from "@agent-smith/core";

// Process an existing config file
const { paths, pf, dd } = await conf.processConfPath("~/.config/agent-smith/config.yml");
// paths: Array<string> — all feature search paths
// pf: string — prompt file path
// dd: string — data directory path

// Create a default config if none exists
const fp = conf.createConfigFileIfNotExists();

// Get platform-specific config paths
const { confDir, dbPath } = conf.getConfigPath("agent-smith", "config.db");
```

### Feature Discovery

Discover and register features from filesystem directories:

```typescript
import { getFeatureSpec, conf } from "@agent-smith/core";

// Re-scan all registered feature paths
await conf.updateFeaturesCmd({});

// Look up a feature by name and type
const spec = getFeatureSpec("writer", "agent");
if (spec.found) {
  console.log(spec.path);   // Full file path
  console.log(spec.ext);    // File extension
  console.log(spec.variables); // Variable definitions
}
```

### Tool Execution

Execute actions, workflows, and agents:

```typescript
import { executeAction, executeWorkflow, executeAgent } from "@agent-smith/core";

// Execute a JavaScript action
const result = await executeAction("read", ["./file.txt"], {});

// Execute a YAML action (shell command)
const grepResult = await executeAction("grep", ["error"], {});

// Execute a Python action
const pythonResult = await executeAction("analyze", ["data.csv"], {});

// Run a workflow chaining multiple steps
const pipelineResult = await executeWorkflow("data-pipeline", ["input.csv"], {
  verbose: true,
  debug: false
});

// Execute an agent with inference
const agentResult = await executeAgent("writer", ["AI trends"], {
  model: "llama3",
  temperature: 0.7
});
```

### Agent Executor

Create a full agent execution context:

```typescript
import { useAgentExecutor } from "@agent-smith/core";

const executor = await useAgentExecutor("researcher", { prompt: "Analyze the data" }, {});
const result = await executor.execute();
// Returns: InferenceResult
```

The executor handles backend resolution, MCP server initialization, grammar compilation, and streaming.

### Reactive State

Access and manage reactive state:

```typescript
import { state } from "@agent-smith/core";

// List all inference backends
const backends = state.listBackends();

// Set the default backend
await state.setBackend("openai");

// Get per-agent inference settings
const settings = state.getAgentSettings();
```

### MCP Client

Connect to external MCP servers:

```typescript
import { McpClient } from "@agent-smith/core";

const client = new McpClient(
  "filesystem",                    // server name
  "npx",                           // command
  ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"], // args
  null,                            // authorizedTools (null = all allowed)
  null                             // askUserTools (null = no confirmation needed)
);

// Start the server connection
await client.start();

// Extract tools as ToolSpec objects
const tools = await client.extractTools({ confirmToolUsage });

// Stop the connection
await client.stop();
```

## 🔧 Complete Example

A full working example demonstrating configuration, feature discovery, and execution:

```typescript
import {
  conf,
  db,
  state,
  executeAction,
  executeWorkflow,
  useAgentExecutor,
  getFeatureSpec,
  McpClient
} from "@agent-smith/core";

async function main() {
  // Step 1: Initialize database and configuration
  console.log("Initializing...");
  await conf.updateConfCmd(["conf"]);
  
  // Verify state readiness
  if (!state.isStateReady()) {
    throw new Error("Configuration not loaded");
  }

  // Step 2: Discover features from all registered paths
  console.log("Discovering features...");
  await conf.updateFeaturesCmd({});

  // Step 3: Look up a feature
  const agentSpec = getFeatureSpec("writer", "agent");
  if (!agentSpec.found) {
    throw new Error("Writer agent not found");
  }
  console.log(`Found agent at: ${agentSpec.path}`);

  // Step 4: Execute an action
  console.log("Executing read action...");
  const fileContent = await executeAction("read", ["./README.md"], {});
  console.log(`File content length: ${fileContent.length}`);

  // Step 5: Run a workflow
  console.log("Running workflow...");
  try {
    const result = await executeWorkflow("my-pipeline", ["input.txt"], {
      verbose: true
    });
    console.log("Workflow completed:", result);
  } catch (e) {
    console.error("Workflow failed:", e.message);
  }

  // Step 6: Execute an agent
  console.log("Running agent...");
  try {
    const executor = await useAgentExecutor("writer", { prompt: "Write about AI" }, {});
    const inferenceResult = await executor.execute();
    console.log("Agent response:", inferenceResult.content);
  } catch (e) {
    console.error("Agent execution failed:", e.message);
  }

  // Step 7: Use MCP client for external tools
  console.log("Setting up MCP client...");
  const mcpClient = new McpClient(
    "filesystem",
    "npx",
    ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
  );
  
  try {
    await mcpClient.start();
    const tools = await mcpClient.extractTools({ confirmToolUsage: async () => true });
    console.log(`Loaded ${tools.length} MCP tools`);
  } finally {
    await mcpClient.stop();
  }

  console.log("Done!");
}

main().catch(console.error);
```

## 📋 API Reference

### Named Exports

| Export | Type | Description |
|--------|------|-------------|
| `db` | `object` | Database operations: `init`, `...readOps`, `...writeOps`, `db` (raw better-sqlite3) |
| `fs` | `object` | Filesystem helpers: `openAgentSpec`, `readWorkflow` |
| `conf` | `object` | Configuration management: `getConfigPath`, `processConfPath`, `updateConfigFile`, etc. |
| `utils` | `object` | Utilities: `execute`, `runShellCmd`, `deleteFileIfExists`, `readAgent`, etc. |
| `state` | `object` | Reactive state: `init`, `initState`, `setBackend`, `listBackends`, `agentSettings`, etc. |
| `executeAction` | `function` | Execute an action by name |
| `executeWorkflow` | `function` | Execute a workflow by name |
| `executeAgent` | `function` | Execute an agent by name |
| `useAgentExecutor` | `function` | Create an agent execution context |
| `getFeatureSpec` | `function` | Look up a feature by name and type |
| `extractToolDoc` | `function` | Extract tool specification from a feature file |
| `McpClient` | `class` | MCP server client for external tool integration |

### `executeAction(name, payload, options)`

Executes an action by name, resolving it from the SQLite database.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Action name (matches registered feature) |
| `payload` | `Array<string>` | Arguments passed to the action |
| `options` | `object` | Execution options (`debug`, `verbose`) |

**Returns:** `Promise<any>` — Action result

**Dispatch by extension:**
- `.js`: Dynamically imports and calls exported `action(args, options)`
- `.yml`: Executes YAML-defined shell command with args
- `.py`: Runs via `python-shell` package

### `executeWorkflow(name, args, options)`

Executes a workflow as a sequence of steps (agent/action/adaptater/cmd).

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Workflow name |
| `args` | `Array<string>` | Initial arguments for the first step |
| `options` | `object` | Execution options (`verbose`, `debug`) |

**Returns:** `Promise<any>` — Result of the final step

### `executeAgent(name, args, options)`

Executes an agent by resolving its prompt and running inference.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Agent name |
| `args` | `Array<string>` | Arguments for prompt generation |
| `options` | `object` | Inference options (`model`, `temperature`, etc.) |

**Returns:** `Promise<InferenceResult>` — Agent inference result

### `useAgentExecutor(name, payload, options)`

Creates an agent execution context with full setup.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Agent name |
| `payload` | `object` | Payload including `prompt` and optional context |
| `options` | `object` | Execution options |

**Returns:** `Promise<{ execute: () => Promise<InferenceResult> }>`

### `getFeatureSpec(name, type)`

Looks up a feature in the SQLite database.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Feature name |
| `type` | `"agent" \| "action" \| "workflow" \| "adaptater" \| "cmd" \| "skill"` | Feature type |

**Returns:** `{ found: boolean; path?: string; ext?: string; variables?: Record<string, any> }`

### `McpClient` Class

| Constructor | `(servername: string, command: string, args: Array<string>, authorizedTools?: Array<string> \| null, askUserTools?: Array<string> \| null)` |
|-------------|--------------------------------------------------------------------------------------------------------------------------|
| `start()` | `async () => Promise<void>` — Connect to the MCP server via stdio transport |
| `stop()` | `async () => Promise<void>` — Close the connection |
| `extractTools(options)` | `async (options: { confirmToolUsage?: Function }) => Promise<Array<ToolSpec>>` — Extract tools as ToolSpec objects |

## ⚠️ Important Notes

- **Node.js Environment**: This package is designed for Node.js environments. It depends on `better-sqlite3` which requires native compilation.
- **SQLite First Run**: The database is initialized automatically on first use with 17 tables. No manual migration needed.
- **Feature Discovery Required**: Before executing features, you must call `conf.updateConfCmd()` and `conf.updateFeaturesCmd()` to discover and register them.
- **Python Actions**: Require `python-shell` package and a working Python installation.
- **MCP Servers**: External MCP servers are spawned as child processes. Ensure required binaries (e.g., `npx`) are available.
- **Related Packages**: See `@agent-smith/types` for shared interfaces, `@agent-smith/agent` for the Agent class, `@agent-smith/cli` for CLI usage.

## 📖 Documentation Links

- [Full docsite](https://lynxai-team.github.io/agent-smith/) — Complete project documentation
- [Architecture Overview](https://lynxai-team.github.io/agent-smith/architecture/overview) — System architecture and design principles
- [Tool Abstraction](https://lynxai-team.github.io/agent-smith/architecture/tool-abstraction) — Unified `ToolSpec` interface

## 📄 License

MIT

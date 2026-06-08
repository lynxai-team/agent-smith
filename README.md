# Agent Smith

![Agent Smith](docsite/public/img/agentsmith.png)

A toolkit to create local-first human-friendly agents in the browser or terminal

| Feature | Description |
|---------|-------------|
| 🧠 **Think** | LLM inference via any OpenAI-compatible backend, first class Llama.cpp support |
| 🔧 **Work** | Execute tools recursively — actions, workflows, commands, agents |
| 💾 **Remember** | Semantic memory (LanceDB) + transient memory (IndexedDB/localForage) |
| 💻 **Interact** | Terminal REPL (`lm`), WebSocket client, or Koa server API |

### Philosophy

- **Composable** — limited responsibilities, packages work together
- **Declarative** — focus on business logic, express features simply
- **Explicit** — simple and under user control, no hidden magic

📚 [Documentation](https://lynxai-team.github.io/agent-smith) | 🧩 [Plugins](https://github.com/synw/agent-smith-plugins) | 🎨 [UI](https://github.com/synw/agent-smith-ui)

## Quickstart

Get up and running in 3 steps:

### 1. Install the CLI

```bash
npm i -g @agent-smith/cli
```

### 2. Create a config file (`~/.config/agent-smith/config.yml`)

```yaml
backends:
  default: "llamacpp"
  llamacpp:
    type: "llamacpp"
    url: "http://localhost:8080/v1"

features:
  - ~/my-agents/features
```

### 3. Run your first query

```bash
lm q "Say hello in three words"
```

👉 See the [full quickstart guide](https://lynxai-team.github.io/agent-smith/terminal_client/quickstart) for detailed setup including plugins and custom agents.

## Packages

| Package | Version | Description | Node.js | Browser |
|---------|---------|-------------|---------|---------|
| `@agent-smith/cli` | [![npm](https://img.shields.io/npm/v/@agent-smith/cli)](https://www.npmjs.com/package/@agent-smith/cli) | Terminal REPL client (`lm` command) | ✅ | ❌ |
| `@agent-smith/agent` | [![npm](https://img.shields.io/npm/v/@agent-smith/agent)](https://www.npmjs.com/package/@agent-smith/agent) | Agent runtime with inference loop | ✅ | ✅ |
| `@agent-smith/core` | [![npm](https://img.shields.io/npm/v/@agent-smith/core)](https://www.npmjs.com/package/@agent-smith/core) | Runtime engine (SQLite, config, tools, MCP) | ✅ | ✅ |
| `@agent-smith/types` | [![npm](https://img.shields.io/npm/v/@agent-smith/types)](https://www.npmjs.com/package/@agent-smith/types) | Shared interfaces and types | ✅ | ✅ |
| `@agent-smith/smem` | [![npm](https://img.shields.io/npm/v/@agent-smith/smem)](https://www.npmjs.com/package/@agent-smith/smem) | Semantic memory (LanceDB + embeddings) | ✅ | ❌ |
| `@agent-smith/tmem` | [![npm](https://img.shields.io/npm/v/@agent-smith/tmem)](https://www.npmjs.com/package/@agent-smith/tmem) | Transient key-value store (localForage/IndexedDB) | ✅ | ✅ |
| `@agent-smith/wscli` | [![npm](https://img.shields.io/npm/v/@agent-smith/wscli)](https://www.npmjs.com/package/@agent-smith/wscli) | WebSocket client with auto-reconnect | ✅ | ✅ |
| `@agent-smith/server` | [![npm](https://img.shields.io/npm/v/@agent-smith/server)](https://www.npmjs.com/package/@agent-smith/server) | Koa backend (REST API + WebSocket) | ✅ | ❌ |

## Plugins

Plugins extend the CLI with additional capabilities. Browse all plugins at [agent-smith-plugins](https://github.com/synw/agent-smith-plugins).

| Category | Plugin | Package | Description |
|----------|--------|---------|-------------|
| 💻 Code Management | [git](https://lynxai-team.github.io/agent-smith/plugins/code/git) | `@agent-smith/feat-git` | AI-powered commit messages, diff analysis |
| | [sqlite](https://lynxai-team.github.io/agent-smith/plugins/code/sqlite) | `@agent-smith/feat-sqlite` | Database operations, schema extraction |
| ⚙️ System | [fs](https://lynxai-team.github.io/agent-smith/plugins/filesystem) | `@agent-smith/feat-fs` | Filesystem read/write with path authorization |
| | [shell](https://lynxai-team.github.io/agent-smith/plugins/shell) | `@agent-smith/feat-shell` | Sandboxed Docker execution (shell + Python) |
| 🌐 Web | [search](https://lynxai-team.github.io/agent-smith/plugins/search) | `@agent-smith/feat-search` | Multi-backend web search (DuckDuckGo, Wikipedia, crawl4ai) |
| | video | `@agent-smith/feat-video` | YouTube transcript extraction and chat |
| 📝 Docs | autodoc | `@agent-smith/autodoc` | AI-powered documentation Q&A |

Install a plugin: `npm i -g @agent-smith/feat-shell`, then add it to your `config.yml`.

## Architecture Highlights

- **SQLite-driven runtime**: All configuration (backends, features, settings) lives in SQLite — zero hardcoded defaults
- **Feature discovery**: Agents, actions, workflows, and commands are YAML/JS files on disk, auto-discovered and registered
- **MCP support**: Connect to external Model Context Protocol servers and use their tools within agents
- **Unified tool abstraction**: Actions, agents, workflows, and commands are all `ToolSpec` objects — interchangeable in any context

## Examples

### Terminal Client

```bash
# Simple inference query
lm q "Say hello in three words"

# Generate a commit message (git plugin)
lm commit

# Execute shell command via agent (shell plugin)
lm shell "ls -la"
```

### Node.js: Using an Agent with Tools

```js
import { Agent, Lm } from "@agent-smith/agent";

const lm = new Lm({
    name: "openai",
    serverUrl: "http://localhost:8080/v1",
    apiKey: "",
    onToken: (t) => process.stdout.write(t),
});

const agent = new Agent({
    name: "my-agent",
    lm,
    onToken: (t) => process.stdout.write(t),
});

await agent.run("Hello, how are you?", {
    system: "You are a helpful assistant",
    tools: [weatherTool, trafficTool],
});
```

### WebSocket Client

```js
import { useWsServer } from "@agent-smith/wscli";

const ws = useWsServer({
    url: "ws://localhost:5184/ws",
    onToken: (t) => process.stdout.write(t),
});

await ws.connect();
await ws.executeAgent("my-agent", "Translate to German: Hello world");
```

## Requirements

Supported inference backends:

- [Llama.cpp](https://github.com/ggerganov/llama.cpp): the first class citizen
- Any OpenAI-compatible API server (OpenAI, LM Studio, etc.)

## Related Repositories

| Repository | Description |
|------------|-------------|
| [agent-smith-plugins](https://github.com/synw/agent-smith-plugins) | Plugin extensions: git, sqlite, fs, shell, search, video, autodoc |
| [agent-smith-ui](https://github.com/synw/agent-smith-ui) | Web interface for Agent Smith |

![Agent Smith](docsite/public/img/job.jpg)

*Agents processing a real-world job, thinking, working, and adapting.*

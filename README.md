# Agent Smith

A toolkit to create local first human friendly agents in the browser or terminal

![Agent Smith](docsite/public/img/agentsmith.png)

<details>
<summary>:books: Read the <a href="https://lynxai-team.github.io/agent-smith">documentation</a></summary>

 - [Terminal client](https://lynxai-team.github.io/agent-smith/terminal_client)
    - [Quickstart](https://lynxai-team.github.io/agent-smith/terminal_client/quickstart)
    - [Install](https://lynxai-team.github.io/agent-smith/terminal_client/install)
    - [Overview](https://lynxai-team.github.io/agent-smith/terminal_client/overview)
    - [Config](https://lynxai-team.github.io/agent-smith/terminal_client/config)
    - [Tasks](https://lynxai-team.github.io/agent-smith/terminal_client/tasks)
    - [Actions](https://lynxai-team.github.io/agent-smith/terminal_client/actions)
    - [Workflows](https://lynxai-team.github.io/agent-smith/terminal_client/workflows)
    - [Commands](https://lynxai-team.github.io/agent-smith/terminal_client/commands)
     - [Agents](https://lynxai-team.github.io/agent-smith/terminal_client/agents)
        - [Overview](https://lynxai-team.github.io/agent-smith/terminal_client/agents/overview)
        - [Tools call](https://lynxai-team.github.io/agent-smith/terminal_client/agents/tools_call)
        - [Mcp](https://lynxai-team.github.io/agent-smith/terminal_client/agents/mcp)
        - [Subagents](https://lynxai-team.github.io/agent-smith/terminal_client/agents/subagents)
        - [Tools routing](https://lynxai-team.github.io/agent-smith/terminal_client/agents/tools_routing)
 - [Architecture](https://lynxai-team.github.io/agent-smith/architecture)
    - [Overview](https://lynxai-team.github.io/agent-smith/architecture/overview)
    - [Feature-discovery](https://lynxai-team.github.io/agent-smith/architecture/feature-discovery)
    - [Database](https://lynxai-team.github.io/agent-smith/architecture/database)
    - [Tool-abstraction](https://lynxai-team.github.io/agent-smith/architecture/tool-abstraction)
    - [Callbacks](https://lynxai-team.github.io/agent-smith/architecture/callbacks)
 - [Libraries](https://lynxai-team.github.io/agent-smith/libraries)
     - [Types](https://lynxai-team.github.io/agent-smith/libraries/types)
        - [Get started](https://lynxai-team.github.io/agent-smith/libraries/types/get_started)
        - [Interfaces](https://lynxai-team.github.io/agent-smith/libraries/types/interfaces)
     - [Core](https://lynxai-team.github.io/agent-smith/libraries/core)
        - [Get started](https://lynxai-team.github.io/agent-smith/libraries/core/get_started)
        - [Configuration](https://lynxai-team.github.io/agent-smith/libraries/core/configuration)
        - [Feature-discovery](https://lynxai-team.github.io/agent-smith/libraries/core/feature-discovery)
        - [Tool-execution](https://lynxai-team.github.io/agent-smith/libraries/core/tool-execution)
        - [Mcp](https://lynxai-team.github.io/agent-smith/libraries/core/mcp)
     - [Agent](https://lynxai-team.github.io/agent-smith/libraries/agent)
        - [Get started](https://lynxai-team.github.io/agent-smith/libraries/agent/get_started)
        - [Tools](https://lynxai-team.github.io/agent-smith/libraries/agent/tools)
        - [Templates](https://lynxai-team.github.io/agent-smith/libraries/agent/templates)
        - [Supervision](https://lynxai-team.github.io/agent-smith/libraries/agent/supervision)
     - [Transient memory](https://lynxai-team.github.io/agent-smith/libraries/transient_memory)
        - [Get started](https://lynxai-team.github.io/agent-smith/libraries/transient_memory/get_started)
        - [Usage](https://lynxai-team.github.io/agent-smith/libraries/transient_memory/usage)
        - [Api](https://lynxai-team.github.io/agent-smith/libraries/transient_memory/api)
     - [Semantic memory](https://lynxai-team.github.io/agent-smith/libraries/semantic_memory)
        - [Get started](https://lynxai-team.github.io/agent-smith/libraries/semantic_memory/get_started)
        - [Initialize](https://lynxai-team.github.io/agent-smith/libraries/semantic_memory/initialize)
        - [Write operations](https://lynxai-team.github.io/agent-smith/libraries/semantic_memory/write_operations)
        - [Read operations](https://lynxai-team.github.io/agent-smith/libraries/semantic_memory/read_operations)
     - [Wscli](https://lynxai-team.github.io/agent-smith/libraries/wscli)
        - [Get started](https://lynxai-team.github.io/agent-smith/libraries/wscli/get_started)
        - [Api](https://lynxai-team.github.io/agent-smith/libraries/wscli/api)
 - [Plugins](https://lynxai-team.github.io/agent-smith/plugins)
    - [Overview](https://lynxai-team.github.io/agent-smith/plugins/overview)
    - [Filesystem](https://lynxai-team.github.io/agent-smith/plugins/filesystem)
    - [Search](https://lynxai-team.github.io/agent-smith/plugins/search)
    - [Shell](https://lynxai-team.github.io/agent-smith/plugins/shell)
     - [Code](https://lynxai-team.github.io/agent-smith/plugins/code)
        - [Git](https://lynxai-team.github.io/agent-smith/plugins/code/git)
        - [Sqlite](https://lynxai-team.github.io/agent-smith/plugins/code/sqlite)
 - [Server](https://lynxai-team.github.io/agent-smith/server)
    - [Get started](https://lynxai-team.github.io/agent-smith/server/get_started)
    - [Api](https://lynxai-team.github.io/agent-smith/server/api)
    - [Client-usage](https://lynxai-team.github.io/agent-smith/server/client-usage)
    - [Deployment](https://lynxai-team.github.io/agent-smith/server/deployment)

</details>

Check the :computer: [examples](examples)

## What is an Agent?

An agent is a language model that can take decisions. It can:

- **Think**: use language model servers to perform inference queries
- **Work**: manage long running workflows with multiple steps, using tools
- **Remember**: use semantic memory to store data
- **Interact**: perform interactions with the user

## Packages

| Version | Name | Description | Nodejs | Browser |
| --- | --- | --- | --- | --- |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/cli)](https://www.npmjs.com/package/@agent-smith/cli) | [@agent-smith/cli](https://github.com/lynxai-team/agent-smith/tree/main/packages/cli) | Terminal client | :white_check_mark: | :x: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/agent)](https://www.npmjs.com/package/@agent-smith/agent) | [@agent-smith/agent](https://github.com/lynxai-team/agent-smith/tree/main/packages/agent) | Agent runtime | :white_check_mark: | :white_check_mark: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/core)](https://www.npmjs.com/package/@agent-smith/core) | [@agent-smith/core](https://github.com/lynxai-team/agent-smith/tree/main/packages/core) | Runtime engine | :white_check_mark: | :white_check_mark: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/types)](https://www.npmjs.com/package/@agent-smith/types) | [@agent-smith/types](https://github.com/lynxai-team/agent-smith/tree/main/packages/types) | Shared interfaces | :white_check_mark: | :white_check_mark: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/smem)](https://www.npmjs.com/package/@agent-smith/smem) | [@agent-smith/smem](https://github.com/lynxai-team/agent-smith/tree/main/packages/smem) | Semantic memory | :white_check_mark: | :x: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/tmem)](https://www.npmjs.com/package/@agent-smith/tmem) | [@agent-smith/tmem](https://github.com/lynxai-team/agent-smith/tree/main/packages/tmem) | Transient memory | :white_check_mark: | :white_check_mark: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/wscli)](https://www.npmjs.com/package/@agent-smith/wscli) | [@agent-smith/wscli](https://github.com/lynxai-team/agent-smith/tree/main/packages/wscli) | WebSocket client | :white_check_mark: | :white_check_mark: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/server)](https://www.npmjs.com/package/@agent-smith/server) | [@agent-smith/server](https://github.com/lynxai-team/agent-smith/tree/main/server) | Koa server | :white_check_mark: | :x: |

[Terminal client plugins](https://github.com/lynxai-team/agent-smith-plugins)

## Philosophy

- **Composable**: the packages have limited responsibilities and can work together
- **Declarative**: focus on the business logic by expressing features simply
- **Explicit**: keep it simple and under user control: no hidden magic

## Requirements

Supported inference servers:

- [Llama.cpp](https://github.com/ggerganov/llama.cpp)
- Any OpenAI-compatible API server

## Getting started

Terminal client [quick start doc](https://lynxai-team.github.io/agent-smith/terminal_client/quickstart)

## Terminal client plugins

Plugins for the terminal client are available: [terminal client plugins](https://github.com/lynxai-team/agent-smith-plugins)

## Node.js Example: Using an Agent with Local Tools

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

## Server API Example

To execute an agent using the server WebSocket API:

```js
import { useWsServer } from "@agent-smith/wscli";

const ws = useWsServer({
    url: "ws://localhost:5184/ws",
    onToken: (t) => process.stdout.write(t),
});

await ws.connect();
await ws.executeAgent("my-agent", "Translate to German: Hello world");
```

![Agent Smith](docsite/public/img/job.jpg)

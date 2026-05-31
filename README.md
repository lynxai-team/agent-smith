# Agent Smith

A toolkit to create local first human friendly agents in the browser or terminal

![Agent Smith](docsite/public/img/agentsmith.png)

<details>
<summary>:books: Read the <a href="https://synw.github.io/agent-smith">documentation</a></summary>

 - [Architecture](https://synw.github.io/agent-smith/architecture)
 - [Libraries](https://synw.github.io/agent-smith/libraries)
     - [Agent](https://synw.github.io/agent-smith/libraries/agent)
        - [Get started](https://synw.github.io/agent-smith/libraries/agent/get_started)
        - [Tools](https://synw.github.io/agent-smith/libraries/agent/tools)
        - [Templates](https://synw.github.io/agent-smith/libraries/agent/templates)
        - [Supervision](https://synw.github.io/agent-smith/libraries/agent/supervision)
     - [Core](https://synw.github.io/agent-smith/libraries/core)
        - [Get started](https://synw.github.io/agent-smith/libraries/core/get_started)
        - [Configuration](https://synw.github.io/agent-smith/libraries/core/configuration)
        - [Feature discovery](https://synw.github.io/agent-smith/libraries/core/feature_discovery)
        - [Tool execution](https://synw.github.io/agent-smith/libraries/core/tool_execution)
     - [Types](https://synw.github.io/agent-smith/libraries/types)
        - [Get started](https://synw.github.io/agent-smith/libraries/types/get_started)
        - [Interfaces](https://synw.github.io/agent-smith/libraries/types/interfaces)
     - [Transient memory](https://synw.github.io/agent-smith/libraries/transient_memory)
        - [Get started](https://synw.github.io/agent-smith/libraries/transient_memory/get_started)
        - [Usage](https://synw.github.io/agent-smith/libraries/transient_memory/usage)
        - [Api](https://synw.github.io/agent-smith/libraries/transient_memory/api)
     - [Semantic memory](https://synw.github.io/agent-smith/libraries/semantic_memory)
        - [Get started](https://synw.github.io/agent-smith/libraries/semantic_memory/get_started)
        - [Initialize](https://synw.github.io/agent-smith/libraries/semantic_memory/initialize)
        - [Write operations](https://synw.github.io/agent-smith/libraries/semantic_memory/write_operations)
        - [Read operations](https://synw.github.io/agent-smith/libraries/semantic_memory/read_operations)
     - [WebSocket client](https://synw.github.io/agent-smith/libraries/wscli)
        - [Get started](https://synw.github.io/agent-smith/libraries/wscli/get_started)
        - [Usage](https://synw.github.io/agent-smith/libraries/wscli/usage)
 - [Terminal client](https://synw.github.io/agent-smith/terminal_client)
    - [Install](https://synw.github.io/agent-smith/terminal_client/install)
    - [Overview](https://synw.github.io/agent-smith/terminal_client/overview)
    - [Config](https://synw.github.io/agent-smith/terminal_client/config)
    - [Agents](https://synw.github.io/agent-smith/terminal_client/agents)
        - [Overview](https://synw.github.io/agent-smith/terminal_client/agents/overview)
        - [Tools call](https://synw.github.io/agent-smith/terminal_client/agents/tools_call)
        - [Mcp](https://synw.github.io/agent-smith/terminal_client/agents/mcp)
        - [Subagents](https://synw.github.io/agent-smith/terminal_client/agents/subagents)
        - [Tools routing](https://synw.github.io/agent-smith/terminal_client/agents/tools_routing)
    - [Actions](https://synw.github.io/agent-smith/terminal_client/actions)
    - [Workflows](https://synw.github.io/agent-smith/terminal_client/workflows)
    - [Commands](https://synw.github.io/agent-smith/terminal_client/commands)
 - [Plugins](https://synw.github.io/agent-smith/plugins)
    - [Overview](https://synw.github.io/agent-smith/plugins/overview)
    - [Inference](https://synw.github.io/agent-smith/plugins/inference)
    - [Vision](https://synw.github.io/agent-smith/plugins/vision)
    - [Filesystem](https://synw.github.io/agent-smith/plugins/filesystem)
     - [Code](https://synw.github.io/agent-smith/plugins/code)
        - [Git](https://synw.github.io/agent-smith/plugins/code/git)
 - [Server](https://synw.github.io/agent-smith/server)
    - [Get started](https://synw.github.io/agent-smith/server/get_started)
    - [Api](https://synw.github.io/agent-smith/server/api)

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
| [![pub package](https://img.shields.io/npm/v/@agent-smith/cli)](https://www.npmjs.com/package/@agent-smith/cli) | [@agent-smith/cli](https://github.com/synw/agent-smith/tree/main/packages/cli) | Terminal client | :white_check_mark: | :x: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/agent)](https://www.npmjs.com/package/@agent-smith/agent) | [@agent-smith/agent](https://github.com/synw/agent-smith/tree/main/packages/agent) | Agent runtime | :white_check_mark: | :white_check_mark: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/core)](https://www.npmjs.com/package/@agent-smith/core) | [@agent-smith/core](https://github.com/synw/agent-smith/tree/main/packages/core) | Runtime engine | :white_check_mark: | :white_check_mark: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/types)](https://www.npmjs.com/package/@agent-smith/types) | [@agent-smith/types](https://github.com/synw/agent-smith/tree/main/packages/types) | Shared interfaces | :white_check_mark: | :white_check_mark: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/smem)](https://www.npmjs.com/package/@agent-smith/smem) | [@agent-smith/smem](https://github.com/synw/agent-smith/tree/main/packages/smem) | Semantic memory | :white_check_mark: | :x: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/tmem)](https://www.npmjs.com/package/@agent-smith/tmem) | [@agent-smith/tmem](https://github.com/synw/agent-smith/tree/main/packages/tmem) | Transient memory | :white_check_mark: | :white_check_mark: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/wscli)](https://www.npmjs.com/package/@agent-smith/wscli) | [@agent-smith/wscli](https://github.com/synw/agent-smith/tree/main/packages/wscli) | WebSocket client | :white_check_mark: | :white_check_mark: |
| [![pub package](https://img.shields.io/npm/v/@agent-smith/server)](https://www.npmjs.com/package/@agent-smith/server) | [@agent-smith/server](https://github.com/synw/agent-smith/tree/main/server) | Koa server | :white_check_mark: | :x: |

[Terminal client plugins](https://github.com/synw/agent-smith-plugins)

## Philosophy

- **Composable**: the packages have limited responsibilities and can work together
- **Declarative**: focus on the business logic by expressing features simply
- **Explicit**: keep it simple and under user control: no hidden magic

## Requirements

Supported inference servers:

- [Llama.cpp](https://github.com/ggerganov/llama.cpp)
- Any OpenAI-compatible API server

## Examples

### Terminal client

Simple inference query (using the [inference](https://synw.github.io/agent-smith/plugins/inference) plugin):

```bash
lm q list the planets of the solar system
```

Compare images (using the [vision](https://synw.github.io/agent-smith/plugins/vision) plugin):

```bash
lm vision img1.jpg img2.jpg "Compare the images"
```

Generate a commit message in a git repository (using the [git](https://synw.github.io/agent-smith/plugins/code/git) plugin):

```bash
lm commit
```

## Terminal client plugins

Plugins for the terminal client are available: [terminal client plugins](https://github.com/synw/agent-smith-plugins)

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

# Agent Smith — Project Navigation

> **Purpose**: Single-reference map for AI coding agents to understand, navigate, and modify the Agent Smith codebase.
> **Role**: Comprehensive navigation map with dependency graph, task references, and code snippets.
> **See also**: `/workspace/agent-smith/.agents/documentation/decision-tree.md` to find the right doc for your task.
> **See also**: `/workspace/agent-smith/.agents/documentation/project-overview.md` for concise overview (~1 page).

---

## Project Overview

Agent Smith is a **local-first AI agent framework** built as a TypeScript monorepo. It enables thinking (LLM inference via OpenAI-compatible backends), working (tool calling through a unified abstraction), remembering (semantic + transient memory), and interacting (CLI, WebSocket server, web dashboard). The project spans 5 repositories: the core runtime, plugins, UI, apps, and a Lynx AI coding agent layer.

| Repo | Path | Purpose |
|------|------|---------|
| `agent-smith` | `/workspace/agent-smith/` | Runtime packages (8), dual servers (Go + Node/Koa), docsite, examples, maintenance |
| `agent-smith-plugins` | `/workspace/agent-smith-plugins/` | Feature plugins: git, sqlite (code); fs, shell (system); search, video (web) |
| `agent-smith-ui` | `/workspace/agent-smith-ui/` | Vue 3 + PrimeVue web dashboard with 20+ components, 6 themes, history management |
| `agent-smith-apps` | `/workspace/agent-smith-apps/` | Dashboard extensions (debate app with multi-agent coordination via modprompt) |
| `lynx-coder` | `/workspace/lynx-coder/` | Lynx AI coding agents (18 YAML agents, 3 skills, actions) |

---

## Architecture Principles

- **Feature Discovery**: YAML/JS features scanned from filesystem directories, registered in SQLite (17 tables) at runtime — zero hardcoded defaults
- **Tool Abstraction**: Actions, agents, workflows, and commands unified as `ToolSpec` with `# tool` docblock metadata, parsed by `extractToolDoc()`
- **Reactive State**: Vue `ref`/`reactive` manages cross-module state — agents, UI, and server share reactivity via `@vue/reactivity`
- **Callback Events**: `InferenceCallbacks` stream tokens, thinking phases, and tool calls in real-time over WebSocket
- **Database-Driven Runtime**: Better-sqlite3 stores all configuration — features, backends, plugins, tools, settings, workspaces
- **Dual Server Architecture**: Node/Koa provides REST + WebSocket for browser clients; Go/Echo provides lightweight headless execution with its own CLI
- **Plugin Architecture**: Plugins extend CLI features from filesystem directories, auto-discovered and registered at runtime

---

## Dependency Graph

```
agent-smith (root)
├── packages/
│   ├── types/ (leaf — shared interfaces, no runtime)
│   ├── core/ → types
│   │   ├── db/ (schemas, read, write, connection)
│   │   ├── actions/ (cmd, read — tool execution engine)
│   │   ├── features/actions/ (load-skill, load-task, notify-user, run-agent, run-collaborator, run-worker, show-feature)
│   │   ├── workflows/ (cmd, read — workflow handlers)
│   │   ├── agents/ (cmd, conf, files, read, useagent)
│   │   ├── adaptaters/ (cmd)
│   │   ├── state/ (state, backends, tasks, features, plugins)
│   │   ├── utils/sys/ (execute, read, dirs, clipboard, python, conf, agents, cmds, features, yml)
│   │   └── mcp.ts (Model Context Protocol client)
│   ├── agent/ → types, core
│   │   ├── agent.ts (recursive tool-calling inference loop)
│   │   ├── client.ts (Lm client for OpenAI-compatible backends)
│   │   ├── history/ (history builder and display)
│   │   ├── stats.ts, tools.ts, variables.ts, params.ts
│   │   └── main.ts → exports { Lm, Agent }
│   ├── smem/ → types, core
│   │   ├── main.ts, smeminterfaces.ts
│   │   ├── useSmem.ts (LanceDB vector search factory)
│   │   └── useSnode.ts
│   ├── tmem/ → types, core
│   │   ├── main.ts, tmeminterfaces.ts
│   │   └── tmem.ts (localForage/IndexedDB key-value store)
│   ├── browser/ → types
│   │   ├── main.ts → exports { WllamaProvider, LmBrowserProviderParams }
│   │   └── wllama.ts (browser-side WLLAMA on-device inference)
│   ├── cli/ (leaf — Commander.js CLI, bin/cmd/*)
│   └── wscli/ → types, core
│       ├── interfaces.ts, main.ts
│       └── wllama.ts (WebSocket client with auto-reconnect)
├── server/
│   ├── node/ → types, core
│   │   ├── src/main.ts (Koa bootstrap)
│   │   ├── src/server/ (router, server, state)
│   │   └── src/routes/ (16 route files: agents, apps, backends, conf, folders, models, plugins, settings, skills, state, templates, tools, workflows, workspace, agent_settings, index)
│   └── go/ → types, core
│       ├── main.go (Echo server entry)
│       ├── httpserver/ (router.go, ws_handler.go)
│       ├── lm/ (cmd.go, utils.go)
│       ├── conf/, state/, types/, utils/, callbacks/
│       └── server.config.yaml
├── docsite/ (Vue 3 + Vite, @agent-smith/body, @agent-smith/brain, @agent-smith/jobs, @agent-smith/tfm)
│   ├── src/ (App.vue, router.ts, state.ts, services/, components/, pages/, widgets/)
│   └── public/doc/ (47+ docs across 6 sections: frontend, terminal_client, architecture, libraries, plugins, server)
├── examples/
│   ├── features/actions/ (traffic.js, weather.py)
│   ├── features/agents/ (fs-light-agent, fsrouting-agent, general-agent, mcp-fs-agent, ytvideo)
│   └── libraries/ (agent, task usage examples)
└── maintenance/
    ├── skills/ (document-agent-smith-package, update-doc-map)
    └── tasks/ (maintain-agent-docs, maintain-all-agent-docs)
```

---

## Packages / Modules

### `@agent-smith/types`
- **Purpose**: Shared TypeScript interfaces — all packages depend on this (leaf package, no runtime code)
- **Key files**: `src/main.ts` (re-exports all types), `src/{agent,callbacks,conf,core,history,inference,lm,model,stats,tools,verbosity,workspace,ws}.ts`
- **Key types**: `AgentSpec`, `ToolSpec`, `InferenceCallbacks`, `WsClientMsg`, `WsServerMsgType`, `ModelInfo`, `ConfigFile`, `FeatureType`, `McpServerSpec`, `AgentWorkflow`, `Settings`

### `@agent-smith/core`
- **Purpose**: Runtime engine — SQLite DB (17 tables), feature discovery, tool execution, MCP client, state management
- **Key files**: `src/main.ts`, `src/db/{db,schemas,read,write}.ts`, `src/conf.ts`, `src/mcp.ts`, `src/tools.ts`, `src/state/{state,backends,tasks,features,plugins}.ts`
- **Key types/classes**: `McpClient`, `executeAction()`, `executeWorkflow()`, `useAgentExecutor()`, `extractToolDoc()`
- **Feature loaders**: `features/actions/` — load-skill, load-task, notify-user, run-agent, run-collaborator, run-worker, show-feature
- **Workflow handlers**: `workflows/{cmd,read}.ts`

### `@agent-smith/agent`
- **Purpose**: Agent inference loop — recursive tool-calling with streaming SSE over OpenAI-compatible backends
- **Key files**: `src/agent.ts`, `src/client.ts`, `src/history/`, `src/stats.ts`, `src/tools.ts`, `src/variables.ts`, `src/params.ts`
- **Key types/classes**: `Agent` (recursive inference loop), `Lm` (backend client), `HistoryBuilder`

### `@agent-smith/smem`
- **Purpose**: Semantic memory — vector-based memory using LanceDB + Xenova embeddings (384-dim) with typed node storage
- **Key files**: `src/main.ts`, `src/useSmem.ts`, `src/useSnode.ts`, `src/smeminterfaces.ts`
- **Key types/classes**: `useSmem()` factory, `SmemNode`

### `@agent-smith/tmem`
- **Purpose**: Transient memory — lightweight key-value store wrapping IndexedDB via localForage
- **Key files**: `src/main.ts`, `src/tmem.ts`, `src/tmeminterfaces.ts`
- **Key types/classes**: `Tmem` factory, key-value operations

### `@agent-smith/browser`
- **Purpose**: Browser-side WLLAMA integration for on-device LLM inference
- **Key files**: `src/main.ts`, `src/wllama.ts`, `src/interfaces.ts`
- **Key types/classes**: `WllamaProvider`, `LmBrowserProviderParams`

### `@agent-smith/cli`
- **Purpose**: Terminal REPL — Commander.js CLI for agent execution and config management
- **Key files**: `bin/cmd/base.ts`, `bin/cmd/features.ts`, `bin/main.ts`
- **Key commands**: `lm` (agent execution), feature management, config updates

### `@agent-smith/wscli`
- **Purpose**: WebSocket client — real-time bidirectional server communication with auto-reconnect
- **Key files**: `src/main.ts`, `src/interfaces.ts`, `src/wllama.ts`
- **Key types/classes**: WebSocket client with reconnect, message type handling

---

## Server

### Node/Koa Server (`server/node/`)
- **Purpose**: HTTP + WebSocket server for browser client communication and remote agent execution
- **Entry point**: `src/main.ts` — Koa bootstrap with WebSocket upgrade and middleware pipeline
- **Routes** (`src/routes/`):
  | Route File | Purpose |
  |------------|---------|
  | `agents.ts` | Agent CRUD and execution |
  | `apps.ts` | Dashboard app management |
  | `backends.ts` | Inference backend configuration |
  | `conf.ts` | Configuration management |
  | `folders.ts` | Workspace folder operations |
  | `models.ts` | Model listing and management |
  | `plugins.ts` | Plugin discovery and management |
  | `settings.ts` | User settings persistence |
  | `skills.ts` | Skill registration and listing |
  | `state.ts` | Reactive state synchronization |
  | `templates.ts` | Agent template management |
  | `tools.ts` | Tool discovery and execution |
  | `workflows.ts` | Workflow management |
  | `workspace.ts` | Workspace operations |
  | `agent_settings.ts` | Agent-specific settings |
- **Server layer** (`src/server/`): `router.ts`, `server.ts`, `state.ts`

### Go/Echo Server (`server/go/`)
- **Purpose**: Lightweight alternative server with its own CLI for headless execution
- **Entry point**: `main.go` — Echo router, config loading, state management
- **HTTP/WebSocket** (`httpserver/`): `router.go`, `ws_handler.go`
- **LM CLI** (`lm/`): `cmd.go`, `utils.go`
- **Support**: `conf/`, `state/`, `types/`, `utils/`, `callbacks/`
- **Config**: `server.config.yaml`

---

## Plugins (`agent-smith-plugins/`)

- **Purpose**: Plugin system for extending CLI features — discovered from filesystem directories at runtime
- **Structure**:
  | Category | Plugins | Key File(s) |
  |----------|---------|-------------|
  | code | git, sqlite | `code/{git,sqlite}/` |
  | system | fs, shell | `system/{fs,shell}/` |
  | web | search, video | `web/{search,video}/` |
- **Build**: Each plugin has `dist/`, `package.json`; compiled from TypeScript sources

---

## UI (`agent-smith-ui/`)

- **Purpose**: Vue 3 + PrimeVue web dashboard for agent management with real-time streaming
- **Stack**: Vue 3, PrimeVue, Vite, Tailwind CSS, SCSS theming (6 themes)
- **Entry point**: `src/main.ts` → `App.vue`
- **Views** (`src/views/`):
  | View | Purpose |
  |------|---------|
  | `AppView.vue` | Main app shell |
  | `HomeView.vue` | Dashboard home |
  | `ConfigInitView.vue` | Initial configuration |
  | `ConfigView.vue` | Settings configuration |
  | `TaskRunView.vue` | Task execution |
  | `TaskViewView.vue` | Task listing/management |
  | `WorkflowView.vue` | Workflow management |
- **Components** (`src/components/`): `TheHeader.vue`, `TheSidebar.vue`, `sidebars/`
- **Widgets** (`src/widgets/`): `AutoTextarea.vue`, `FormatedToolCall.vue`, `HistoryTurnStatsBar.vue`, `LoadingSpinner.vue`, `ToolCallDetails.vue`, `TurnTitle.vue`, `icons/`
- **Services**: `services/notify.ts`
- **Apps**: `apps/debate.js` (multi-agent debate extension)
- **Router**: `src/router.ts`

---

## Apps (`agent-smith-apps/`)

- **Purpose**: Add-on Vue 3 applications for the Agent Smith dashboard
- **Structure**:
  | App | Path | Purpose |
  |-----|------|---------|
  | `@agent-smith/app-debate` | `debate/` | Multi-agent debate with coordination via modprompt, Mermaid diagrams |

---

## Code Snippets

### YAML Agent Definition
```yaml
# examples/features/agents/general-agent.yml
description: "General agent: sandboxed shell access and filesystem write"
category: system
prompt: |-
    {prompt}
model: qwen4b
inferParams:
    min_p: 0
    top_k: 20
    top_p: 0.95
    temperature: 0.4
toolsList:
  - shell
  - python
  - searchweb
```

### JavaScript Action/Tool
```javascript
// examples/features/actions/traffic.js
/*
# tool
name: traffic
description: Get the current road traffic conditions
arguments:
    city:
        description: The city or location
        required: true
*/
async function action(args) {
    return { "traffic": "normal" }
}
export { action }
```

### Programmatic Agent Usage
```javascript
import { Agent, Lm } from "@agent-smith/agent";

const lm = new Lm({ serverUrl: "http://localhost:8080/v1" });
const agent = new Agent({
    lm,
    onToken: (t) => process.stdout.write(t),
    onThinkingToken: (t) => console.log(`[thinking] ${t}`),
});

const result = await agent.run("Hello, explain quantum computing", {
    model: "qwen4b",
    params: { stream: true, temperature: 0.6, top_k: 40, max_tokens: 2048 }
});
```

### Semantic Memory Usage
```javascript
import { useSmem } from "@agent-smith/smem";

const smem = await useSmem({
    embeddingModel: "all-MiniLM-L6-v2",
    dimension: 384,
});

await smem.write("Hello world", { id: "msg-1", metadata: { role: "user" } });
const results = await smem.read("greeting", { topK: 5 });
```

### WebSocket Client Usage
```javascript
import { WsClient } from "@agent-smith/wscli";

const ws = new WsClient("ws://localhost:8080/ws");
ws.onmessage = (msg) => console.log("Server:", msg);
ws.onopen = () => ws.send({ type: "agent_run", prompt: "Hello" });
```

---

## Navigation Quick Reference

| Task | Go To |
|------|-------|
| Add a new agent | `agent-smith/examples/features/agents/*.yml` or `packages/agent/src/agent.ts` |
| Create a tool/action | `agent-smith/examples/features/actions/*` (.js/.py with `# tool` docblock) |
| Define a workflow | YAML file chaining actions/agents — see `packages/core/src/workflows/` |
| Change inference backend | `packages/core/src/state/backends.ts` + config YAML |
| Modify WebSocket protocol | `packages/types/src/ws.ts` → `server/node/src/routes/` |
| Add CLI command | `packages/cli/bin/cmd/*.ts` |
| Extend UI routes/views | `agent-smith-ui/src/views/` + `agent-smith-ui/src/router.ts` |
| Add a plugin | `agent-smith-plugins/{code,system,web}/` |
| Create a dashboard app | `agent-smith-apps/debate/` as reference template |
| Use Lynx coding agents | `lynx-coder/dist/agents/*.yml` + `lynx-coder/dist/skills/` |
| Configure MCP servers | `packages/core/src/mcp.ts` + `packages/types/src/core.ts` (McpServerSpec) |
| Manage SQLite schema | `packages/core/src/db/schemas.ts` (17 tables) |
| Add a theme | `agent-smith-ui/src/scss/` (6 themes: black, white, etc.) |
| Run Go server CLI | `server/go/lm/cmd.go` |
| Write documentation | `agent-smith/docsite/src/pages/` + `agent-smith/docsite/public/doc/` |

---

## Documentation Links

| Resource | Path |
|----------|------|
| Decision tree (find the right doc) | `/workspace/agent-smith/.agents/documentation/decision-tree.md` |
| Project overview (~1 page) | `/workspace/agent-smith/.agents/documentation/project-overview.md` |
| Root codebase summary | `/workspace/agent-smith/.agents/documentation/codebase-summary.md` |
| Documentation map | `/workspace/agent-smith/.agents/documentation/documentation-map.md` |
| Per-package: types | `/workspace/agent-smith/packages/types/.agents/documentation/codebase-summary.md` |
| Per-package: core | `/workspace/agent-smith/packages/core/.agents/documentation/codebase-summary.md` |
| Per-package: agent | `/workspace/agent-smith/packages/agent/.agents/documentation/codebase-summary.md` |
| Per-package: smem | `/workspace/agent-smith/packages/smem/.agents/documentation/codebase-summary.md` |
| Per-package: tmem | `/workspace/agent-smith/packages/tmem/.agents/documentation/codebase-summary.md` |
| Per-package: cli | `/workspace/agent-smith/packages/cli/.agents/documentation/codebase-summary.md` |
| Per-package: wscli | `/workspace/agent-smith/packages/wscli/.agents/documentation/codebase-summary.md` |
| UI summary | `/workspace/agent-smith-ui/.agents/documentation/codebase-summary.md` |
| UI code style | `/workspace/agent-smith-ui/.agents/documentation/code_style_guidelines.md` |
| UI CSS style | `/workspace/agent-smith-ui/.agents/documentation/css-style-guide.md` |
| Plugins summary | `/workspace/agent-smith-plugins/.agents/documentation/codebase-summary.md` |
| Apps summary | `/workspace/agent-smith-apps/.agents/documentation/codebase-summary.md` |
| Lynx Coder summary | `/workspace/lynx-coder/.agents/documentation/codebase-summary.md` |
| Go server docs | `/workspace/agent-smith/server/go/AGENTS.md` |
| Node server docs | `/workspace/agent-smith/server/node/AGENTS.md` |
| Full docsite | `/workspace/agent-smith/docsite/public/doc/` (47+ docs, 6 sections) |
| Docsite source | `/workspace/agent-smith/docsite/src/` (Vue 3 app) |
| Examples | `/workspace/agent-smith/examples/` (YAML agents, JS/Python actions, library usage) |
| Maintenance skills | `/workspace/agent-smith/maintenance/skills/` (document-agent-smith-package, update-doc-map) |
| Maintenance tasks | `/workspace/agent-smith/maintenance/tasks/` (maintain-agent-docs, maintain-all-agent-docs) |

---

## Key Conventions & Patterns

- **Tool definitions**: Tools defined in YAML (`.yml`), JavaScript/TypeScript (JSDoc comment-block with `# tool`), or Python (docstring) — all parsed by `extractToolDoc()` in `packages/core/src/tools.ts`
- **File naming**: Vue components use PascalCase (`TheHeader.vue`), TypeScript files use camelCase (`state.ts`), SCSS themes use kebab-case (`black.scss`), directories use kebab-case (`sidebars/`)
- **Import convention**: Always use `.js` extension for relative TypeScript imports (even though source files are `.ts`); use `@/` alias for `src/` in UI packages
- **State management**: Core packages use ES module singletons (`state.ts`, `tasks.ts`, etc.); UI uses Vue `reactive()` + `@vueuse/core` `useStorage()` for persisted state
- **Build patterns**: Simple packages use `tsc`; bundled libs use `rollup`; Vue apps use `vite build`; all output ESM to `dist/`
- **Feature discovery**: YAML/JS files scanned from user directories at runtime, registered in SQLite — no hardcoded feature defaults
- **Callback streaming**: All real-time output flows through `InferenceCallbacks` interface — tokens, thinking tokens, tool calls streamed to CLI or WebSocket clients
- **Plugin categories**: Plugins organized by category directory (`code/`, `system/`, `web/`) with auto-discovery from filesystem

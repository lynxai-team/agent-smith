# Agent Smith — Project Overview

> **Role**: Concise "what is this" for context loading (~1 page overview).
> **See also**: `.agents/documentation/decision-tree.md` to find the right doc for your task.
> **See also**: `.agents/documentation/project-nav.md` for detailed navigation and task references.

---

## What is Agent Smith?

Agent Smith is a **local-first AI agent framework** that enables thinking (LLM inference via OpenAI-compatible backends), working (tool calling through a unified abstraction), remembering (semantic + transient memory), and interacting (CLI, WebSocket server, web dashboard). It's built as a TypeScript monorepo with a plugin architecture where agents, tools, and workflows are defined as YAML or JavaScript and discovered from the filesystem at runtime.

---

## Core Capabilities

- **LLM Inference** — OpenAI-compatible backends (Ollama, llama.cpp, vLLM, OpenAI) with streaming SSE, configurable inference parameters
- **Tool Calling** — Unified `ToolSpec` abstraction; actions (JS/Python/YAML), agents, workflows, and commands all exposed as tools
- **Semantic Memory** — Vector-based memory using LanceDB + Xenova embeddings (384-dim) with generic typed node storage
- **Transient Memory** — Lightweight key-value store wrapping IndexedDB for ephemeral agent state
- **Multi-Modal UI** — Vue 3 + PrimeVue dashboard with real-time streaming, plugin apps, and 6 switchable themes

---

## Repository Structure

| Repo | Path | Purpose |
|------|------|---------|
| `agent-smith` | `/workspace/agent-smith/` | Runtime packages (7), Node.js/Koa server, Go server, docsite, examples |
| `agent-smith-plugins` | `/workspace/agent-smith-plugins/` | Feature plugins: agents, git, sqlite, fs, shell, search, video |
| `agent-smith-ui` | `/workspace/agent-smith-ui/` | Vue 3 + PrimeVue web dashboard for agent management |
| `agent-smith-apps` | `/workspace/agent-smith-apps/` | Dashboard extensions (debate app with multi-agent coordination) |
| `lynx-coder` | `/workspace/lynx-coder/` | Lynx AI coding agents (16 YAML agents, 3 skills, actions) |

---

## Runtime Packages (`agent-smith/packages/`)

| Package | Purpose |
|---------|---------|
| `@agent-smith/types` | Shared TypeScript interfaces (leaf package, no runtime code) |
| `@agent-smith/core` | Runtime engine: SQLite (17 tables), feature discovery, tool execution, MCP client |
| `@agent-smith/agent` | Agent inference loop: recursive tool-calling with streaming SSE |
| `@agent-smith/smem` | Semantic memory: LanceDB vector search with typed node storage |
| `@agent-smith/tmem` | Transient memory: key-value store wrapping IndexedDB |
| `@agent-smith/cli` | Terminal REPL: Commander.js CLI for agent execution and config |
| `@agent-smith/wscli` | WebSocket client: real-time bidirectional server communication |

---

## Key Architecture Patterns

- **Feature Discovery**: YAML/JS features scanned from filesystem directories, registered in SQLite at runtime — zero hardcoded defaults
- **Tool Abstraction**: Actions, agents, workflows, and commands unified as `ToolSpec` with `# tool` docblock metadata
- **Reactive State**: Vue `ref`/`reactive` manages cross-module state — agents, UI, and server share reactivity
- **Callback Events**: `InferenceCallbacks` stream tokens, thinking phases, and tool calls in real-time over WebSocket

---

## Quick Reference: Common Tasks

| Task | Go To |
|------|-------|
| Add a new agent | `agent-smith/examples/features/agents/*.yml` or `packages/agent/src/agent.ts` |
| Create a tool/action | `agent-smith/examples/features/actions/*` (.js/.py with `# tool` docblock) |
| Define a workflow | YAML file chaining actions/agents — see `agent-smith-plugins/*/dist/workflows/` |
| Change inference backend | `packages/core/src/state/backends.ts` + config YAML |
| Modify WebSocket protocol | `packages/types/src/ws.ts` → `server/src/callbacks.ts` |
| Add CLI command | `packages/cli/bin/cmd/base.ts` or `packages/cli/bin/cmd/features.ts` |
| Extend UI routes | `agent-smith-ui/src/apps/` plugin pattern + `agent-smith-ui/src/router.ts` |
| Use Lynx coding agents | `lynx-coder/dist/agents/*.yml` + `lynx-coder/dist/skills/` |

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

---

## Documentation Links

| Resource | Path |
|----------|------|
| Decision tree (find the right doc) | `.agents/documentation/decision-tree.md` |
| Navigation map (detailed) | `.agents/documentation/project-nav.md` |
| Root codebase summary | `agent-smith/.agents/documentation/codebase-summary.md` |
| Per-package summaries | `agent-smith/packages/<pkg>/.agents/documentation/codebase-summary.md` (7 packages) |
| UI summary | `agent-smith-ui/.agents/documentation/codebase-summary.md` |
| Plugins summary | `agent-smith-plugins/.agents/documentation/codebase-summary.md` |
| Apps summary | `agent-smith-apps/.agents/documentation/codebase-summary.md` |
| Lynx Coder summary | `lynx-coder/.agents/documentation/codebase-summary.md` |
| Full docsite | `agent-smith/docsite/public/doc/` (47+ files) |
| Examples | `agent-smith/examples/` (YAML agents, JS/Python actions, library usage) |

→ See `AGENTS.md` for full conventions summary.

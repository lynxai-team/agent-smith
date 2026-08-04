# Agent Smith

## Mission
Agent Smith is a local-first AI agent framework that enables thinking (LLM inference via OpenAI-compatible backends), working (tool calling through a unified abstraction), remembering (semantic + transient memory), and interacting (CLI, WebSocket server, web dashboard) across 5 interconnected repositories.

## Repositories

| Repo | Path | Purpose |
|------|------|---------|
| `agent-smith` | `/workspace/agent-smith/` | Core framework: 8 TypeScript packages, dual servers (Node/Koa + Go/Echo), CLI, examples, docsite |
| `agent-smith-plugins` | `/workspace/agent-smith-plugins/` | Plugin features for the CLI: shell, fs, search, video, git, sqlite, agents |
| `agent-smith-ui` | `/workspace/agent-smith-ui/` | Vue 3 + PrimeVue web dashboard with real-time streaming, 14 themes, and plugin apps |
| `agent-smith-apps` | `/workspace/agent-smith-apps/` | Extensible dashboard applications (e.g., debate app with multi-agent coordination) |
| `lynx-coder` | `/workspace/lynx-coder/` | Pre-built Lynx AI coding agents: 21 YAML agent definitions, 3 skills, custom actions |

## Conventions (for AI Agents)
- **Tool definitions**: Tools are defined in YAML (`.yml`), JavaScript (JSDoc `/* # tool ... */`), or Python (docstring `""" # tool ... """`) — all parsed by `extractToolDoc()` in `packages/core/src/tools.ts`
- **File naming**: Vue components use PascalCase (`TheHeader.vue`), TypeScript files use camelCase (`state.ts`), SCSS themes use kebab-case (`black.scss`), directories use kebab-case (`sidebars/`)
- **Import convention**: Always use `.js` extension for relative TypeScript imports (even though source files are `.ts`); use `@/` alias for `src/` in UI packages
- **State management**: Core packages use ES module singletons with `@vue/reactivity` (`state.ts`, `tasks.ts`, etc.); UI uses Vue `reactive()` + `@vueuse/core` `useStorage()` for persisted state
- **Build patterns**: Simple packages use `tsc`; bundled libs use `rollup`; Vue apps use `vite build`; all output ESM to `dist/`

## Quick Start for AI Agents
1. Read `/workspace/agent-smith/.agents/documentation/decision-tree.md` to find the right doc for your task
2. Read `/workspace/agent-smith/.agents/documentation/project-overview.md` for high-level context
3. Read `/workspace/agent-smith/.agents/documentation/project-nav.md` for detailed navigation and dependency graph
4. Navigate to the relevant repo/package and read its `/workspace/agent-smith/.agents/documentation/codebase-summary.md`

## Documentation
- `/workspace/agent-smith/.agents/documentation/decision-tree.md` — Quick guide: find the right doc for your task
- `/workspace/agent-smith/.agents/documentation/codebase-summary.md` — Top-level codebase summary
- `/workspace/agent-smith/.agents/documentation/project-overview.md` — Concise project overview (~1 page)
- `/workspace/agent-smith/.agents/documentation/project-nav.md` — Detailed navigation map with dependency graph
- `/workspace/agent-smith/.agents/documentation/documentation-map.md` — Full documentation index across all repos
- `/workspace/agent-smith/packages/types/.agents/documentation/codebase-summary.md` — @agent-smith/types summary
- `/workspace/agent-smith/packages/core/.agents/documentation/codebase-summary.md` — @agent-smith/core summary
- `/workspace/agent-smith/packages/agent/.agents/documentation/codebase-summary.md` — @agent-smith/agent summary
- `/workspace/agent-smith/packages/browser/.agents/documentation/codebase-summary.md` — @agent-smith/browser summary
- `/workspace/agent-smith/packages/cli/.agents/documentation/codebase-summary.md` — @agent-smith/cli summary
- `/workspace/agent-smith/packages/smem/.agents/documentation/codebase-summary.md` — @agent-smith/smem summary
- `/workspace/agent-smith/packages/tmem/.agents/documentation/codebase-summary.md` — @agent-smith/tmem summary
- `/workspace/agent-smith/packages/wscli/.agents/documentation/codebase-summary.md` — @agent-smith/wscli summary
- `/workspace/agent-smith-plugins/.agents/documentation/codebase-summary.md` — Plugins summary
- `/workspace/agent-smith-ui/.agents/documentation/codebase-summary.md` — UI summary
- `/workspace/agent-smith-ui/.agents/documentation/code_style_guidelines.md` — UI code style guidelines
- `/workspace/agent-smith-ui/.agents/documentation/css-style-guide.md` — UI CSS style guide
- `/workspace/agent-smith-apps/.agents/documentation/codebase-summary.md` — Apps summary
- `/workspace/lynx-coder/.agents/documentation/codebase-summary.md` — Lynx Coder summary
- `/workspace/agent-smith/server/go/AGENTS.md` — Go server agent docs
- `/workspace/agent-smith/server/node/AGENTS.md` — Node server agent docs (when created)
- `/workspace/agent-smith/packages/*/README.md` — Per-package READMEs (8 total)
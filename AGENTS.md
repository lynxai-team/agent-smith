# Agent Smith

## Mission
Agent Smith is a TypeScript-based AI agent framework that provides CLI tools, a web UI, a plugin system, and a dual Go/Node server architecture for running and managing AI agents with shell, browser, and web capabilities.

## Repositories

| Repo | Path | Purpose |
|------|------|---------|
| `agent-smith` | `/workspace/agent-smith/` | Core framework with 8 packages, dual servers (Go + Node/Koa), examples, and docsite |
| `agent-smith-plugins` | `/workspace/agent-smith-plugins/` | Plugin packages for CLI features (shell, fs, git, sqlite, video, search) |
| `agent-smith-ui` | `/workspace/agent-smith-ui/` | Vue 3 web UI frontend with 20+ components, theming, and history management |
| `agent-smith-apps` | `/workspace/agent-smith-apps/` | Add-on Vue 3 applications (e.g., debate app) |
| `lynx-coder` | `/workspace/lynx-coder/` | Lynx AI coding agent built on @agent-smith/core |

## Conventions (for AI Agents)
- **Tool definitions**: Tools are defined in YAML (`.yml`), JavaScript/TypeScript (comment-block JSDoc), or Python (docstring) — all parsed by `extractToolDoc()` in `packages/core/src/tools.ts`
- **File naming**: Vue components use PascalCase (`TheHeader.vue`), TypeScript files use camelCase (`state.ts`), SCSS themes use kebab-case (`black.scss`), directories use kebab-case (`sidebars/`)
- **Import convention**: Always use `.js` extension for relative TypeScript imports (even though source files are `.ts`); use `@/` alias for `src/` in UI packages
- **State management**: Core packages use ES module singletons (`state.ts`, `tasks.ts`, etc.); UI uses Vue `reactive()` + `@vueuse/core` `useStorage()` for persisted state
- **Build patterns**: Simple packages use `tsc`; bundled libs use `rollup`; Vue apps use `vite build`; all output ESM to `dist/`

## Quick Start for AI Agents
1. Read `.agents/documentation/decision-tree.md` to find the right doc for your task
2. Read `.agents/documentation/project-overview.md` for high-level context
3. Read `.agents/documentation/project-nav.md` for detailed navigation and dependency graph
4. Navigate to the relevant repo/package and read its `.agents/documentation/codebase-summary.md`

## Documentation
- `.agents/documentation/codebase-summary.md` — Top-level codebase summary
- `.agents/documentation/documentation-map.md` — Navigation map for agent-smith root
- `agent-smith-plugins/.agents/documentation/codebase-summary.md` — Plugins summary
- `agent-smith-ui/.agents/documentation/codebase-summary.md` — UI summary
- `agent-smith-ui/.agents/documentation/code_style_guidelines.md` — UI code style guidelines
- `agent-smith-ui/.agents/documentation/css-style-guide.md` — UI CSS style guide
- `agent-smith-apps/.agents/documentation/codebase-summary.md` — Apps summary
- `lynx-coder/.agents/documentation/codebase-summary.md` — Lynx Coder summary
- `server/go/AGENTS.md` — Go server agent docs
- `server/node/AGENTS.md` — Node server agent docs
- `packages/*/README.md` — Per-package READMEs (8 total)
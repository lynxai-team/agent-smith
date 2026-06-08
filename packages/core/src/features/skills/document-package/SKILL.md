---
name: document-package
description: use when asked to create or update package documentation in the docsite
---

This skill describes the workflow to document a package for the Agent Smith CLI.

## Workflow

Execute this one step after the other:

1. **Locate the package** — Read `.agents/documentation/codebase-summary.md` to find the package path

2. **Read codebase summary** — Read `[package-path].agents/documentation/codebase-summary.md` (e.g., `agent-smith-plugins/system/shell/.agents/documentation/codebase-summary.md`). This provides a quick overview of tools, agents, dependencies, and architecture.

3. **Read source code** — Inspect `src/actions/`, `dist/agents/*.yml`, `dist/tasks/*.yml` to identify tools, agents, and capabilities.

4. **Find next number** — List existing docs in `agent-smith/docsite/public/doc/plugins/`. Use the next available number (e.g., if 1-8 exist, use 9).

5. **Write the doc** at `agent-smith/docsite/public/doc/plugins/<N>.<name>.md` using this exact structure:

```markdown
# <PackageName>

![pub package](https://img.shields.io/npm/v/@agent-smith/feat-<name>)

One-line description of what the package does.

## Install

```bash
npm i -g @agent-smith/feat-<name>
```

Add the package to your `config.yml` file and run the `conf` command:

```yml
plugins:
  - "@agent-smith/feat-<name>"
```

```bash
lm conf
```

## Actions and tools

### <category>

Available tools:

- <kbd>tool-name</kbd> one-line description of what it does (include container image if applicable)

## Agents

Available agents:

- <kbd>agent-name</kbd> one-line description. Lists tools used:
    - `tool-a` — purpose
    - `tool-b` — purpose

## Example agent

```yaml
description: A brief description
model: qwen4b
toolsList:
  - agent-name # this tool is a subagent
```

## Links

Add a next page link. All internal links must be of this form:

<a href="javascript:openLink('/plugins/overview')">Back: Overview</a>
```

## Rules

- Keep it short and information-dense — match the style of `6.filesystem.md` and `8.search.md`
- Use `<kbd>tool-name</kbd>` for all tools/agents
- Use backticks `for tool names in prose
- End with navigation link to overview (or next package if known)

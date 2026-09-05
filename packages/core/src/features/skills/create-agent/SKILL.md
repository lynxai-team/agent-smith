---
name: create-agent
description: use when asked to create, define, or modify an agent in YAML for Agent Smith, optionally exposes it as a subagent tool
---

# Create an Agent in YAML

Define, register, and verify an AI agent from a YAML file in the Agent Smith framework.

## Workflow

1. **Ensure a registered features directory** (first time only) — edit the conf file to add your `features/` root path, then run `lm conf`. The conf file lists the directories the framework scans for feature files; it is the source of truth for feature paths.
2. **Write the agent YAML** — create `<name>.yml` in `features/agents/`. The filename becomes the agent's default name (e.g., `my-agent.yml` → agent `my-agent`). Fill in the required fields (`description`, `prompt`, `model`) plus any optional ones from the field reference below.
3. **Register** — run `lm update`. This triggers feature discovery: it scans registered directories, parses agent metadata, and upserts into the `agent` SQLite table (and creates `ToolSpec` entries in the `tool` table).
4. **(Optional) Expose as a subagent** — add a `tool:` section to the YAML so other agents can call it, then run `lm update` again.
5. **Verify**:

```bash
lm agents                    # agent appears in the list
lm my-agent "Hello"           # runs the agent interactively
```

## Field reference

Required: `name` (from filename), `prompt` (system prompt template; `{prompt}` = user input), `description`, `model` (e.g., `qwen4b`).

Optional: `category` (UI navigation), `template` (system prompt, stop sequences), `inferParams` (sampling: `temperature`, `top_p`, `top_k`, `min_p`, `repetition_penalty`), `variables` (input variable definitions with `required:`/`optional:`), `toolsList` (references to registered tools by name), `tools` (inline tool definitions), `models` (alternative models for UI selection), `shots` (few-shot examples), `skills`, `workflow` (pre/post steps), `mcp`.

## Examples

Minimal agent:

```yaml
description: "My first agent"
category: myagents/general
prompt: |-
    User query: {prompt}
model: qwen4b
```

Full annotated example:

```yaml
# features/agents/my-coder.yml
description: "A coding agent with file and shell access"
category: development/coding
prompt: |-
    {prompt}
template:
    system: |-
      You are a coding agent. Follow instructions precisely.
      Report back with a short summary when done.
model: qwen35b
inferParams:
    min_p: 0
    top_k: 20
    top_p: 0.85
    temperature: 0.6
    repetition_penalty: 1
variables:
  required:
    workspace:
      description: The local directory path where to operate
toolsList:
  - read-file
  - write-file
  - edit-search-replace
  - shell
```

Subagent (callable by other agents) — add a `tool:` section defining the interface:

```yaml
# features/agents/my-search.yml
tool:
  name: my-search
  description: Perform web search and return results
  arguments:
    prompt:
      description: The search query or question
      required: true
description: "A web search agent"
prompt: |-
    Research the following: {prompt}
model: qwen4b
toolsList:
  - ddsearch
  - openpage
```

Other agents reference it by its tool name in their `toolsList` (e.g., `- my-search`), then run `lm update`.

## Gotchas

- Simply running `lm conf` without first editing the conf file will NOT add a new features directory — the conf file is the source of truth for feature paths.
- Every change to an agent's tool list requires re-registration: after adding, removing, or modifying entries in `toolsList` (or inline `tools`), run `lm update` again — the agent will not see new tools until then.
- A subagent is NOT usable until registered: the `tool:` section only defines the interface; `lm update` creates the `ToolSpec` entry in the `tool` table that makes it callable. Without this step, parent agents referencing it in their `toolsList` get a "tool not found" error.
- Renaming the YAML file changes the agent's default name — keep filenames stable or update references in other agents' `toolsList`.

## References (load when needed)

- Full schema and field-by-field guide: `agent-smith/docsite/public/doc/reference/1.howto-agents.md`
- Minimal example agent: `agent-smith/examples/features/agents/general-agent.yml`
- Complex real-world example with template, variables, tools: `lynx-coder/dist/agents/lx-coder.yml`
- Feature discovery pipeline internals: `agent-smith/docsite/public/doc/libraries/core/3.feature-discovery.md`

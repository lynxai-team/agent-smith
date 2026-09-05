---
name: create-workflow
description: use when asked to create, define, or modify a workflow in Agent Smith - writes the .yml file in features/workflows/, chains actions/agents/adaptaters/commands, registers it with lm update so it runs as `lm <name>` and can be exposed as an agent tool
---

# Create a Workflow

Define, register, and verify a workflow (an ordered pipeline of actions, agents, adaptaters, and commands) from a YAML file in the Agent Smith framework.

## Workflow

1. **Ensure a registered features directory** (first time only) — edit the conf file to add your `features/` root path, then run `lm conf`. Workflows are discovered from the `workflows/` subdirectory of each registered path (same mechanism as agents/actions).
2. **Write the workflow YAML** — create `<name>.yml` in `features/workflows/`. The filename (without extension) becomes the workflow name and its CLI command. Only `steps` is required:

   ```yaml
   steps:
     - action: <action-name>
     - agent: <agent-name>
   ```

3. **Register** — run `lm update`. Feature discovery upserts the workflow into the `workflow` table, creates a CLI alias (so `lm <name>` works), and — if the YAML has a `tool:` section — registers a ToolSpec in the `tool` table so agents can call it.
4. **(Optional) Expose as an agent tool** — add a `tool:` section with `description` and `arguments`, then run `lm update` again. Other agents reference the workflow by name in their `toolsList`.
5. **Verify**:

   ```bash
   lm <name> [args...]     # runs the pipeline; args feed step 1
   lm <name> --debug       # prints each step as it runs
   ```

## Step types

Each entry in `steps:` is a single-key map naming a registered feature (executor: `agent-smith/packages/core/src/workflows/cmd.ts`):

| Key | Runs | Receives |
|-----|------|----------|
| `action` | an action (.js/.py/.yml) | step 1: CLI args array; later steps: the whole accumulated context object |
| `agent` | a registered agent | its prompt (see Data flow) |
| `adaptater` | a JS data adapter (`.js` only, exports async `action`) | same as action |
| `command` (or `cmd`) | a user command from `cmds/` (.js exporting `runCmd`) | same as action |

## When steps reference features that don't exist yet

Create them first using the matching sibling skill — load it with the `load-skill` tool before writing the file: `create-action`, `create-agent-yaml`, `create-adaptater`. Their gotchas (docblock placement, exports, registration) are what make workflows fail at run time.

## Data flow (how steps pass data)

All steps share one context object:

- **Step 1** receives the raw CLI args as an array — or, when the workflow is called as a tool by an agent, the tool arguments object.
- Each step's result is merged into the context: a **string/array result** lands in `context.args`; an **object result** adds its keys to the context. On key collision the *existing* context value wins (later results cannot overwrite earlier keys).
- An **agent step needs a `prompt`**:
  - step 1: from the first CLI arg (or `params.prompt` when called as a tool);
  - later steps: from a `prompt` key in the context — i.e. the previous step must return an object containing `prompt`. Exception: if the previous step was an `action` that returned a **string**, that string becomes the prompt (via `context.args`).
- An agent's own output is merged as `text` (plus `thinkingText`, `stats`) — **not** as `prompt`.

Consequences:
- To feed CLI args into an agent, start with an adaptater that returns `{ prompt: ... }` (see examples).
- To chain agent → agent, insert an adaptater/action between them that renames the previous `text` to `prompt`; two adjacent agent steps fail with "provide a prompt for the task".

## Adaptaters

Declared in an `adaptaters/` folder (`.js` only), they transform data between steps:

```js
// adaptaters/prequery.js
async function action(params, options) {
    return { prompt: Array.isArray(params) ? params.join(" ") : params.prompt };
}
export { action };
```

## Field reference

- `steps` (required): ordered list of step entries.
- `title` (optional): human-readable label; the workflow's name always comes from the filename.
- `tool` (optional): exposes the workflow as a callable tool — `description` + `arguments` define the interface other agents see when calling it; the tool name is the filename.

## Examples

Minimal (action returns a string → becomes the agent prompt):

```yaml
# features/workflows/commit_msg.yml
title: "Generate a git commit message from a git diff"
steps:
  - action: git_diff        # returns the diff string -> context.args
  - agent: commit_msg       # prompt = that string
```

Adaptater-first (normalize CLI args for an agent):

```yaml
# features/workflows/q.yml
steps:
  - adaptater: prequery     # CLI args array -> { prompt: "..." }
  - agent: infer            # prompt from context
```

Full pipeline exposed as an agent tool (adaptater → agent → action):

```yaml
# features/workflows/sqlquery.yml
tool:
  description: Read data or write in the database. Schema-aware read/write.
  arguments:
    prompt:
      description: The question to ask about the data
steps:
  - adaptater: db-getschema      # returns { prompt, schema }
  - agent: db-create-query       # prompt from context; declares {schema} variable; outputs SQL as text
  - action: db-ask-execute-query # receives whole context, reads args.text + options.variables.dbpath
```

Then in another agent's YAML add `toolsList: [sqlquery]` and run `lm update`.

## Gotchas

- **Agent steps after the first need a `prompt` in the context** or you get "provide a prompt for the task <name>". Agent output is stored under `text`, so agent → agent needs an intermediate adaptater/action returning `{ prompt: ... }`.
- **Step 1 sees raw CLI args as an array**, not an object — design step 1 (often an adaptater) to normalize them; later steps see the accumulated context object.
- **Context keys cannot be overwritten** by later steps (`{...result, ...context}` merge order) — give each step's returned keys distinct names.
- **The name is the filename.** Renaming the `.yml` file changes the workflow's CLI command and breaks any agent `toolsList` referencing it.
- **Every change requires `lm update`** — new/edited workflows, step lists, or `tool:` sections are not picked up until re-registration; a `tool:` section without re-registration leaves callers with "tool not found".
- **Adaptaters must be `.js` exporting an async `action(args, options)` function**; other extensions are not discovered.

## References (load when needed)

- Workflow executor (step types + data flow): `agent-smith/packages/core/src/workflows/cmd.ts`
- Workflow YAML parser: `agent-smith/packages/core/src/workflows/read.ts`
- Feature discovery (dirs, tables, `lm update` pipeline): `agent-smith/docsite/public/doc/libraries/core/3.feature-discovery.md`
- User-facing workflow doc: `agent-smith/docsite/public/doc/terminal_client/7.workflows.md`
- Real examples: `agent-smith-plugins/code/git/dist/workflows/git_commit.yml`, `agent-smith-plugins/code/sqlite/dist/workflows/sqlquery.yml`, `agent-smith-plugins/agents/dist/workflows/q.yml`

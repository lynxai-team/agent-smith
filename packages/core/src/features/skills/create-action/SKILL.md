---
name: create-action
description: use when asked to create, define, or modify an action in Agent Smith - writes the .js/.py/.yml file in features/actions/, adds the # tool docblock so agents can call it as a tool, and registers it with lm update
---

# Create an Action

Define, register, and verify an action — a unit of work (JS/Python code or a wrapped shell command) that workflows and agents can call.

## Workflow

1. **Ensure a registered features directory** (first time only) — edit the conf file to add your `features/` root path, then run `lm conf`. Actions are discovered from the `actions/` subdirectory of each registered path (same mechanism as agents/workflows).
2. **Write the action file** — create `<name>.js` in `features/actions/` (default), or `.py` for a Python script / `.yml` to wrap a shell command. The filename without extension becomes the action name.
3. **Expose it as an agent tool** — add a `# tool` docblock at the very top of the file (see Tool docblock). Without it the action still runs from workflows, but agents cannot call it.
4. **Register** — run `lm update`. Discovery upserts the action into the `action` table; with a docblock it also upserts a ToolSpec into the `tool` table.
5. **(Optional) Give it to an agent** — add the action name to the agent's `toolsList`, then run `lm update` again.
6. **Verify**:
   - `lm update` output lists `- actions: <name>` (and `- tools: <name>` when exposed).
   - Run it through a one-step workflow (`steps: [- action: <name>]`) with `lm <workflow> [args...]`, or call it from an agent that has it in its `toolsList`.

## Formats

### JavaScript (.js) — default

ESM module exporting an async `action(args, options)` function. The docblock (first comment in the file) declares the tool interface:

```js
/*
# tool
name: traffic
description: Get the current road traffic conditions
arguments:
    city:
        description: The city or location, e.g. San Francisco, CA
        required: true
*/

async function action(args, options) {
    const city = Array.isArray(args) ? args[0] : args.city;
    return { traffic: "normal", city };
}

export { action }
```

- `args` shape depends on the caller: **string array** (CLI / first workflow step), **tool arguments object** with the docblock's keys (agent tool call), or the **workflow context object** (later steps) — handle both.
- `options` carries run flags: `debug`, `verbose`, `isToolCall` when called by an agent.
- Return a string or object; in workflows an object's keys are merged into the shared context.
- To run shell commands from JS use `utils.execute(cmd, args)` — `import { utils } from "@agent-smith/core"` (see `git_diff.js` example).

### YAML (.yml) — wrap a system command

```yaml
# features/actions/ocr.yml
tool:
  name: ocr
  description: Run OCR on an image file
  arguments:
      path:
          description: Path to the image file
          required: true
cmd: /home/me/app/.venv/bin/python
args:
  - "/home/me/app/ocr.py"
```

- `cmd` plus optional static `args` (all strings); runtime args are appended after them, positionally.
- Result is the trimmed stdout string of the command.

### Python (.py)

Plain script run with `python3`; arguments arrive in `sys.argv[1:]`:

```python
"""
# tool
name: weather
description: Get the current weather
arguments:
    city:
        description: The city or location, e.g. San Francisco, CA
        required: true
"""

import sys

print(f'{{"temp": 18, "city": "{sys.argv[1]}"}}')
```

Result is the printed stdout as a string.

## Tool docblock

The docblock is what makes an action callable by agents; it defines the ToolSpec (name, description, arguments) that other agents see.

- **JS**: file must start with `/*` on line 1 and `# tool` on line 2; content up to the closing `*/` is parsed as YAML.
- **Python**: same, but the opening marker is a triple-quote docstring (`"""` on line 1).
- **YAML**: a top-level `tool:` section instead of a comment.
- Fields: `name` (overridden by the filename — keep it for documentation), `description`, `arguments` (map of arg name → `{ description, required }`).

## Gotchas

- **The docblock must be the first bytes of the file** — the parser checks the file starts with `/*\n# tool` (JS) or `"""\n# tool` (Python). An import, shebang, or comment before it silently disables tool registration: the action still works from workflows, but agents get "tool <name> not found for agent ...".
- **Docblock content is parsed as YAML** — write `key: value` and nested maps, not JS/JSON object syntax.
- **The docblock `name` is overridden by the filename** — renaming the file renames the tool and breaks every agent `toolsList` referencing it.
- **Python actions return raw stdout string** — printing JSON does not make it structured; if a later workflow step needs keys, use a JS action or an adaptater that parses the output.
- **YAML action args are all strings, appended after static `args:`** — design the wrapped command to accept them positionally; only trimmed stdout becomes the result (stderr is lost).
- **JS actions must export exactly `action`** (async function) as ESM — the module is dynamically imported and called at run time; a different export name fails only when the action runs, not at registration.
- **Every change requires `lm update`** — new files, edited docblocks, or new `toolsList` references are not picked up until re-registration.
- **Do not verify with `lm <action-name>`** — actions are not standalone CLI commands in the current CLI; run them through a workflow step or an agent tool call.

## References (load when needed)

- Action executor (extension dispatch, args handling per format): `agent-smith/packages/core/src/actions/cmd.ts`
- Tool docblock parser (`# tool` markers, YAML parsing, name override): `agent-smith/packages/core/src/tools.ts`
- Feature discovery (scans `actions/` for .yml/.js/.py, table registration): `agent-smith/docsite/public/doc/libraries/core/3.feature-discovery.md`
- User-facing action doc: `agent-smith/docsite/public/doc/terminal_client/6.actions.md`
- Real examples: `agent-smith/examples/features/actions/traffic.js`, `agent-smith/examples/features/actions/weather.py`, `agent-smith-plugins/code/git/dist/actions/git_diff.js`

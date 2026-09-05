---
name: create-adaptater
description: use when asked to create, define, or modify an adaptater (adapter) in Agent Smith - writes the .js file in features/adaptaters/, registers it with lm update so workflows can use it as a data transformation step between actions and agents
---

# Create an Adaptater

Define, register, and verify an adaptater — a JS data-transformation step that workflows run between actions and agents (normalize CLI args, reshape the shared context, prepare `prompt` for agent steps).

## Workflow

1. **Ensure a registered features directory** (first time only) — edit the conf file to add your `features/` root path, then run `lm conf`. Adaptaters are discovered from the `adaptaters/` subdirectory of each registered path (same mechanism as agents/actions/workflows).
2. **Write the adaptater file** — create `<name>.js` in `features/adaptaters/`; the filename without extension becomes the adaptater name. `.js` is the only supported extension. The file must be an ESM module exporting an async `action(args, options)` function (see Format).
3. **Register** — run `lm update`. Feature discovery upserts the adaptater into the `adaptater` table. No ToolSpec is created: unlike actions, adaptaters have no `# tool` docblock and cannot be called directly by agents.
4. **(Optional) Wire it into a workflow** — add `- adaptater: <name>` to `steps:` in a workflow YAML (typically step 1, or between two steps whose data formats don't match), then run `lm update` again.
5. **Verify**:
   - `lm update` output shows `+ [adaptater] <name> <path>` for the new file.
   - Run the workflow: `lm <workflow> [args...] --debug` — each step prints as it runs; if the adaptater is the final step, its result is printed to stdout.

## Format

ESM module exporting an async `action(args, options)` function:

```js
// features/adaptaters/prequery.js
async function action(params, options) {
    const prompt = Array.isArray(params) ? params.join(" ") : params.prompt;
    return { prompt };
}

export { action };
```

- `args` (first param): **string array** when the adaptater is step 1 of a workflow (raw CLI args; piped/clipboard/file input may be appended to the array), or the tool arguments object when the workflow is called as an agent tool; for later steps it is the **whole accumulated context object**. Handle both shapes.
- `options`: run flags — `debug`, `verbose`, `isToolCall` when called through an agent tool call.
- Return value: an **object** has its keys merged into the shared workflow context (existing context keys win); a **string/array** lands in `context.args`.

## Example

Goal: a workflow that takes CLI args and feeds them as prompt to an agent.

```yaml
# features/workflows/q.yml
steps:
  - adaptater: prequery   # ["list", "planets"] -> { prompt: "list planets" }
  - agent: infer          # picks up prompt from context
```

```js
// features/adaptaters/prequery.js
async function action(params, options) {
    const prompt = Array.isArray(params) ? params.join(" ") : params.prompt;
    return { prompt };
}

export { action };
```

`lm q list the planets of the solar system` ≡ `lm infer "list the planets of the solar system"`.

## Gotchas

- **Only `.js` files are discovered** — `.py`/`.yml` in `adaptaters/` are silently ignored (unlike actions, which support .yml/.js/.py).
- **The module must export exactly `action`** — the executor dynamically imports the file and calls the exported `action`; a different export name fails only at run time with a wrapped "executing js action: ..." error, not at registration.
- **No `# tool` docblock, no ToolSpec** — adaptaters cannot be called directly by agents; they exist only as workflow steps. Do not copy the action docblock pattern from the create-action skill.
- **No CLI alias** — `lm <adaptater-name>` does not work (aliases are created only for agents/actions/workflows); verify through a workflow step or programmatically.
- **Context keys cannot be overwritten** — object results merge as `{ ...result, ...context }`, so returned keys that already exist in the context are dropped; choose distinct key names (`prompt` to feed an agent step).
- **Step 1 sees raw CLI args as an array**, not an object — normalize in the adaptater (e.g. `params.join(" ")`); later steps see the accumulated context object.
- **Fail loudly** — throw on bad input, or return `{ error: ... }`; the executor throws a returned error and wraps thrown exceptions as `adaptater <name>: <e>`.
- **Every change requires `lm update`** — new/edited adaptaters or workflow step lists are not picked up until re-registration.

## References (load when needed)

- Adaptater executor (dynamic import, `action` call, error wrapping): `agent-smith/packages/core/src/adaptaters/cmd.ts`
- Workflow step dispatch + context merge (how an adaptater result flows to the next step): `agent-smith/packages/core/src/workflows/cmd.ts`
- Feature discovery (`adaptaters/` dir scan, `.js` only, `adaptater` table, no CLI alias): `agent-smith/docsite/public/doc/libraries/core/3.feature-discovery.md`
- User-facing doc with the prequery example: `agent-smith/docsite/public/doc/terminal_client/7.workflows.md`

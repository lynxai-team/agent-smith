---
name: update-codebase-summary
description: use when asked to create or update the codebase summary documentation
---

This skill describes the workflow to create or update a codebase documentation file (`[project-path].agents/documentation/codebase-summary.md`).

## Workflow

1. **Explore the project** — Walk the directory tree, identify package/module boundaries, read manifest files (e.g., `package.json`), locate entry points, and understand inter-module dependencies.

2. **Check for existing file** — Look for `[project-path].agents/documentation/codebase-summary.md` in the project directory. If it exists, update it. If not, create it.

3. **Write the file** using exactly these 7 sections in this order:

### Section Format

```markdown
# <module-name>

## Summary
One sentence: what the module does and why it exists.

## Dependencies
- `<dep-module>` — key types, functions, or services used
- External: `<library>` (<purpose>)

## Used By
- `<consumer-module>` — why it uses this module

## Entry Point
- `<path>` — one-line description of what it exports or provides

## Key Files
| File | Purpose |
|------|---------|
| `<src/path>` | One-line: what the file does conceptually |

## Architecture
- 2–4 bullet points on main design patterns and data flow.

## Related
- See `<related-module>` — how they work together

Keep the file as short and condensed as possible

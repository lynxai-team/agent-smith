# Task State: maintain-agent-docs

## Status: planned

## Project Context
- **Project:** Agent Smith
- **Scope:** Audit and maintain agent navigation docs for a single package/module
- **Task Type:** Solo task
- **Template Source:** Based on `maintain-all-agent-docs` (simplified for single package)

## Task Parameter
- **`package`** — [TO BE SET: name/path of the package to document]

## Progress

### Step 1: Resolve Package Path
- [] Map package parameter to directory path
- [] Identify target `codebase-summary.md` file path

### Step 2: Explore the Module
- [ ] Walk module directory tree
- [ ] Identify entry points, key files, dependencies
- [ ] Check for new/removed features

### Step 3: Check Existing Documentation
- [ ] Read existing `codebase-summary.md` (if exists)
- [ ] Identify gaps, inaccuracies, outdated information

### Step 4: Update or Create codebase-summary.md
- [ ] Write Summary (one sentence)
- [ ] Write Dependencies (internal + external)
- [ ] Write Used By section
- [ ] Write Entry Point
- [ ] Write Key Files table
- [ ] Write Architecture (2-4 bullets)
- [ ] Write Related Modules

### Step 5: Verify
- [ ] Format matches 7-section template
- [ ] Information is accurate and current
- [ ] Cross-references valid

## Skills to Use

| Skill | When |
|-------|------|
| `smart-explore` | Step 2 — explore module directory tree (excludes noise like `node_modules`, `.git`, build artifacts) |
| `update-codebase-summary` | Steps 3-4 — checking existing docs and updating module summary |

## Notes
- This task handles ONE package at a time
- For maintaining all packages, use `maintain-all-agent-docs` task instead
- The `package` parameter must be set before executing the task
- Use the "Available Modules" table in goals.md to resolve package paths

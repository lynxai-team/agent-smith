# Task Plan: maintain-agent-docs

> **Project:** Agent Smith
> **Scope:** Audit and maintain agent navigation docs for a single package/module
> **Type:** Solo task — single agent executes all steps

---

## Task Parameter

This task requires one input parameter:
- **`package`** — The name of the package to document (e.g., `@agent-smith/core`)

The agent must resolve the package name to its path and target file using the table in `goals.md`.

---

## Execution Steps

### Step 1: Resolve Package Path
- Map the `package` parameter to its directory path and target file
- Use the "Available Modules" table in goals.md as reference
**Success Criteria:**
- [ ] Package path identified
- [ ] Target `codebase-summary.md` file path determined

### Step 1b: Check Recent Changes
- **Determine which git repository the package belongs to** (the project has 5 separate repos):
  - Packages under `agent-smith/packages/*` and `agent-smith/server/` → repo is `/workspace/agent-smith`
  - `agent-smith-plugins` → repo is `/workspace/agent-smith-plugins`
  - `agent-smith-ui` → repo is `/workspace/agent-smith-ui`
  - `agent-smith-apps` → repo is `/workspace/agent-smith-apps`
  - `lynx-coder` → repo is `/workspace/lynx-coder`
- **cd into the correct repository directory** before running git commands (git cannot access paths outside its own `.git`)
- Run `git log --oneline -10 -- <relative-package-path>` to see recent commits
- Run `git diff HEAD~10 -- <relative-package-path>/src/` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory identified and cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged
- [ ] New/modified types, interfaces, or features identified

### Step 2: Explore the Module
- Use the `smart-explore` skill to walk the module's directory tree
- Prioritize files identified as changed in Step 1b (git diff)
- Identify entry points, key files, dependencies
- Check for new/removed features since last doc update
**Success Criteria:**
- [ ] All source files identified
- [ ] Entry point located
- [ ] Dependencies cataloged

### Step 3: Check Existing Documentation
- Read existing `codebase-summary.md` (if exists)
- Identify gaps, inaccuracies, outdated information
**Success Criteria:**
- [ ] Current state of documentation assessed
- [ ] Gaps and issues documented

### Step 4: Update or Create codebase-summary.md
- Write using the 7-section format:
  1. **Summary** — One sentence describing module purpose
  2. **Dependencies** — Internal (other agent-smith packages) + External (npm packages)
  3. **Used By** — Which modules depend on this one
  4. **Entry Point** — Main entry file path
  5. **Key Files** — Table of important files with purpose
  6. **Architecture** — 2-4 bullets on patterns, design decisions
  7. **Related Modules** — Links to related packages/repos
**Success Criteria:**
- [ ] File follows 7-section format exactly
- [ ] All key files documented
- [ ] Dependencies accurate and complete

### Step 5: Verify
- Verify file follows 7-section format
- Verify information is accurate and current
- Verify cross-references point to existing files
**Success Criteria:**
- [ ] Documentation is accurate and complete
- [ ] Format matches template exactly

---

## Rules Summary

| Rule | Detail |
|------|--------|
| Standardized format | `codebase-summary.md` uses 7-section structure exactly |
| Information-dense | Keep files short. Use tables, bullets, one-line descriptions |
| No redundancy | Module-specific details only — no project-level content |
| Cross-references valid | All links to related modules point to existing files |

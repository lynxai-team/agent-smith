# Task Plan: maintain-all-agent-docs

> **Project:** Agent Smith
> **Scope:** Audit and maintain all agent navigation docs across the entire project
> **Type:** Team task — coordinator delegates phases to executor agents (sequential execution)

---

## Phase Structure

Each phase handles one repository, package, or server module.
**Note:** All phases execute sequentially — no parallel execution supported yet.

### Phase Group A: Runtime Packages (7 phases)
These are the core framework packages within `agent-smith/packages/`.

| Phase | Module | Path | Phase File |
|-------|--------|------|------------|
| 1 | `@agent-smith/types` | `agent-smith/packages/types/` | `phases/phase-01-types.md` |
| 2 | `@agent-smith/core` | `agent-smith/packages/core/` | `phases/phase-02-core.md` |
| 3 | `@agent-smith/agent` | `agent-smith/packages/agent/` | `phases/phase-03-agent.md` |
| 4 | `@agent-smith/smem` | `agent-smith/packages/smem/` | `phases/phase-04-smem.md` |
| 5 | `@agent-smith/tmem` | `agent-smith/packages/tmem/` | `phases/phase-05-tmem.md` |
| 6 | `@agent-smith/cli` | `agent-smith/packages/cli/` | `phases/phase-06-cli.md` |
| 7 | `@agent-smith/wscli` | `agent-smith/packages/wscli/` | `phases/phase-07-wscli.md` |

### Phase Group B: Server & Root (2 phases)

| Phase | Module | Path | Phase File |
|-------|--------|------|------------|
| 8 | `server` | `agent-smith/server/` | `phases/phase-08-server.md` |
| 9 | `agent-smith` (root) | `agent-smith/` | `phases/phase-09-agent-smith-root.md` |

### Phase Group C: External Repos (5 phases)

| Phase | Repo | Path | Phase File |
|-------|------|------|------------|
| 10 | `agent-smith-plugins` | `agent-smith-plugins/` | `phases/phase-10-plugins.md` |
| 11 | `agent-smith-ui` | `agent-smith-ui/` | `phases/phase-11-ui.md` |
| 12 | `agent-smith-apps` | `agent-smith-apps/` | `phases/phase-12-apps.md` |
| 13 | `lynx-coder` | `lynx-coder/` | `phases/phase-13-lynx-coder.md` |

### Phase Group D: Project-Level Docs (2 phases)

| Phase | Scope | Phase File |
|-------|-------|------------|
| 14 | Update project-nav.md, decision-tree.md, project-overview.md | `phases/phase-14-project-nav.md` |
| 15 | Cross-reference verification & final quality check | `phases/phase-15-cross-reference.md` |

---

## Phase Execution Pattern

Each phase follows the same workflow:

### Step 1: Check Recent Changes (Git)
- **Determine which git repository the module belongs to** (the project has 5 separate repos):
  - Packages under `agent-smith/packages/*` and `agent-smith/server/` → repo is `/workspace/agent-smith`
  - `agent-smith-plugins` → repo is `/workspace/agent-smith-plugins`
  - `agent-smith-ui` → repo is `/workspace/agent-smith-ui`
  - `agent-smith-apps` → repo is `/workspace/agent-smith-apps`
  - `lynx-coder` → repo is `/workspace/lynx-coder`
- **cd into the correct repository directory** before running git commands (git cannot access paths outside its own `.git`)
- Run `git log --oneline -10 -- <relative-module-path>` to see recent commits
- Run `git diff HEAD~10 -- <relative-module-path>/src/` to identify code changes
- Focus exploration on modified files identified in the diff
**Success Criteria:**
- [ ] Correct repo directory identified and cd'd into
- [ ] Recent commits reviewed
- [ ] Changed files cataloged

### Step 2: Explore the Module
- Use the `smart-explore` skill to walk the directory tree (excludes noise like `node_modules`, `.git`, build artifacts)
- Prioritize files identified as changed in Step 1 (git diff)
- Identify entry points, key files, dependencies
- Check for new/removed features since last doc update

### Step 3: Check Existing Documentation
- Read existing `codebase-summary.md` (if exists)
- Identify gaps, inaccuracies, outdated information

### Step 4: Update or Create codebase-summary.md
- Write using the 7-section format:
  1. **Summary** — One sentence describing module purpose
  2. **Dependencies** — Internal (other agent-smith packages) + External (npm packages)
  3. **Used By** — Which modules depend on this one
  4. **Entry Point** — Main entry file path
  5. **Key Files** — Table of important files with purpose
  6. **Architecture** — 2-4 bullets on patterns, design decisions
  7. **Related Modules** — Links to related packages/repos

### Step 5: Verify
- File follows 7-section format exactly
- Information is accurate and current
- Cross-references point to existing files

---

## Phase 14: Update Project-Level Documentation

### Step 14.1: Update project-nav.md
- Verify repository structure table is complete
- Update dependency graph if relationships changed
- Verify module sections reflect current state
- Update navigation quick reference
- Update documentation links

### Step 14.2: Update decision-tree.md
- Verify all repos/modules have entries
- Update task-to-path mappings
- Verify link to AGENTS.md conventions

### Step 14.3: Update project-overview.md
- Verify core capabilities are current
- Update repository structure table
- Verify architecture patterns reflect current design

### Step 14.4: Update AGENTS.md
- Verify mission statement is current
- Verify repositories table includes all repos
- Verify conventions section reflects current patterns
- Verify documentation links point to existing files

---

## Phase 15: Cross-Reference Verification

### Step 15.1: Check for Duplicated Content
- Project description → ONLY in `project-nav.md` and `project-overview.md`
- Architecture patterns → ONLY in `project-nav.md`
- Code snippets → ONLY in `project-nav.md` and `project-overview.md`
- Module technical details → ONLY in `codebase-summary.md`
- Conventions → ONLY in `AGENTS.md` (referenced by `decision-tree.md`)

### Step 15.2: Verify Cross-References
- All links between files point to existing files
- `AGENTS.md` → links to decision-tree, project-overview, project-nav, codebase-summary
- `decision-tree.md` → references all doc files, links to AGENTS.md
- `codebase-summary.md` → Related section points to correct modules

### Step 15.3: Final Quality Check
- Files are information-dense (tables, bullets, one-line descriptions)
- No verbose explanations or filler content
- Paths are correct and consistent

---

## Rules Summary

| Rule | Detail |
|------|--------|
| No redundancy | Each piece of information lives in exactly one file |
| Standardized format | `codebase-summary.md` uses 7-section structure exactly |
| Information-dense | Keep files short. Use tables, bullets, one-line descriptions |
| project-nav.md is canonical | Single source of truth for project overview, architecture, snippets |
| decision-tree.md first | Always the first file agents should read to find the right doc |

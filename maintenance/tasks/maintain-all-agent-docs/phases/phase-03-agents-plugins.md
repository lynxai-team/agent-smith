# Phase 3: Create agent-smith-plugins AGENTS.md

## Context
- **Task ID:** maintain-all-agent-docs
- **Repo:** `agent-smith-plugins` — Plugin system for Agent Smith
- **Path:** `/workspace/agent-smith-plugins/`
- **Target File:** `/workspace/agent-smith-plugins/AGENTS.md`
- **Prerequisites:** Phase 1 (Explore) complete

---

## Prerequisites
- **Load the `execute-task-phase` skill** before proceeding. This skill defines the behavioral contract for executor agents running an assigned phase.
- **Load the `smart-explore` skill** before starting. This skill provides instructions about how to explore the codebase effectively.
- Read the exploration summary at `/workspace/.agents/tasks/maintain-all-agent-docs/documents/project-exploration-summary.md`

---

## Phase Goal
Create or update the per-repo AGENTS.md for agent-smith-plugins following the procedure's template.

---

### Step 3.1: Explore Repo Structure
**Execution Plan:**
- Walk `/workspace/agent-smith-plugins/` directory tree
- Identify key directories (categories, plugins)
- Note repo-specific conventions
**Success Criteria:**
- [ ] Directory structure documented
- [ ] Key directories identified

### Step 3.2: Read Existing AGENTS.md
**Execution Plan:**
- Read existing `agent-smith-plugins/AGENTS.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 3.3: Write Per-Repo AGENTS.md
**Execution Plan:**
Write using this exact structure:
```markdown
# agent-smith-plugins

## Mission
<One-line mission for this repo>

## Structure

| Directory | Purpose |
|-----------|---------|
| `<dir>` | <One-line description> |

## Conventions
- **<Convention>**: <Brief description> (repo-specific patterns)

## Quick Start for AI Agents
1. Read `.agents/documentation/codebase-summary.md` for technical summary
2. Explore key files listed in codebase-summary.md
3. <Build/run instructions specific to this repo>

## Documentation
- `.agents/documentation/codebase-summary.md` — Technical summary of this repo
- `../../AGENTS.md` — Project-wide context and conventions (workspace root)
```
**Success Criteria:**
- [ ] File follows template exactly
- [ ] Links back to root AGENTS.md

### Step 3.4: Verify
**Execution Plan:**
- Verify file is self-contained for agents working in this repo
- Verify structure table lists key directories
- Verify conventions include repo-specific patterns
- Verify Quick Start references local codebase-summary.md first
- Verify Documentation links back to root `/workspace/agent-smith/AGENTS.md`
**Success Criteria:**
- [ ] All success criteria met

---

## Reporting
At the end of this phase, report all files created or modified. Include the full absolute path (starting with `/workspace`) for each file.

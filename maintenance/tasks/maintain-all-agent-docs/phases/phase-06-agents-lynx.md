# Phase 6: Create lynx-coder AGENTS.md

## Context
- **Task ID:** maintain-all-agent-docs
- **Repo:** `lynx-coder` — Lynx Coder AI coding platform
- **Path:** `/workspace/lynx-coder/`
- **Target File:** `/workspace/lynx-coder/AGENTS.md`
- **Prerequisites:** Phase 1 (Explore) complete

---

## Prerequisites
- **Load the `execute-task-phase` skill** before proceeding. This skill defines the behavioral contract for executor agents running an assigned phase.
- **Load the `smart-explore` skill** before starting. This skill provides instructions about how to explore the codebase effectively.
- Read the exploration summary at `/workspace/.agents/tasks/maintain-all-agent-docs/documents/project-exploration-summary.md`

---

## Phase Goal
Create or update the per-repo AGENTS.md for lynx-coder following the procedure's template.

---

### Step 6.1: Explore Repo Structure
**Execution Plan:**
- Walk `/workspace/lynx-coder/` directory tree
- Identify key directories (src, packages, etc.)
- Note repo-specific conventions
**Success Criteria:**
- [ ] Directory structure documented
- [ ] Key directories identified

### Step 6.2: Read Existing AGENTS.md
**Execution Plan:**
- Read existing `lynx-coder/AGENTS.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 6.3: Write Per-Repo AGENTS.md
**Execution Plan:**
Write using the per-repo AGENTS.md template from the procedure:
- Mission statement for this repo
- Structure table with key directories
- Repo-specific conventions
- Quick Start referencing local codebase-summary.md first
- Documentation linking back to root `../../AGENTS.md`
**Success Criteria:**
- [ ] File follows template exactly
- [ ] Links back to root AGENTS.md

### Step 6.4: Verify
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

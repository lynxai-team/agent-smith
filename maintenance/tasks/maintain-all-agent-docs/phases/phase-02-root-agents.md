# Phase 2: Create Root AGENTS.md

## Context
- **Task ID:** maintain-all-agent-docs
- **Module:** Agent Smith project root
- **Path:** `/workspace/agent-smith/`
- **Target File:** `agent-smith/AGENTS.md`
- **Prerequisites:** Phase 1 (Explore) complete — read exploration notes

---

## Prerequisites
- **Load the `smart-explore` skill** before starting. This skill provides instructions about how to explore the codebase effectively.
- Read the exploration summary at `.agents/tasks/maintain-all-agent-docs/documents/project-exploration-summary.md`

---

## Phase Goal
Create or update the root AGENTS.md following the procedure's exact template.

---

### Step 2.1: Read Existing AGENTS.md
**Execution Plan:**
- Read existing `agent-smith/AGENTS.md` (if exists)
- Note what's missing or outdated
**Success Criteria:**
- [ ] Current state of documentation assessed

### Step 2.2: Determine Content
**Execution Plan:**
- **Mission**: One concise sentence capturing the project's purpose and capabilities
- **Repositories table**: All 5 repos with path and one-line purpose
- **Conventions**: 3-5 key patterns AI agents need to know (from exploration notes)
- **Quick Start**: decision-tree.md FIRST, then project-overview.md, project-nav.md, per-repo summaries
- **Documentation**: List all doc files with brief descriptions
**Success Criteria:**
- [ ] Mission statement drafted
- [ ] Repositories table complete
- [ ] Conventions identified

### Step 2.3: Write AGENTS.md
**Execution Plan:**
Write using this exact structure:
```markdown
# Agent Smith

## Mission
<One-line mission statement>

## Repositories

| Repo | Path | Purpose |
|------|------|---------|
| ...

## Conventions (for AI Agents)
- **<Convention>**: <Description>
...

## Quick Start for AI Agents
1. Read `.agents/documentation/decision-tree.md` to find the right doc for your task
2. Read `.agents/documentation/project-overview.md` for high-level context
3. Read `.agents/documentation/project-nav.md` for detailed navigation and dependency graph
4. Navigate to the relevant repo/package and read its `.agents/documentation/codebase-summary.md`

## Documentation
- `.agents/documentation/decision-tree.md` — Quick guide: find the right doc for your task
- `.agents/documentation/codebase-summary.md` — Top-level codebase summary
- `.agents/documentation/project-overview.md` — Concise project overview (~1 page)
- `.agents/documentation/project-nav.md` — Detailed navigation map with dependency graph
- `<repo>/.agents/documentation/codebase-summary.md` — <Repo> summary
...
```
**Success Criteria:**
- [ ] File follows template exactly
- [ ] All sections present

### Step 2.4: Verify
**Execution Plan:**
- Verify mission statement is one concise sentence
- Verify repositories table includes all 5 repos
- Verify conventions section has 3-5 key patterns
- Verify Quick Start lists decision-tree.md FIRST
- Verify Documentation section lists all doc files
**Success Criteria:**
- [ ] All success criteria met

# Phase 23: Cross-Reference Verification & Final Quality Check

## Context
- **Task ID:** maintain-all-agent-docs
- **Scope:** Verify consistency across all documentation files
- **Prerequisites:** All phases 1-22 complete

---

## Phase Goal
Ensure no duplicated content, all cross-references valid, and documentation quality is high.

**Key Insight:** This phase uses automated scripts for mechanical checks (file existence, format compliance) and focused agent analysis for content duplication review. This avoids overwhelming the agent with 26+ files (~134KB) of raw documentation text.

---

### Step 23.1: Automated Verification Script

**Execution Plan:**
Run a verification script that performs mechanical checks automatically. The agent should execute this Python script and review its output.

```python
# verification.py - Run in /workspace context
import os, re

expected_files = {
    # Root docs
    "root_AGENTS.md": "/workspace/AGENTS.md",
    "root_decision-tree.md": "/workspace/.agents/documentation/decision-tree.md",
    "root_project-overview.md": "/workspace/.agents/documentation/project-overview.md",
    "root_project-nav.md": "/workspace/.agents/documentation/project-nav.md",
    "root_codebase-summary.md": "/workspace/.agents/documentation/codebase-summary.md",
    # Per-repo AGENTS.md (5 repos)
    "agent-smith_AGENTS.md": "/workspace/agent-smith/AGENTS.md",
    "agent-smith-plugins_AGENTS.md": "/workspace/agent-smith-plugins/AGENTS.md",
    "agent-smith-ui_AGENTS.md": "/workspace/agent-smith-ui/AGENTS.md",
    "agent-smith-apps_AGENTS.md": "/workspace/agent-smith-apps/AGENTS.md",
    "lynx-coder_AGENTS.md": "/workspace/lynx-coder/AGENTS.md",
    # codebase-summary.md (13 modules + root)
    "cs_root": "/workspace/.agents/documentation/codebase-summary.md",
    "cs_agent-smith": "/workspace/agent-smith/.agents/documentation/codebase-summary.md",
    "cs_types": "/workspace/agent-smith/packages/types/.agents/documentation/codebase-summary.md",
    "cs_core": "/workspace/agent-smith/packages/core/.agents/documentation/codebase-summary.md",
    "cs_agent": "/workspace/agent-smith/packages/agent/.agents/documentation/codebase-summary.md",
    "cs_smem": "/workspace/agent-smith/packages/smem/.agents/documentation/codebase-summary.md",
    "cs_tmem": "/workspace/agent-smith/packages/tmem/.agents/documentation/codebase-summary.md",
    "cs_cli": "/workspace/agent-smith/packages/cli/.agents/documentation/codebase-summary.md",
    "cs_wscli": "/workspace/agent-smith/packages/wscli/.agents/documentation/codebase-summary.md",
    "cs_server_node": "/workspace/agent-smith/server/node/.agents/documentation/codebase-summary.md",
    "cs_server_go": "/workspace/agent-smith/server/go/.agents/documentation/codebase-summary.md",
    "cs_plugins": "/workspace/agent-smith-plugins/.agents/documentation/codebase-summary.md",
    "cs_ui": "/workspace/agent-smith-ui/.agents/documentation/codebase-summary.md",
    "cs_apps": "/workspace/agent-smith-apps/.agents/documentation/codebase-summary.md",
    "cs_lynx-coder": "/workspace/lynx-coder/.agents/documentation/codebase-summary.md",
}

# CHECK 1: File existence
missing = [k for k, v in expected_files.items() if not os.path.exists(v)]
print(f"CHECK 1 - File Existence: {'PASS' if not missing else 'FAIL'}")
if missing: print(f"  Missing: {missing}")

# CHECK 2: codebase-summary.md format (7 sections)
required_sections = ["Summary", "Dependencies", "Used By", "Entry Point", "Key Files", "Architecture", "Related"]
format_issues = []
for name, path in expected_files.items():
    if not name.startswith("cs_") or not os.path.exists(path):
        continue
    content = open(path).read()
    headers = re.findall(r'^#{1,2}\s+(.+)$', content, re.MULTILINE)
    missing_sections = [s for s in required_sections if not any(s.lower() in h.lower() for h in headers)]
    if missing_sections:
        format_issues.append((name, missing_sections))

print(f"CHECK 2 - Format Compliance: {'PASS' if not format_issues else 'WARN'}")
for name, issues in format_issues:
    print(f"  {name}: Missing {', '.join(issues)}")

# CHECK 3: File sizes (information density)
large_files = []
for name, path in expected_files.items():
    if os.path.exists(path):
        size = os.path.getsize(path)
        if size > 10000 and "project-nav" not in name:
            large_files.append((name, size))

print(f"CHECK 3 - File Sizes: {'PASS' if not large_files else 'WARN'}")
for name, size in large_files:
    print(f"  ⚠ {name}: {size:,} bytes (may be verbose)")
```

**Success Criteria:**
- [ ] All expected documentation files exist
- [ ] All codebase-summary.md files have the 7 required sections
- [ ] No unexpectedly large files (warns if >10KB except project-nav.md)

---

### Step 23.2: Targeted Duplication Review

**Execution Plan:**
Instead of reading all 26 files, read only the "header/summary" portions of each file to check for duplicated content patterns.

**Method:**
1. Read the first ~50 lines of each documentation file (the summary/description sections)
2. Look for duplicated:
   - Project mission/description text
   - Architecture pattern descriptions
   - Convention lists
   - Repository table definitions

**Files to Spot-Check (read full content):**
- Root `AGENTS.md` vs per-repo `AGENTS.md` — ensure per-repo files don't repeat root conventions
- `project-nav.md` vs `project-overview.md` — ensure overview is concise, nav is comprehensive
- Each `codebase-summary.md` — ensure technical details aren't duplicated in AGENTS.md

**Success Criteria:**
- [ ] Project description only in `project-nav.md` and `project-overview.md`
- [ ] Architecture patterns only in `project-nav.md`
- [ ] Conventions only in root `AGENTS.md`
- [ ] Module technical details only in their `codebase-summary.md`

---

### Step 23.3: Cross-Reference Spot Check

**Execution Plan:**
Instead of checking every reference, verify the key cross-reference patterns:

1. **Root AGENTS.md** — verify it links to: decision-tree.md, project-overview.md, project-nav.md, codebase-summary.md, per-repo AGENTS.md
2. **Per-repo AGENTS.md** — verify each links to its local codebase-summary.md and back to root `../../AGENTS.md`
3. **decision-tree.md** — verify it references all doc files and ends with link to root AGENTS.md

**Method:** Read these 6 key files (root AGENTS.md + 4 per-repo AGENTS.md + decision-tree.md) and verify the expected links are present.

**Success Criteria:**
- [ ] Root AGENTS.md has all expected navigation links
- [ ] Per-repo AGENTS.md files link to local codebase-summary.md
- [ ] decision-tree.md references all documentation files

---

### Step 23.4: Final Quality Assessment

**Execution Plan:**
Read the complete content of 3 representative files to assess quality:
1. One root-level doc (e.g., `decision-tree.md`)
2. One codebase-summary.md (e.g., `core/.agents/documentation/codebase-summary.md`)
3. One per-repo AGENTS.md (e.g., `agent-smith-plugins/AGENTS.md`)

**Quality Criteria:**
- Information-dense: tables, bullets, one-line descriptions
- No verbose explanations or filler content
- Paths are correct and consistent
- Format follows templates exactly

**Success Criteria:**
- [ ] Sampled files are concise, accurate, and actionable
- [ ] All success criteria from goals.md are met

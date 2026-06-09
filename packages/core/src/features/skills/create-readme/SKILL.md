---
name: create-readme
description: use this to create comprehensive README file for a given package or plugin or repository
---

## Workflow: README Creation

### Phase 1: Discovery
1. Read `/workspace/AGENTS.md` and `/workspace/.agents/documentation/project-nav.md` to understand project structure
2. Read `/workspace/agent-smith/.agents/documentation/codebase-summary.md` and `/workspace/agent-smith/.agents/documentation/dpcumentation-map.md`
3. Locate target in the codebase summary (note its position, dependencies, and purpose)

### Phase 2: Deep Dive
3. Navigate to directory: `/workspace/agent-smith/packages/{package-name}/` for a package, adapt the path
4. Read `.agents/documentation/codebase-summary.md` for architecture, key files, and usage patterns
5. Read documentation from `/workspace/agent-smith/docsite/public/doc/libraries/{package-name}/*.md` (get_started, usage, api)

### Phase 3: Synthesis & Writing
6. Create `README.md` with this structure:
   - **Npm badge**: example:
      ```
      [![pub package](https://img.shields.io/npm/v/this-package-name)](https://www.npmjs.com/package/this-package-name)
      ```
   - **Title & Tagline**: Package name + one-sentence description. Mention that this package is part of the Agent Smith toolkit (repository: https://github.com/lynxai-team/agent-smith)
   - **Features**: Bullet list of key capabilities (use emojis for visual hierarchy)
   - **Documentation**: REQUIRED section with specific structure (see below)
   - **Installation**: npm/yarn command in code block
   - **Quick Start**: Minimal working example showing creation, init, and basic operations
   - **Usage**: Detailed patterns with code examples (creation, initialization, verbose mode, reading/writing, error handling)
   - **Complete Example**: Full working async function demonstrating all operations
   - **API Reference**: Factory function signature + parameters table + interface + method summary table
   - **Important Notes**: Browser-only warnings, limitations, related packages
   - **Documentation Links**: References to full docsite
   - **License**: MIT/appropriate license

### Documentation Section Structure (REQUIRED)

Every README must include a **Documentation** section with this exact structure: two subsections — "For AI Agents" and "For Humans" — providing appropriate links for each audience.

#### Required Format

```markdown
## Documentation

### For AI Agents
- [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns for the {package-name} package
- [Doc1](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/{package-name}/1.get_started.md) — Description
- [Doc2](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/{package-name}/2.topic.md) — Description

### For Humans
- [Doc1](https://lynxai-team.github.io/agent-smith/libraries/{package-name}/) — Description
- [Doc2](https://lynxai-team.github.io/agent-smith/libraries/{package-name}/topic) — Description
```

#### Rules

1. **For AI Agents subsection**:
   - Always start with a link to `.agents/documentation/codebase-summary.md` (relative path)
   - List all relevant documentation files from `/workspace/agent-smith/docsite/public/doc/libraries/{package-name}/`
   - Use raw GitHub URLs: `https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/{package-name}/{filename}.md`
   - Include a brief description after each link (after `—`)

2. **For Humans subsection**:
   - Use the docsite URL: `https://lynxai-team.github.io/agent-smith/libraries/{package-name}/`
   - Convert paths: replace `docsite/public/doc/libraries/{package-name}/` with `libraries/{package-name}/`
   - Remove file numbering prefixes (e.g., `1.get_started.md` → `/`)
   - Include a brief description after each link (after `—`)

#### Example from the types package README

```markdown
## Documentation

### For AI Agents
- [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns for the Agent Smith libraries
- [Get Started](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/types/1.get_started.md) — Overview and installation
- [Interfaces](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/types/2.interfaces.md) — Complete API reference of all exported types

### For Humans
- [Get Started](https://lynxai-team.github.io/agent-smith/libraries/types/) — Overview and usage guide
- [Interfaces](https://lynxai-team.github.io/agent-smith/libraries/types/interfaces) — Full interface reference with tables
```

### Key Principles
- **Information Density**: Every section must convey unique value; avoid repetition between Quick Start and Usage
- **Code Examples**: All examples must be complete, runnable TypeScript with proper async/await
- **Type Safety**: Show generic type parameters explicitly (e.g., `get<string>()`)
- **Error Handling**: Document error cases explicitly with try/catch examples
- **Browser vs Node**: Clearly state environment constraints early in the README
- **Visual Hierarchy**: Use emojis for feature bullets, clear section headers, and tables for API reference

### Output Validation
Before finalizing, verify:
- [ ] All code blocks are syntactically valid TypeScript
- [ ] API signatures match actual implementation (check source files if needed)
- [ ] Installation command uses correct package name (`@agent-smith/{package-name}`)
- [ ] Documentation section follows the required structure with "For AI Agents" and "For Humans" subsections
- [ ] Documentation links follow consistent pattern (raw GitHub URLs for AI agents, docsite URLs for humans)
- [ ] No internal paths or implementation details leak into public documentation

Documentation links base url: https://lynxai-team.github.io/agent-smith/

Notify the user when the task is completed

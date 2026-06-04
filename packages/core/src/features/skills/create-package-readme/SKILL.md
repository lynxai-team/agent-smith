---
name: create-package-readme
description: use this to create comprehensive README file for a given package
---

## Workflow: Package README Creation

### Phase 1: Discovery
1. Read `/workspace/AGENTS.md` and `/workspace/.agents/documentation/project-nav.md` to understand project structure
2. Read `/workspace/agent-smith/.agents/documentation/codebase-summary.md` and `/workspace/agent-smith/.agents/documentation/dpcumentation-map.md`
3. Locate target package in the codebase summary (note its position, dependencies, and purpose)

### Phase 2: Deep Dive
3. Navigate to package directory: `/workspace/agent-smith/packages/{package-name}/`
4. Read `.agents/documentation/codebase-summary.md` for package-specific architecture, key files, and usage patterns
5. Read documentation from `/workspace/agent-smith/docsite/public/doc/libraries/{package-name}/*.md` (get_started, usage, api)

### Phase 3: Synthesis & Writing
6. Create `/workspace/agent-smith/packages/{package-name}/README.md` with this structure:
   - **Npm badge**: example:
      ```
      [![pub package](https://img.shields.io/npm/v/this-package-name)](https://www.npmjs.com/package/this-package-name)
      ```
   - **Title & Tagline**: Package name + one-sentence description. Mention that this package is part of the Agent Smith toolkit (repository: https://github.com/lynxai-team/agent-smith)
   - **Features**: Bullet list of key capabilities (use emojis for visual hierarchy)
   - **Documentation**: 2 sections: documentation for AI agents (must include a link to the codebase navigation map at .agents/documentation/codebase-summary.md and the relevant doc from documentation), and documentation for humans, with the relevant doc http links. Correct links formats:
      - For humans use the site link: https://lynxai-team.github.io/agent-smith/: replace the `docsite/public/doc` paths by this link. Example:
         ```md
         - [Complete doc](https://lynxai-team.github.io/agent-smith/libraries/agent/)
         ```
      - For AI agents provide detailled links map and use the raw file paths links. Example:
         ```md
         - [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns for the agent package
         - [Get Started](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/agent/1.get_started.md) — Installation and basic usage
         - [Tools](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/agent/2.tools.md) — Defining and configuring tools for agents
         - [Templates](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/agent/3.templates.md) — System prompts, YAML specs, and few-shot examples
         - [Supervision](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/agent/4.supervision.md) — Human-in-the-loop tool authorization
         ```
   - **Installation**: npm/yarn command in code block
   - **Quick Start**: Minimal working example showing creation, init, and basic operations
   - **Usage**: Detailed patterns with code examples (creation, initialization, verbose mode, reading/writing, error handling)
   - **Complete Example**: Full working async function demonstrating all operations
   - **API Reference**: Factory function signature + parameters table + interface + method summary table
   - **Important Notes**: Browser-only warnings, limitations, related packages
   - **Documentation Links**: References to full docsite
   - **License**: MIT/appropriate license

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
- [ ] Documentation links follow consistent pattern
- [ ] No internal paths or implementation details leak into public documentation

Documentation links base url: https://lynxai-team.github.io/agent-smith/

Notify the user when the task is completed

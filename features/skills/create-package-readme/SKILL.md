---
name: create-package-readme
description: use this to create comprehensive README file for a given package
---

## Workflow: Package README Creation

### Phase 1: Discovery
1. Read `/workspace/AGENTS.md` and `/workspace/agent-smith/.agents/documentation/codebase-summary.md` to understand project structure
2. Locate target package in the codebase summary (note its position, dependencies, and purpose)

### Phase 2: Deep Dive
3. Navigate to package directory: `/workspace/agent-smith/packages/{package-name}/`
4. Read `.agents/documentation/codebase-summary.md` for package-specific architecture, key files, and usage patterns
5. Read documentation from `/workspace/agent-smith/docsite/public/doc/libraries/{package-name}/*.md` (get_started, usage, api)

### Phase 3: Synthesis & Writing
6. Create `/workspace/agent-smith/packages/{package-name}/README.md` with this structure:
   - **Title & Tagline**: Package name + one-sentence description
   - **Features**: Bullet list of key capabilities (use emojis for visual hierarchy)
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

[![npm version](https://img.shields.io/npm/v/@agent-smith/cli)](https://www.npmjs.com/package/@agent-smith/cli)

# @agent-smith/cli — Terminal REPL for Agent Smith

A command-line interface built with Commander.js for interacting with AI agents, executing workflows and actions, managing configuration, and running inference. Part of the [Agent Smith toolkit](https://github.com/lynxai-team/agent-smith).

## Features

- 🚀 **Interactive REPL** — Chat mode for conversational agent interaction
- ⚡ **One-shot Commands** — Run agents, workflows, and actions from the terminal
- 🔧 **Dynamic Commands** — Auto-generated commands from database features (agents, actions, workflows, aliases)
- 🎛️ **Configuration Management** — YAML-based config with SQLite backend for backends, plugins, and feature paths
- 🌐 **Multi-Backend Support** — Llama.cpp, Koboldcpp, Ollama, OpenRouter, and any OpenAI-compatible API
- 📋 **I/O Flexibility** — Clipboard input/output, file input, markdown output modes
- 🔍 **Inference Control** — Fine-grained control over model parameters (temperature, top_k, top_p, min_p, etc.)
- 🔄 **Hot-Reloadable Features** — Add agents and tools without restarting the CLI

## Documentation

### For AI Agents

- [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns for the CLI package
- [Overview](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/terminal_client/2.overview.md) — Terminal client principles and feature types
- [Install](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/terminal_client/1.install.md) — Installation and quickstart
- [Config](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/terminal_client/3.config.md) — Configuration file format and backend setup
- [Agents](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/terminal_client/agents/1.overview.md) — Agent YAML definitions and tool calling
- [Tasks](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/terminal_client/4.tasks.md) — Running agents with variables and parameters
- [Actions](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/terminal_client/6.actions.md) — Custom tool scripts (JS, Python, YAML)
- [Workflows](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/terminal_client/7.workflows.md) — Chaining actions and agents in pipelines
- [Commands](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/terminal_client/8.commands.md) — Custom terminal commands

### For Humans

- [Quickstart Guide](https://lynxai-team.github.io/agent-smith/terminal_client/quickstart) — Get up and running in minutes
- [Terminal Client Overview](https://lynxai-team.github.io/agent-smith/terminal_client/overview) — Principles and feature types
- [Installation](https://lynxai-team.github.io/agent-smith/terminal_client/install) — Install and initial configuration
- [Configuration](https://lynxai-team.github.io/agent-smith/terminal_client/config) — Config file format, backends, and plugins
- [Agent Definitions](https://lynxai-team.github.io/agent-smith/terminal_client/agents/overview) — Declaring agents with YAML
- [Tasks & Variables](https://lynxai-team.github.io/agent-smith/terminal_client/tasks) — Parameterized agent execution
- [Actions](https://lynxai-team.github.io/agent-smith/terminal_client/actions) — Writing custom tools
- [Workflows](https://lynxai-team.github.io/agent-smith/terminal_client/workflows) — Building multi-step pipelines

## Installation

```bash
npm i -g @agent-smith/cli
```

This installs the `lm` command globally.

## Quick Start

### 1. Configure Your Backend

Create a config file at `~/.config/agent-smith/config.yml`:

```yaml
backends:
  default: "llamacpp"
  llamacpp:
    type: "openai"
    url: "http://localhost:8080/v1"
  openrouter:
    type: "openai"
    url: "https://openrouter.ai/api/v1"
    apiKey: "$OPENROUTER_API_KEY"
```

### 2. Sync Configuration

```bash
lm conf ~/.config/agent-smith/config.yml
```

This processes the YAML config and populates the SQLite database at `~/.config/agent-smith/config.db`.

### 3. Run a Quick Query

```bash
lm q list the planets of the solar system
```

With a specific model:

```bash
lm q list the planets of the solar system -m gemma4b
```

### 4. Enter Interactive Chat Mode

```bash
lm
```

Then type your queries interactively. Use `exit` to quit.

## Usage

### Listing Agents

List all registered agents:

```bash
lm agents
```

View an agent definition:

```bash
lm agent myagent
```

### Running Agents

Run a specific agent with a prompt:

```bash
lm myagent "Explain quantum computing"
```

With variables (if the agent requires them):

```bash
lm myagent "Analyze this code" --workspace /path/to/project
```

### Using Different Backends

Change the default backend:

```bash
lm backend openrouter
```

Use a specific backend for one execution:

```bash
lm myagent "Hello" -b llamacpp
```

List available backends:

```bash
lm backends
```

### Inference Parameters

Control model behavior with command-line options:

```bash
lm q "Write a poem" \
  --model qwen4b \
  --temperature 0.7 \
  --top_k 20 \
  --top_p 0.95 \
  --max_tokens 1024
```

### Input/Output Modes

**Clipboard input:**
```bash
lm q "Summarize this" --clipboard-input
```

**File input:**
```bash
lm q "Analyze" --input-file
```

**Markdown output:**
```bash
lm q "Generate a report" --markdown-output
```

**Clipboard output:**
```bash
lm q "Generate code" --clipboard-output
```

### Chat Mode for Tasks

Enable chat mode for multi-turn task execution:

```bash
lm myagent "Start a project" -c
```

### Verbose and Debug Modes

```bash
lm q "Hello" --verbose    # Show detailed execution info
lm q "Hello" --debug       # Show debug-level output
```

## Complete Example

Here's a full workflow: configuring backends, creating an agent, and running it with custom parameters.

### Step 1: Create Features Directory

```bash
mkdir -p ~/my-agents/features/agents
mkdir -p ~/my-agents/features/actions
```

### Step 2: Configure Features Path

Update `~/.config/agent-smith/config.yml`:

```yaml
features:
  - ~/my-agents/features
backends:
  default: "llamacpp"
  llamacpp:
    type: "openai"
    url: "http://localhost:8080/v1"
```

### Step 3: Create an Agent

Create `~/my-agents/features/agents/shell-demo.yml`:

```yaml
name: shell-demo
description: A demo agent with shell tool access
prompt: |-
    {prompt}
model: qwen4b
inferParams:
  min_p: 0
  top_k: 20
  top_p: 0.95
  temperature: 0.4
toolsList:
  - shell
variables:
  required:
    workspace:
      description: The local directory path where to operate
```

### Step 4: Register and Run

```bash
# Register the new agent
lm update

# Run with a prompt and variable
lm shell-demo "List files in the current directory" --workspace /path/to/dir
```

## API Reference

### CLI Entry Point

The package exports utility functions for integration:

```typescript
import {
    displayOptions,
    ioOptions,
    inferenceOptions,
    allOptions,
    parseCommandArgs
} from "@agent-smith/cli";
```

### Options

| Export | Type | Description |
|--------|------|-------------|
| `displayOptions` | `Option[]` | CLI display options (`--verbose`, `--debug`) |
| `ioOptions` | `Option[]` | I/O mode options (clipboard, file, markdown) |
| `inferenceOptions` | `Option[]` | Inference parameter options (model, temperature, etc.) |
| `allOptions` | `Option[]` | Combined options array |
| `parseCommandArgs` | `Function` | Parse command-line arguments for Commander.js |

### Inference Options

| Option | Short | Description |
|--------|-------|-------------|
| `--model <name>` | `-m` | Model name to use |
| `--ctx` | `-x` | Context window size |
| `--template <template>` | `--tpl` | Template to use |
| `--max_tokens <number>` | `--mt` | Maximum tokens to generate |
| `--top_k <number>` | `-k` | Limit results to top K |
| `--top_p <number>` | `-p` | Cumulative probability filter |
| `--min_p <number>` | `--mp` | Minimum token probability |
| `--temperature <number>` | `-t` | Sampling randomness |
| `--repeat_penalty <number>` | `-r` | Penalty for repeated tokens |
| `--backend <name>` | `-b` | Backend to use (must be registered) |
| `--mcp [args...]` | — | MCP server arguments |

### I/O Options

| Option | Short | Description |
|--------|-------|-------------|
| `--input-file` | `--if` | Use promptfile input mode |
| `--clipboard-input` | `--ic` | Use clipboard input mode |
| `--manual-input` | `--im` | Manual input (default) |
| `--clipboard-output` | `--oc` | Output to clipboard |
| `--markdown-output` | `--omd` | Markdown output format |
| `--text-output` | `--otxt` | Text output (default) |

## Important Notes

- **Node.js Required**: This package runs in Node.js environments only — it is not a browser library.
- **Global Installation**: Designed for global installation via `npm i -g`. The `lm` binary is available system-wide.
- **SQLite Database**: Configuration and features are stored in SQLite at `~/.config/agent-smith/config.db`.
- **Dependencies**: Requires `@agent-smith/core` for feature execution and database operations.
- **Backend Compatibility**: Supports any server with an OpenAI-compatible API (Llama.cpp, Ollama, Koboldcpp, OpenRouter, etc.).
- **Related Packages**: 
  - `@agent-smith/core` — Runtime engine for feature execution
  - `@agent-smith/agent` — Agent inference loop
  - `@agent-smith/wscli` — WebSocket client for server communication

## License

MIT

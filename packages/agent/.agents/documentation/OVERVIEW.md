# Agent Smith: Agent Runtime - Documentation

## Overview
`@agent-smith/agent` is an agent runtime library designed to orchestrate interactions between a Language Model (LLM) and external tools. It provides a structured way to handle conversation history, tool execution, and inference streaming.

## Key Components

### Core Classes
- **Agent**: The high-level orchestrator that manages conversation flow, maintains history, and handles tool execution.
- **Lm**: The low-level Language Model provider interface that handles API communication with LLM servers.

### Main Features
- **Multi-turn Conversations**: Maintains stateful interactions across multiple prompts.
- **Tool Use**: Supports function calling with validation and execution (both synchronous and parallel).
- **Streaming Support**: Full support for streaming responses with token-level callbacks.
- **Reasoning Support**: Hooks for capturing and displaying "thinking" tokens.
- **Extensible Provider Pattern**: Allows different LLM backends to be plugged in.

## Project Structure
```
workspace/
├── src/
│   ├── main.ts          # Entry point, exports Agent and Lm
│   ├── agent.ts         # Core orchestration logic
│   ├── client.ts        # Low-level LLM provider interface
│   ├── stats.ts         # Performance tracking utilities
│   └── tools.ts         # Tool conversion helpers
├── dist/                # Compiled output
├── node_modules/        # Dependencies
├── package.json        # Project metadata
├── rollup.config.js    # Bundling configuration
└── tsconfig.json       # TypeScript settings
```

## Build Process
- `npm run build`: Compiles TypeScript to JavaScript.

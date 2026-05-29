# @agent-smith/wscli

## Summary

A WebSocket client library for the Agent Smith server, providing real-time communication capabilities for executing agents and workflows. It handles WebSocket connections with automatic reconnection, message parsing, and event-driven callbacks for token streaming, tool calls, and turn management.

## File Structure

```
wscli/
├── dist/                    # Compiled output directory
│   ├── api.d.ts             # API module type definitions
│   ├── api.js               # API module (REST client)
│   ├── main.d.ts            # Main entry point type definitions
│   ├── main.js              # Main entry point (exports useWsServer, useClientFeatures)
│   ├── server.d.ts          # Server features module type definitions
│   ├── server.js            # Client features service implementation
│   ├── utils.d.ts           # Utility functions type definitions
│   ├── utils.js             # Promise-based awaiter utility
│   ├── ws.d.ts              # WebSocket client type definitions
│   └── ws.js                # WebSocket client with reconnection support
├── src/                     # TypeScript source files
│   ├── api.ts               # REST API client configuration
│   ├── main.ts              # Main entry point - exports useWsServer, useClientFeatures
│   ├── server.ts            # Client features service - agent/workflow execution logic
│   ├── utils.ts             # Utility functions (createAwaiter for promise-based synchronization)
│   └── ws.ts                # WebSocket client with reconnection and message handling
├── package.json             # Package configuration
├── rollup.config.js         # Rollup bundler configuration
└── tsconfig.json            # TypeScript compiler configuration
```

## File Descriptions

### Source Files

- **src/main.ts**: Entry point that re-exports `useWsServer` from ws.ts and `useClientFeatures` from server.ts. Provides the public API surface.

- **src/server.ts**: Core client features service (`useClientFeatures`). Manages agent execution, workflow execution, variable handling, model loading, settings management, and state checking. Uses Vue's reactivity system for reactive state (isReady, agentSpec, variables, mcp). Handles both async and sync execution modes via promise-based awaiters.

- **src/ws.ts**: WebSocket client wrapper using `reconnecting-websocket`. Manages connection to the server, parses incoming messages by type (token, thinkingtoken, turnstart, turnend, toolcall, etc.), and dispatches events to callback handlers. Supports sending commands for agent execution, workflow execution, and cancellation.

- **src/api.ts**: REST API client configuration using `restmix`. Configured to connect to `http://localhost:5184/api` by default. Provides HTTP methods for fetching models, agents, settings, workspaces, etc.

- **src/utils.ts**: Utility module containing `createAwaiter<T>()` - a helper function that creates a promise with external resolve/reject functions, used for synchronizing async operations (e.g., waiting for agent execution to complete).

### Configuration Files

- **package.json**: Defines the package as `@agent-smith/wscli` (version 0.0.5), an ESM module. Dependencies include `@vue/reactivity` and `reconnecting-websocket`. Build scripts use Rollup for bundling and TypeScript for compilation.

- **tsconfig.json**: TypeScript configuration targeting ES2022, strict mode enabled, output to `./dist`, declarations generated. Includes Vue file support.

- **rollup.config.js**: Bundles source into ESM (`api.es.js`) and IIFE minified (`api.min.js`) formats using `@rollup/plugin-typescript`, `@rollup/plugin-node-resolve`, and `@rollup/plugin-terser`.

## Architecture & Patterns

### Event-Driven Architecture
The library uses an event-driven pattern where WebSocket messages are parsed and dispatched to callback handlers. Message types include: tokens, thinking tokens, turn start/end, tool calls, errors, and system commands.

### Reactive State Management
Uses Vue's `reactive` and `ref` from `@vue/reactivity` for reactive state management (agentSpec, variables, mcp servers, isReady flag).

### Promise-Based Synchronization
The `createAwaiter` utility enables sync-like execution of async operations by creating promises with externally accessible resolve/reject functions. This allows both async and sync execution modes for agents and workflows.

### Dual Transport Layer
- **WebSocket** (`ws.ts`): Real-time bidirectional communication for streaming tokens, tool calls, and turn events
- **REST API** (`api.ts`): HTTP-based queries for loading models, settings, workspaces, agent specs, etc.

### Reconnection Support
Uses `reconnecting-websocket` library with automatic reconnection and message retry logic (exponential backoff up to 5 seconds).

### Modular Exports
The main entry point (`main.ts`) exports two primary services:
- `useWsServer`: Low-level WebSocket client
- `useClientFeatures`: High-level service wrapping WebSocket + REST API for agent/workflow orchestration

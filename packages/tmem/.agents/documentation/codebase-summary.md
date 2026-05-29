# @agent-smith/tmem - Transient Memory Module

## Summary
A TypeScript library providing a transient memory module API for creating human-friendly agents. It wraps [localForage](https://localforage.github.io/localForage/) to offer a simple key-value store interface backed by IndexedDB.

## File Structure
```
packages/tmem/
├── package.json              # Package configuration and dependencies
├── tsconfig.json             # TypeScript compiler configuration
├── rollup.config.js          # Rollup bundler configuration for ESM and IIFE builds
├── src/
│   ├── main.ts               # Entry point - re-exports Tmem interface and useTmem function
│   ├── tmem.ts               # Core implementation of the useTmem hook
│   └── tmeminterfaces.ts     # TypeScript interfaces (Tmem)
```

## File Descriptions

| File | Description |
|------|-------------|
| `package.json` | Defines the package (`@agent-smith/tmem` v0.0.4), build scripts, dependencies (localforage), and exports configuration for ESM modules. |
| `tsconfig.json` | TypeScript configuration targeting ES2020 with strict mode, declaration file generation, and output to `./dist`. |
| `rollup.config.js` | Bundles the source into two formats: ESM (`api.es.js`) and minified IIFE (`api.min.js`) under the global name `$agentbrain`. |
| `src/main.ts` | Entry point that re-exports the `Tmem` interface and `useTmem` function for consumers. |
| `src/tmem.ts` | Core implementation. The `useTmem` generic function creates a localForage instance and returns an object with `init`, `set`, `get`, `del`, `keys`, and `all` methods for persistent key-value storage. |
| `src/tmeminterfaces.ts` | Declares the `Tmem<S>` interface defining the shape of the returned memory module. |

## Architecture & Patterns

- **Generic Factory Pattern**: `useTmem<S>()` is a generic function that creates a typed transient memory instance for a given store name and initial data.
- **Wrapper Pattern**: Wraps localForage (IndexedDB backend) to provide a simplified, consistent API for key-value operations.
- **Async/Await**: All storage operations are asynchronous, leveraging localForage's promise-based API.
- **Initialization on Demand**: The `init()` method populates the store with initial data only if the store is empty, enabling reproducible agent state.
- **Dual Build Output**: Supports both module-based imports (ESM) and script tag usage (IIFE).

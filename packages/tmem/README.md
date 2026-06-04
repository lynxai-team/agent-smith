[![npm package](https://img.shields.io/npm/v/@agent-smith/tmem)](https://www.npmjs.com/package/@agent-smith/tmem)

# @agent-smith/tmem — Transient Key-Value Memory

Lightweight transient key-value store wrapping localForage/IndexedDB for agent state persistence. Part of the [Agent Smith](https://github.com/lynxai-team/agent-smith) toolkit.

## Features

- 🗄️ **IndexedDB-backed** persistent storage that survives page reloads
- 🏭 **Generic factory** — `useTmem<S>()` creates typed stores with any shape
- 🔄 **Init-on-demand** — initial data populated only if the store is empty
- ⚡ **Async API** — consistent `set/get/del/keys/all` interface over IndexedDB
- 🔍 **Verbose mode** — optional console logging during initialization
- 🌐 **Browser-only** — works in any modern browser with IndexedDB support

## Documentation

### For AI Agents
- [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns for the tmem package
- [Get Started](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/transient_memory/1.get_started.md) — Installation and basic usage
- [Usage](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/transient_memory/2.usage.md) — Practical usage patterns
- [API Reference](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/transient_memory/3.api.md) — Complete API surface

### For Humans
- [Get Started](https://lynxai-team.github.io/agent-smith/libraries/transient_memory/get_started) — Installation and basic usage
- [Usage](https://lynxai-team.github.io/agent-smith/libraries/transient_memory/usage) — Practical usage patterns
- [API Reference](https://lynxai-team.github.io/agent-smith/libraries/transient_memory/api) — Complete API surface

## Installation

```bash
npm i @agent-smith/tmem
```

## Quick Start

```typescript
import { useTmem } from "@agent-smith/tmem";

const tmem = useTmem("myStore", { greeting: "hello", count: 0 });

await tmem.init();

// Store a new value
await tmem.set("greeting", "world");

// Read a value (throws if key doesn't exist)
const greeting = await tmem.get<string>("greeting");
console.log(greeting); // "world"

// Delete and list keys
await tmem.del("count");
const keys = await tmem.keys();
console.log(keys); // ["greeting"]
```

## Usage

### Creating a Store

Use the `useTmem` factory to create a named store with optional initial data:

```typescript
import { useTmem } from "@agent-smith/tmem";

const prefs = useTmem("userPrefs", {
    theme: "dark",
    language: "en",
    fontSize: 14,
});
```

The `initial` object is written **only if the store is empty** (i.e., `keys()` returns zero entries). Subsequent calls to `init()` will not overwrite existing data.

### Initialization

Always call `init()` before performing any read or write operations:

```typescript
await prefs.init();
```

`init()` waits for the underlying IndexedDB instance to be ready, then populates it with the initial data if empty.

### Verbose Mode

Enable logging during initialization:

```typescript
const prefs = useTmem("userPrefs", { theme: "dark" }, true);
await prefs.init();
// Console: Tmem: setting initial data for store userPrefs
```

### Reading and Writing

All operations are asynchronous — use `await` with every call:

```typescript
// Write
await prefs.set("theme", "light");

// Read (throws if key is missing)
const theme = await prefs.get<string>("theme");
console.log(theme); // "light"

// Get all values at once
const allPrefs = await prefs.all();
console.log(allPrefs);
// { theme: "light", language: "en", fontSize: 14 }
```

### Error Handling

The `get()` method throws an `Error` when the requested key does not exist:

```typescript
try {
    const value = await prefs.get<string>("nonexistent");
} catch (e) {
    console.error(e.message); // "Key nonexistent not found"
}
```

### Deleting Keys

Remove a single key from the store:

```typescript
await prefs.del("fontSize");
```

### Accessing the Underlying localForage Instance

The returned `Tmem` object exposes the `db` property for advanced operations:

```typescript
// Clear the entire store
await prefs.db.clear();

// Iterate over all items
await prefs.db.iterate((value, key) => {
    console.log(key, value);
});
```

## Complete Example

```typescript
import { useTmem } from "@agent-smith/tmem";

async function main() {
    // 1. Create and initialize
    const store = useTmem("appState", { version: 1, tokens: [] });
    await store.init();

    // 2. Write values
    await store.set("version", 2);
    await store.set("tokens", ["abc", "def"]);

    // 3. Read values
    const version = await store.get<number>("version");
    const tokens = await store.get<string[]>("tokens");
    console.log(`Version: ${version}, Tokens: ${tokens.join(", ")}`);

    // 4. List all keys
    const keys = await store.keys();
    console.log("Keys:", keys); // ["version", "tokens"]

    // 5. Get everything
    const allData = await store.all();
    console.log(allData);
}

main();
```

## API Reference

### Factory Function: `useTmem`

```typescript
function useTmem<S extends Record<string, any> = Record<string, any>>(
    name: string,
    initial: S,
    verbose?: boolean
): Tmem<S>
```

Creates a new transient memory store.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | The name of the localForage store instance. Determines the IndexedDB object store name. |
| `initial` | `S` (extends `Record<string, any>`) | An object containing initial key-value pairs. Written only if the store is empty. |
| `verbose` | `boolean` (optional) | If `true`, logs a message to `console` when initial data is populated. Default: `false`. |

#### Return Value

Returns an object conforming to the `Tmem<S>` interface.

### Interface: `Tmem<S>`

```typescript
interface Tmem<S extends Record<string, any>> {
    db: LocalForage;
    init(): Promise<void>;
    set(k: string, v: any): Promise<void>;
    get<T>(k: string): Promise<T>;
    del(k: string): Promise<void>;
    keys(): Promise<Array<string>>;
    all<T = any>(): Promise<Record<string, T>>;
}
```

All methods are **asynchronous** and return Promises.

#### Property: `db`

| Property | Type | Description |
|----------|------|-------------|
| `db` | `LocalForage` | The underlying localForage instance. Use it for advanced operations like `clear()` or `iterate()`. |

#### Method Summary

| Method | Signature | Returns |
|--------|-----------|---------|
| `init()` | `() => Promise<void>` | — |
| `set(k, v)` | `(k: string, v: any) => Promise<void>` | — |
| `get<T>(k)` | `(k: string) => Promise<T>` | Value of type `T` |
| `del(k)` | `(k: string) => Promise<void>` | — |
| `keys()` | `() => Promise<Array<string>>` | Array of keys |
| `all<T>()` | `() => Promise<Record<string, T>>` | Key-value object |

## Important Notes

- 🌐 **Browser-only**: `tmem` uses IndexedDB through localForage, so it only works in browser environments. It is not suitable for Node.js server-side use.
- 📦 **Complementary to smem**: For server-side persistent memory, use `@agent-smith/smem` (LanceDB-based semantic memory).
- ⚠️ **`get()` throws**: Unlike `localStorage.getItem()`, `get()` throws an `Error` if the key does not exist. Handle with try/catch.
- 🔒 **Typed stores**: The generic parameter `S` lets TypeScript infer the shape of your initial data for type-safe access.

## License

MIT

# @agent-smith/tmem

**Transient key-value memory for AI agents in the browser.**

`tmem` provides a lightweight, persistent key-value store backed by IndexedDB via [localForage](https://localforage.github.io/localForage/). It enables in-browser storage that survives page reloads, with a simple TypeScript API for managing transient agent state.

## Features

- 🌐 **Browser-only**: Uses IndexedDB for reliable, persistent storage
- ⚡ **Async API**: All operations are asynchronous and type-safe
- 🔧 **Generic Factory**: Type-safe store creation with `useTmem<S>()`
- 📦 **Zero Dependencies**: Only requires `localforage` as a peer dependency
- 🔄 **Init-on-Demand**: Automatically populates initial data on first use

## Installation

```bash
npm i @agent-smith/tmem
```

## Quick Start

```typescript
import { useTmem } from "@agent-smith/tmem";

// 1. Create a store with initial data
const tmem = useTmem("myStore", { greeting: "hello", count: 0 });

// 2. Initialize the store
await tmem.init();

// 3. Read and write values
await tmem.set("greeting", "world");
const greeting = await tmem.get<string>("greeting"); // "world"

// 4. Delete keys and list them
await tmem.del("count");
const keys = await tmem.keys(); // ["greeting"]
```

## Usage

### Creating a Store

Use the `useTmem` factory function to create a named store with optional initial data:

```typescript
const prefs = useTmem("userPrefs", {
    theme: "dark",
    language: "en",
    fontSize: 14,
});
```

**Important**: The `initial` object is only written if the store is currently empty. Subsequent calls to `init()` will not overwrite existing data.

### Initialization

Always call `init()` before performing any read or write operations:

```typescript
await prefs.init();
```

`init()` performs the following:
1. Waits for the underlying IndexedDB instance to be ready
2. Populates the store with initial data if empty
3. Logs a message to console if `verbose` mode is enabled

### Verbose Mode

Enable logging during initialization:

```typescript
const prefs = useTmem("userPrefs", { theme: "dark" }, true);
await prefs.init();
// Console: Tmem: setting initial data for store userPrefs
```

### Reading and Writing

All read and write operations are asynchronous. Use `await` with every call:

```typescript
// Write
await prefs.set("theme", "light");

// Read (throws if key is missing)
const theme = await prefs.get<string>("theme"); // "light"

// Get all values at once
const allPrefs = await prefs.all();
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

All other methods (`init`, `set`, `del`, `keys`, `all`) resolve normally even if the store is empty.

### Accessing the Underlying Instance

The returned `Tmem` object exposes the `db` property for advanced localForage operations:

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

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | The name of the localForage store instance |
| `initial` | `S` | Initial key-value pairs (written only if empty) |
| `verbose` | `boolean` | Enable logging during initialization (default: `false`) |

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

**Method Summary:**

| Method | Signature | Returns | Async |
|--------|-----------|---------|-------|
| `init()` | `() => Promise<void>` | — | Yes |
| `set(k, v)` | `(k: string, v: any) => Promise<void>` | — | Yes |
| `get<T>(k)` | `(k: string) => Promise<T>` | Value of type T | Yes |
| `del(k)` | `(k: string) => Promise<void>` | — | Yes |
| `keys()` | `() => Promise<Array<string>>` | Array of keys | Yes |
| `all<T>()` | `() => Promise<Record<string, T>>` | Key-value object | Yes |

## Browser-Only Considerations

⚠️ **Important**: `tmem` uses IndexedDB through localForage and **only works in browser environments**. It is not suitable for Node.js server-side use.

For persistent memory on the server side, use `@agent-smith/smem` (LanceDB).

## Related Packages

- `@agent-smith/smem` — Semantic memory via LanceDB for vector search
- `@agent-smith/core` — Runtime engine that uses tmem for transient state
- `localforage` — The underlying IndexedDB wrapper library

## Documentation

For more detailed documentation, see:
- [Get Started](https://lynxai-team.github.io/agent-smith/libraries/transient_memory/get_started)
- [Usage Guide](https://lynxai-team.github.io/agent-smith/libraries/transient_memory/usage)
- [API Reference](https://lynxai-team.github.io/agent-smith/libraries/transient_memory/api)

## License

MIT

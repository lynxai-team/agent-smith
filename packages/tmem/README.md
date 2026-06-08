[![npm version](https://img.shields.io/npm/v/@agent-smith/tmem)](https://www.npmjs.com/package/@agent-smith/tmem)

# @agent-smith/tmem — Transient Memory for AI Agents

A lightweight key-value store wrapping [localForage](https://localforage.github.io/localForage/) (IndexedDB backend) with a simple typed async API. Part of the [Agent Smith toolkit](https://github.com/lynxai-team/agent-smith).

## ✨ Features

- 🗄️ **IndexedDB-backed persistence** — data survives page reloads via localForage
- 🔤 **TypeScript generics** — typed stores with automatic type inference from keys
- ⚡ **Simple API** — `init`, `set`, `get`, `del`, `keys`, `all` operations
- 🌐 **Browser-only** — designed for client-side agent state management
- 🔄 **Lazy initialization** — initial data populated only when store is empty

## 📖 Documentation

### For AI Agents
- [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns
- [Source: tmem.ts](src/tmem.ts) — Factory implementation
- [Source: tmeminterfaces.ts](src/tmeminterfaces.ts) — Type definitions

### For Humans
- [Get Started](https://lynxai-team.github.io/agent-smith/libraries/transient_memory/1.get_started.md) — Installation and quick start
- [Usage Guide](https://lynxai-team.github.io/agent-smith/libraries/transient_memory/2.usage.md) — Patterns and examples
- [API Reference](https://lynxai-team.github.io/agent-smith/libraries/transient_memory/3.api.md) — Complete API surface

## 📦 Installation

```bash
npm i @agent-smith/tmem
```

## 🚀 Quick Start

```typescript
import { useTmem } from "@agent-smith/tmem";

const store = useTmem("myStore", { greeting: "hello", count: 0 });
await store.init();

// Write
await store.set("greeting", "world");

// Read (type inferred from key)
const greeting = await store.get("greeting");
console.log(greeting); // "world"

// Delete and list
await store.del("count");
const keys = await store.keys();
console.log(keys); // ["greeting"]
```

## 📝 Usage

### Creating a Store

```typescript
import { useTmem } from "@agent-smith/tmem";

const prefs = useTmem("userPrefs", {
    theme: "dark",
    language: "en",
    fontSize: 14,
});
```

The `initial` object is written only if the store is empty. Subsequent `init()` calls won't overwrite existing data.

### Initialization

Always call `init()` before any read/write operations:

```typescript
await prefs.init();
```

`init()` waits for IndexedDB readiness and populates initial data if the store is empty.

### Verbose Mode

Enable logging during initialization:

```typescript
const prefs = useTmem("userPrefs", { theme: "dark" }, true);
await prefs.init();
// Console: Tmem: setting initial data for store userPrefs
```

### Reading and Writing

All operations are asynchronous:

```typescript
// Write
await prefs.set("theme", "light");

// Read (type inferred from key)
const theme = await prefs.get("theme");
console.log(theme); // "light"

// Get all values
const allPrefs = await prefs.all();
// { theme: "light", language: "en", fontSize: 14 }
```

### Error Handling

`get()` throws if the key doesn't exist:

```typescript
try {
    const value = await prefs.get("nonexistent");
} catch (e) {
    console.error(e.message); // "Key nonexistent not found"
}
```

### Deleting Keys

```typescript
await prefs.del("fontSize");
```

### Accessing the Underlying localForage Instance

```typescript
// Clear the entire store
await prefs.db.clear();

// Iterate over all items
await prefs.db.iterate((value, key) => {
    console.log(key, value);
});
```

## 🔧 Complete Example

```typescript
import { useTmem } from "@agent-smith/tmem";

async function main() {
    // 1. Create and initialize
    const store = useTmem("appState", { version: 1, tokens: [] });
    await store.init();

    // 2. Write values
    await store.set("version", 2);
    await store.set("tokens", ["abc", "def"]);

    // 3. Read values (types inferred from keys)
    const version = await store.get("version");
    const tokens = await store.get("tokens");
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

## 📚 API Reference

### Factory Function: `useTmem`

```typescript
function useTmem<S extends Record<string, any> = Record<string, any>>(
    name: string,
    initial: S,
    verbose?: boolean
): Tmem<S>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Name of the localForage store (determines IndexedDB object store name) |
| `initial` | `S` | Initial key-value pairs. Written only if store is empty |
| `verbose` | `boolean` (optional) | Enable console logging during init. Default: `false` |

### Interface: `Tmem<S>`

```typescript
interface Tmem<S extends Record<string, any>> {
    db: LocalForage;
    init(): Promise<void>;
    set<T extends keyof S>(k: T, v: S[T]): Promise<void>;
    get<T extends keyof S>(k: T): Promise<S[T]>;
    del<T extends keyof S>(k: T): Promise<void>;
    keys(): Promise<Array<string>>;
    all<T = any>(): Promise<Record<string, T>>;
}
```

### Method Summary

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `init()` | `() => Promise<void>` | — | Initialize store with initial data if empty |
| `set(k, v)` | `(k: keyof S, v: S[keyof S]) => Promise<void>` | — | Store a key-value pair |
| `get(k)` | `(k: keyof S) => Promise<S[keyof S]>` | Value | Retrieve value by key (throws if missing) |
| `del(k)` | `(k: keyof S) => Promise<void>` | — | Remove a key from the store |
| `keys()` | `() => Promise<string[]>` | Array | List all keys in the store |
| `all()` | `() => Promise<Record<string, any>>` | Object | Get all key-value pairs |

## ⚠️ Important Notes

- **Browser-only**: Uses IndexedDB via localForage — not suitable for Node.js/server-side use
- **Server alternative**: Use `@agent-smith/smem` (LanceDB) for persistent memory on the server side
- **Async operations**: All methods return Promises — always use `await`
- **Type inference**: Generic types are inferred from keys, not provided by the user

## 📄 License

MIT

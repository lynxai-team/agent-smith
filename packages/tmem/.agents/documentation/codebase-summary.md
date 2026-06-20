# @agent-smith/tmem

## Summary
Transient key-value memory module that wraps localForage (IndexedDB backend) with a generic typed API for init, set, get, del, keys, and all operations.

## Dependencies
- External: `localforage` (^1.10.0) — IndexedDB wrapper for browser-based persistent storage

## Used By
- *(none currently — available for use by other packages such as cli, agent, or ui)*

## Entry Point
- `src/main.ts` — Re-exports `Tmem` interface and `useTmem` factory function

## Key Files
| File | Purpose |
|------|---------|
| `src/main.ts` | Entry point: re-exports `Tmem` and `useTmem` |
| `src/tmem.ts` | `useTmem<S>()` generic factory: creates a named localForage instance and returns a typed store with init/set/get/del/keys/all |
| `src/tmeminterfaces.ts` | `Tmem<S>` interface defining the transient memory module shape |

## Architecture
- **Generic Factory**: `useTmem<S>()` creates a typed instance for a named store with optional initial data, using TypeScript generics to infer value types from keys.
- **Wrapper Pattern**: Simplifies localForage's API into consistent async key-value operations (set/get/del/keys/all) with an `init` method for seeding empty stores.
- **IndexedDB Backend**: Persists data in the browser via IndexedDB through localForage, with `db.ready()` ensuring operations are safe on first access.
- **Type-Safe Keys**: TypeScript generics constrain keys to `keyof S`, so `get("count")` returns the inferred type without explicit type parameters.

## Related
- See `packages/smem` — complementary semantic (vector) memory; tmem handles simple key-value persistence while smem handles vector embeddings.
- See `packages/types` — shared TypeScript types across the agent-smith monorepo.

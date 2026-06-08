# @agent-smith/tmem

## Summary
Transient key-value memory for agents. Wraps localForage (IndexedDB backend) with a simple typed API: `init`, `set`, `get`, `del`, `keys`, `all`.

## Dependencies
- External: `localforage` (IndexedDB wrapper).

## Used By
- `@agent-smith/core` — for transient state persistence.
- Browser-based agent apps needing lightweight key-value storage.

## Entry Point
- `src/main.ts` — Re-exports `Tmem` interface and `useTmem` function.

## Key Files
| File | Purpose |
|------|---------|
| `src/tmem.ts` | `useTmem<S>()` generic factory: creates localForage instance, returns typed store with init/set/get/del/keys/all |
| `src/tmeminterfaces.ts` | `Tmem<S>` interface defining the memory module shape |

## Architecture
- **Generic Factory**: `useTmem<S>()` creates a typed instance for a named store with optional initial data.
- **Wrapper Pattern**: Simplifies localForage's API to consistent async key-value operations.
- **Init on Demand**: `init()` populates store only if empty, enabling reproducible agent state.
- **Type Inference**: TypeScript generics infer value types from keys — `get("count")` returns the inferred type without explicit type parameters.

## API Surface
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

## Related
- See `packages/smem` — complementary semantic (vector) memory; tmem handles simple key-value persistence.

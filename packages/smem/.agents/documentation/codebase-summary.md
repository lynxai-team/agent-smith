# @agent-smith/smem

## Summary
Semantic memory API for agents: stores, retrieves, and searches data using vector embeddings powered by LanceDB and Xenova transformers.

## Dependencies
- `@lancedb/lancebd` — vector database for persistent storage and vector search
- `@xenova/transformers` — text embedding pipeline (`all-MiniLM-L6-v2`, 384-dim vectors)
- `apache-arrow` — schema definition and data format for LanceDB tables

## Used By
- No direct references found in workspace; designed for consumption by CLI and server packages.

## Entry Point
- `src/main.ts` — Exports `useSmem`, `useSnode`, `SmemNodeFieldSchema`, `SmemNodeSchema`, `SmemNode`, `Smem`

## Key Files
| File | Purpose |
|------|---------|
| `src/main.ts` | Barrel export: re-exports useSmem, useSnode, and all type definitions |
| `src/useSmem.ts` | Factory `useSmem()`: initializes LanceDB connection and embedding pipeline; `node()` creates typed tables; `embed()` batch text→vector conversion |
| `src/useSnode.ts` | Node interface: `add()`, `upsert()`, `search()`, `filter()`; auto-opens tables on first use; vector embedding at write time |
| `src/smeminterfaces.ts` | Type definitions: `SmemNode<T>`, `Smem`, `SearchParams`, `SmemNodeFieldSchema` |

## Architecture
- **Factory Pattern**: `useSmem()` returns a configured instance with `node()` factory for typed table handles.
- **Generic Types**: `SmemNode<T>` provides type-safe CRUD and vector search operations.
- **Lazy Initialization**: Tables auto-open on first operation; nodes cached in a registry map.
- **Auto-Embedding**: Text source column auto-embedded via `all-MiniLM-L6-v2` at write time; vectors stored as 384-dim FixedSizeList columns.

## Related
- See `packages/tmem` — transient (key-value) memory; complements smem's semantic/vector search with ephemeral storage.

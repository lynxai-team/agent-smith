# @agent-smith/smem

## Summary
Semantic memory API for agents: stores, retrieves, and searches data using vector embeddings. Powered by LanceDB (vector database) and Xenova transformers (`all-MiniLM-L6-v2`, 384-dim vectors).

## Dependencies
- `@agent-smith/types` — shared types.
- External: `@lancedb/lancebd` (vector DB), `@xenova/transformers` (text embeddings).

## Used By
- `@agent-smith/core` — for semantic memory integration in agent features.
- Agent plugins that require vector search (e.g., filesystem indexing).

## Entry Point
- `src/main.ts` — Exports `useSmem`, `useSnode`, and type definitions (`SmemNodeFieldSchema`, `Smem`).

## Key Files
| File | Purpose |
|------|---------|
| `src/useSmem.ts` | Factory `useSmem()`: creates semantic memory instance; `init()` loads embedding pipeline; `node()` creates tables; `embed()` batch text→vector |
| `src/useSnode.ts` | Node interface: `add()`, `upsert()`, `search()` (cosine similarity), `filter()`; auto-opens tables on first use |
| `src/smeminterfaces.ts` | Types: `SmemNode<T>` (generic CRUD/search), `Smem`, `SearchParams`, `SmemNodeFieldSchema` |

## Architecture
- **Factory Pattern**: `useSmem()` returns a configured instance; `node()` creates typed table handles.
- **Generic Types**: `SmemNode<T>` for type-safe data operations.
- **Lazy Initialization**: Tables auto-opened on first operation; nodes cached in a registry.
- **Vector Embeddings**: Text auto-embedded via `all-MiniLM-L6-v2` (384-dim vectors stored as FixedSizeList columns).
- **Schema Management**: Auto Arrow schema generation from type defs; supports string/int/float/boolean + vector column.

## Related
- See `packages/tmem` — complementary transient (key-value) memory; smem handles semantic/vector search.
- See `packages/core` — integrates smem for agent feature storage and retrieval.

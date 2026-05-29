# @agent-smith/smem

## Summary
An API to create human-friendly agents using semantic memory. This package provides a high-level interface for storing, retrieving, and searching data using vector embeddings powered by LanceDB and the Xenova transformers library (all-MiniLM-L6-v2 model).

## File Structure
```
packages/smem/
├── package.json              # Package configuration and dependencies
├── tsconfig.json             # TypeScript compiler configuration
├── rollup.config.js          # Rollup bundler configuration for ESM and IIFE builds
├── src/
│   ├── main.ts               # Main entry point - exports all public APIs
│   ├── useSmem.ts            # Core semantic memory factory function
│   ├── useSnode.ts           # Node interface for table operations (CRUD, search)
│   └── smeminterfaces.ts     # TypeScript interfaces and type definitions
└── types/
    └── transformers.d.ts     # Type declaration for @xenova/transformers module
```

## File Descriptions

### `package.json`
Defines the package `@agent-smith/smem` (version 0.0.5). Dependencies include `@lancedb/lancebd` for vector database operations and `@xenova/transformers` for text embeddings. Supports both TypeScript compilation (`tsc`) and Rollup bundling.

### `src/main.ts`
Entry point that re-exports all public APIs: `useSmem`, `useSnode`, and the type definitions (`SmemNodeFieldSchema`, `SmemNodeSchema`, `SmemNode`, `Smem`).

### `src/useSmem.ts`
The core factory function that creates a semantic memory instance. Key features:
- **init()**: Initializes the database connection and loads the feature extraction pipeline (all-MiniLM-L6-v2)
- **node()**: Creates a new node from a schema definition with automatic Arrow schema generation
- **nodeFromSchema()**: Creates a node from an existing Apache Arrow Schema
- **nodeFromData()**: Creates a node from sample data with auto-detected schema
- **embed()**: Batch embedding function for converting text arrays to vectors
- Manages a registry of nodes in memory

### `src/useSnode.ts`
Provides the node interface for interacting with individual database tables. Key operations:
- **add() / addRaw()**: Insert new records (with/without automatic vector generation)
- **upsert() / upsertRaw()**: Upsert records (update if exists, insert if not)
- **insertIfNotExists()**: Insert only if record doesn't exist by ID
- **search()**: Vector similarity search using cosine distance
- **filter()**: Filter-based query without vector search
- Auto-opens tables on first use

### `src/smeminterfaces.ts`
TypeScript interfaces defining the package contract:
- **SmemNode<T>**: Generic interface for node operations
- **Smem**: Interface for the semantic memory instance
- **SearchParams**: Configuration for search/filter queries (limit, filters, select fields, distance type)
- **SmemNodeFieldSchema**: Schema field definition (name, type, nullable)
- **FieldDataType**: Supported types: "string", "int", "float", "boolean"

### `types/transformers.d.ts`
Type declaration file extending the `@xenova/transformers` module.

### `tsconfig.json`
TypeScript configuration targeting ES2022 with Node16 modules, strict mode enabled, output to `./dist`.

### `rollup.config.js`
Builds two outputs: ESM format (`dist/api.es.js`) and minified IIFE (`dist/api.min.js`) with the global name `$agentbrain`.

## Architecture & Patterns

- **Factory Pattern**: `useSmem()` is a factory function that returns a configured semantic memory instance
- **Generic Types**: `SmemNode<T>` uses TypeScript generics for type-safe data operations
- **Lazy Initialization**: Tables are auto-opened on first operation; nodes are cached in a registry
- **Vector Embeddings**: Text is automatically embedded using the Xenova all-MiniLM-L6-v2 model (384-dimensional vectors) stored as FixedSizeList columns
- **Schema Management**: Automatic Arrow schema generation from type definitions, with support for string/int/float/boolean fields plus a fixed 384-dim vector column
- **LanceDB Integration**: Uses LanceDB's mergeInsert for upsert operations and supports vector similarity search with configurable distance metrics (cosine by default)

[![npm package](https://img.shields.io/npm/v/@agent-smith/smem)](https://www.npmjs.com/package/@agent-smith/smem)

# @agent-smith/smem — Semantic Memory for AI Agents

Vector-based semantic memory using LanceDB + Xenova embeddings (384-dim `all-MiniLM-L6-v2`). Part of the [Agent Smith toolkit](https://github.com/lynxai-team/agent-smith).

## Features

- 🧠 **Semantic Search** — Find relevant data using natural language queries via vector embeddings
- 🔍 **Filter & Query** — Combine semantic search with SQL-like column filters
- ✏️ **CRUD Operations** — Add, upsert, insert-if-not-exists with automatic embedding
- 📐 **Type-Safe** — Generic `SmemNode<T>` for type-safe data operations
- ⚡ **Auto-Embedding** — Text is automatically embedded using `all-MiniLM-L6-v2` (384-dim vectors)
- 🔌 **Lazy Initialization** — Tables auto-open on first use; nodes cached in a registry
- 📊 **Raw Access** — Pre-computed vectors via `addRaw()` / `upsertRaw()` for advanced use cases

## Documentation

### For AI Agents
- [Codebase Summary](.agents/documentation/codebase-summary.md) — Architecture, key files, and patterns for the smem package
- [Get Started](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/semantic_memory/1.get_started.md) — Overview and quick start
- [Initialize](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/semantic_memory/2.initialize.md) — Schema definition, database initialization, and node creation
- [Write Operations](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/semantic_memory/3.write_operations.md) — add, upsert, insertIfNotExists, raw operations
- [Read Operations](https://raw.githubusercontent.com/lynxai-team/agent-smith/refs/heads/main/docsite/public/doc/libraries/semantic_memory/4.read_operations.md) — search, filter, vector embeddings

### For Humans
- [Overview & Quick Start](https://lynxai-team.github.io/agent-smith/libraries/semantic_memory/1.get_started) — Overview and quick start
- [Initialize a Database](https://lynxai-team.github.io/agent-smith/libraries/semantic_memory/2.initialize) — Schema definition, database initialization, and node creation
- [Write Operations](https://lynxai-team.github.io/agent-smith/libraries/semantic_memory/3.write_operations) — add, upsert, insertIfNotExists, raw operations
- [Read Operations](https://lynxai-team.github.io/agent-smith/libraries/semantic_memory/4.read_operations) — search, filter, vector embeddings

## Installation

```bash
npm i @agent-smith/smem
```

## Quick Start

```ts
import { useSmem } from "@agent-smith/smem";

const mem = useSmem();
await mem.init("./my-memory");

const schema = [
    { name: "title", type: "string" },
    { name: "text", type: "string" },
];

const documents = await mem.node("documents", schema, "text");
await documents.add([{ title: "Hello", text: "World of semantic memory" }]);

const results = await documents.search("semantic concepts");
```

## Usage

### Initialization

Create a memory instance and initialize it with a database path:

```ts
import { useSmem } from "@agent-smith/smem";
import path from "path";

const mem = useSmem();
await mem.init(path.join(process.cwd(), "my-memory"));
```

Enable verbose logging for debugging:

```ts
const mem = useSmem(true);  // verbose mode
```

### Schema Definition

Define your data schema using the `SmemNodeSchema` type — an array of field definitions:

```ts
import { useSmem, SmemNodeSchema } from "@agent-smith/smem";

const schema: SmemNodeSchema = [
    { name: "id", type: "int" },
    { name: "title", type: "string" },
    { name: "text", type: "string" },
    { name: "tags", type: "string" },
];
```

Supported field types: `string`, `int`, `float`, `boolean`. Each field can optionally have a `nullable` property (defaults to `false`).

### Creating Nodes

**From schema:**
```ts
const documents = await mem.node("documents", schema, "text");
```

The three parameters are:
1. `name` — The table/node name in the database
2. `schema` — The field schema definition
3. `vectorSourceCol` — The column whose text will be embedded into vectors

**From raw data (schema inferred):**
```ts
const documents = await mem.nodeFromData("documents", [
    { id: 1, title: "Hello", text: "World" },
    { id: 2, title: "Foo", text: "Bar" },
], "text");
```

**From Apache Arrow schema (advanced):**
```ts
import { Schema, Field, Float64, Int32, Utf8, FixedSizeList } from "apache-arrow";

const arrowSchema = new Schema([
    new Field("id", new Int32(), false),
    new Field("title", new Utf8()),
    new Field("text", new Utf8()),
    new Field(
        "vector",
        new FixedSizeList(384, new Field("value", new Float64())),
        false
    ),
]);

const documents = await mem.nodeFromSchema("documents", arrowSchema, "text");
```

### Writing Data

**Add records** (auto-embeds text):
```ts
await mem.nodes.documents.add([
    { id: 1, title: "Lorem Ipsum", text: "Lorem ipsum dolor sit amet ...", tags: "science" },
    { id: 2, title: "Quantum Physics", text: "Quantum mechanics describes ...", tags: "physics" },
]);
```

**Upsert records** (update or insert by key):
```ts
await mem.nodes.documents.upsert(data, "id");
```

**Insert only if not exists:**
```ts
await mem.nodes.documents.insertIfNotExists(data, "id");
```

**Raw operations** (with pre-computed vectors):
```ts
await mem.nodes.documents.addRaw([
    { id: 3, title: "Pre-embedded", text: "Some text", vector: [/* 384 floats */] },
]);
```

### Reading Data

**Semantic search:**
```ts
const results = await mem.nodes.documents.search("lorem ipsum", {
    limit: 10,
    select: ["title", "text"],
    distanceType: "cosine",
});
```

Results include a `_distance` field — lower distances indicate higher similarity.

**Filter by columns:**
```ts
const results = await mem.nodes.documents.filter({
    limit: 20,
    select: ["title", "text"],
    filters: ["tags LIKE '%science%'"],
});
```

**Combined search + filter:**
```ts
const results = await mem.nodes.documents.search("quantum computing", {
    limit: 5,
    select: ["title", "text"],
    distanceType: "cosine",
    filters: ["category = 'science'"],
});
```

### Vector Embeddings

Get raw embedding vectors for a text string:

```ts
const embedding = await mem.vector("hello world");
// Returns: Array<number> (384-dimensional)
```

### Listing & Opening Nodes

```ts
// List all nodes
const nodeNames = await mem.nodeNames();
// Returns: string[] — e.g., ["documents", "articles"]

// Open an existing node
const table = await mem.openTable("documents");
```

## Complete Example

```ts
import { useSmem } from "@agent-smith/smem";
import path from "path";

async function main() {
    // Initialize semantic memory
    const mem = useSmem(true);  // verbose mode
    await mem.init(path.join(process.cwd(), "my-memory"));

    // Define schema
    const schema = [
        { name: "id", type: "int" },
        { name: "title", type: "string" },
        { name: "text", type: "string" },
        { name: "category", type: "string" },
    ];

    // Create node
    const articles = await mem.node("articles", schema, "text");

    // Add data (auto-embedded)
    await articles.add([
        { id: 1, title: "Intro to AI", text: "Artificial intelligence is transforming industries.", category: "tech" },
        { id: 2, title: "Quantum Computing", text: "Quantum computers leverage superposition for computation.", category: "science" },
        { id: 3, title: "Machine Learning", text: "ML models learn patterns from data to make predictions.", category: "tech" },
    ]);

    // Semantic search
    const techResults = await articles.search("technology and computing", {
        limit: 5,
        select: ["title", "text"],
        filters: ["category = 'tech'"],
    });
    console.log("Tech results:", techResults);

    // Filter without semantic search
    const scienceDocs = await articles.filter({
        filters: ["category = 'science'"],
    });
    console.log("Science docs:", scienceDocs);

    // Upsert with key
    await articles.upsert(
        [{ id: 1, title: "Intro to AI (Updated)", text: "AI continues to transform industries rapidly.", category: "tech" }],
        "id"
    );

    // Get raw embedding
    const vec = await mem.vector("hello world");
    console.log(`Vector dimension: ${vec.length}`);
}

main().catch(console.error);
```

## API Reference

### `useSmem(isVerbose?: boolean): Smem`

Factory function that creates a semantic memory instance.

| Parameter | Type | Description |
|-----------|------|-------------|
| `isVerbose` | `boolean` | Enable console logging (default: `false`) |

**Returns:** `Smem` interface

### `Smem` Interface

| Method | Signature | Description |
|--------|-----------|-------------|
| `init` | `(dbpath: string) => Promise<Connection>` | Initialize the LanceDB database at the given path |
| `node` | `<T>(name: string, schema: SmemNodeSchema, vectorSourceCol: string) => Promise<SmemNode<T>>` | Create a typed node from a schema definition |
| `nodeFromData` | `<T>(name: string, data: Array<Record<string, unknown>>, vectorSourceCol: string) => Promise<SmemNode<T>>` | Create a node inferred from sample data |
| `nodeFromSchema` | `<T>(name: string, schema: Schema, vectorSourceCol: string) => Promise<SmemNode<T>>` | Create a node from an Apache Arrow Schema |
| `nodeNames` | `() => Promise<string[]>` | List all node (table) names in the database |
| `openTable` | `(name: string) => Promise<Table>` | Open an existing table by name |
| `vector` | `(text: string) => Promise<number[]>` | Get the 384-dim embedding vector for a text string |
| `embed` | `(data: unknown[]) => Promise<number[][]>` | Batch-embed an array of texts into vectors |
| `nodes` | `Record<string, SmemNode>` | Registry of all created nodes |

### `SmemNode<T>` Interface

| Method | Signature | Description |
|--------|-----------|-------------|
| `add` | `(data: Array<T>) => Promise<void>` | Add records with automatic embedding |
| `addRaw` | `(data: Array<T>) => Promise<void>` | Add records with pre-computed vectors |
| `upsert` | `(data: Array<T>, idCol?: string) => Promise<void>` | Insert or update records by key |
| `upsertRaw` | `(data: Array<T>, idCol?: string) => Promise<void>` | Upsert with pre-computed vectors |
| `insertIfNotExists` | `(data: Array<T>, idCol?: string) => Promise<void>` | Insert only when key doesn't exist |
| `search` | `(q: string, params?: SearchParams) => Promise<Array<Record<string, any>>>` | Semantic search with optional filters |
| `filter` | `(params?: SearchParams) => Promise<Array<Record<string, any>>>` | Filter by column values (no semantic search) |
| `open` | `() => Promise<Table>` | Re-open the underlying LanceDB table |

### `SearchParams` Interface

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | `number` | Maximum results (`-1` for all, default) |
| `select` | `string[]` | Columns to include (empty = all) |
| `distanceType` | `string` | `"cosine"` or `"l2"` |
| `filters` | `string[]` | SQL-like filter expressions |

## Important Notes

- 🌐 **Browser & Node.js** — Works in both browser (via IndexedDB through localForage) and Node.js environments
- 🔒 **Vector Column** — Every table automatically includes a 384-dimensional `vector` column (`FixedSizeList<Float64>`)
- ⚠️ **Duplicate Data** — `add()` does not check for duplicates; use `upsert()` or `insertIfNotExists()` to avoid them
- 🔑 **Key Column** — Upsert operations require a unique identifier column (e.g., `"id"`)
- 📦 **Dependencies** — Requires `@lancedb/lancedb` and `@xenova/transformers` (auto-installed)

## Related Packages

- [`@agent-smith/tmem`](../tmem/README.md) — Transient key-value memory for short-term agent state
- [`@agent-smith/core`](../core/README.md) — Runtime engine that integrates semantic memory
- [`@agent-smith/agent`](../agent/README.md) — Agent inference loop consuming memory backends

## License

MIT

# @agent-smith/agent

## Summary
Agent runtime providing the `Agent` class (inference loop with recursive tool calling) and `Lm` class (OpenAI-compatible HTTP client for streaming inference). Works in Node.js and browsers.

## Dependencies
- `@agent-smith/types` — `AgentParams`, `ToolSpec`, `HistoryTurn`, `InferenceCallbacks`, `LmProvider`, `AgentSpec`.
- External: `restmix` (HTTP client), `eventsource-parser` (SSE streaming parser), `yaml` (YAML spec parsing), `openai` (type definitions for OpenAI API).

## Used By
- `@agent-smith/cli` — CLI uses agent runtime for interactive agent sessions with streaming.
- `@agent-smith/core` — wraps Agent class with MCP backend selection and config integration.

## Entry Point
- `src/main.ts` — Exports `Agent` and `Lm` classes.

## Key Files
| File | Purpose |
|------|---------|
| `src/agent.ts` | `Agent` class: orchestrates inference loop, manages `HistoryTurn[]`, recursive tool calling, callback dispatch |
| `src/client.ts` | `Lm` class: OpenAI-compatible HTTP client; streaming (SSE) and non-streaming inference; tokenize/detokenize |
| `src/tools.ts` | Converts `ToolSpec` to OpenAI function format; image handling (base64 from Buffer/URL); tool call ID generation |
| `src/params.ts` | Inference parameter formatting: merges user options with default `InferenceParams` |
| `src/stats.ts` | Performance metrics: cache hit rates, draft token acceptance, throughput, prompt processing progress |
| `src/variables.ts` | Template variable substitution for agent specs: validates required vars, applies defaults |
| `src/history/build.ts` | Converts `HistoryTurn[]` to OpenAI messages format; handles tool calls, reasoning_content |
| `src/history/display.ts` | Human-readable conversation history display to console |

## Architecture
- **Recursive Inference Loop**: After tool calls, results are appended as new `HistoryTurn`s and inference re-invoked with updated context.
- **Callback-Driven Events**: Comprehensive callback system for real-time tokens, thinking phases, tool call lifecycle.
- **Streaming-First**: Default mode uses SSE streaming for real-time token output.
- **OpenAI-Compatible API**: `Lm` class speaks OpenAI chat completions API — works with any compatible server (llama.cpp, Ollama, vLLM, etc.).
- **Template System**: Agent specs support variable substitution in prompts, system templates, and few-shot examples.

## Related
- See `packages/types` — provides all interfaces (`AgentParams`, `ToolSpec`, `HistoryTurn`).
- See `packages/core` — core's `agents/useagent.ts` wraps the `Agent` class with MCP and backend selection.
- See `packages/cli` — CLI uses this agent runtime for interactive agent sessions.

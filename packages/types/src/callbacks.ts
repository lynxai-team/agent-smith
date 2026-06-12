/**
 * Defines callback interfaces for inference and agent interactions.
 * Imports: Utilizes types from `history.js`, `inference.js`, `stats.js`, and `tools.js`.
 * @example
 * // Example of using InferenceCallbacks
 * const inferenceCallbacks: InferenceCallbacks = {
 *   onToken: (token: string, from: string) => console.log(`Token from ${from}: ${token}`),
 *   onError: (err: any, from: string) => console.error(`Error from ${from}:`, err)
 * };
 *
 * // Example of using AgentCallbacks
 * const agentCallbacks: AgentCallbacks = {
 *   onToolCall: (tc: ToolCallSpec, type: string, from: string) => console.log(tc),
 *   onTurnEnd: (ht: HistoryTurn, from: string) => console.log(ht)
 * };
 *
 * // Example of using AllCallbacks
 * const allCallbacks: AllCallbacks = {
 *   ...inferenceCallbacks,
 *   ...agentCallbacks
 * };
 */

import type { HistoryTurn, ToolTurn } from "./history.js";
import type { InferenceResult } from "./inference.js";
import type { PromptProcessingInProgressStats } from "./stats.js";
import type { ToolCallSpec } from "./tools.js";

/**
 * Represents the callbacks for inference events.
 *
 * @interface InferenceCallbacks
 * @property {() => void} [onStartThinking] - Callback when thinking starts.
 * @property {() => void} [onEndThinking] - Callback when thinking ends.
 * @property {(t: string, from: string) => void} [onToken] - Callback for each token emitted.
 * @property {(t: string, from: string) => void} [onThinkingToken] - Callback for thinking tokens.
 * @property {(t: string, from: string) => void} [onToolCallToken] - Callback for tool call tokens.
 * @property {(data: PromptProcessingInProgressStats, from: string) => void} [onStartEmit] - Callback when emission starts.
 * @property {(result: InferenceResult, from: string) => void} [onEndEmit] - Callback when emission ends.
 * @property {(err: any, from: string) => void} [onError] - Callback for errors.
 * @property {(tc: Array<ToolCallSpec>, from: string) => void} [onToolCallInProgress] - Callback for tool call progress.
 * @property {(progress: PromptProcessingInProgressStats, from: string) => void} [onPromptProcessingProgress] - Callback for prompt processing progress.
 * @example
 * const inferenceCallbacks: InferenceCallbacks = {
 *   onToken: (token: string, from: string) => console.log(`Token from ${from}: ${token}`),
 *   onError: (err: any, from: string) => console.error(`Error from ${from}:`, err),
 *   onStartThinking: (from: string) => console.log(`Thinking started in ${from}`),
 *   onEndThinking: (from: string) => console.log(`Thinking ended in ${from}`)
 * };
 */
interface InferenceCallbacks {
    onStartThinking?: (from: string) => void;
    onEndThinking?: (from: string) => void;
    onToken?: (t: string, from: string) => void;
    onThinkingToken?: (t: string, from: string) => void;
    onToolCallToken?: (t: string, from: string) => void;
    onStartEmit?: (data: PromptProcessingInProgressStats, from: string) => void;
    onEndEmit?: (result: InferenceResult, from: string) => void;
    onError?: (err: any, from: string) => void;
    onToolCallInProgress?: (tc: Array<ToolCallSpec>, from: string) => void;
    onPromptProcessingProgress?: (progress: PromptProcessingInProgressStats, from: string) => void;
}

/**
 * Represents the callbacks for agent interactions.
 *
 * @interface AgentCallbacks
 * @property {(tc: ToolCallSpec, type: string, from: string) => void} [onToolCall] - Callback for tool calls.
 * @property {(tc: ToolCallSpec, tr: any, type: string, from: string) => void} [onToolCallEnd] - Callback for tool call completion.
 * @property {(tc: Array<ToolCallSpec>, from: string) => void} [onToolsTurnStart] - Callback for tools turn start.
 * @property {(tt: Array<ToolTurn>, from: string) => void} [onToolsTurnEnd] - Callback for tools turn end.
 * @property {(from: string) => void} [onTurnStart] - Callback when a new turn starts.
 * @property {(ht: HistoryTurn, from: string) => void} [onTurnEnd] - Callback for turn end.
 * @property {(txt: string, from: string) => void} [onAssistant] - Callback for assistant text.
 * @property {(txt: string, from: string) => void} [onThink] - Callback for thinking text.
 * @example
 * const agentCallbacks: AgentCallbacks = {
 *   onToolCall: (tc: ToolCallSpec, type: string, from: string) => console.log(`Tool call from ${from}:`, tc),
 *   onTurnEnd: (ht: HistoryTurn, from: string) => console.log(`Turn ended in ${from}`),
 *   onAssistant: (txt: string, from: string) => console.log(`Assistant message from ${from}:`, txt)
 * };
 */
interface AgentCallbacks {
    onToolCall?: (tc: ToolCallSpec, type: string, from: string) => void;
    onToolCallEnd?: (tc: ToolCallSpec, tr: any, type: string, from: string) => void;
    onToolsTurnStart?: (tc: Array<ToolCallSpec>, from: string) => void;
    onToolsTurnEnd?: (tt: Array<ToolTurn>, from: string) => void;
    onTurnStart?: (from: string) => void;
    onTurnEnd?: (ht: HistoryTurn, from: string) => void;
    onAssistant?: (txt: string, from: string) => void;
    onThink?: (txt: string, from: string) => void;
}

/**
 * Combines inference and agent callbacks into a single interface.
 *
 * @interface AllCallbacks
 * @extends InferenceCallbacks
 * @extends AgentCallbacks
 * @example
 * const allCallbacks: AllCallbacks = {
 *   onToken: (token: string, from: string) => console.log(`Token: ${token}`),
 *   onToolCall: (tc: ToolCallSpec, type: string, from: string) => console.log(`Tool: ${tc}`),
 *   onError: (err: any, from: string) => console.error(`Error:`, err)
 * };
 */
interface AllCallbacks extends InferenceCallbacks, AgentCallbacks { }

export {
    InferenceCallbacks,
    AgentCallbacks,
    AllCallbacks,
}

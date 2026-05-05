
/**
 * @file Defines callback interfaces for inference and agent interactions.
 * Imports: Utilizes types from `history.js`, `inference.js`, `stats.js`, and `tools.js`.
 * @example
 * // Example of using InferenceCallbacks
 * const inferenceCallbacks: InferenceCallbacks = {
 *   onToken: (token: string) => console.log(token),
 *   onError: (err: any) => console.error(err)
 * };
 *
 * // Example of using AgentCallbacks
 * const agentCallbacks: AgentCallbacks = {
 *   onToolCall: (tc: ToolCallSpec) => console.log(tc),
 *   onTurnEnd: (ht: HistoryTurn) => console.log(ht)
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
import type { IngestionStats } from "./stats.js";
import type { ToolCallSpec } from "./tools.js";

/**
 * Represents the callbacks for inference events.
 *
 * @interface InferenceCallbacks
 * @param {() => void} [onStartThinking] - Callback when thinking starts.
 * @param {() => void} [onEndThinking] - Callback when thinking ends.
 * @param {(t: string) => void} [onToken] - Callback for each token emitted.
 * @param {(t: string) => void} [onThinkingToken] - Callback for thinking tokens.
 * @param {(data: IngestionStats) => void} [onStartEmit] - Callback when emission starts.
 * @param {(result: InferenceResult) => void} [onEndEmit] - Callback when emission ends.
 * @param {(err: any) => void} [onError] - Callback for errors.
 * @param {(tc: Array<ToolCallSpec>) => void} [onToolCallInProgress] - Callback for tool call progress.
 * @example
 * const inferenceCallbacks: InferenceCallbacks = {
 *   onToken: (token: string) => console.log(token),
 *   onError: (err: any) => console.error(err)
 * };
 */
interface InferenceCallbacks {
    onStartThinking?: (from: string) => void;
    onEndThinking?: (from: string) => void;
    onToken?: (t: string, from: string) => void;
    onThinkingToken?: (t: string, from: string) => void;
    onStartEmit?: (data: IngestionStats, from: string) => void;
    onEndEmit?: (result: InferenceResult, from: string) => void;
    onError?: (err: any, from: string) => void;
    onToolCallInProgress?: (tc: Array<ToolCallSpec>, from: string) => void;
}

/**
 * Represents the callbacks for agent interactions.
 *
 * @interface AgentCallbacks
 * @param {(tc: ToolCallSpec) => void} [onToolCall] - Callback for tool calls.
 * @param {(tc: ToolCallSpec, tr: any) => void} [onToolCallEnd] - Callback for tool call completion.
 * @param {(tc: Array<ToolCallSpec>) => void} [onToolsTurnStart] - Callback for tools turn start.
 * @param {(tt: Array<ToolTurn>) => void} [onToolsTurnEnd] - Callback for tools turn end.
 * @param {(ht: HistoryTurn) => void} [onTurnEnd] - Callback for turn end.
 * @param {(txt: string) => void} [onAssistant] - Callback for assistant text.
 * @param {(txt: string) => void} [onThink] - Callback for thinking text.
 * @example
 * const agentCallbacks: AgentCallbacks = {
 *   onToolCall: (tc: ToolCallSpec) => console.log(tc),
 *   onTurnEnd: (ht: HistoryTurn) => console.log(ht)
 * };
 */
interface AgentCallbacks {
    onToolCall?: (tc: ToolCallSpec, from: string) => void;
    onToolCallEnd?: (tc: ToolCallSpec, tr: any, from: string) => void;
    onToolsTurnStart?: (tc: Array<ToolCallSpec>, from: string) => void;
    onToolsTurnEnd?: (tt: Array<ToolTurn>, from: string) => void;
    onTurnEnd?: (ht: HistoryTurn, from: string) => void;
    onAssistant?: (txt: string, from: string) => void;
    onThink?: (txt: string, from: string) => void;
}

/**
 * Combines inference and agent callbacks into a single interface.
 *
 * @interface AllCallbacks
 * @augments InferenceCallbacks
 * @augments AgentCallbacks
 * @example
 * const allCallbacks: AllCallbacks = {
 *   onToken: (token: string) => console.log(token),
 *   onToolCall: (tc: ToolCallSpec) => console.log(tc)
 * };
 */
interface AllCallbacks extends InferenceCallbacks, AgentCallbacks { }

export {
    InferenceCallbacks,
    AgentCallbacks,
    AllCallbacks,
}

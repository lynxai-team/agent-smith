/**
 * @file Defines history-related interfaces for conversation turns, UI state, and tool interactions.
 * Imports: Utilizes OpenAI types for chat completion messages, and local types for stats and tools.
 * @example
 * import type { HistoryTurn, ToolTurn } from './history';
 * const turn: HistoryTurn = {
 *   user: "Hello",
 *   assistant: "Hi there!",
 *   tools: [{ call: toolSpec, response: result, from: 'agent', type: 'tool' }]
 * };
 */

import type { ChatCompletionContentPart, ChatCompletionMessageToolCall, ChatCompletionRole } from "openai/resources/index.js";
import type { InferenceStats, PromptProcessingInProgressStats } from "./stats.js";
import type { ToolCallSpec } from "./tools.js";

/**
 * Represents a single turn in the conversation history.
 *
 * @interface HistoryTurn
 * @property {string} [user] - The user's message content.
 * @property {string} [assistant] - The assistant's response content.
 * @property {string} [think] - The assistant's internal thinking/reasoning content.
 * @property {Array<String>} [images] - Array of image data associated with the turn.
 * @property {Array<ToolTurn>} [tools] - Array of tool calls and their responses in this turn.
 * @property {InferenceStats} [stats] - Statistics about inference performance for this turn.
 * @property {PromptProcessingInProgressStats} [prefillStats] - Statistics about prompt prefill processing.
 * @example
 * const historyTurn: HistoryTurn = {
 *   user: "What's the weather?",
 *   assistant: "Let me check that for you.",
 *   think: "I should use the weather tool",
 *   tools: [{
 *     call: { id: '1', name: 'getWeather', arguments: { location: 'NYC' } },
 *     response: { content: 'Sunny, 72°F' },
 *     from: 'agent',
 *     type: 'tool_call'
 *   }],
 *   stats: {
 *     nTotalTokens: 100,
 *     nEmittedTokens: 50,
 *     nPrefillProcessedTokens: 30,
 *     nPrefillCacheTokens: 20,
 *     nPrefillTotalTokens: 50,
 *     percentCache: 40,
 *     percentDraft: 80,
 *     nDraftTokens: 10,
 *     nDraftTokensAccepted: 8,
 *     percentDraftAccepted: 80,
 *     emittedTokensPerSecond: 50,
 *     prefillTokensPerSecond: 30,
 *     prefilDuration: 1.0,
 *     emitDuration: 1.0,
 *     totalDuration: 2.0
 *   }
 * };
 */
interface HistoryTurn {
    user?: string;
    assistant?: string;
    think?: string;
    images?: Array<String>;
    tools?: Array<ToolTurn>;
    stats?: InferenceStats;
    prefillStats?: PromptProcessingInProgressStats;
}

/**
 * Represents the UI state for a history turn, controlling visibility and confirmation dialogs.
 *
 * @interface UiHistoryTurnState
 * @property {boolean} showThinking - Whether to display the assistant's thinking content.
 * @property {Array<string>} showToolResponses - List of tool call IDs whose responses should be shown.
 * @property {number | null} confirmRestartAtTurn - Turn number at which to prompt for restart confirmation, or null.
 * @property {Record<string, { resolve: (value: boolean) => void, reject: (reason?: any) => void }>} confirmToolCalls - Pending tool call confirmations mapped by ID.
 * @example
 * const uiState: UiHistoryTurnState = {
 *   showThinking: true,
 *   showToolResponses: ['tool-1', 'tool-2'],
 *   confirmRestartAtTurn: null,
 *   confirmToolCalls: {}
 * };
 */
interface UiHistoryTurnState {
    showThinking: boolean;
    showToolResponses: Array<string>;
    confirmRestartAtTurn: number | null;
    confirmToolCalls: Record<string, {
        resolve: (value: boolean) => void,
        reject: (reason?: any) => void
    }>;
}

/**
 * Extends HistoryTurn with UI-specific metadata for rendering in the interface.
 *
 * @interface UiHistoryTurn
 * @augments HistoryTurn
 * @property {string} from - The source of this turn (e.g., 'user', 'agent').
 * @property {UiHistoryTurnType} type - The type/category of this turn.
 * @property {UiHistoryTurnState} state - The UI state associated with this turn.
 * @property {number} agentTurn - The sequential number of the agent's turn.
 * @example
 * const uiHistoryTurn: UiHistoryTurn = {
 *   user: "Hello",
 *   assistant: "Hi there!",
 *   from: 'agent',
 *   type: 'assistant',
 *   state: {
 *     showThinking: false,
 *     showToolResponses: [],
 *     confirmRestartAtTurn: null,
 *     confirmToolCalls: {}
 *   },
 *   agentTurn: 1
 * };
 */
interface UiHistoryTurn extends HistoryTurn {
    from: string;
    type: UiHistoryTurnType;
    state: UiHistoryTurnState;
    agentTurn: number;
}

/**
 * Represents a tool call and its response in a conversation turn.
 *
 * @interface ToolTurn
 * @property {ToolCallSpec} call - The tool call specification.
 * @property {any [ undefined]} response - The response from the tool call.
 * @property {string} from - The source that initiated the tool call.
 * @property {string} type - The type/category of the tool turn.
 * @example
 * const toolTurn: ToolTurn = {
 *   call: { id: '1', name: 'getWeather', arguments: { location: 'New York' } },
 *   response: { content: 'Sunny, 72°F' },
 *   from: 'agent',
 *   type: 'tool_call'
 * };
 */
interface ToolTurn {
    call: ToolCallSpec;
    response?: any;
    from: string;
    type: string;
}

/*interface InferenceClientHistoryMessage {
    role: ChatCompletionRole;
    content?: string;
    reasoning_content?: string;
    tool_calls: Array<ChatCompletionMessageToolCall>;
}*/

/**
 * Represents a chat completion message in the conversation history, compatible with OpenAI's API format.
 *
 * @interface ChatCompletionHistoryTurn
 * @property {ChatCompletionRole} role - The role of the message sender (user, assistant, system).
 * @property {string | Array<ChatCompletionContentPart>} [content] - The text or multimodal content of the message.
 * @property {string} [reasoning_content] - The internal reasoning content from the model.
 * @property {Array<ChatCompletionMessageToolCall>} [tool_calls] - Tool calls made by the assistant in this turn.
 * @example
 * const chatHistoryTurn: ChatCompletionHistoryTurn = {
 *   role: 'assistant',
 *   content: 'Here is the weather information.',
 *   reasoning_content: 'I need to call the weather tool.',
 *   tool_calls: [{
 *     id: 'call_123',
 *     type: 'function',
 *     function: { name: 'getWeather', arguments: '{"location": "NYC"}' }
 *   }]
 * };
 */
interface ChatCompletionHistoryTurn {
    role: ChatCompletionRole;
    content?: string | Array<ChatCompletionContentPart>;
    reasoning_content?: string;
    tool_calls?: Array<ChatCompletionMessageToolCall>;
}

/**
 * Represents the type of a UI history turn.
 *
 * @typedef {("unknown" | "user" | "assistant" | "think" | "tools")} UiHistoryTurnType
 * @example
 * const turnType: UiHistoryTurnType = "assistant";
 */
type UiHistoryTurnType = "unknown" | "user" | "assistant" | "think" | "tools";

export {
    HistoryTurn,
    UiHistoryTurn,
    ToolTurn,
    UiHistoryTurnState,
    UiHistoryTurnType,
    ChatCompletionHistoryTurn,
}

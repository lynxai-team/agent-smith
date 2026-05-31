
import type { ChatCompletionMessageToolCall, ChatCompletionRole } from "openai/resources/index.js";
import type { InferenceStats, PromptProcessingInProgressStats } from "./stats.js";
import type { ToolCallSpec } from "./tools.js";

interface HistoryTurn {
    user?: string;
    assistant?: string;
    think?: string;
    images?: Array<ImgData>;
    tools?: Array<ToolTurn>;
    stats?: InferenceStats;
    prefillStats?: PromptProcessingInProgressStats;
}

interface UiHistoryTurnState {
    showThinking: boolean;
    showToolResponses: Array<string>;
    confirmRestartAtTurn: number | null;
    confirmToolCalls: Record<string, {
        resolve: (value: boolean) => void,
        reject: (reason?: any) => void
    }>;
}

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
 * @param {ToolCallSpec} call - The tool call specification.
 * @param {any} response - The response from the tool call.
 * @example
 * const toolTurn: ToolTurn = {
 *   call: { id: '1', name: 'getWeather', arguments: { location: 'New York' } },
 *   response: { content: 'Sunny, 72°F' }
 * };
 */
interface ToolTurn {
    call: ToolCallSpec;
    response: any;
    from: string;
    type: string;
}

/**
 * Image data associated with a message or response.
 *
 * @interface ImgData
 * @param {number} id - The unique identifier for the image.
 * @param {string} data - The base64 encoded image data.
 * @example
 * const imgExample: ImgData = {
 *   id: 1,
 *   data: 'base64image'
 * };
 */
interface ImgData {
    id: number;
    data: string;
}

interface InferenceClientHistoryMessage {
    role: ChatCompletionRole;
    content?: string;
    reasoning_content?: string;
    tool_calls: Array<ChatCompletionMessageToolCall>;
}

type UiHistoryTurnType = "unknown" | "user" | "assistant" | "think" | "tools";

export {
    HistoryTurn,
    UiHistoryTurn,
    ToolTurn,
    ImgData,
    UiHistoryTurnState,
    UiHistoryTurnType,
}

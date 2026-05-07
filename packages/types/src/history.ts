
import type { ToolCallSpec } from "./tools.js";

/**
 * Represents a single turn in a conversation history.
 *
 * @interface HistoryTurn
 * @param {string | undefined} user - The user's message in this turn.
 * @param {string | undefined} assistant - The assistant's response in this turn.
 * @param {string | undefined} think - The assistant's thoughts in this turn.
 * @param {Array<ImgData> | undefined} images - Images associated with this turn.
 * @param {Array<ToolTurn> | undefined} tools - Tool calls and results for this turn.
 * @example
 * const historyTurn: HistoryTurn = {
 *   user: "What's the weather like?",
 *   assistant: "The weather is sunny with a temperature of 72°F.",
 *   tools: [
 *     {
 *       call: { id: '1', name: 'getWeather', arguments: { location: 'New York' } },
 *       response: { content: 'Sunny, 72°F' }
 *     }
 *   ]
 * };
 */
interface HistoryTurn {
    user?: string;
    assistant?: string;
    think?: string;
    images?: Array<ImgData>;
    tools?: Array<ToolTurn>;
}

/**
 * UI history turn with additional state information.
 *
 * @interface UiHistoryTurn
 * @param {HistoryTurn} - Extends HistoryTurn interface.
 * @param {string} from - The source of the turn
 * @param {Object} state - UI state for the turn.
 * @param {boolean} state.showThinking - Whether to show thinking process.
 * @param {Array<string>} state.showToolResponses - Tool responses to show.
 * @param {number | null} state.confirmRestartAtTurn - Turn number to restart at.
 * @param {Record<string, { resolve: (value: boolean) => void, reject: (reason?: any) => void }>} state.confirmToolCalls - Tool call confirmations.
 * @example
 * const uiHistoryTurn: UiHistoryTurn = {
 *   from: 'qwen4b',
 *   state: {
 *     showThinking: true,
 *     showToolResponses: ['tool1'],
 *     confirmRestartAtTurn: null,
 *     confirmToolCalls: {}
 *   }
 * };
 */
interface UiHistoryTurn extends HistoryTurn {
    from: string;
    state: {
        showThinking: boolean;
        showToolResponses: Array<string>;
        confirmRestartAtTurn: number | null;
        confirmToolCalls: Record<string, {
            resolve: (value: boolean) => void,
            reject: (reason?: any) => void
        }>;
    }
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
    think?: string;
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

export {
    HistoryTurn,
    UiHistoryTurn,
    ToolTurn,
    ImgData,
}

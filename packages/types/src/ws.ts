import type { FeatureType } from "./task.js";
import type { ToolCallSpec } from "./tools.js";
import type { HistoryTurn, ToolTurn } from "./history.js";
import type { InferenceParams } from "./inference.js";
import type { AllCallbacks } from "./callbacks.js";

/**
 * WebSocket client message structure.
 *
 * @interface WsClientMsg
 * @param {string} command - The command to execute.
 * @param {WsClientMsgType} type - The type of message.
 * @param {FeatureType} [feature] - The feature associated with the message.
 * @param {any} [payload] - The message payload.
 * @param {Record<string, any>} [options] - Additional options.
 * @example
 * const message: WsClientMsg = {
 *   command: 'start',
 *   type: 'command',
 *   payload: { sessionId: '123' }
 * };
 */
interface WsClientMsg {
    command: string;
    type: WsClientMsgType;
    feature?: FeatureType;
    payload?: any;
    options?: Record<string, any>;
}

/**
 * Raw WebSocket client message structure.
 *
 * @interface WsRawClientMsg
 * @param {WsClientMsgType} type - The type of message.
 * @param {string} msg - The raw message content.
 * @example
 * const rawMessage: WsRawClientMsg = {
 *   type: 'command',
 *   msg: '{"command": "start", "payload": {}}'
 * };
 */
interface WsRawClientMsg {
    type: WsClientMsgType;
    msg: string;
}

/**
 * Raw WebSocket server message structure.
 *
 * @interface WsRawServerMsg
 * @param {WsServerMsgType} type - The type of message.
 * @param {string} msg - The raw message content.
 * @example
 * const rawMessage: WsRawServerMsg = {
 *   type: 'token',
 *   msg: 'Hello world'
 * };
 */
interface WsRawServerMsg {
    type: WsServerMsgType;
    msg: string;
}

/**
 * Streamed message structure for real-time updates.
 *
 * @interface StreamedMessage
 * @param {string} content - The message content.
 * @param {MsgType} type - The type of message.
 * @param {number} num - Message sequence number.
 * @param {Record<string, any>} [data] - Additional data.
 * @example
 * const streamedMessage: StreamedMessage = {
 *   content: 'Hello',
 *   type: 'token',
 *   num: 1
 * };
 */
interface StreamedMessage {
    content: string;
    type: MsgType;
    num: number;
    data?: Record<string, any>;
}

interface ServerParams extends AllCallbacks {
    url?: string;
    isVerbose?: boolean;
    defaultInferenceParams?: InferenceParams;
    onConfirmToolUsage?: (tool: ToolCallSpec) => Promise<boolean>;
}

/**
 * WebSocket server message types.
 *
 * @type {WsServerMsgType}
 * @example
 * const msgType: WsServerMsgType = 'token';
 */
type WsServerMsgType = 'error'
    | 'token'
    | 'thinkingtoken'
    | 'turnend'
    | 'assistant'
    | 'thinkingstart'
    | 'thinkingend'
    | 'toolcallinprogress'
    | 'toolsturnstart'
    | 'toolsturnend'
    | 'toolcall'
    | 'toolcallend'
    | 'toolcallconfirm'
    | 'finalresult'
    | "think";

/**
 * WebSocket client message types.
 *
 * @type {WsClientMsgType}
 * @example
 * const msgType: WsClientMsgType = 'command';
 */
type WsClientMsgType = "command" | "system";

/**
 * Message types.
 *
 * @type {MsgType}
 * @example
 * const msgType: MsgType = 'token';
 */
type MsgType = "token" | "system" | "error";

export {
    WsClientMsg,
    WsClientMsgType,
    WsServerMsgType,
    WsRawClientMsg,
    WsRawServerMsg,
    MsgType,
    ServerParams,
    StreamedMessage,
}
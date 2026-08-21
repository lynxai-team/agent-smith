/**
 * @file WebSocket communication types and interfaces for the Agent Smith project.
 * Defines message structures, connection parameters, and event types for WebSocket-based communication.
 * Imports: Utilizes `FeatureType` from "./core.js", `ToolCallSpec` from "./tools.js",
 *          `HistoryTurn`, `ToolTurn` from "./history.js", `InferenceParams` from "./inference.js",
 *          and `AllCallbacks` from "./callbacks.js".
 * @example
 * // Creating a WebSocket client message
 * import type { WsClientMsg, ServerParams } from './ws';
 *
 * const clientMsg: WsClientMsg = {
 *   command: 'start',
 *   type: 'command',
 *   feature: 'agent',
 *   payload: { sessionId: '123' }
 * };
 *
 * // Configuring WebSocket server parameters
 * const params: ServerParams = {
 *   url: 'ws://localhost:3000',
 *   isVerbose: true,
 *   defaultInferenceParams: { temperature: 0.7 },
 *   onConfirmToolUsage: async (tool) => {
 *     console.log(`Confirming tool: ${tool.name}`);
 *     return true;
 *   }
 * };
 */

import type { FeatureType } from "./core.js";
import type { ToolCallSpec } from "./tools.js";
import type { InferenceParams } from "./inference.js";
import type { AllCallbacks } from "./callbacks.js";

/**
 * WebSocket client message structure.
 *
 * @interface WsClientMsg
 * @property {string} command - The command to execute (e.g., 'start', 'stop').
 * @property {WsClientMsgType} type - The type of message ('command' or 'system').
 * @property {FeatureType} [feature] - The feature associated with the message.
 * @property {any} [payload] - The message payload containing command-specific data.
 * @property {Record<string, any>} [options] - Additional options for the message.
 * @example
 * const message: WsClientMsg = {
 *   command: 'start',
 *   type: 'command',
 *   feature: 'agent',
 *   payload: { sessionId: '123' },
 *   options: { retry: true }
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
 * Used for sending raw string messages over the WebSocket connection.
 *
 * @interface WsRawClientMsg
 * @property {WsClientMsgType} type - The type of message ('command' or 'system').
 * @property {string} msg - The raw message content as a string.
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
 * Used for receiving raw string messages from the WebSocket server.
 *
 * @interface WsRawServerMsg
 * @property {WsServerMsgType} type - The type of server message (e.g., 'token', 'error').
 * @property {string} from - The source of the message (e.g., 'agent', 'tool').
 * @property {string} msg - The raw message content as a string.
 * @example
 * const rawMessage: WsRawServerMsg = {
 *   type: 'token',
 *   from: 'agent',
 *   msg: 'Hello world'
 * };
 */
interface WsRawServerMsg {
    type: WsServerMsgType;
    from: string;
    msg: string;
}

/**
 * Streamed message structure for real-time updates.
 * Used for streaming incremental content during inference.
 *
 * @interface StreamedMessage
 * @property {string} content - The message content.
 * @property {MsgType} type - The type of message ('token', 'system', or 'error').
 * @property {number} num - Message sequence number for ordering.
 * @property {Record<string, any>} [data] - Additional data associated with the message.
 * @example
 * const streamedMessage: StreamedMessage = {
 *   content: 'Hello',
 *   type: 'token',
 *   num: 1,
 *   data: { from: 'agent', timestamp: Date.now() }
 * };
 */
interface StreamedMessage {
    content: string;
    type: MsgType;
    num: number;
    data?: Record<string, any>;
}

/**
 * Server parameters for WebSocket connection configuration.
 * Extends AllCallbacks to support inference and agent event callbacks.
 *
 * @interface ServerParams
 * @extends {AllCallbacks}
 * @property {string} [url] - The WebSocket server URL (e.g., 'ws://localhost:3000').
 * @property {boolean} [isVerbose] - Whether to enable verbose logging.
 * @property {InferenceParams} [defaultInferenceParams] - Default inference parameters for the session.
 * @property {(tool: ToolCallSpec) => Promise<boolean>} [onConfirmToolUsage] - Callback to confirm tool usage before execution. Return true to proceed, false to reject.
 * @example
 * const params: ServerParams = {
 *   url: 'ws://localhost:3000',
 *   isVerbose: true,
 *   defaultInferenceParams: { temperature: 0.7 },
 *   onConfirmToolUsage: async (tool) => {
 *     console.log(`Confirming tool: ${tool.name}`);
 *     return true;
 *   },
 *   onToken: (token, from) => process.stdout.write(token),
 *   onError: (err, from) => console.error(`Error from ${from}:`, err)
 * };
 */
interface ServerParams extends AllCallbacks {
    url?: string;
    isVerbose?: boolean;
    defaultInferenceParams?: InferenceParams;
    onConfirmToolUsage?: (tool: ToolCallSpec) => Promise<boolean>;
}

/**
 * WebSocket server message types.
 * Defines all possible message types emitted by the WebSocket server during inference.
 * @typedef {('error' | 'startemit' | 'token' | 'thinkingtoken' | 'turnstart' | 'turnend' | 'assistant' | 'thinkingstart' | 'thinkingend' | 'toolcallinprogress' | 'promptprocessingprogress' | 'toolcalltoken' | 'toolsturnstart' | 'toolsturnend' | 'toolcall' | 'toolcallend' | 'toolcallconfirm' | 'finalresult' | 'think' | 'endemit')} WsServerMsgType
 * @example
 * const msgType: WsServerMsgType = 'token';
 * const errorType: WsServerMsgType = 'error';
 * const thinkingType: WsServerMsgType = 'thinkingtoken';
 */
type WsServerMsgType = 'error'
    | 'startemit'
    | 'token'
    | 'thinkingtoken'
    | 'turnstart'
    | 'turnend'
    | 'assistant'
    | 'thinkingstart'
    | 'thinkingend'
    | 'toolcallinprogress'
    | 'promptprocessingprogress'
    | 'toolcalltoken'
    | 'toolsturnstart'
    | 'toolsturnend'
    | 'toolcall'
    | 'toolcallend'
    | 'toolcallconfirm'
    | 'finalresult'
    | "think"
    | 'endemit';

/**
 * WebSocket client message types.
 * Defines the two possible message types that can be sent from the client.
 * @typedef {('command' | 'system')} WsClientMsgType
 * @example
 * const msgType: WsClientMsgType = 'command';
 * const systemType: WsClientMsgType = 'system';
 */
type WsClientMsgType = "command" | "system";

/**
 * Message types.
 * Defines the possible types for streamed messages.
 * @typedef {('token' | 'system' | 'error')} MsgType
 * @example
 * const msgType: MsgType = 'token';
 * const errorType: MsgType = 'error';
 * const systemType: MsgType = 'system';
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
};

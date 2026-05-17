import type { WsClientMsg, FeatureType, ToolCallSpec, WsRawServerMsg, ServerParams, InferenceResult } from "@agent-smith/types";
import type { HistoryTurn } from "@agent-smith/types";
import ReconnectingWebSocket from 'reconnecting-websocket';

const useWsServer = (params: ServerParams) => {
    //console.log("WS PARAMS", params);
    let url = "ws://localhost:5184/ws";
    if (params?.url) {
        url = params.url;
    }
    let ws = new ReconnectingWebSocket(url);

    ws.onopen = function(event) {
        console.log('Connected to WebSocket server');
    };

    ws.onmessage = function(event: MessageEvent) {
        //console.log('Received message:', typeof event.data, event.data);
        let data: WsRawServerMsg;
        try {
            data = JSON.parse(event.data) as WsRawServerMsg;
        } catch (e) {
            throw new Error(`can not parse data: ${e}\nMSG: ${event.data}`)
        }
        const type = data.type;
        const from = data.from;
        const msg = data.msg;
        /*const s = event.data.split(sep);
        const type = s[0];
        const msg = s[1];
        if (type != "token") {
            console.log(type, msg)
        }*/
        switch (type) {
            case "error":
                if (params?.onError) {
                    params.onError(msg, from)
                } else {
                    console.error(from, msg)
                }
                break;
            case "token":
                if (params?.onToken) {
                    params.onToken(msg, from);
                }
                break
            case "thinkingtoken":
                if (params?.onThinkingToken) {
                    params.onThinkingToken(msg, from);
                }
                break
            case "turnstart":
                if (params?.onTurnStart) {
                    params.onTurnStart(from)
                }
                break
            case "turnend":
                if (params?.onTurnEnd) {
                    params.onTurnEnd(JSON.parse(msg), from)
                }
                break
            case "assistant":
                if (params?.onAssistant) {
                    params.onAssistant(msg, from)
                }
                break
            case "think":
                if (params?.onThink) {
                    params.onThink(msg, from)
                }
                break
            case "thinkingstart":
                if (params?.onStartThinking) {
                    params.onStartThinking(from)
                }
                break
            case "thinkingend":
                if (params?.onEndThinking) {
                    params.onEndThinking(from)
                }
                break
            case "toolcallinprogress":
                if (params?.onToolCallInProgress) {
                    params.onToolCallInProgress(JSON.parse(msg), from)
                }
                break
            case "toolsturnstart":
                if (params?.onToolsTurnStart) {
                    params.onToolsTurnStart(JSON.parse(msg), from)
                }
                break
            case "toolsturnend":
                if (params?.onToolsTurnEnd) {
                    params.onToolsTurnEnd(JSON.parse(msg), from)
                }
                break
            case "toolcall":
                if (params?.onToolCall) {
                    const payload = JSON.parse(msg);
                    params.onToolCall(payload.tc, payload.type, payload.from)
                }
                break
            case "toolcallend":
                if (params?.onToolCallEnd) {
                    //console.log("WS TCE", msg);
                    const m = msg.split("<|xtool_call_id|>");
                    const payload = JSON.parse(m[0]);
                    const content = m[1];
                    //console.log("WS TCP", tc);
                    params.onToolCallEnd(payload.tc, content, payload.type, payload.from)
                }
                break
            case "toolcallconfirm":
                if (params?.onConfirmToolUsage) {
                    const tm = JSON.parse(msg) as ToolCallSpec;
                    params.onConfirmToolUsage(tm).then(c => {
                        const m: WsClientMsg = {
                            type: "system",
                            command: "confirmtool",
                            payload: { confirm: c, id: tm.id }
                        }
                        _sendMsg(JSON.stringify(m))
                    })
                }
                break
            case "endemit":
                if (params?.onEndEmit) {
                    const m = JSON.parse(msg) as InferenceResult;
                    params.onEndEmit(m, from)
                }
                break
            case "finalresult":
                //console.log("FINAL RES", msg);
                const history = JSON.parse(msg) as HistoryTurn;
                //console.log("HIST", history);
                if (params?.onTurnEnd) {
                    params.onTurnEnd(history, from)
                }
                break
            default:
                throw new Error(`unknown message type ${type}`)
        }
    };

    ws.onclose = function(event) {
        console.log('Disconnected from WebSocket server');
    };

    ws.onerror = function(error) {
        /*if (params?.onError) {
            params.onError(error, "websockets server")
        }*/
        console.error('WebSocket error:', error);
    };

    const _sendMsg = (m: string, t = 1000) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(m);
        } else {
            console.warn('Cannot send message - not connected');
            console.log("Trying to reconnect ...");
            if (t < 5000) {
                t = t + 500;
            }
            setTimeout(() => {
                _sendMsg(m);
            }, t);
        }
    }

    const _executeFeature = (name: string, feat: FeatureType, payload: any, options: Record<string, any> = {}) => {
        const cmd: WsClientMsg = {
            type: "command",
            command: name,
            feature: feat,
            payload: payload,
            options: options,
        };
        _sendMsg(JSON.stringify(cmd));
    };

    const executeTask = (
        name: string, payload: any, options: Record<string, any> = {}
    ) => _executeFeature(name, "task", payload, options);

    const executeWorkflow = (
        name: string, payload: any, options: Record<string, any> = {}
    ) => _executeFeature(name, "workflow", payload, options);

    const executeAgent = (
        name: string, payload: any, options: Record<string, any> = {}
    ) => _executeFeature(name, "agent", payload, options);

    const cancel = async () => {
        const cmd: WsClientMsg = {
            type: "system",
            command: "stop",
        };
        _sendMsg(JSON.stringify(cmd));
    }

    return {
        executeTask,
        executeWorkflow,
        executeAgent,
        cancel,
        onToken: params.onToken,
        onToolCall: params.onToolCall,
        onToolCallEnd: params.onToolCallEnd,
        onError: params.onError,
        onConfirmToolUsage: params.onConfirmToolUsage,
    }
}

export {
    useWsServer,
}
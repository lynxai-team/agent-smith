import type { WsClientMsg, FeatureType, ToolCallSpec, WsRawServerMsg, ServerParams } from "@agent-smith/types";
import type { HistoryTurn } from "@agent-smith/types";
import ReconnectingWebSocket from 'reconnecting-websocket';

const useWsServer = (params: ServerParams) => {
    //console.log("WS PARAMS", params);
    let url = "ws://localhost:5184/ws";
    if (params?.url) {
        url = params.url;
    }
    let ws = new ReconnectingWebSocket(url);
    let onToken = params.onToken;
    let onThinkingToken = params.onThinkingToken;
    let onStartThinking = params.onStartThinking;
    let onEndThinking = params.onEndThinking;
    let onToolCallInProgress = params.onToolCallInProgress;
    let onToolCall = params.onToolCall;
    let onToolCallEnd = params.onToolCallEnd;
    let onToolsTurnStart = params.onToolsTurnStart;
    let onToolsTurnEnd = params.onToolsTurnEnd;
    let onTurnEnd = params.onTurnEnd;
    let onAssistant = params.onAssistant;
    let onError = params.onError;
    let onConfirmToolUsage = params.onConfirmToolUsage;
    let onThink = params.onThink;

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
        const msg = data.msg;
        /*const s = event.data.split(sep);
        const type = s[0];
        const msg = s[1];
        if (type != "token") {
            console.log(type, msg)
        }*/
        switch (type) {
            case "error":
                if (onError) {
                    onError(msg)
                } else {
                    console.error(msg)
                }
                break;
            case "token":
                if (onToken) {
                    onToken(msg);
                }
                break
            case "thinkingtoken":
                if (onThinkingToken) {
                    onThinkingToken(msg);
                }
                break
            case "turnend":
                if (onTurnEnd) {
                    onTurnEnd(JSON.parse(msg))
                }
                break
            case "assistant":
                if (onAssistant) {
                    onAssistant(msg)
                }
                break
            case "think":
                if (onThink) {
                    onThink(msg)
                }
                break
            case "thinkingstart":
                if (onStartThinking) {
                    onStartThinking()
                }
                break
            case "thinkingend":
                if (onEndThinking) {
                    onEndThinking()
                }
                break
            case "toolcallinprogress":
                if (onToolCallInProgress) {
                    onToolCallInProgress(JSON.parse(msg))
                }
                break
            case "toolsturnstart":
                if (onToolsTurnStart) {
                    onToolsTurnStart(JSON.parse(msg))
                }
                break
            case "toolsturnend":
                if (onToolsTurnEnd) {
                    onToolsTurnEnd(JSON.parse(msg))
                }
                break
            case "toolcall":
                if (onToolCall) {
                    onToolCall(JSON.parse(msg))
                }
                break
            case "toolcallend":
                if (onToolCallEnd) {
                    //console.log("WS TCE", msg);
                    const m = msg.split("<|xtool_call_id|>");
                    const tc = JSON.parse(m[0]);
                    const content = m[1];
                    //console.log("WS TCP", tc);
                    onToolCallEnd(tc, content)
                }
                break
            case "toolcallconfirm":
                if (onConfirmToolUsage) {
                    const tm = JSON.parse(msg) as ToolCallSpec;
                    onConfirmToolUsage(tm).then(c => {
                        const m: WsClientMsg = {
                            type: "system",
                            command: "confirmtool",
                            payload: { confirm: c, id: tm.id }
                        }
                        _sendMsg(JSON.stringify(m))
                    })
                }
                break
            case "finalresult":
                //console.log("FINAL RES", msg);
                const history = JSON.parse(msg) as HistoryTurn;
                //console.log("HIST", history);
                if (params?.onTurnEnd) {
                    params.onTurnEnd(history)
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
        onToken,
        onToolCall,
        onToolCallEnd,
        onError,
        onConfirmToolUsage,
    }
}

export {
    useWsServer,
}
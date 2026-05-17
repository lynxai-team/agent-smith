import type { InferenceResult, WsClientMsg, WsRawServerMsg } from "@agent-smith/types";
import type { Context } from "koa";
import { default as color } from "ansi-colors";
import { createAwaiter } from "./utils.js";

function buildCallbacks(msg: WsClientMsg, ctx: Context, isAgent: boolean,
    confirmToolCalls: Record<string, (value: boolean) => void>
) {
    if (!msg?.options) {
        msg.options = {}
    }
    msg.options.onThinkingToken = (t: string, from: string) => {
        const rsm: WsRawServerMsg = {
            type: "thinkingtoken",
            from: from,
            msg: t,
        }
        ctx.websocket.send(JSON.stringify(rsm));
        process.stdout.write(`\x1b[2m${t}\x1b[0m`);
    };
    msg.options.onToken = (t: string, from: string) => {
        const rsm2: WsRawServerMsg = {
            type: "token",
            from: from,
            msg: t,
        }
        ctx.websocket.send(JSON.stringify(rsm2));
        process.stdout.write(t);
    };
    msg.options.onStartThinking = (from: string) => {
        const rsm: WsRawServerMsg = {
            type: "thinkingstart",
            from: from,
            msg: "",
        }
        ctx.websocket.send(JSON.stringify(rsm));
    };
    msg.options.onEndThinking = (from: string) => {
        const rsm: WsRawServerMsg = {
            type: "thinkingend",
            from: from,
            msg: "",
        }
        ctx.websocket.send(JSON.stringify(rsm));
    };
    msg.options.onTurnStart = (from: string) => {
        const rsm: WsRawServerMsg = {
            type: "turnstart",
            from: from,
            msg: "",
        }
        ctx.websocket.send(JSON.stringify(rsm));
    };
    msg.options.onTurnEnd = (ht: Record<string, any>, from: string) => {
        const rsm: WsRawServerMsg = {
            type: "turnend",
            from: from,
            msg: JSON.stringify(ht),
        }
        ctx.websocket.send(JSON.stringify(rsm));
    };
    msg.options.onAssistant = (txt: string, from: string) => {
        const rsm: WsRawServerMsg = {
            type: "assistant",
            from: from,
            msg: txt,
        }
        ctx.websocket.send(JSON.stringify(rsm));
    };
    msg.options.onThink = (txt: string, from: string) => {
        const rsm: WsRawServerMsg = {
            type: "think",
            from: from,
            msg: txt,
        }
        ctx.websocket.send(JSON.stringify(rsm));
    };
    msg.options.onEndEmit = (res: InferenceResult, from: string) => {
        const rsm: WsRawServerMsg = {
            type: "endemit",
            from: from,
            msg: JSON.stringify(res),
        }
        ctx.websocket.send(JSON.stringify(rsm));
    };
    if (isAgent) {
        msg.options.onToolCallInProgress = (tcs: Array<any>, from: string) => {
            const rsm: WsRawServerMsg = {
                type: "toolcallinprogress",
                from: from,
                msg: JSON.stringify(tcs),
            }
            ctx.websocket.send(JSON.stringify(rsm));
        };
        msg.options.onToolsTurnStart = (tcs: Record<string, any>, from: string) => {
            const rsm: WsRawServerMsg = {
                type: "toolsturnstart",
                from: from,
                msg: JSON.stringify(tcs),
            }
            ctx.websocket.send(JSON.stringify(rsm));
        };
        msg.options.onToolsTurnEnd = (tr: Record<string, any>, from: string) => {
            const rsm: WsRawServerMsg = {
                type: "toolsturnend",
                from: from,
                msg: JSON.stringify(tr),
            }
            ctx.websocket.send(JSON.stringify(rsm));
        };
        msg.options.onToolCall = (tc: Record<string, any>, type: string, from: string) => {
            if (!tc?.id) {
                tc.id = crypto.randomUUID()
            }
            const payload = { tc: tc, type: type, from: from };
            const rsm: WsRawServerMsg = {
                type: "toolcall",
                from: from,
                msg: JSON.stringify(payload),
            }
            ctx.websocket.send(JSON.stringify(rsm));
            console.log("\n⚒️ ", color.bold(msg.command), "=>", `${color.yellowBright(tc.name)}`, tc.arguments);
        };
        msg.options.onToolCallEnd = (tc: any, tr: any, type: string, from: string) => {
            let toolResData: any;
            if (typeof tr == 'object') {
                tr.type = type;
                if (tr?.text) {
                    // comes from an inference task
                    toolResData = tr.text
                } else {
                    toolResData = JSON.stringify(tr)
                }
            } else {
                toolResData = tr.toString();
            }
            const payload = { tc: tc, type: type, from: from };
            const rsm: WsRawServerMsg = {
                type: "toolcallend",
                from: from,
                msg: `${JSON.stringify(payload)}<|xtool_call_id|>` + toolResData,
            };
            //console.log("TOOL CALL END", toolResData);
            ctx.websocket.send(JSON.stringify(rsm));
        }
        msg.options.confirmToolUsage = async (tc: Record<string, any>, from: string) => {
            if (!tc?.id) {
                tc.id = crypto.randomUUID()
            }
            const rsm: WsRawServerMsg = {
                type: "toolcallconfirm",
                from: from,
                msg: JSON.stringify(tc),
            }
            const { promise, resolve } = createAwaiter<boolean>();
            confirmToolCalls[tc.id] = resolve;
            ctx.websocket.send(JSON.stringify(rsm));
            const res = await promise;
            return res
        }
    }
}

export {
    buildCallbacks,
}
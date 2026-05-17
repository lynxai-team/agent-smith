import type { AgentCallbacks, AgentParams, HistoryTurn, InferenceCallbacks, InferenceResult, ToolCallSpec, ToolSpec, ToolTurn, VerbosityOptions } from "@agent-smith/types";
import type { AgentInferenceOptions, PerformanceMetrics } from "@agent-smith/types/dist/inference.js";
import { Lm } from "./client.js";

class Agent {
    name: string = "unamed";
    lm: Lm;
    tools: Record<string, ToolSpec> = {};
    history: Array<HistoryTurn> = [];
    onToolCall?: (tc: ToolCallSpec, type: string, from: string) => void;
    onToolCallEnd?: (tc: ToolCallSpec, tr: any, type: string, from: string) => void;
    onToolsTurnStart?: (tc: Array<ToolCallSpec>, from: string) => void;
    onToolsTurnEnd?: (tt: Array<ToolTurn>, from: string) => void;
    onTurnStart?: (from: string) => void;
    onTurnEnd?: (ht: HistoryTurn, from: string) => void;
    onAssistant?: (txt: string, from: string) => void;
    onThink?: (txt: string, from: string) => void;

    constructor(params: AgentParams) {
        this.lm = params.lm;
        if (params?.name) {
            this.name = params.name;
        }
        // lm params
        if (params?.onToken) {
            this.lm.onToken = params.onToken;
        }
        if (params?.onThinkingToken) {
            this.lm.onThinkingToken = params.onThinkingToken;
        }
        if (params?.onStartEmit) {
            this.lm.onStartEmit = params.onStartEmit;
        }
        if (params?.onEndEmit) {
            this.lm.onEndEmit = params.onEndEmit;
        }
        if (params?.onError) {
            this.lm.onError = params.onError;
        }
        if (params?.onToolCallInProgress) {
            this.lm.onToolCallInProgress = params.onToolCallInProgress;
        }
        // agent params
        this.onToolCall = params?.onToolCall;
        this.onToolCallEnd = params?.onToolCallEnd;
        this.onToolsTurnStart = params?.onToolsTurnStart;
        this.onTurnStart = params?.onTurnStart;
        this.onToolsTurnEnd = params?.onToolsTurnEnd;
        this.onTurnEnd = params?.onTurnEnd;
        this.onAssistant = params?.onAssistant;
        this.onThink = params?.onThink;
    }

    async run(
        prompt: string,
        options: AgentInferenceOptions = {},
    ): Promise<InferenceResult> {
        if (options?.debug) {
            console.log("Agent", this.name, "inference params:", options?.params);
            console.log("Agent", this.name, "options:", options);
            //console.log("Agent template:", template);
            //console.log("Agent prompt:", prompt);
        }
        if (options?.history) {
            this.history = options.history;
            //options.history = undefined;
        }
        this.tools = {};
        if (options?.tools) {
            options.tools.forEach(t => {
                this.tools[t.name] = t;
            });
        }
        return await this._runAgent(1, prompt, options)
    }

    private async _runAgent(
        it: number,
        prompt: string,
        options: AgentInferenceOptions,
    ) {
        if (this?.onTurnStart) {
            this.onTurnStart(this.name)
        }
        const verbosity: VerbosityOptions = options?.verbosity ?? { events: true };
        //console.log("START RUN AGENT", this.name);
        const clientEvents: InferenceCallbacks = {
            onStartThinking: options?.onStartThinking,
            onEndThinking: options?.onEndThinking,
            onToken: options?.onToken,
            onThinkingToken: options?.onThinkingToken,
            onStartEmit: options?.onStartEmit,
            onEndEmit: options?.onEndEmit,
            onError: options?.onEndEmit,
            onToolCallInProgress: options?.onToolCallInProgress,
            onPromptProcessingProgress: options?.onPromptProcessingProgress,
        };
        const events: AgentCallbacks = {
            onToolCall: options?.onToolCall ?? this.onToolCall,
            onToolCallEnd: options?.onToolCallEnd ?? this.onToolCallEnd,
            onToolsTurnStart: options?.onToolsTurnStart ?? this.onToolsTurnStart,
            onToolsTurnEnd: options?.onToolsTurnEnd ?? this.onToolsTurnEnd,
            onTurnEnd: options?.onTurnEnd ?? this.onTurnEnd,
            onAssistant: options?.onAssistant ?? this.onAssistant,
            onThink: options?.onThink ?? this.onThink,
        }
        const baseOpts = {
            ...options,
        };
        baseOpts.tools = Object.values(this.tools);
        baseOpts.history = this.history;
        //console.log("AGENT OPTS", baseOpts);
        const clientOpts = { ...baseOpts, ...clientEvents, ...events, agentName: this.name };
        //console.log("AGENT CLIENT OPS", clientOpts);
        //options.history = this.history;
        const res = await this.lm.infer(prompt, clientOpts);
        //console.log("(AGENT) RUN RES:");
        //console.dir(res, {depth: 8})
        //console.log("IT", it, prompt);
        if (it == 1) {
            this.history.push({ user: prompt });
        }
        let _res = res;
        //console.log("RES", res);
        const toolsResults = new Array<ToolTurn>();
        if (_res.thinkingText.length > 0) {
            if (events.onThink) {
                events.onThink(_res.thinkingText, this.name);
            };
        }
        if (_res.text.length > 0) {
            if (events.onAssistant) {
                events.onAssistant(_res.text, this.name);
            }
        }
        if (res?.toolCalls) {
            //console.log("TTS", this.name);
            if (events.onToolsTurnStart) {
                events.onToolsTurnStart(res.toolCalls, this.name);
            }
            const toolNames = Object.keys(this.tools);
            const syncTools = new Array<() => Promise<void>>();
            const parallelTools = new Array<() => Promise<void>>();
            let isAbort = false;
            for (const tc of res.toolCalls) {
                if (!toolNames.includes(tc.name)) {
                    throw new Error(`Inexistant tool ${tc.name} called (available tools: ${toolNames})`)
                }
                const tool = this.tools[tc.name];
                //console.log("AGENT TOOL", tool);
                let canRun = true;
                if (tool?.canRun) {
                    canRun = await tool.canRun(tc);
                }
                if (canRun) {
                    const type = this.tools[tc.name].type;
                    if (events?.onToolCall) {
                        //console.log("TCT", this.tools[tc.name]);                        
                        events.onToolCall(tc, type, this.name);
                    }
                    const f = async () => {
                        //console.log("EXEC TOOL", tc.name);
                        let toolCallResult: any;
                        let ok = false;
                        try {
                            toolCallResult = await tool.execute(tc.arguments);
                            ok = true;
                        } catch (e) {
                            toolCallResult = `[Error] running tool call ${e},\n ${JSON.stringify(tc, null, 2)}`;
                            //if (verbosity?.events) {
                            console.log("[X] Tool", tool.name, "execution error:", toolCallResult);
                            //}
                            if (options?.onError) {
                                options?.onError(toolCallResult, this.name);
                            }
                            //throw new Error(m)
                        }
                        //console.log("END EXEC TOOL", tc.name, toolCallResult);
                        if (verbosity?.toolResults && ok) {
                            console.log("[x] Executed tool", tool.name + ":\n", toolCallResult);
                        }
                        toolsResults.push({ call: tc, response: toolCallResult, from: this.name, type: tool.type });
                        if (events?.onAssistant && tool.type == "agent") {
                            if (typeof toolCallResult == "object") {
                                const ln = Object.keys(toolCallResult).length;
                                if ((toolCallResult?.type == "agent" && ln == 1) || ln == 0) {
                                    console.log("Request aborted from subagent tool call", this.name), toolCallResult;
                                    isAbort = true;
                                    this.lm.abort();
                                    return
                                }
                            }
                            //console.log("TOOL CALL RESP ASSISTANT", toolCallResult);
                            if (toolCallResult?.assistant) {
                                events?.onAssistant(toolCallResult.assistant, this.name)
                            }
                        }
                        if (events?.onToolCallEnd) {
                            const type = this.tools[tc.name].type;
                            events.onToolCallEnd(tc, toolCallResult, type, this.name);
                        }
                        //console.log("TCE", this.name, JSON.stringify(toolCallResult));                    
                    };
                    if (tool.parallelCalls) {
                        parallelTools.push(f)
                    } else {
                        syncTools.push(f);
                    }
                } else {
                    if (verbosity?.events) {
                        const m = `[-] Tool", ${tool.name}, "execution refused`;
                        if (events?.onToolCallEnd) {
                            events.onToolCallEnd(tc, m, this.tools[tc.name].type, this.name)
                        }
                        console.log(m);
                    }
                }
            }
            if (parallelTools.length > 0) {
                await Promise.allSettled(parallelTools.map(f => f()));
            }
            if (syncTools.length > 0) {
                for (const f of syncTools) {
                    await f()
                }
            }
            if (isAbort) {
                const r: InferenceResult = { text: "", thinkingText: "", stats: {} as PerformanceMetrics };
                return r
            }
            if (events?.onToolsTurnEnd) {
                events.onToolsTurnEnd(toolsResults, this.name);
            }
            const ht: HistoryTurn = { tools: toolsResults };
            if (res.thinkingText) {
                ht.think = res.thinkingText
            }
            this.history.push(ht);
            if (options?.isToolsRouter) {
                const fres: InferenceResult = {
                    text: JSON.stringify(toolsResults.map(tr => tr.response)),
                    thinkingText: res.thinkingText ?? "",
                    stats: res.stats,
                    toolCalls: res.toolCalls,
                }
                //console.log("TURN END ROUTING", this.name);
                if (events?.onTurnEnd) {
                    events.onTurnEnd(this.history[this.history.length - 1], this.name)
                }
                return fres
            }
            const nit = it + 1;
            /*if (nit > 1 && options?.debug) {
                options.debug = false;
                options.verbose = true;
            }*/
            //console.log("HISTORY:");
            //console.dir(options.history, {depth: 8});         
            if (options?.tools) {
                options.tools = Object.values(this.tools);
            }
            //console.log("TURN END Tc", this.name);
            if (events?.onTurnEnd) {
                events.onTurnEnd(this.history[this.history.length - 1], this.name)
            }
            //console.log("HIST", this.name + ":");
            //console.dir(this.history, { depth: 6 });
            //console.log("RUN AGENT TC", nit, this.name);
            _res = await this._runAgent(nit, "", options);
            //console.log("END RUN AGENT TC", this.name);
        } else {
            //console.log("END RUN AGENT NO TC", this.name);
            const turn: HistoryTurn = { assistant: res.text };
            if (res?.thinkingText) {
                turn.think = res.thinkingText
            }
            this.history.push(turn);
            //console.log("TURN END NO TC", this.name);
            if (events?.onTurnEnd) {
                events.onTurnEnd(this.history[this.history.length - 1], this.name)
            }
        }
        return _res
    }
}

export {
    Agent
};


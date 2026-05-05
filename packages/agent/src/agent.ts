import type { AgentCallbacks, AgentParams, HistoryTurn, InferenceCallbacks, InferenceResult, ToolCallSpec, ToolSpec, ToolTurn, VerbosityOptions } from "@agent-smith/types";
import type { AgentInferenceOptions } from "@agent-smith/types/dist/inference.js";
import { Lm } from "./client.js";

class Agent {
    name: string = "unamed";
    lm: Lm;
    tools: Record<string, ToolSpec> = {};
    history: Array<HistoryTurn> = [];
    onToolCall?: (tc: ToolCallSpec, from: string) => void;
    onToolCallEnd?: (tc: ToolCallSpec, tr: any, from: string) => void;
    onToolsTurnStart?: (tc: Array<ToolCallSpec>, from: string) => void;
    onToolsTurnEnd?: (tt: Array<ToolTurn>, from: string) => void;
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
            options.history = undefined;
        }
        this.tools = {};
        if (options?.tools) {
            options.tools.forEach(t => {
                this.tools[t.name] = t;
            });
        }
        return await this.runAgent(1, prompt, options)
    }

    async runAgent(
        it: number,
        prompt: string,
        options: AgentInferenceOptions = {},
    ) {
        const verbosity: VerbosityOptions = options?.verbosity ?? { events: true };
        //console.log("(AGENT) options:", options);
        const clientEvents: InferenceCallbacks = {
            onStartThinking: options?.onStartThinking,
            onEndThinking: options?.onEndThinking,
            onToken: options?.onToken,
            onThinkingToken: options?.onThinkingToken,
            onStartEmit: options?.onStartEmit,
            onEndEmit: options?.onEndEmit,
            onError: options?.onEndEmit,
            onToolCallInProgress: options?.onToolCallInProgress,
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
            //debug: options?.debug,
            //verbose: options?.verbose,
            model: options?.model,
            tools: options?.tools,
            history: options?.history,
            system: options?.system,
            assistant: options?.assistant,
            isToolsRouter: options?.isToolsRouter,
            params: options?.params,
        }
        //console.log("AGENT OPTS", baseOpts);
        const clientOpts = { ...baseOpts, ...clientEvents, agentName: this.name };
        options.history = this.history;
        const res = await this.lm.infer(prompt, clientOpts);
        //console.log("(AGENT) RUN RES:");
        //console.dir(res, {depth: 8})
        if (it == 1) {
            this.history.push({ user: prompt });
        }
        let _res = res;
        //console.log("RES", res);
        if (_res.thinkingText.length > 0) {
            if (events.onThink) {
                events.onThink(_res.thinkingText, this.name)
            }
        }
        if (_res.text.length > 0) {
            if (events.onAssistant) {
                events.onAssistant(_res.text, this.name)
            }
        }
        if (res?.toolCalls) {
            if (events.onToolsTurnStart) {
                events.onToolsTurnStart(res.toolCalls, this.name);
            }
            const toolsResults = new Array<ToolTurn>();
            const toolNames = Object.keys(this.tools);
            for (const tc of res.toolCalls) {
                if (!toolNames.includes(tc.name)) {
                    throw new Error(`Inexistant tool ${tc.name} called (available tools: ${toolNames})`)
                }
                const tool = this.tools[tc.name];
                let canRun = true;
                if (tool?.canRun) {
                    canRun = await tool.canRun(tc);
                }
                if (canRun) {
                    if (events?.onToolCall) {
                        //console.log("TCA", this.name);
                        events.onToolCall(tc, this.name);
                    }
                    const toolCallResult = await tool.execute(tc.arguments);
                    if (verbosity?.toolResults) {
                        console.log("[x] Executed tool", tool.name + ":", toolCallResult);
                    }
                    toolsResults.push({ call: tc, response: JSON.stringify(toolCallResult) });
                    if (events?.onToolCallEnd) {
                        events.onToolCallEnd(tc, toolCallResult, this.name);
                    }
                } else {
                    if (verbosity?.events) {
                        console.log("[-] Tool", tool.name, "execution refused");
                    }
                }
            }
            if (events?.onToolsTurnEnd) {
                events.onToolsTurnEnd(toolsResults, this.name);
            }
            this.history.push({ tools: toolsResults });
            if (options?.isToolsRouter) {
                const fres: InferenceResult = {
                    text: JSON.stringify(toolsResults.map(tr => tr.response)),
                    thinkingText: "",
                    stats: res.stats,
                    serverStats: res.serverStats,
                    toolCalls: res.toolCalls,
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
            if (events?.onTurnEnd) {
                events.onTurnEnd(this.history[this.history.length - 1], this.name)
            }
            _res = await this.runAgent(nit, "", options);
        } else {
            this.history.push({ assistant: res.text });
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


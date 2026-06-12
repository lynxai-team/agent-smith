import type { AgentCallbacks, AgentParams, AgentSpec, HistoryTurn, InferenceCallbacks, InferenceResult, ToolCallSpec, ToolSpec, ToolTurn, VerbosityOptions } from "@agent-smith/types";
import type { AgentInferenceOptions, PerformanceMetrics } from "@agent-smith/types";
import { Lm } from "./client.js";
import { convertStats } from "./stats.js";
import YAML from 'yaml';
import { applyVariables } from "./variables.js";

class Agent {
    name: string = "unamed";
    lm: Lm;
    tools: Record<string, ToolSpec> = {};
    history: Array<HistoryTurn> = [];
    spec?: AgentSpec;
    onToolCall?: (tc: ToolCallSpec, type: string, from: string) => void;
    onToolCallEnd?: (tc: ToolCallSpec, tr: any, type: string, from: string) => void;
    onToolsTurnStart?: (tc: Array<ToolCallSpec>, from: string) => void;
    onToolsTurnEnd?: (tt: Array<ToolTurn>, from: string) => void;
    onTurnStart?: (from: string) => void;
    onTurnEnd?: (ht: HistoryTurn, from: string) => void;
    onAssistant?: (txt: string, from: string) => void;
    onThink?: (txt: string, from: string) => void;

    constructor(params: AgentParams, spec?: AgentSpec) {
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
        if (spec) {
            this.spec = spec;
        }
    }

    static fromYaml(params: AgentParams, txt: string) {
        const data = YAML.parse(txt);
        return new Agent(params, data as AgentSpec)
    }

    async run(
        prompt: string,
        options: AgentInferenceOptions = {},
    ): Promise<InferenceResult> {
        const localOptions: AgentInferenceOptions = Object.assign({}, options);
        //console.log("AGENT OPTS IN", localOptions);
        /*if (localOptions?.isToolCall) {
            console.log("START AGENT TC HIST", this.name, localOptions.history);
            const hist = localOptions.history?.pop();
            if (!hist) {
                throw new Error(`subagent tool call no history ${this.name} ${localOptions}`)
            }
            // subagents use fresh context
            localOptions.history = [hist];
            this.history = [hist];
            console.log("END AGENT TC HIST", this.name, localOptions.history);
        } else*/
        if (localOptions?.history) {
            this.history = localOptions.history;
        }
        this.tools = {};
        if (localOptions?.tools) {
            localOptions.tools.forEach(t => {
                this.tools[t.name] = t;
            });
        }
        let finalPrompt = prompt;
        //console.log("================= Agent", this.name, "OPTS", localOptions);
        //console.log("Agent", this.name, "SPEC", this.spec);
        if (this?.spec) {
            // model
            if (!options?.isToolCall) {
                if (!localOptions?.model) {
                    if (!this.spec?.model) {
                        throw new Error(`${this.name}: provide a model in agent spec or runtime options`)
                    }
                    localOptions.model = this.spec.model;
                }
            } else {
                if (!options?.propagateModel) {
                    if (!this.spec?.model) {
                        throw new Error(`${this.name} subagent: provide a model in subagent spec or set propagateModel from main agent to true`)
                    }
                    localOptions.model = this.spec.model;
                }
            }
            /*console.log("A", this.name, "TC", localOptions?.isToolCall, "P", localOptions?.propagateModel);
            console.log("M", localOptions?.model);
            console.log("B", localOptions?.backend);
            console.log("ASB", this?.spec?.backend);*/
            // variables
            applyVariables(this.spec, localOptions);
            // infer params
            if (!options?.isToolCall) {
                if (!localOptions.params) {
                    localOptions.params = this.spec.inferParams;
                }
                //localOptions.params = formatInferParams(this.spec.inferParams ?? {}, localOptions ?? {});
            } else {
                if (!options?.propagateInferParams) {
                    localOptions.params = this.spec.inferParams;
                }
            }
            //console.log("IPOPTS", localOptions?.params);
            //console.log("SPECOPTS", this?.spec?.name, this?.spec?.inferParams);
            // prompt
            finalPrompt = this.spec.prompt.replace("{prompt}", prompt);
            if (this.spec?.description) {
                localOptions.isToolsRouter = this.spec.description.includes("routing agent")
            }
            if (this.spec.template?.system) {
                localOptions.system = this.spec.template.system;
            }
            if (this.spec?.shots) {
                localOptions.history = localOptions?.history ? [...this.spec.shots, ...localOptions.history] : this.spec.shots;
            }
        }
        //console.log("OPTS MODEL FINAL", localOptions?.model);
        return await this._runAgent(1, finalPrompt, localOptions)
    }

    private async _runAgent(
        it: number,
        prompt: string,
        localOptions: AgentInferenceOptions,
    ) {
        const verbosity: VerbosityOptions = localOptions?.verbosity ?? { events: true };
        //console.log("START RUN AGENT", this.name);
        const clientEvents: InferenceCallbacks = {
            onStartThinking: localOptions?.onStartThinking,
            onEndThinking: localOptions?.onEndThinking,
            onToken: localOptions?.onToken,
            onThinkingToken: localOptions?.onThinkingToken,
            onStartEmit: localOptions?.onStartEmit,
            onEndEmit: localOptions?.onEndEmit,
            onError: localOptions?.onEndEmit,
            onToolCallInProgress: localOptions?.onToolCallInProgress,
            onPromptProcessingProgress: localOptions?.onPromptProcessingProgress,
        };
        const events: AgentCallbacks = {
            onToolCall: localOptions?.onToolCall ?? this.onToolCall,
            onToolCallEnd: localOptions?.onToolCallEnd ?? this.onToolCallEnd,
            onToolsTurnStart: localOptions?.onToolsTurnStart ?? this.onToolsTurnStart,
            onToolsTurnEnd: localOptions?.onToolsTurnEnd ?? this.onToolsTurnEnd,
            onTurnStart: localOptions?.onTurnStart ?? this.onTurnStart,
            onTurnEnd: localOptions?.onTurnEnd ?? this.onTurnEnd,
            onAssistant: localOptions?.onAssistant ?? this.onAssistant,
            onThink: localOptions?.onThink ?? this.onThink,
        }
        if (events?.onTurnStart) {
            events.onTurnStart(this.name)
        }
        const baseOpts = {
            ...localOptions,
        };
        baseOpts.tools = Object.values(this.tools);
        baseOpts.history = this.history;
        // check start assistant message
        if (this.spec?.template?.assistant) {
            baseOpts.history.push({
                assistant: this.spec.template.assistant
            })
        }
        //console.log("AGENT OPTS", baseOpts);
        localOptions = { ...baseOpts, ...clientEvents, ...events };
        const clientOpts = { ...localOptions, agentName: this.name };
        //localOptions.history = this.history;
        /*if (localOptions?.debug) {
            console.log("-----------", localOptions.model, "-----------");
            if (localOptions?.system) {
                console.log("SYSTEM:", localOptions.system, "\n");
            }
            console.log("PROMPT:", prompt);
            console.log("----------------------------------------------")
            console.log("Infer params:", localOptions.params);
            console.log("----------------------------------------------")
        }*/
        //console.log("PR", prompt);
        //console.log("AGENT CLIENT OPS", clientOpts.history);
        const res = await this.lm.infer(prompt, clientOpts);
        //console.log("(AGENT) RUN RES:");
        //console.dir(res, {depth: 8})
        //console.log("IT", it, prompt);
        if (it == 1) {
            this.history.push({ user: prompt, stats: convertStats(res.stats) });
        }
        //console.log(it, this.name, "tc:", localOptions?.isToolCall, "history:");
        //console.dir(this.history, { depth: 5 })
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
                //console.log("AGENT TOOL CAN", canRun);
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
                            const tlo = Object.assign({}, localOptions);
                            let toolCallArgs: {
                                [key: string]: any
                            } | undefined = { ...tc.arguments };
                            //console.log("TC TYPE", tool.name, tool.type, "/", tool?.agentType);
                            //console.log("TLO", tlo);
                            //if (["agent", "workflow"].includes(tool.type)) {
                            if (tool?.agentType !== "worker") {
                                // discard history
                                tlo.history = []
                            } else {
                                if (tlo?.system) {
                                    delete tlo.system
                                }
                                if (tlo?.tools) {
                                    delete tlo.tools
                                }
                            }
                            tlo.caller = this.name;
                            toolCallArgs.toolOptions = tlo;
                            /*} else {
                                if (tool?.agentType == "worker") {
                                    tlo.caller = this.name;
                                    toolCallArgs.toolOptions = tlo;
                                }
                            }*/
                            //console.log("EXEC TC OPTs", tc.name, tool?.type, tool?.agentType, "c=" + toolCallArgs.toolOptions?.caller);
                            toolCallResult = await tool.execute(toolCallArgs);
                            //console.log("TCR*******", toolCallResult)
                            //console.log("*************")
                            ok = true;
                        } catch (e) {
                            toolCallResult = `[Error] running tool call ${e},\n ${JSON.stringify(tc, null, 2)}`;
                            //if (verbosity?.events) {
                            console.log("[X] Tool", tool.name, "execution error:", toolCallResult);
                            //}
                            if (localOptions?.onError) {
                                localOptions?.onError(toolCallResult, this.name);
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
            const ht: HistoryTurn = { tools: toolsResults, stats: convertStats(res.stats) };
            //console.log(this.name, it, localOptions?.isToolCall, it == 1 && !localOptions?.isToolCall);
            /*if (it > 1 && !localOptions?.isToolCall) {
                ht.user = prompt
            }*/
            if (res.thinkingText) {
                ht.think = res.thinkingText
            }
            if (res.text) {
                ht.assistant = res.text
            }
            //console.log("TC HT", this.name, "tc", localOptions?.isToolCall ?? false);
            //console.dir(ht, { depth: 5 })
            this.history.push(ht);
            //localOptions.history?.push(ht);
            //console.log("TC HIST", this.name, "tc", localOptions?.isToolCall ?? false);
            //console.dir(this.history, { depth: 5 })
            //console.dir(ht, { depth: 5 })
            if (localOptions?.isToolsRouter) {
                const fres: InferenceResult = {
                    text: JSON.stringify(toolsResults.map(tr => tr.response)),
                    thinkingText: res.thinkingText ?? "",
                    stats: res.stats,
                    toolCalls: res.toolCalls,
                }
                //console.log("TURN END ROUTING", this.name, toolsResults.map(tr => tr.response));
                if (events?.onTurnEnd) {
                    events.onTurnEnd(this.history[this.history.length - 1], this.name)
                }
                return fres
            }

            /*if (nit > 1 && localOptions?.debug) {
                localOptions.debug = false;
                localOptions.verbose = true;
            }*/
            //console.log("HISTORY:");
            //console.dir(localOptions.history, {depth: 8});         
            if (localOptions?.tools) {
                localOptions.tools = Object.values(this.tools);
            }
            //console.log("TURN END Tc", this.name);
            if (events?.onTurnEnd) {
                events.onTurnEnd(this.history[this.history.length - 1], this.name)
            }
            localOptions.history = this.history;
            //console.log("END LOOP HIST", this.name + ":");
            //console.dir(this.history, { depth: 6 });
            _res = await this._runAgent(it + 1, "", localOptions);
            //console.log("END RUN AGENT TC", this.name);
        } else {
            //console.log("END RUN AGENT NO TC", this.name);
            const turn: HistoryTurn = { assistant: res.text, stats: convertStats(res.stats) };
            if (it > 1 && !localOptions?.isToolCall) {
                turn.user = prompt
            }
            if (res?.thinkingText) {
                turn.think = res.thinkingText
            }
            //console.log("PUSH TURN", turn);
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


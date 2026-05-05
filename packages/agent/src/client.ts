import type {
    InferenceCallbacks,
    InferenceResult,
    InferenceStats,
    IngestionStats,
    LmProvider,
    LmProviderParams,
    ModelInfo,
    OnLoadProgress,
    ToolCallSpec,
    ToolSpec,
    VerbosityOptions
} from "@agent-smith/types";
import type { ClientInferenceOptions } from "@agent-smith/types/dist/inference.js";
import { createParser } from 'eventsource-parser';
import {
    type ChatCompletionContentPart,
    type ChatCompletionCreateParamsNonStreaming,
    type ChatCompletionCreateParamsStreaming,
    type ChatCompletionMessageFunctionToolCall,
    type ChatCompletionMessageParam,
    type ChatCompletionMessageToolCall,
    type ChatCompletionTool
} from "openai/resources/index.js";
import { useApi } from "restmix";
import { useStats } from "./stats.js";
import { convertToolCallSpec, generateId } from './tools.js';

class Lm implements LmProvider {
    name: string;
    api: ReturnType<typeof useApi>;
    onToken?: (t: string, from: string) => void;
    onThinkingToken?: (t: string, from: string) => void;
    onStartThinking?: (from: string) => void;
    onEndThinking?: (from: string) => void;
    onStartEmit?: (data: IngestionStats, from: string) => void;
    onEndEmit?: (result: InferenceResult, from: string) => void;
    onError?: (err: any, from: string) => void;
    onToolCallInProgress?: (tc: Array<ToolCallSpec>, from: string) => void;
    // state
    model = "";
    models = new Array<ModelInfo>();
    abortController = new AbortController();
    apiKey: string;
    serverUrl: string;
    tools: Record<string, ToolSpec> = {};

    /**
 * Creates a new instance of the OpenaiCompatibleProvider.
 *
 * @param {LmProviderParams} params - Configuration parameters for initializing the provider.
 */
    constructor(params: LmProviderParams) {
        this.name = params.name;
        this.onToken = params.onToken;
        this.onThinkingToken = params.onThinkingToken;
        this.onStartEmit = params.onStartEmit;
        this.onEndEmit = params.onEndEmit;
        this.onStartThinking = params.onStartThinking;
        this.onEndThinking = params.onEndThinking;
        this.onError = params.onError;
        this.onToolCallInProgress = params.onToolCallInProgress;
        this.apiKey = params.apiKey ?? "";
        this.serverUrl = params.serverUrl;
        this.api = useApi({
            serverUrl: params.serverUrl,
            credentials: "omit",
        });
        this.api.addHeader('Content-Type', 'application/json')
        if (this.apiKey.length > 0) {
            this.api.addHeader("Authorization", `Bearer ${this.apiKey}`);
        }
    }

    async modelsInfo(): Promise<Array<ModelInfo>> {
        const baseUrl = this.serverUrl.replace("/v1", "");
        // use llama.cpp's /models endpoint
        let api = useApi({
            serverUrl: baseUrl,
            credentials: "omit",
        });
        api.addHeader('Content-Type', 'application/json')
        if (this.apiKey.length > 0) {
            api.addHeader("Authorization", `Bearer ${this.apiKey}`);
        }
        const res = await api.get<Record<string, any>>("/models");
        const ms = new Array<ModelInfo>();
        if (res.ok) {
            //console.dir(res.data.data, { depth: 3 });            
            res.data.data.forEach((m: Record<string, any>) => {
                //console.log("M", m.id);
                let prevArg = "";
                let ctx = 0;
                let hasVision = false;
                for (const a of m.status.args) {
                    //console.log("A", a);
                    if (prevArg == "--ctx-size") {
                        ctx = parseInt(a);
                    }
                    if (a == "--mmproj") {
                        hasVision = true
                    }
                    prevArg = a;
                }
                ms.push({ id: m.id, status: m.status.value, ctx: ctx, hasVision: hasVision });
            })
        }
        return ms
    }

    async modelInfo(): Promise<ModelInfo> {
        console.warn("Not implemented for this provider")
        return { id: "", status: "", ctx: -1, hasVision: false }
    }

    /**
   * Use a specified model for inferences.
   *
   * @param {string} name - The name of the model to load.
   * @param {number | undefined} [ctx] - The optional context window length, defaults to the model ctx.
   * @returns {Promise<void>}
   */
    async loadModel(name: string, ctx?: number, urls?: string | string[], onLoadProgress?: OnLoadProgress): Promise<void> {
        this.model = name
    }

    /**
  * Unloads a specified model
  *
  * @param {string} name - The name of the model to unload.
  * @returns {Promise<void>}
  */
    async unloadModel(name: string): Promise<void> {
        throw new Error("Not implemented for this provider");
    }

    async tokenize(text: string): Promise<Array<number>> {
        const tokens = new Array<number>();
        const res = await this.api.post<{ tokens: Array<number> }>("/tokenize", { content: text });
        if (res.ok) {
            tokens.push(...res.data.tokens)
        } else {
            throw new Error(`Error ${res.status} tokenizing text ${res.text}`);
        }
        return tokens
    }

    async detokenize(tokens: Array<number>): Promise<string> {
        let text = "";
        const res = await this.api.post<string>("/tokenize", { tokens: tokens });
        if (res.ok) {
            text = res.text
        } else {
            throw new Error(`Error ${res.status} detokenizing text ${res.text}`);
        }
        return text
    }

    /**
     * Makes an inference based on the provided prompt and parameters.
     *
     * @param {string} prompt - The input text to base the inference on.
     * @param {InferenceParams} params - Parameters for customizing the inference behavior.
     * @returns {Promise<InferenceResult>} - The result of the inference.
     */
    async infer(
        prompt: string,
        options: ClientInferenceOptions = {},
    ): Promise<InferenceResult> {
        const events: InferenceCallbacks = {
            onStartThinking: options?.onStartThinking ?? this.onStartThinking,
            onEndThinking: options?.onEndThinking ?? this.onEndThinking,
            onToken: options?.onToken ?? this.onToken,
            onThinkingToken: options?.onThinkingToken ?? this.onThinkingToken,
            onStartEmit: options?.onStartEmit ?? this.onStartEmit,
            onEndEmit: options?.onEndEmit ?? this.onEndEmit,
            onError: options?.onEndEmit ?? this.onError,
            onToolCallInProgress: options?.onToolCallInProgress ?? this.onToolCallInProgress,
        };
        //console.log("EVENTS", events);
        //console.log("CLI OPTS", options);
        const verbosity: VerbosityOptions = options?.verbosity ?? { events: true };
        this.abortController = new AbortController();
        const params = options?.params ?? {};
        const inferenceParams: Record<string, any> = Object.assign({}, params);
        if ("max_tokens" in inferenceParams) {
            inferenceParams.max_completion_tokens = params.max_tokens;
            delete inferenceParams.max_tokens;
        }
        if (options?.model) {
            this.model = options.model;
        }
        if (verbosity?.options) {
            console.log("Options", options);
        }
        inferenceParams.stream = params?.stream ?? true;
        //console.log("STREAM", inferenceParams.stream, params?.stream)
        const stats = useStats();
        stats.start();
        let finalStats = {} as InferenceStats;
        let serverStats: Record<string, any> = {};
        let msgs: Array<ChatCompletionMessageParam> = [];
        if (options?.system) {
            msgs = [{ role: "system", content: options.system }];
        }
        if (options?.history) {
            options.history.forEach(
                // @ts-ignore
                row => {
                    if (row?.user) {
                        msgs.push({
                            role: "user",
                            content: row.user,
                        });
                    }
                    if (row?.assistant) {
                        msgs.push({
                            role: "assistant",
                            content: row.assistant,
                        });
                    }
                    if (row?.tools) {
                        const toolCalls = new Array<ChatCompletionMessageToolCall>();
                        const toolResponses = new Array<ChatCompletionMessageParam>();

                        // @ts-ignore
                        row.tools.forEach(tt => {
                            toolCalls.push({
                                id: tt.call.id ?? "",
                                type: "function",
                                "function": {
                                    name: tt.call.name,
                                    arguments: JSON.stringify(tt.call.arguments)
                                }
                            });
                            toolResponses.push({
                                role: "tool",
                                tool_call_id: tt.call.id,
                                content: tt.response,
                            })
                        });
                        msgs.push({
                            role: "assistant",
                            content: null,
                            tool_calls: toolCalls,
                        })
                        for (const tr of toolResponses) {
                            msgs.push(tr)
                        }
                    }
                }
            );
        }
        //console.log("AGENT IP", inferenceParams);
        if (inferenceParams?.images) {
            const usermsgs = new Array<ChatCompletionContentPart>();
            usermsgs.push(
                { type: "text", text: prompt }
            );
            (inferenceParams.images as Array<string>).forEach(imgStr => {
                usermsgs.push(
                    { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imgStr}`, detail: "auto" } }
                )
            });
            delete inferenceParams.images;
            msgs.push({ role: "user", content: usermsgs })
        } else {
            msgs.push({ role: "user", content: prompt });
        }
        let tools: Array<ChatCompletionTool> = [];
        this.tools = {};
        if (options?.tools) {
            options.tools.forEach(t => {
                this.tools[t.name] = t;
                const finalToolCall = convertToolCallSpec(t);
                //console.log("Tool call def:")
                //console.dir(finalToolCall, { depth: 5 });
                tools.push(finalToolCall);
            });
        }
        if (options?.assistant) {
            msgs.push({ role: "assistant", content: options.assistant });
        }
        if (params?.extra) {
            //inferenceParams = { ...inferenceParams, ...params.extra };
            for (const [k, v] of Object.entries(params.extra)) {
                inferenceParams[k] = v
            }
            delete inferenceParams.extra;
        }
        if (verbosity?.history) {
            console.log("Messages ----------\n");
            console.dir(msgs, { depth: 6 });
            console.log("-------------------");
            if (this?.tools && verbosity?.tools) {
                console.log("Tools ----------\n");
                console.dir(this.tools, { depth: 6 });
                console.log("-------------------");
            }
        }
        let i = 1;
        let text: string;
        let thinkingText = "";
        const toolCalls = new Array<ToolCallSpec>();
        if (!inferenceParams.stream) {
            const ip: ChatCompletionCreateParamsNonStreaming = {
                messages: msgs,
                model: this.model,
                parallel_tool_calls: true,
                ...inferenceParams,
            };
            if (verbosity?.inferenceParams) {
                console.log("Inference parameters:");
                console.dir(inferenceParams, { depth: 4 });
            }
            if (tools.length > 0) {
                ip.tools = tools;
                ip.tool_choice = "auto";
            }
            //console.log("IP", JSON.stringify(ip, null, 2));            
            const _url = `/chat/completions`;
            //console.log("URL", _url);
            const res = await this.api.post<Record<string, any>>(_url, ip, false, true);
            if (!res.ok) {
                throw new Error(`${res.statusText} ${res.status}`);
            }
            //const completion = await this.openai.chat.completions.create(ip);
            //console.log("RESP", JSON.stringify(res, null, "  "));
            const completion = res.data;
            text = res.data.choices[0].message.content ?? "";
            i = text.length > 0 ? text.length : (completion.usage?.completion_tokens ?? 0);
            serverStats = completion?.timings ?? {};
            if (completion.choices[0].finish_reason == "tool_calls") {
                //console.log("TOOL CALLS NO STREAM:");
                //console.dir(completion.choices[0].message.tool_calls, { depth: 8 })
                const tcs = completion.choices[0].message.tool_calls as Array<ChatCompletionMessageFunctionToolCall> ?? [];
                tcs?.forEach(tc => {
                    const toolCall: ToolCallSpec = {
                        id: tc.id ?? generateId(),
                        name: tc.function.name,
                    }
                    if (tc?.function?.arguments) {
                        try {
                            const parsedTc = JSON.parse(tc.function.arguments);
                            toolCall.arguments = parsedTc
                        } catch (e) {
                            throw new Error(`${e}\n\nTool call arguments parsing error: \n${tc.function.arguments}`)
                        }
                    }
                    toolCalls.push(toolCall)
                });
            }
        } else {
            const ip: ChatCompletionCreateParamsStreaming = {
                messages: msgs,
                model: this.model,
                parallel_tool_calls: true,
                ...inferenceParams,
                stream: true,
            };
            if (verbosity?.inferenceParams) {
                console.log("Inference parameters:");
                console.dir(inferenceParams, { depth: 4 });
            }
            if (tools.length > 0) {
                ip.tools = tools;
                ip.tool_choice = "auto";
            }
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                //'Accept': 'text/event-stream',
            };
            if (this.apiKey.length > 0) {
                headers["Authorization"] = `Bearer ${this.apiKey}`
            }
            const _url = `${this.serverUrl}/chat/completions`;
            const body = JSON.stringify(ip);
            if (verbosity?.request) {
                console.log("Agent: request body -------------");
                console.log(ip);
                console.log("-----------------------------------");
            }
            //console.log("IP", JSON.stringify(ip, null, 2));
            const response = await fetch(_url, {
                method: 'POST',
                headers: headers,
                body: body,
                signal: this.abortController.signal,
            });
            if (!response.ok) {
                const jerr = await response.json();
                const err = jerr?.error ?? await response.text();
                if (this?.onError) {
                    this.onError(err, options?.agentName ?? "");
                    return {} as InferenceResult;
                } else {
                    throw new Error(`Inference server error: ${JSON.stringify(err, null, 2)}`)
                }
            }
            if (!response.body) {
                if (this?.onError) {
                    this.onError(new Error("No response body"), options?.agentName ?? "");
                };
                throw new Error("No response body")
            }
            let buf = new Array<string>();
            const reader = response.body.getReader();
            let i = 1;
            let accumulatedToolCalls: Array<{
                id: string;
                function: {
                    name: string;
                    arguments: string;
                };
                type: string;
                index: number;
            }> = [];
            let toolsCallsInProgress = new Array<ToolCallSpec>();
            let isThinking = false;
            const parser = createParser({
                onEvent: (event) => {
                    const done = event.data === '[DONE]';
                    if (!done) {
                        if (i == 1) {
                            const ins = stats.inferenceStarts();
                            if (events.onStartEmit) {
                                events.onStartEmit(ins, this.name)
                            }
                        }
                        if (events.onToken) {
                            const payload = JSON.parse(event.data);
                            const modelRawToolCalls: Record<string, { name: string, arguments: Array<string> }> = {};

                            const choice = payload.choices[0];
                            if (!choice) return;

                            const delta = choice.delta;
                            if (!delta) return;

                            // Check for tool calls in the delta
                            if (delta.tool_calls && delta.tool_calls.length > 0) {
                                //console.log("DELTA TC", delta.tool_calls);
                                for (const toolCallDelta of delta.tool_calls) {
                                    const index = toolCallDelta.index;
                                    // Ensure the array is large enough
                                    if (!accumulatedToolCalls[index]) {
                                        // new tool call                                        
                                        accumulatedToolCalls[index] = {
                                            id: toolCallDelta.id || '',
                                            function: {
                                                name: toolCallDelta.function?.name || '',
                                                arguments: toolCallDelta.function?.arguments || ''
                                            },
                                            type: toolCallDelta.type || 'function',
                                            index: index
                                        };
                                        //console.log("INIT NEW TC", index, toolCallDelta.function?.name);
                                        if (index > 0) {
                                            // second or more tool call
                                            //console.log("INIT SECOND+ TC", index, toolCallDelta.function?.name);
                                            // update arguments in previous tool calls in progress
                                            const rtcs = accumulatedToolCalls.slice(0, -1);
                                            rtcs.forEach(rtc => {
                                                toolsCallsInProgress[rtc.index].arguments = JSON.parse(rtc.function.arguments)
                                            });
                                        }
                                        // register the new tool call
                                        toolsCallsInProgress[index] = {
                                            id: toolCallDelta.id,
                                            name: toolCallDelta.function?.name,
                                            arguments: {},
                                        };
                                        if (isThinking) {
                                            isThinking = false;
                                            if (events.onEndThinking) {
                                                events.onEndThinking(options?.agentName ?? "")
                                            }
                                        }
                                        if (events.onToolCallInProgress) {
                                            events.onToolCallInProgress(toolsCallsInProgress, options?.agentName ?? "");
                                        }
                                    } else {
                                        // Update existing tool call with new information
                                        if (toolCallDelta.function?.name) {
                                            accumulatedToolCalls[index].function.name = toolCallDelta.function.name;
                                        }
                                        if (toolCallDelta.function?.arguments) {
                                            accumulatedToolCalls[index].function.arguments += toolCallDelta.function.arguments;
                                        }
                                    }
                                }
                            }
                            // Check for finish_reason if the tool call is complete
                            const finishReason = choice.finish_reason;
                            /*if (finishReason) {
                                console.log("FINISH REASON", finishReason);
                            }*/
                            if (finishReason === 'tool_calls') {
                                //console.log("FINISH TC", accumulatedToolCalls);
                                //console.log('\n--- Tool Call Ready ---');
                                for (const toolCall of accumulatedToolCalls) {
                                    //console.log('Tool Name:', toolCall.function.name);
                                    //console.log('Arguments:', toolCall.function.arguments);
                                    if (!(toolCall.function.name in modelRawToolCalls)) {
                                        modelRawToolCalls[toolCall.id] = {
                                            name: toolCall.function.name,
                                            arguments: new Array<string>()
                                        };
                                        if (verbosity?.tools) {
                                            console.log("* Initiating tool call", toolCall.function.name)
                                        }
                                    }
                                    //modelRawToolCalls[currentToolCallName].id = toolCall.id;
                                    modelRawToolCalls[toolCall.id].arguments.push(toolCall.function.arguments);
                                }
                                reader.cancel();
                            }
                            if (delta?.reasoning_content) {
                                if (!isThinking) {
                                    isThinking = true;
                                    if (events.onStartThinking) {
                                        events.onStartThinking(options?.agentName ?? "")
                                    }
                                }
                                thinkingText += delta.reasoning_content;
                                if (events.onThinkingToken) {
                                    events.onThinkingToken(delta.reasoning_content, options?.agentName ?? "");
                                }
                            } else {
                                const t = delta?.content;
                                if (t) {
                                    if (isThinking) {
                                        isThinking = false;
                                        if (events.onEndThinking) {
                                            events.onEndThinking(options?.agentName ?? "")
                                        }
                                    }
                                    if (events.onToken) {
                                        events.onToken(t, options?.agentName ?? "");
                                    }
                                    buf.push(t);

                                }
                            }
                            ++i
                            for (const [k, v] of Object.entries(modelRawToolCalls)) {
                                let args: any;
                                try {
                                    //console.log("TRY", `parsing tool call args:\n${k}: ${v.arguments}`);
                                    //console.log(`TRY MRTC:\n${typeof modelRawToolCalls} ${JSON.stringify(modelRawToolCalls, null, 2)}`);
                                    args = JSON.parse(v.arguments.join(""));
                                } catch (e) {
                                    if (events.onError) {
                                        events.onError(`${e}`, options?.agentName ?? "")
                                    } else {
                                        throw new Error(`parsing tool call args:\n${v.arguments}\nMRTC:\n${typeof modelRawToolCalls} ${JSON.stringify(modelRawToolCalls, null, 2)}`)
                                    }
                                }
                                const toolCall: ToolCallSpec = {
                                    id: k ?? generateId(),
                                    name: v.name,
                                    arguments: args,
                                }
                                toolCalls.push(toolCall)
                            }
                        }
                        ++i
                    } else {
                        reader.cancel();
                        return;
                    }
                }
            });
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                // Enqueue the raw chunk bytes into the parser
                const chunk = new TextDecoder().decode(value);
                parser.feed(chunk);
            }
            //serverStats = completion?.timings ?? {};
            text = buf.join("");
        }
        finalStats = stats.inferenceEnds(i);
        const ir: InferenceResult = {
            text: text,
            thinkingText: thinkingText,
            stats: finalStats,
            serverStats: serverStats,
        };
        if (toolCalls.length > 0) {
            ir.toolCalls = toolCalls;
            if (verbosity?.toolResults) {
                console.log("=> Tools calls:");
                console.dir(toolCalls, { depth: 6 })
            }
        }
        if (events.onEndEmit) {
            events.onEndEmit(ir, options?.agentName ?? "")
        }
        return ir
    }

    /**
   * Aborts a currently running inference task.
   *
   * @returns {Promise<void>}
   */
    async abort(): Promise<void> {
        this.abortController.abort();
    }
}

export {
    Lm
};

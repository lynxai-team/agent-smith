import { useApi } from 'restmix';
import {
    InferenceResult,
    LmProvider,
    LmProviderParams,
    LmProviderType,
    OnLoadProgress,
    BasicOnLoadProgress,
    type ModelInfo,
    type InferenceOptions,
    type PromptProcessingInProgressStats,
    type ToolSpec,
    type PerformanceMetrics,
    type ChatCompletionHistoryTurn,
} from "@agent-smith/types";
import { AssetsPathConfig, Wllama } from '@wllama/wllama/esm/index.js';
import { LmBrowserProviderParams } from './interfaces.js';
import type { ModelSource } from '@wllama/wllama';
//import { CacheManager } from '@wllama/wllama';

class WllamaProvider implements LmProvider {
    name: string;
    api = useApi();
    onToken?: (t: string, from: string) => void;
    onThinkingToken?: (t: string, from: string) => void;
    onStartEmit?: (data: PromptProcessingInProgressStats, from: string) => void;
    onEndEmit?: (result: InferenceResult, from: string) => void;
    onError?: (err: any, from: string) => void;
    abortController = new AbortController();
    tools: Record<string, ToolSpec> = {};
    providerType: LmProviderType = "browser";
    // state
    model: string = "";
    models = new Array<ModelInfo>();
    //abortController = new AbortController();
    apiKey: string;
    serverUrl: string;
    // state
    abortInference = false;
    wllama = new Wllama({
        default: './esm/wasm/wllama.wasm',
    });

    constructor(options: LmProviderParams) {
        //const cm = new CacheManager();
        //cm.clear()
        this.name = options.name;
        this.onToken = options.onToken;
        this.onThinkingToken = options.onThinkingToken;
        this.onStartEmit = options.onStartEmit;
        this.onError = options.onError;
        this.onEndEmit = options.onEndEmit;
        this.apiKey = options.apiKey ?? "";
        this.serverUrl = options.serverUrl;
    }

    static init(options: LmBrowserProviderParams, config: string | AssetsPathConfig = "/esm/"): WllamaProvider {
        let conf: AssetsPathConfig;
        if (typeof config == "string") {
            conf = {
                default: './esm/wasm/wllama.wasm',
            };
        } else {
            conf = config
        }
        const provider = new WllamaProvider({
            serverUrl: "",
            apiKey: "",
            ...options,
        });
        provider.wllama = new Wllama(conf);
        return provider
    }

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

    async modelInfo(): Promise<ModelInfo> {
        console.warn("Not implemented for this provider")
        return { id: "", status: "", ctx: -1, hasVision: false }
    }

    /**
    * Set the available models from the browser cache
    *
    * @returns {Promise<void>}
    */
    async modelsInfo(): Promise<ModelInfo[]> {
        const cachedFiles = (await this.wllama.cacheManager.list()).filter((m) => {
            return m.size === m.metadata.originalSize;
        });
        const cachedURLs = new Set(cachedFiles.map((e) => e.metadata.originalURL));
        const models = new Set<ModelInfo>();
        cachedURLs.forEach((u) => {
            const name = u
                .split('/')
                .pop()
                ?.replace(/-\d{5}-of-\d{5}/, '')
                .replace('.gguf', '') ?? '(unknown)';
            models.add({
                id: name,
                ctx: -1,
                status: "",
                hasVision: false
            })
        })
        this.models = Array.from(models);
        return this.models
    }

    async info(): Promise<Record<string, any>> {
        if (!this.wllama.isModelLoaded()) {
            throw new Error("The model is not loaded");
        }
        return this.wllama.getModelMetadata()
    }

    async loadModel(name: string, ctx?: number, urls?: string | string[], onLoadProgress?: OnLoadProgress) {
        if (!urls) {
            throw new Error("Provide urls to load a browser models")
        }
        const progressCallback: BasicOnLoadProgress = (p) => {
            const progressPercentage = Math.round((p.loaded / p.total) * 100);
            const data = { ...p, percent: progressPercentage };
            if (onLoadProgress) {
                onLoadProgress(data);
            }
        };
        const source = typeof urls == "string" ?
            urls :
            { url: urls[0], mmprojUrl: urls[1] } as ModelSource;
        await this.wllama.loadModelFromUrl(source, {
            progressCallback: progressCallback,
            n_ctx: ctx ?? -1,
            //n_threads: 2,
            //cache_type_v: 'q8_0',
        });
        this.model = name;
        //this.model.ctx = ctx ?? -1;
        //this.model.extra = { urls: urls };
    }


    async infer(prompt: string, options?: InferenceOptions): Promise<InferenceResult> {
        if (!this.wllama.isModelLoaded()) {
            throw new Error("No model loaded")
        }
        let localOptions: Record<string, any> = { ...options };
        this.abortInference = false;
        if (options) {
            if ("stop" in options) {
                let st = new Array<string>();
                for (const t of (localOptions?.stop ?? [])) {
                    st = [...st, ...t]
                }
                localOptions.stop = st;
            }
            if ("extra" in options) {
                localOptions = { ...localOptions, ...(options.extra as Record<string, any>) }
            }
        }
        let i = 1;
        const buf = new Array<string>();
        localOptions.onData = (chunk: Record<string, any>) => {
            //console.log("CHUNK", chunk);
            const token = chunk?.choices[0]?.text ? chunk.choices[0].text : chunk?.choices[0]?.delta?.content;
            const reasoningToken = chunk?.choices[0]?.delta?.reasoning_content;
            if (i == 1) {
                if (this.onStartEmit) {
                    this.onStartEmit({} as PromptProcessingInProgressStats, this.name)
                }
            }
            if (token) {
                if (localOptions?.onToken) {
                    localOptions.onToken(token, this.name);
                } else if (this?.onToken) {
                    this.onToken(token, this.name);
                }
                buf.push(token)
            }
            if (reasoningToken) {
                if (localOptions?.onThinkingToken) {
                    localOptions.onThinkingToken(reasoningToken, this.name);
                } else if (this?.onThinkingToken) {
                    this.onThinkingToken(reasoningToken, this.name);
                }
            }
            if (this.abortInference) {
                localOptions?.abortSignal()
            }
            ++i
        };
        /*const stats = useStats();
        stats.start();*/
        //console.log(_prompt);
        //localOptions.prompt = prompt;
        localOptions.model = this.model;
        localOptions.stream = true;
        //console.log("LM CLIENT OPS", localOptions);
        //console.log("PROMPT:", prompt);
        localOptions.messages = [{ role: "user", content: [{ type: "text", text: prompt }] }];
        if (localOptions?.images) {
            // @ts-ignore
            localOptions.images.forEach(img => {
                localOptions.messages[0].content.push({ type: "image", data: img })
            });
            delete localOptions.images;
        }
        //console.log("RUN OPTS", localOptions);
        try {
            await this.wllama.createChatCompletion(localOptions as any);
        } catch (e) {
            console.error("[Error]:", e);
            //throw new Error(e)
        }
        /*const finalStats = stats.inferenceEnds(i);
        let data: Record<string, any> = {};
        if (parseJson) {
            data = parseJsonUtil(txt, parseJsonFunc);
        }*/
        //const ct = txt.choices[0].message.role == "assistant"
        const res: InferenceResult = {
            text: buf.join(""),
            thinkingText: "",
            stats: {} as PerformanceMetrics,
        };
        if (this.onEndEmit) {
            this.onEndEmit(res, this.name)
        }
        return res
    }

    async applyTemplate(messages: Array<ChatCompletionHistoryTurn>, modelName: string): Promise<{ prompt: string; }> {
        const baseUrl = this.serverUrl.replace("/v1", "");
        const api = useApi({
            serverUrl: baseUrl,
            credentials: "omit",
        });
        api.addHeader('Content-Type', 'application/json')
        if (this.apiKey.length > 0) {
            api.addHeader("Authorization", `Bearer ${this.apiKey}`);
        }
        const res = await api.post<{ prompt: string; }>("/apply-template", {
            messages: messages,
            model: modelName,
        });
        if (!res.ok) {
            const m = `applying template ${res.status} ${res.statusText} ${res.text}`
            if (this.onError) {
                console.warn(m);
                this.onError(m, this.name)
            } else {
                throw new Error(m)
            }
        }
        return res.data
    }

    /**
     * Aborts a currently running inference task.
     *
     * @returns {Promise<void>}
     */
    async abort(): Promise<void> {
        this.abortInference = true;
    }
}

export { WllamaProvider }

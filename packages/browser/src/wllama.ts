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

class WllamaProvider implements LmProvider {
    name: string;
    api = useApi();
    onToken?: (t: string, from: string) => void;
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
        this.name = options.name;
        this.onToken = options.onToken;
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
        });
        this.model = name;
        //this.model.ctx = ctx ?? -1;
        //this.model.extra = { urls: urls };
    }


    async infer(prompt: string, options?: InferenceOptions): Promise<InferenceResult> {
        if (!this.wllama.isModelLoaded()) {
            throw new Error("No model loaded")
        }
        const localOptions: Record<string, any> = {};
        this.abortInference = false;
        let _prompt = prompt;
        let samplingOptions: Record<string, any> = {};
        if (options) {
            if ("max_tokens" in options) {
                localOptions.max_tokens = options.max_tokens;
            }
            if ("stop" in options) {
                let st = new Array<string>();
                for (const t of (localOptions?.stop ?? [])) {
                    st = [...st, ...t]
                }
                localOptions.stop = st;
            }
            if ("temperature" in options) {
                samplingOptions.temp = options.temperature;
            }
            if ("top_k" in options) {
                samplingOptions.top_k = options.top_k;
            }
            if ("top_p" in options) {
                samplingOptions.top_p = options.top_p;
            }
            if ("min_p" in options) {
                samplingOptions.min_p = options.min_p;
            }
            if ("repeat_penalty" in options) {
                samplingOptions.penalty_repeat = options.repeat_penalty;
            }
            if ("grammar" in options) {
                samplingOptions.grammar = options.grammar;
            }
            if ("extra" in options) {
                samplingOptions = { ...samplingOptions, ...(options.extra as Record<string, any>) }
            }
        }
        localOptions.sampling = samplingOptions;
        let i = 1;
        const decoder = new TextDecoder('utf-8');
        // @ts-ignore
        localOptions.onNewToken = (token: string, piece: any, currentText: string, { abortSignal }) => {
            if (i == 1) {
                if (this.onStartEmit) {
                    this.onStartEmit({} as PromptProcessingInProgressStats, this.name)
                }
            }
            if (this.onToken) {
                const t = decoder.decode(piece);
                this.onToken(t, this.name);
            }
            if (this.abortInference) {
                abortSignal()
            }
            ++i
        };
        /*const stats = useStats();
        stats.start();*/
        //console.log(_prompt);
        localOptions.prompt = prompt;
        const txt = await this.wllama.createChatCompletion(localOptions as any);
        /*const finalStats = stats.inferenceEnds(i);
        let data: Record<string, any> = {};
        if (parseJson) {
            data = parseJsonUtil(txt, parseJsonFunc);
        }*/
        //const ct = txt.choices[0].message.role == "assistant"
        const res: InferenceResult = {
            text: txt.choices[0].message.content ?? "",
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

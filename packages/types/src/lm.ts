import type { useApi } from "restmix";
import type { InferenceOptions, InferenceParams } from "./inference.js";
import type { InferenceResult } from "./inference.js";
import type { ModelInfo } from "./model.js";
import type { InferenceCallbacks } from "./callbacks.js";
import type { ToolSpec } from "./tools.js";
import type { ChatCompletionContentPart, ChatCompletionMessageToolCall, ChatCompletionRole } from "openai/resources/index.js";
import type { ChatCompletionHistoryTurn } from "./history.js";

/**
 * Represents the basic progress of a load operation.
 *
 * @interface OnLoadProgressBasic
 * @param {number} total - The total number of items to load.
 * @param {number} loaded - The number of items that have been loaded so far.
 * @example
 * const onLoadProgress: OnLoadProgressBasic = {
 *   total: 100,
 *   loaded: 50
 * };
 */
interface OnLoadProgressBasic {
    total: number;
    loaded: number;
}

/**
 * Represents the full progress of a load operation, including percentage.
 *
 * @interface OnLoadProgressFull
 * @augments OnLoadProgressBasic
 * @param {number} percent - The percentage of items that have been loaded so far.
 * @example
 * const onLoadProgress: OnLoadProgressFull = {
 *   total: 100,
 *   loaded: 50,
 *   percent: 50
 * };
 */
interface OnLoadProgressFull extends OnLoadProgressBasic {
    percent: number;
}

/**
 * Type definition for a progress callback function with full details.
 *
 * @typedef OnLoadProgress
 * @type {(data: OnLoadProgressFull) => void}
 * @example
 * const onLoadProgress: OnLoadProgress = (data) => {
 *   console.log(`Loaded ${data.loaded} of ${data.total} (${data.percent}%)`);
 * };
 */
type OnLoadProgress = (data: OnLoadProgressFull) => void;

/**
 * Type definition for a basic progress callback function.
 *
 * @typedef BasicOnLoadProgress
 * @type {(data: OnLoadProgressBasic) => void}
 * @example
 * const onLoadProgress: BasicOnLoadProgress = (data) => {
 *   console.log(`Loaded ${data.loaded} of ${data.total}`);
 * };
 */
type BasicOnLoadProgress = (data: OnLoadProgressBasic) => void;

/**
 * Default parameters that can be used with an LM provider.
 *
 * @interface LmDefaults
 * @param {string | undefined} model - Default model conf to use.
 * @param {InferenceParams | undefined} inferenceParams - Default inference parameters.
 * @example
 * const lmDefaults: LmDefaults = {
 *   model: { name: 'gpt-3', ctx: 2048 },
 *   inferenceParams: { max_tokens: 150, top_k: 50 }
 * };
 */
interface LmDefaults {
    model?: string;
    inferenceParams?: InferenceParams;
}

/**
 * Parameters required when creating a new LM provider instance.
 *
 * @interface LmProviderParams
 * @param {string} name - Identifier for the LM provider.
 * @param {string} serverUrl - The URL endpoint for the provider's server.
 * @param {string | undefined} apiKey - The key used for authentication.
 * @param {(t: string) => void} onToken - Callback when a new token is received.
 * @param {(t: string) => void} onThinkingToken - Callback when a new thinking token is received.
 * @param {(data: IngestionStats) => void} onStartEmit - Callback triggered when inference starts.
 * @param {(result: InferenceResult) => void} onEndEmit - Callback triggered when inference ends.
 * @param {(err: string) => void} onError - Callback triggered on errors.
 * @param {LmDefaults | undefined} defaults - Default settings.
 * @example
 * const lmProviderParams: LmProviderParams = {
 *   name: 'koboldcpp',
 *   serverUrl: 'http://example.com/api',
 *   apiKey: 'your-api-key',
 *   onToken: (t) => console.log(t),
 *   onStartEmit: (data) => console.log(data),
 *   onEndEmit: (result) => console.log(result),
 *   onError: (err) => console.error(err)
 * };
 */
interface LmProviderParams extends InferenceCallbacks {
    name: string;
    serverUrl: string;
    apiKey?: string;
    defaults?: LmDefaults;
}

/**
 * Defines the structure and behavior of an LM Provider.
 *
 * @interface LmProvider
 * @param {string} name - Identifier for the LM provider.
 * @param {ReturnType<typeof useApi>} api - API utility being used.
 * @param {string} serverUrl - The URL endpoint for the provider's server.
 * @param {string} apiKey - The key used for authentication with the provider's API.
 * @param {string} model - Active model configuration.
 * @param {Array<string>} models - List of available model configurations.
 * @param {() => Promise<ModelInfo>} info - Retrieves information about available server config.
 * @param {() => Promise<Array<ModelInfo>>} modelsInfo - Retrieves information about available models.
 * @param {(name: string, ctx?: number, urls?: string | string[], onLoadProgress?: OnLoadProgress) => Promise<void>} loadModel - Loads a model by name, with optional context.
 * @param {(name: string) => Promise<void>} unloadModel - Unload a model 
 * @param {(prompt: string, params: InferenceParams, options?: InferenceOptions) => Promise<InferenceResult>} infer - Makes an inference based on provided prompt and parameters.
 * @param {() => Promise<void>} abort - Aborts a currently running inference task.
 * @param {(t: string) => void} onToken - Callback when a new token is received
 * @param {(t: string) => void} onThinkingToken - Callback when a new thinking token is received
 * @param {(data: IngestionStats) => void} onStartEmit - Callback triggered when inference starts.
 * @param {(result: InferenceResult) => void} onEndEmit - Callback triggered when inference ends.
 * @param {(err: string) => void} onError - Callback triggered on errors during inference.
 * @example
 * const lmProvider: LmProvider = {
 *   name: 'koboldcpp',
 *   api: useApi(),
 *   serverUrl: 'http://example.com/api',
 *   apiKey: 'your-api-key',
 *   model: { name: 'gpt-3', ctx: 2048 },
 *   models: [{ name: 'gpt-3', ctx: 2048 }],
 *   info: async () => ({ config: 'some-config' }),
 *   modelsInfo: async () => {},
 *   loadModel: async (name, ctx, urls, onLoadProgress) => {},
 *   infer: async (prompt, params, options) => ({ text: 'result', stats: {}, serverStats: {} }),
 *   abort: async () => {},
 *   onToken: (t) => console.log(t),
 *   onStartEmit: (data) => console.log(data),
 *   onEndEmit: (result) => console.log(result),
 *   onError: (err) => console.error(err)
 * };
 */
interface LmProvider extends InferenceCallbacks {
    name: string;
    api: ReturnType<typeof useApi>;
    serverUrl: string;
    apiKey: string;
    model: string;
    models: Array<ModelInfo>;
    abortController: AbortController;
    tools: Record<string, ToolSpec>;
    modelInfo: () => Promise<ModelInfo>;
    modelsInfo: () => Promise<Array<ModelInfo>>;
    loadModel: (name: string, ctx?: number, urls?: string | string[], onLoadProgress?: OnLoadProgress) => Promise<void>;
    unloadModel: (name: string) => Promise<void>;
    tokenize(text: string): Promise<Array<number>>;
    detokenize(tokens: Array<number>): Promise<string>;
    applyTemplate(messages: Array<ChatCompletionHistoryTurn>, modelName: string): Promise<{ prompt: string }>;
    infer: (prompt: string, options?: InferenceOptions) => Promise<InferenceResult>;
    abort: () => Promise<void>;
    defaults?: LmDefaults;
}

/**
 * Represents the type of LM provider.
 *
 * @typedef LmProviderType
 * @type {"openai" | "browser"}
 * @example
 * const providerType: LmProviderType = 'browser';
 */
type LmProviderType = "llamacpp" | "openai" | "browser";


export {
    OnLoadProgress,
    OnLoadProgressBasic,
    OnLoadProgressFull,
    BasicOnLoadProgress,
    LmProvider,
    LmProviderType,
    LmProviderParams,
    LmDefaults,
}

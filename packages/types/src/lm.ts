/**
 * Defines types and interfaces for Language Model (LM) providers, including
 * provider configuration, model loading progress, and inference capabilities.
 * Imports: Utilizes types from `inference.js`, `model.js`, `callbacks.js`, `tools.js`, `history.js`.
 * @example
 * // Example of creating LM provider parameters
 * import type { LmProviderParams, LmDefaults } from './lm';
 *
 * const defaults: LmDefaults = {
 *   model: 'llama-3-8b',
 *   inferenceParams: { max_tokens: 200, temperature: 0.7 }
 * };
 *
 * const providerParams: LmProviderParams = {
 *   name: 'koboldcpp',
 *   serverUrl: 'http://localhost:5001/api',
 *   apiKey: 'your-api-key',
 *   defaults,
 *   onToken: (t) => process.stdout.write(t),
 *   onError: (err) => console.error(err)
 * };
 */

import type { useApi } from "restmix";
import type { InferenceOptions, InferenceParams } from "./inference.js";
import type { InferenceResult } from "./inference.js";
import type { ModelInfo } from "./model.js";
import type { InferenceCallbacks } from "./callbacks.js";
import type { ToolSpec } from "./tools.js";
import type { ChatCompletionHistoryTurn } from "./history.js";

/**
 * Represents the basic progress of a load operation.
 *
 * @interface OnLoadProgressBasic
 * @property {number} total - The total number of items to load.
 * @property {number} loaded - The number of items that have been loaded so far.
 * @example
 * const progress: OnLoadProgressBasic = {
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
 * Extends {@link OnLoadProgressBasic} with a percentage field.
 *
 * @interface OnLoadProgressFull
 * @property {number} percent - The percentage of items that have been loaded so far.
 * @example
 * const progress: OnLoadProgressFull = {
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
 * Called during model loading to report progress updates.
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
 * Called during model loading to report progress updates without percentage.
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
 * Specifies the default model and inference parameters for the provider.
 *
 * @interface LmDefaults
 * @property {string | undefined} [model] - Default model name to use.
 * @property {InferenceParams | undefined} [inferenceParams] - Default inference parameters.
 * @example
 * const lmDefaults: LmDefaults = {
 *   model: 'llama-3-8b',
 *   inferenceParams: { max_tokens: 150, temperature: 0.7 }
 * };
 */
interface LmDefaults {
    model?: string;
    inferenceParams?: InferenceParams;
}

/**
 * Parameters required when creating a new LM provider instance.
 * Extends {@link InferenceCallbacks} with provider-specific configuration.
 *
 * @interface LmProviderParams
 * @property {string} name - Identifier for the LM provider.
 * @property {string} serverUrl - The URL endpoint for the provider's server.
 * @property {string | undefined} [apiKey] - The key used for authentication.
 * @property {LmDefaults | undefined} [defaults] - Default settings for the provider.
 * @example
 * const lmProviderParams: LmProviderParams = {
 *   name: 'koboldcpp',
 *   serverUrl: 'http://example.com/api',
 *   apiKey: 'your-api-key',
 *   defaults: {
 *     model: 'llama-3-8b',
 *     inferenceParams: { max_tokens: 200 }
 *   },
 *   onToken: (t) => console.log(t),
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
 * Provides methods for model management, inference, tokenization, and chat templating.
 * Extends {@link InferenceCallbacks} with provider capabilities.
 *
 * @interface LmProvider
 * @property {string} name - Identifier for the LM provider.
 * @property {ReturnType<typeof useApi>} api - API utility being used.
 * @property {string} serverUrl - The URL endpoint for the provider's server.
 * @property {string} apiKey - The key used for authentication with the provider's API.
 * @property {string} model - Active model name.
 * @property {Array<ModelInfo>} models - List of available model configurations.
 * @property {AbortController} abortController - Controller for aborting ongoing operations.
 * @property {Record<string, ToolSpec>} tools - Available tools for the provider.
 * @property {() => Promise<ModelInfo>} info - Retrieves information about the server configuration.
 * @property {() => Promise<Array<ModelInfo>>} modelsInfo - Retrieves information about available models.
 * @property {(name: string, ctx?: number, urls?: string | string[], onLoadProgress?: OnLoadProgress) => Promise<void>} loadModel - Loads a model by name, with optional context window and URLs.
 * @property {(name: string) => Promise<void>} unloadModel - Unloads a model by name.
 * @property {(text: string) => Promise<Array<number>>} tokenize - Tokenizes text into an array of token IDs.
 * @property {(tokens: Array<number>) => Promise<string>} detokenize - Converts an array of token IDs back to text.
 * @property {(messages: Array<ChatCompletionHistoryTurn>, modelName: string) => Promise<{ prompt: string }>} applyTemplate - Applies a chat template to messages for the given model.
 * @property {(prompt: string, options?: InferenceOptions) => Promise<InferenceResult>} infer - Makes an inference based on provided prompt and options.
 * @property {() => Promise<void>} abort - Aborts a currently running inference task.
 * @property {LmDefaults | undefined} [defaults] - Default settings for the provider.
 * @example
 * const lmProvider: LmProvider = {
 *   name: 'koboldcpp',
 *   api: useApi(),
 *   serverUrl: 'http://example.com/api',
 *   apiKey: 'your-api-key',
 *   model: 'llama-3-8b',
 *   models: [
 *     { id: 'llama-3-8b', status: 'loaded', ctx: 4096, hasVision: false }
 *   ],
 *   abortController: new AbortController(),
 *   tools: {},
 *   info: async () => ({ config: 'some-config' }),
 *   modelsInfo: async () => [{ id: 'llama-3-8b', status: 'loaded', ctx: 4096, hasVision: false }],
 *   loadModel: async (name, ctx, urls, onLoadProgress) => {},
 *   unloadModel: async (name) => {},
 *   tokenize: async (text) => [1, 2, 3],
 *   detokenize: async (tokens) => 'hello world',
 *   applyTemplate: async (messages, modelName) => ({ prompt: 'prompt text' }),
 *   infer: async (prompt, options) => ({
 *     text: 'result',
 *     thinkingText: '',
 *     stats: {},
 *     toolCalls: []
 *   }),
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
 * Defines the supported provider backends for language model inference.
 *
 * @typedef LmProviderType
 * @type {"llamacpp" | "openai" | "browser"}
 * @example
 * const providerType: LmProviderType = 'llamacpp';
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

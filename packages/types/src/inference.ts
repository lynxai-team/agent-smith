/**
 * Defines types and interfaces for AI inference requests, options, results, and sampling presets.
 * Imports: Utilizes types from `callbacks.js`, `history.js`, `stats.js`, `tools.js`, and `verbosity.js`.
 * @example
 * // Example of creating inference parameters
 * import type { InferenceParams, InferenceOptions } from './inference';
 *
 * const params: InferenceParams = {
 *   stream: true,
 *   max_tokens: 150,
 *   temperature: 0.7,
 *   top_p: 0.9
 * };
 *
 * // Example of creating inference options with a model and history
 * const options: InferenceOptions = {
 *   model: 'llama-3',
 *   history: [{ user: "Hello", assistant: "Hi there!" }],
 *   system: "You are a helpful assistant.",
 *   params
 * };
 */

import type { AllCallbacks, InferenceCallbacks } from "./callbacks.js";
import type { HistoryTurn } from "./history.js";
import type { PerformanceMetrics } from "./stats.js";
import type { ToolCallSpec, ToolSpec } from "./tools.js";
import type { VerbosityOptions } from "./verbosity.js";

/**
 * Describes the parameters for making an inference request.
 *
 * @interface InferenceParams
 * @property {boolean | undefined} [stream] - Indicates if results should be streamed progressively.
 * @property {number | undefined} [max_tokens] - The maximum number of tokens to generate.
 * @property {number | undefined} [top_k] - Limits the result set to the top K results.
 * @property {number | undefined} [top_p] - Filters results based on cumulative probability (nucleus sampling).
 * @property {number | undefined} [min_p] - The minimum probability for a token to be considered, relative to the probability of the most likely token.
 * @property {number | undefined} [temperature] - Adjusts randomness in sampling; higher values mean more randomness.
 * @property {number | undefined} [repeat_penalty] - Adjusts penalty for repeated tokens.
 * @property {number | undefined} [presence_penalty] - Adjusts penalty for token presence.
 * @property {number | undefined} [frequency_penalty] - Adjusts penalty for token frequency.
 * @property {Array<Array<number | false>> | undefined} [logit_bias] - Modifies the likelihood of specified tokens appearing in the output.
 * @property {number | undefined} [seed] - Random seed for reproducible sampling.
 * @property {number | undefined} [tfs] - Set the tail free sampling value.
 * @property {Array<string> | undefined} [stop] - List of stop words or phrases to halt predictions.
 * @property {string | undefined} [grammar] - The gnbf grammar to use for grammar-based sampling.
 * @property {string | undefined} [tsGrammar] - A TypeScript interface to be converted to a gnbf grammar to use for grammar-based sampling.
 * @property {Array<string> | undefined} [images] - Base64 encoded image data (for multimodal models).
 * @property {Record<string, any> | undefined} [schema] - A JSON schema to format the output.
 * @property {Record<string, any> | undefined} [chat_template_kwargs] - Additional keyword arguments for the chat template.
 * @property {Record<string, any> | undefined} [extra] - Extra parameters to include in the payload.
 * @example
 * const inferenceParams: InferenceParams = {
 *   stream: true,
 *   max_tokens: 150,
 *   top_k: 50,
 *   top_p: 0.9,
 *   min_p: 0.01,
 *   temperature: 0.7,
 *   repeat_penalty: 1.2,
 *   presence_penalty: 0.5,
 *   frequency_penalty: 0.3,
 *   logit_bias: [[0, 0.5], [1, -0.5]],
 *   seed: 42,
 *   tfs: 0.8,
 *   stop: ['###', 'Human:'],
 *   grammar: 'default_grammar',
 *   tsGrammar: 'MyOutputSchema',
 *   images: ['data:image/png;base64,...'],
 *   schema: { type: 'object', properties: { name: { type: 'string' } } },
 *   chat_template_kwargs: { add_generation_prompt: true },
 *   extra: { custom_param: 'value' }
 * };
 */
interface InferenceParams {
    stream?: boolean;
    max_tokens?: number;
    top_k?: number;
    top_p?: number;
    min_p?: number;
    temperature?: number;
    repeat_penalty?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    logit_bias?: Array<Array<number | false>>;
    seed?: number;
    tfs?: number;
    stop?: Array<string>;
    grammar?: string;
    tsGrammar?: string;
    schema?: Record<string, any>;
    images?: Array<string>;
    chat_template_kwargs?: Record<string, any>;
    extra?: Record<string, any>;
}

/**
 * Options for configuring inference requests.
 *
 * @interface InferenceOptions
 * @property {boolean | undefined} [debug] - Enable debug mode for detailed logging.
 * @property {boolean | undefined} [verbose] - Enable verbose output.
 * @property {string | undefined} [model] - The model name for inference.
 * @property {string | undefined} [backend] - The backend to use for inference (e.g., 'llama.cpp', 'vllm').
 * @property {Array<ToolSpec> | undefined} [tools] - Array of available tools for the conversation.
 * @property {Array<HistoryTurn> | undefined} [history] - Conversation history to include in the inference.
 * @property {string | undefined} [system] - System message to set the context for the conversation.
 * @property {string | undefined} [assistant] - Assistant message to include in the context.
 * @property {boolean | undefined} [isToolsRouter] - Use this call as a tools router, not an agent.
 * @property {boolean | undefined} [isToolCall] - Indicates if this is a tool call rather than a regular inference.
 * @property {boolean | undefined} [propagateModel] - Whether to propagate the model to child calls.
 * @property {boolean | undefined} [propagateInferParams] - Whether to propagate inference parameters to child calls.
 * @property {InferenceParams | undefined} [params] - Inference parameters for the request.
 * @property {Record<string, any> | undefined} [variables] - Variables to be used in templates.
 * @property {VerbosityOptions | undefined} [verbosity] - Verbosity level for output.
 * @example
 * const inferenceOptions: InferenceOptions = {
 *   debug: true,
 *   verbose: true,
 *   model: 'llama-3-70b',
 *   backend: 'vllm',
 *   tools: [weatherTool, searchTool],
 *   history: [
 *     { user: "Hello", assistant: "Hi there!" },
 *     { user: "What's the weather?", assistant: "Let me check..." }
 *   ],
 *   system: "You are a helpful assistant.",
 *   assistant: "How can I help you today?",
 *   isToolsRouter: false,
 *   isToolCall: false,
 *   propagateModel: true,
 *   propagateInferParams: true,
 *   params: {
 *     stream: true,
 *     max_tokens: 200,
 *     temperature: 0.7
 *   },
 *   variables: { name: 'World' },
 *   verbosity: { tokens: true, timing: false }
 * };
 */
interface InferenceOptions {
    debug?: boolean;
    verbose?: boolean;
    model?: string;
    backend?: string;
    tools?: Array<ToolSpec>;
    history?: Array<HistoryTurn>;
    system?: string;
    assistant?: string;
    isToolsRouter?: boolean;
    isToolCall?: boolean;
    propagateModel?: boolean;
    propagateInferParams?: boolean;
    variables?: Record<string, any>;
    params?: InferenceParams;
    verbosity?: VerbosityOptions;
}

/**
 * Client-specific inference options extending base options with callbacks.
 * Used for client-side inference requests.
 *
 * @interface ClientInferenceOptions
 * @extends InferenceOptions
 * @extends InferenceCallbacks
 * @property {string | undefined} [agentName] - The name of the agent making the request.
 * @property {boolean | undefined} [return_progress] - Use prompt processing stats 
 * @example
 * const clientOptions: ClientInferenceOptions = {
 *   model: 'llama-3',
 *   agentName: 'my-client-agent',
 *   params: { max_tokens: 100, temperature: 0.5 },
 *   onToken: (token, from) => console.log(`Token from ${from}: ${token}`),
 *   onError: (err, from) => console.error(`Error from ${from}:`, err)
 * };
 */
interface ClientInferenceOptions extends InferenceOptions, InferenceCallbacks {
    agentName?: string;
    return_progress?: boolean;
}

/**
 * Agent-specific inference options extending base options with all callbacks.
 * Used for full agent inference with tool support and confirmation flows.
 *
 * @interface AgentInferenceOptions
 * @extends InferenceOptions
 * @extends AllCallbacks
 * @property {string | undefined} [baseDir] - The base directory for the agent.
 * @property {string | undefined} [caller] - The caller identifier.
 * @property {boolean | undefined} [isChatMode] - Whether the agent is in chat mode.
 * @property {boolean | undefined} [showTokens] - Whether to show token details in output.
 * @property {boolean | undefined} [nocli] - Disable CLI interaction.
 * @property {string | undefined} [backend] - The backend to use for inference.
 * @property {Record<string, any> | undefined} [variables] - Variables for template rendering.
 * @property {Array<string> | undefined} [mcpArgs] - MCP (Model Context Protocol) arguments.
 * @property {((tool: ToolCallSpec) => Promise<boolean>) | undefined} [onConfirmToolUsage] - Callback to confirm tool usage.
 * @property {AbortController | undefined} [abort] - Controller to abort the inference request.
 * @example
 * const agentOptions: AgentInferenceOptions = {
 *   model: 'llama-3',
 *   baseDir: '/path/to/agent',
 *   isChatMode: true,
 *   showTokens: false,
 *   nocli: false,
 *   variables: { context: 'sales' },
 *   mcpArgs: ['--config', 'default'],
 *   onConfirmToolUsage: async (tool) => {
 *     console.log(`Confirm tool: ${tool.name}`);
 *     return true;
 *   },
 *   abort: new AbortController(),
 *   onToken: (token, from) => process.stdout.write(token),
 *   onToolCall: (tc, type, from) => console.log(`Tool call: ${tc.name}`)
 * };
 */
interface AgentInferenceOptions extends InferenceOptions, AllCallbacks {
    baseDir?: string;
    caller?: string;
    isChatMode?: boolean;
    showTokens?: boolean;
    nocli?: boolean;
    backend?: string;
    variables?: Record<string, any>;
    mcpArgs?: Array<string>;
    onConfirmToolUsage?: (tool: ToolCallSpec) => Promise<boolean>;
    abort?: AbortController;
}

/**
 * Represents the result returned after an inference request.
 *
 * @interface InferenceResult
 * @property {string} text - The textual representation of the generated inference.
 * @property {string} thinkingText - The reasoning/thinking text generated before the final response.
 * @property {PerformanceMetrics} stats - Performance metrics and metadata related to the inference.
 * @property {Array<ToolCallSpec> | undefined} [toolCalls] - Tool calls made during inference.
 * @example
 * const inferenceResult: InferenceResult = {
 *   text: 'The quick brown fox jumps over the lazy dog.',
 *   thinkingText: 'I need to complete this sentence...',
 *   stats: {
 *     cache_n: 100,
 *     prompt_n: 50,
 *     prompt_ms: 120,
 *     prompt_per_token_ms: 2.4,
 *     prompt_per_second: 416,
 *     predicted_n: 150,
 *     predicted_ms: 300,
 *     predicted_per_token_ms: 2.0,
 *     predicted_per_second: 500,
 *     draft_n: 80,
 *     draft_n_accepted: 60
 *   },
 *   toolCalls: [
 *     { id: '1', name: 'getWeather', arguments: { location: 'New York' } }
 *   ]
 * };
 */
interface InferenceResult {
    text: string;
    thinkingText: string;
    stats: PerformanceMetrics;
    toolCalls?: Array<ToolCallSpec>;
}

/**
 * Defines a preset configuration for sampling parameters.
 * Presets can be applied to standardize inference behavior across calls.
 *
 * @interface SamplingPreset
 * @property {string} name - The name of the sampling preset.
 * @property {string | undefined} [model] - Optional model filter for this preset.
 * @property {number | undefined} [max_tokens] - Maximum tokens for this preset.
 * @property {number | undefined} [top_k] - Top-K value for this preset.
 * @property {number | undefined} [top_p] - Top-P (nucleus) value for this preset.
 * @property {number | undefined} [min_p] - Minimum probability threshold for this preset.
 * @property {number | undefined} [temperature] - Temperature setting for this preset.
 * @property {number | undefined} [repeat_penalty] - Repeat penalty for this preset.
 * @property {number | undefined} [presence_penalty] - Presence penalty for this preset.
 * @property {number | undefined} [frequency_penalty] - Frequency penalty for this preset.
 * @property {string | undefined} [backend] - Backend filter for this preset.
 * @property {Record<string, any> | undefined} [chat_template_kwargs] - Chat template kwargs for this preset.
 * @property {Record<string, any> | undefined} [props] - Additional properties for this preset.
 * @example
 * const samplingPreset: SamplingPreset = {
 *   name: 'creative-writing',
 *   model: 'llama-3-70b',
 *   max_tokens: 500,
 *   top_k: 50,
 *   top_p: 0.95,
 *   min_p: 0.01,
 *   temperature: 1.2,
 *   repeat_penalty: 1.1,
 *   presence_penalty: 0.6,
 *   frequency_penalty: 0.4,
 *   backend: 'vllm',
 *   chat_template_kwargs: { add_generation_prompt: true },
 *   props: { style: 'creative', tone: 'formal' }
 * };
 */
interface SamplingPreset {
    name: string;
    model?: string;
    max_tokens?: number;
    top_k?: number;
    top_p?: number;
    min_p?: number;
    temperature?: number;
    repeat_penalty?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    backend?: string;
    chat_template_kwargs?: Record<string, any>;
    props?: Record<string, any>;
}



export {
    AgentInferenceOptions,
    ClientInferenceOptions,
    InferenceOptions,
    InferenceParams,
    InferenceResult,
    SamplingPreset,
};

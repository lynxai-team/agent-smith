import type { AllCallbacks, InferenceCallbacks } from "./callbacks.js";
import type { HistoryTurn } from "./history.js";
import type { InferenceStats } from "./stats.js";
import type { ToolCallSpec, ToolSpec } from "./tools.js";
import type { VerbosityOptions } from "./verbosity.js";

/**
 * Describes the parameters for making an inference request.
 *
 * @interface InferenceParams
 * @param {boolean | undefined} stream - Indicates if results should be streamed progressively.
 * @param {number | undefined} max_tokens - The number of predictions to return.
 * @param {number | undefined} top_k - Limits the result set to the top K results.
 * @param {number | undefined} top_p - Filters results based on cumulative probability.
 * @param {number | undefined} min_p - The minimum probability for a token to be considered, relative to the probability of the most likely token.
 * @param {number | undefined} temperature - Adjusts randomness in sampling; higher values mean more randomness.
 * @param {number | undefined} repeat_penalty - Adjusts penalty for repeated tokens.
 * @param {number | undefined} presence_penalty - Adjusts penalty for presence.
 * @param {number | undefined} frequency_penalty - Repeat alpha frequency penalty.
 * @param {number | undefined} tfs - Set the tail free sampling value.
 * @param {Array<string> | undefined} stop - List of stop words or phrases to halt predictions.
 * @param {string | undefined} grammar - The gnbf grammar to use for grammar-based sampling.
 * @param {string | undefined} tsGrammar - A Typescript interface to be converted to a gnbf grammar to use for grammar-based sampling.
 * @param {Array<string>} images - The base64 images data (for multimodal models).
 * @param {string | undefined} schema - A json schema to format the output.
 * @param {Record<string, any> | undefined} extra - Extra parameters to include in the payload
 * @example
 * const inferenceParams: InferenceParams = {
 *   stream: true,
 *   template: 'default',
 *   max_tokens: 150,
 *   top_k: 50,
 *   top_p: 0.9,
 *   min_p: 0.01,
 *   temperature: 0.7,
 *   repeat_penalty: 1.2,
 *   tfs: 0.8,
 *   stop: ['###'],
 *   grammar: 'default_grammar',
 *   images: ['data:image/png;base64,...']
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
    extra?: Record<string, any>;
}

/**
 * Options for inference requests.
 *
 * @interface InferenceOptions
 * @param {boolean | undefined} debug - Enable debug mode for detailed logging.
 * @param {boolean | undefined} verbose - Enable verbose output.
 * @param {string | undefined} model - The model name for inference.
 * @param {Array<ToolSpec> | undefined} tools - Array of available tools for the conversation.
 * @param {Array<HistoryTurn> | undefined} history - Conversation history to include in the inference.
 * @param {string | undefined} system - System message to set the context for the conversation.
 * @param {string | undefined} assistant - Assistant message to include in the context.
 * @param {boolean | undefined} isToolsRouter - Use this call as a tools router not an agent
 * @param {InferenceParams | undefined} params - Inference parameters 
 * @example
 * const inferenceOptions: InferenceOptions = {
 *   debug: true,
 *   verbose: true,
 *   tools: [weatherTool],
 *   history: [
 *     { user: "Hello", assistant: "Hi there!" }
 *   ],
 *   system: "You are a helpful assistant.",
 *   assistant: "How can I help you today?",
 * };
 */
interface InferenceOptions {
    debug?: boolean;
    verbose?: boolean;
    model?: string;
    tools?: Array<ToolSpec>;
    history?: Array<HistoryTurn>;
    system?: string;
    assistant?: string;
    isToolsRouter?: boolean;
    params?: InferenceParams;
    verbosity?: VerbosityOptions;
}

interface ClientInferenceOptions extends InferenceOptions, InferenceCallbacks {
    agentName?: string;
}

interface AgentInferenceOptions extends InferenceOptions, AllCallbacks {
    baseDir?: string;
    isAgent?: boolean;
    isToolCall?: boolean;
    isChatMode?: boolean;
    showTokens?: boolean;
    nocli?: boolean;
    backend?: string;
    mcpArgs?: Array<string>;
    confirmToolUsage?: (tool: ToolCallSpec) => Promise<boolean>;
    abort?: AbortController;
}

/**
 * Represents the result returned after an inference request.
 *
 * @interface InferenceResult
 * @param {string} text - The textual representation of the generated inference.
 * @param {InferenceStats} stats - Additional statistics or metadata related to the inference.
 * @param {Record<string, any>} serverStats - Additional server-related statistics.
 * @param {Array<ToolCallSpec> | undefined} toolCalls - Tool calls made during inference.
 * @example
 * const inferenceResult: InferenceResult = {
 *   text: 'The quick brown fox jumps over the lazy dog.',
 *   stats: {
 *     ingestionTime: 150,
 *     inferenceTime: 300,
 *     totalTime: 450,
 *     ingestionTimeSeconds: 0.15,
 *     inferenceTimeSeconds: 0.3,
 *     totalTimeSeconds: 0.45,
 *     totalTokens: 200,
 *     tokensPerSecond: 444
 *   },
 *   serverStats: { someServerKey: 'someServerValue' },
 *   toolCalls: [{ id: '1', name: 'getWeather', arguments: { location: 'New York' } }]
 * };
 */
interface InferenceResult {
    text: string;
    thinkingText: string;
    stats: InferenceStats;
    serverStats: Record<string, any>;
    toolCalls?: Array<ToolCallSpec>;
}

export {
    AgentInferenceOptions, ClientInferenceOptions, InferenceOptions, InferenceParams, InferenceResult
};


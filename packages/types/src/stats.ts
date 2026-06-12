/**
 * @file Defines TypeScript interfaces for inference performance statistics,
 * prompt processing metrics, and related statistical data.
 * Imports: None (standalone type definitions).
 * @example
 * import { InferenceStats, PerformanceMetrics } from './stats';
 *
 * const stats: InferenceStats = {
 *   nTotalTokens: 1024,
 *   nEmittedTokens: 512,
 *   nPrefillProcessedTokens: 512,
 *   nPrefillCacheTokens: 256,
 *   nPrefillTotalTokens: 768,
 *   percentCache: 33.33,
 *   percentDraft: 50.0,
 *   nDraftTokens: 256,
 *   nDraftTokensAccepted: 128,
 *   percentDraftAccepted: 50.0,
 *   emittedTokensPerSecond: 100.5,
 *   prefillTokensPerSecond: 85.2,
 *   prefilDuration: 6000,
 *   emitDuration: 5090,
 *   totalDuration: 11090
 * };
 */

/**
 * Represents the statistics of an inference run, including token counts,
 * caching metrics, and performance measurements.
 *
 * @interface InferenceStats
 * @property {number} nTotalTokens - The total number of tokens processed in the inference.
 * @property {number} nEmittedTokens - The number of tokens emitted (generated) by the model.
 * @property {number} nPrefillProcessedTokens - The number of prefill tokens that were processed.
 * @property {number} nPrefillCacheTokens - The number of prefill tokens retrieved from cache.
 * @property {number} nPrefillTotalTokens - The total number of prefill tokens (processed + cached).
 * @property {number} percentCache - The percentage of tokens served from cache (0-100).
 * @property {number} percentDraft - The percentage of draft tokens used in speculative decoding.
 * @property {number} nDraftTokens - The total number of draft tokens generated.
 * @property {number} nDraftTokensAccepted - The number of draft tokens that were accepted.
 * @property {number} percentDraftAccepted - The acceptance rate of draft tokens (0-100).
 * @property {number} emittedTokensPerSecond - The speed of token emission in tokens per second.
 * @property {number} prefillTokensPerSecond - The speed of prefill processing in tokens per second.
 * @property {number} prefilDuration - The total duration of the prefill phase in milliseconds.
 * @property {number} emitDuration - The total duration of the token emission phase in milliseconds.
 * @property {number} totalDuration - The total end-to-end inference duration in milliseconds.
 * @example
 * const stats: InferenceStats = {
 *   nTotalTokens: 1024,
 *   nEmittedTokens: 512,
 *   nPrefillProcessedTokens: 512,
 *   nPrefillCacheTokens: 256,
 *   nPrefillTotalTokens: 768,
 *   percentCache: 33.33,
 *   percentDraft: 50.0,
 *   nDraftTokens: 256,
 *   nDraftTokensAccepted: 128,
 *   percentDraftAccepted: 50.0,
 *   emittedTokensPerSecond: 100.5,
 *   prefillTokensPerSecond: 85.2,
 *   prefilDuration: 6000,
 *   emitDuration: 5090,
 *   totalDuration: 11090
 * };
 */
interface InferenceStats {
    nTotalTokens: number;
    nEmittedTokens: number;
    nPrefillProcessedTokens: number;
    nPrefillCacheTokens: number;
    nPrefillTotalTokens: number;
    percentCache: number;
    percentDraft: number;
    nDraftTokens: number;
    nDraftTokensAccepted: number;
    percentDraftAccepted: number;
    emittedTokensPerSecond: number;
    prefillTokensPerSecond: number;
    prefilDuration: number;
    emitDuration: number;
    totalDuration: number;
}

/**
 * Represents performance metrics for prompt processing and prediction phases.
 *
 * @interface PerformanceMetrics
 * @property {number} cache_n - The number of tokens served from the KV cache.
 * @property {number} prompt_n - The total number of prompt tokens.
 * @property {number} prompt_ms - Total time spent on prompt processing in milliseconds.
 * @property {number} prompt_per_token_ms - Average time per token during prompt processing in milliseconds.
 * @property {number} prompt_per_second - Number of prompt tokens processed per second.
 * @property {number} predicted_n - The number of predicted (generated) tokens.
 * @property {number} predicted_ms - Total time spent on prediction in milliseconds.
 * @property {number} predicted_per_token_ms - Average time per token during prediction in milliseconds.
 * @property {number} predicted_per_second - Number of tokens predicted per second.
 * @property {number} draft_n - The number of draft tokens used in speculative decoding.
 * @property {number} draft_n_accepted - The number of draft tokens that were accepted.
 * @example
 * const metrics: PerformanceMetrics = {
 *   cache_n: 128,
 *   prompt_n: 256,
 *   prompt_ms: 150,
 *   prompt_per_token_ms: 0.59,
 *   prompt_per_second: 1706.67,
 *   predicted_n: 500,
 *   predicted_ms: 2500,
 *   predicted_per_token_ms: 5.0,
 *   predicted_per_second: 200,
 *   draft_n: 100,
 *   draft_n_accepted: 75
 * };
 */
interface PerformanceMetrics {
    cache_n: number;
    prompt_n: number;
    prompt_ms: number;
    prompt_per_token_ms: number;
    prompt_per_second: number;
    predicted_n: number;
    predicted_ms: number;
    predicted_per_token_ms: number;
    predicted_per_second: number;
    draft_n: number;
    draft_n_accepted: number;
}

/**
 * Represents the progress of prompt processing, including counts, timing, and throughput.
 *
 * @interface PromptProcessingProgress
 * @property {number} total - The total number of tokens to process.
 * @property {number} cache - The number of tokens retrieved from cache.
 * @property {number} processed - The number of tokens already processed.
 * @property {number} time_ms - The elapsed processing time in milliseconds.
 * @property {number} tps - Tokens processed per second.
 * @example
 * const progress: PromptProcessingProgress = {
 *   total: 1000,
 *   cache: 300,
 *   processed: 700,
 *   time_ms: 4500,
 *   tps: 155.56
 * };
 */
interface PromptProcessingProgress {
    total: number;
    cache: number;
    processed: number;
    time_ms: number;
    tps: number;
}

/**
 * Extends PromptProcessingProgress with additional fields for tracking in-progress statistics,
 * including percentage progress, cache utilization, and human-readable time.
 *
 * @interface PromptProcessingInProgressStats
 * @augments PromptProcessingProgress
 * @property {number} percent_progress - The percentage of prompt processing completed (0-100).
 * @property {number} percent_cache - The percentage of tokens served from cache (0-100).
 * @property {string} time_humanized - A human-readable representation of the elapsed time.
 * @example
 * const stats: PromptProcessingInProgressStats = {
 *   total: 1000,
 *   cache: 300,
 *   processed: 500,
 *   time_ms: 2500,
 *   tps: 200,
 *   percent_progress: 50.0,
 *   percent_cache: 30.0,
 *   time_humanized: "2.5 seconds"
 * };
 */
interface PromptProcessingInProgressStats extends PromptProcessingProgress {
    percent_progress: number;
    percent_cache: number;
    time_humanized: string;
}

/*interface CtxStats {
    total: number;
    consumedPercent: number;
    emittedTokens: number;
    tps: number;
    pps: number;
}*/

export {
    InferenceStats,
    PerformanceMetrics,
    PromptProcessingProgress,
    PromptProcessingInProgressStats,
};

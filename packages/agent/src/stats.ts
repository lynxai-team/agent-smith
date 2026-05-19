import type { InferenceStats, PerformanceMetrics } from "@agent-smith/types";

function convertStats(metrics: PerformanceMetrics): InferenceStats {
    const percentCache = metrics.cache_n > 0
        ? (metrics.cache_n / (metrics.prompt_n + metrics.cache_n)) * 100
        : 0;

    const percentDraftAccepted = metrics.draft_n > 0
        ? (metrics.draft_n_accepted / metrics.draft_n) * 100
        : 0;

    const percentDraft = metrics.draft_n_accepted > 0
        ? (metrics.draft_n_accepted / metrics.predicted_n) * 100
        : 0;

    return {
        nPrefillTotalTokens: metrics.prompt_n + metrics.cache_n,
        nTotalTokens: metrics.prompt_n + metrics.cache_n + metrics.predicted_n,
        nPrefillProcessedTokens: metrics.prompt_n,
        nPrefillCacheTokens: metrics.cache_n,
        nEmittedTokens: metrics.predicted_n,
        percentCache,
        nDraftTokens: metrics.draft_n,
        nDraftTokensAccepted: metrics.draft_n_accepted,
        percentDraftAccepted,
        percentDraft,
        emittedTokensPerSecond: metrics.predicted_per_second,
        prefillTokensPerSecond: metrics.prompt_per_second,
        prefilDuration: metrics.prompt_ms,
        emitDuration: metrics.predicted_ms,
        totalDuration: metrics.prompt_ms + metrics.predicted_ms,
    };
}

export {
    convertStats,
}
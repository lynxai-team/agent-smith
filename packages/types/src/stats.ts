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

export {
    InferenceStats,
    PerformanceMetrics,
}
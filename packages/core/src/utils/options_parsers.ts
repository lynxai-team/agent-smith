import { InferenceParams, LmTaskConfig } from "@agent-smith/types";



function parseTaskConfigOptions(options: Record<string, any>): LmTaskConfig {
    const conf: LmTaskConfig = { inferParams: {} };
    const optionsInferParams: InferenceParams = {};
    if (options?.temperature) {
        optionsInferParams.temperature = options.temperature
    }
    if (options?.top_k !== undefined) {
        optionsInferParams.top_k = options.top_k
    }
    if (options?.top_p !== undefined) {
        optionsInferParams.top_p = options.top_p
    }
    if (options?.min_p !== undefined) {
        optionsInferParams.min_p = options.min_p
    }
    if (options?.max_tokens !== undefined) {
        optionsInferParams.max_tokens = options.max_tokens
    }
    if (options?.repeat_penalty !== undefined) {
        optionsInferParams.repeat_penalty = options.repeat_penalty
    }
    if (options?.images) {
        optionsInferParams.images = options.images
    }
    if (options?.model !== undefined) {
        conf.model = options.model;
    }
    conf.inferParams = optionsInferParams;
    return conf
}

export {
    parseTaskConfigOptions,
}
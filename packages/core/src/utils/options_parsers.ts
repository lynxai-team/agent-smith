import { InferenceParams, LmTaskConfig, type AgentInferenceOptions } from "@agent-smith/types";



function parseTaskConfigOptions(options: Record<string, any> & AgentInferenceOptions): LmTaskConfig {
    const conf: LmTaskConfig = { inferParams: {} };
    const optionsInferParams: InferenceParams = {};
    if (options.params?.temperature) {
        optionsInferParams.temperature = options.temperature
    }
    if (options.params?.top_k !== undefined) {
        optionsInferParams.top_k = options.params.top_k
    }
    if (options.params?.top_p !== undefined) {
        optionsInferParams.top_p = options.params.top_p
    }
    if (options.params?.min_p !== undefined) {
        optionsInferParams.min_p = options.params.min_p
    }
    if (options.params?.max_tokens !== undefined) {
        optionsInferParams.max_tokens = options.params.max_tokens
    }
    if (options.params?.repeat_penalty !== undefined) {
        optionsInferParams.repeat_penalty = options.params.repeat_penalty
    }
    if (options.params?.images) {
        optionsInferParams.images = options.params.images
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
import type { InferenceParams, AgentInferenceOptions } from "@agent-smith/types";

function formatInferParams(ip: InferenceParams, options: AgentInferenceOptions): InferenceParams {
    const _ip = ip as Record<string, any>;
    // override infer params
    if (options?.params) {
        for (const [k, v] of Object.entries(options.params)) {
            _ip[k] = v
        }
    }
    return _ip as InferenceParams;
}

export {
    formatInferParams,
}
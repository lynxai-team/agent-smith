import type { InferenceParams, AgentInferenceOptions } from "@agent-smith/types";

function formatInferParams(ip: InferenceParams, conf: AgentInferenceOptions): InferenceParams {
    const _ip = ip as Record<string, any>;
    // override infer params
    if (conf?.params) {
        for (const [k, v] of Object.entries(conf.params)) {
            _ip[k] = v
        }
    }
    return _ip as InferenceParams;
}

export {
    formatInferParams,
}
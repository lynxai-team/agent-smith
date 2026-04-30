import type { LmTaskConfig, InferenceParams } from "@agent-smith/types";

function mergeConfOptions(conf: LmTaskConfig, options: Record<string, any>): LmTaskConfig {
    const res: Record<string, any> = conf;
    for (const [k, v] of Object.entries(options)) {
        if (k == "inferParams") {
            continue
        }
        res[k] = v
    }
    return res as LmTaskConfig
}

function mergeInferParams(
    userInferParams: Record<string, any>,
    taskInferParams: InferenceParams
): InferenceParams {
    const ip = taskInferParams as Record<string, any>;
    //console.log("IP", ip);
    for (const [k, v] of Object.entries(userInferParams)) {
        ip[k] = v
    }
    return ip as InferenceParams
}

export {
    mergeConfOptions,
    mergeInferParams,
}
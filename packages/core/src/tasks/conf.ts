import type { InferenceParams } from "@agent-smith/types";

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
    mergeInferParams,
}
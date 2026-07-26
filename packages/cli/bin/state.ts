import type { InferenceParams, RunMode } from "@agent-smith/types";
import { ref } from "@vue/reactivity";

let chatInferenceParams: InferenceParams = { temperature: 0.2, max_tokens: 2048 };
const isChatMode = ref(false);
const runMode = ref<RunMode>("cmd");

function setChatInferenceParams(ip: InferenceParams) {
    chatInferenceParams = ip
}

export {
    runMode,
    isChatMode,
    chatInferenceParams,
    setChatInferenceParams,
}
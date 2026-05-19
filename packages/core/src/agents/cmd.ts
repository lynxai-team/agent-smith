import { getAgentPrompt } from "../utils/io.js";
import type { InferenceResult } from "@agent-smith/types";
import { useAgentExecutor } from "./useagent.js";

async function executeAgent(
    name: string,
    args: any,
    options: Record<string, any>
): Promise<InferenceResult> {
    const prompt = await getAgentPrompt(name, args, options);
    const exec = await useAgentExecutor(name, { prompt: prompt }, options);
    const res = exec.execute();
    return res
}

export {
    executeAgent,
}
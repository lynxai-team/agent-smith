import { getAgentPrompt } from "../utils/io.js";
import type { AgentInferenceOptions, InferenceResult } from "@agent-smith/types";
import { useAgentExecutor } from "./useagent.js";

async function executeAgent(
    name: string,
    args: Array<any> | Record<string, any>,
    options: AgentInferenceOptions & Record<string, any>
): Promise<InferenceResult> {
    //console.log("EXEC AGENT", args, "\n", options);
    const prompt = await getAgentPrompt(name, args, options);
    const exec = await useAgentExecutor(name, { prompt: prompt }, options);
    const res = exec.execute();
    return res
}

export {
    executeAgent,
}
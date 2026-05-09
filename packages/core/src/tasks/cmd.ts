import type { AgentInferenceOptions, InferenceResult } from "@agent-smith/types";
import { useTaskExecutor } from "./usetask.js";

async function executeTask(
    name: string, payload: { prompt: string } & Record<string, any>, options: AgentInferenceOptions
): Promise<InferenceResult> {
    const tsk = await useTaskExecutor(name, payload, options);
    const res = await tsk.execute();
    return res
}

export {
    executeTask,
}
import { executeAction, executeWorkflow, getAgentPrompt, getInputFromOptions, useAgentExecutor } from "@agent-smith/core";
import { confirmToolUsage, parseCommandArgs } from "../utils.js";
import type { InferenceResult } from "@agent-smith/types";
import { useInferenceCallbacks } from "./callbacks.js";
import { chat } from "./build.js";

async function executeWorkflowCmd(name: string, wargs: Array<any>): Promise<any> {
    //console.log("WF INITIAL ARGS", typeof wargs, wargs.slice(0, -1));
    const ca = parseCommandArgs(wargs);
    //console.log("WF ARGS", ca);
    const inferenceCallbacks = useInferenceCallbacks(name, ca.options);
    const options = { ...ca.options, ...inferenceCallbacks };
    return await executeWorkflow(name, wargs, options);
    /*if (ca?.options.chat) {
        await chat(options, tsk.agent, tsk.mcpServers);
    }*/
}

async function executeAgentCmd(
    name: string,
    targs: Array<any> = []
): Promise<InferenceResult> {
    //console.log("EXEC AGENT", name);
    const ca = parseCommandArgs(targs);
    //console.log("Agent ARGs", ca);
    ca.options.isAgent = true;
    ca.options.confirmToolUsage = confirmToolUsage;
    const inferenceCallbacks = useInferenceCallbacks(name, ca.options);
    const options = { ...ca.options, ...inferenceCallbacks };
    const prompt = await getAgentPrompt(name, ca.args, options);
    const tsk = await useAgentExecutor(name, { prompt: prompt }, options);
    //console.log("CA", ca);
    const tr = await tsk.execute();
    //console.dir(tsk.agent.history, { depth: 6 });
    if (tr?.text) {
        if (!tr.text.endsWith("\n")) {
            console.log()
        }
    }
    if (ca?.options.chat) {
        await chat(options, tsk.agent, tsk.mcpServers);
    }
    return tr
}

async function executeActionCmd(
    name: string, aargs: Array<any>, quiet = false
): Promise<any> {
    const ca = parseCommandArgs(aargs);
    //console.log("AARGs", ca);
    const inferenceCallbacks = useInferenceCallbacks(name, ca.options);
    const options: Record<string, any> = { ...ca.options, ...inferenceCallbacks };
    //console.log("CMDA", args)
    const params = aargs;
    const ip = await getInputFromOptions(options);
    if (ip !== null) {
        params.push(ip)
    }
    if (options?.debug) {
        console.log("Action", name, "params", params);
    }
    return await executeAction(name, params, options, quiet)
}

export {
    executeWorkflowCmd,
    executeActionCmd,
    executeAgentCmd,
}
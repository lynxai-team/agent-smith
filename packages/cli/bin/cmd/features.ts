import { executeAction, executeTask, executeWorkflow, getTaskPrompt, getInputFromOptions, useTaskExecutor } from "@agent-smith/core";
import { confirmToolUsage, parseCommandArgs } from "../utils.js";
import type { InferenceResult } from "@agent-smith/types";
import { useInferenceCallbacks } from "./callbacks.js";
import { chat } from "./build.js";

async function executeWorkflowCmd(name: string, wargs: Array<any>): Promise<any> {
    //console.log("WF INITIAL ARGS", typeof wargs, wargs.slice(0, -1));
    const { args, options } = parseCommandArgs(wargs);
    //console.log("WF ARGS", typeof args, args);
    //console.log("WF OPTS", options);
    return await executeWorkflow(name, args, options)
}

async function executeTaskCmd(
    name: string,
    targs: Array<any> = []
): Promise<InferenceResult> {
    const ca = parseCommandArgs(targs);
    //console.log("ARGS", ca);
    const inferenceCallbacks = useInferenceCallbacks(name, ca.options);
    const options = { ...ca.options, ...inferenceCallbacks };
    const prompt = await getTaskPrompt(name, ca.args, options);
    const tsk = await useTaskExecutor(name, { prompt: prompt }, options);
    const tr = await tsk.execute();
    //console.log("TR", tr);
    if (ca?.options.chat) {
        await chat(options, tsk.agent, tsk.mcpServers);
    }
    return tr
}

async function executeAgentCmd(
    name: string,
    targs: Array<any> = []
): Promise<InferenceResult> {
    //console.log("EXEC AGENT", name);
    const ca = parseCommandArgs(targs);
    ca.options.isAgent = true;
    ca.options.confirmToolUsage = confirmToolUsage;
    const inferenceCallbacks = useInferenceCallbacks(name, ca.options);
    const options = { ...ca.options, ...inferenceCallbacks };
    const prompt = await getTaskPrompt(name, ca.args, options);
    const tsk = await useTaskExecutor(name, { prompt: prompt }, options);
    //console.log("CA", ca);
    const tr = await tsk.execute();
    //console.dir(tsk.agent.history, { depth: 6 });
    if (ca?.options.chat) {
        await chat(options, tsk.agent, tsk.mcpServers);
    }
    return tr
}

async function executeActionCmd(
    name: string, aargs: Array<any>, quiet = false
): Promise<any> {
    //console.log("AARGs", aargs)
    const { args, options } = parseCommandArgs(aargs);
    //console.log("CMDA", args)
    const params = args;
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
    executeTaskCmd,
    executeActionCmd,
    executeAgentCmd,
}
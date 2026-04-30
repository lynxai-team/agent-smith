import { executeAction, executeTask, executeWorkflow, getTaskPrompt, getInputFromOptions } from "@agent-smith/core";
import { confirmToolUsage, parseCommandArgs } from "../utils.js";
import type { InferenceResult } from "@agent-smith/types";

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
    const prompt = await getTaskPrompt(name, ca.args, ca.options);
    const tr = await executeTask(name, { prompt: prompt }, ca.options)
    //console.log("TR", tr);
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

async function executeAgentCmd(
    name: string,
    targs: Array<any> = []
): Promise<InferenceResult> {
    const ca = parseCommandArgs(targs);
    const prompt = await getTaskPrompt(name, ca.args, ca.options);
    ca.options.isAgent = true;
    ca.options.confirmToolUsage = confirmToolUsage;
    const res = await executeTask(name, { prompt: prompt }, ca.options)
    return res
}

export {
    executeWorkflowCmd,
    executeTaskCmd,
    executeActionCmd,
    executeAgentCmd,
}
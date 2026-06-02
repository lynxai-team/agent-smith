/*
# tool
name: run-worker
description: use an worker in context to accomplish a task
type: worker
arguments:
    name:
        description: the name of the worker to use
        required: true
    prompt:
        description: the prompt for the worker
        required: true
*/
import { useAgentExecutor } from "../../agents/useagent.js";

async function action(args: Record<string, any>, options: Record<string, any>) {
    //console.log("RW ARGS", args);
    console.log("RW OPTS", options);
    const errb = new Array<string>();
    if (!args?.name) {
        errb.push(`loading worker: provide an worker name`);
    }
    if (!args?.prompt) {
        errb.push(`loading worker: provide an prompt for the worker`);
    }
    if (errb.length > 0) {
        throw new Error(errb.join(" "));
    }
    const aOpts = { ...options };
    const ax = await useAgentExecutor(args.name, { prompt: args.prompt }, aOpts);
    const res = await ax.execute();
    //console.log("AH", ax.agent.history);
    return res.text
}

export {
    action,
}
/*
# tool
name: run-agent
description: use an agent in an independant context to accomplish a task
arguments:
    name:
        description: the name of the agent to use
        required: true
    prompt:
        description: the prompt for the agent
        required: true
*/
import { useAgentExecutor } from "../../agents/useagent.js";
import { state } from "../../main.js";

async function action(args: Record<string, any>, options: Record<string, any>) {
    //console.log("RA ARGS", args);
    //console.log("RA OPTS", options);
    await state.init();
    const errb = new Array<string>();
    if (!args?.name) {
        errb.push(`loading agent: provide an agent name`);
    }
    if (!args?.prompt) {
        errb.push(`loading agent: provide an prompt for the agent`);
    }
    if (errb.length > 0) {
        throw new Error(errb.join(" "));
    }
    const aOpts = { ...options };
    aOpts.history = [];
    if (aOpts?.template) {
        delete aOpts.template
    }
    if (aOpts?.system) {
        delete aOpts.system
    }
    if (aOpts?.shots) {
        delete aOpts.shots
    }
    if (aOpts?.tools) {
        delete aOpts.tools;
    }
    if (aOpts?.debug) {
        console.log("Running agent", args.name);
        console.log(args.prompt);
        console.log("Options:", aOpts);
    }
    const ax = await useAgentExecutor(args.name, { prompt: args.prompt }, aOpts);
    const res = await ax.execute();
    //console.log("AH", ax.agent.history);
    return res.text
}

export {
    action,
}
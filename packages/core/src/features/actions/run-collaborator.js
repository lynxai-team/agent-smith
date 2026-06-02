/*
# tool
name: run-collaborator
description: use an collaborator in context to accomplish a task
agentType: worker
parallelCalls: false
arguments:
    role:
        description: the role of the collaborator to use
        required: true
    prompt:
        description: the prompt for the collaborator
        required: true
*/
import { useAgentExecutor } from "../../agents/useagent.js";

async function action(args, options) {
    //console.log("RC OPTS IN", options);
    const errb = new Array();
    if (!args?.prompt) {
        errb.push(`loading collaborator: provide an collaborator prompt`);
    }
    if (!args?.role) {
        errb.push(`loading collaborator: provide an role for the collaborator`);
    }
    if (errb.length > 0) {
        throw new Error(errb.join(" "));
    }
    const aOpts = { ...options };
    if (!aOpts?.system) {
        console.warn(`loading collaborator ${args.name}: no system in opts`);
    }
    if (aOpts.caller == "collaborator") {
        return "you can not run collaborators while beeing in collaborator mode already. Answer directly.";
    }
    //console.log("Run collab **********************", aOpts.caller, args.role);
    //console.log("RC OPTS OUT", aOpts.caller, aOpts);
    const ax = await useAgentExecutor("collaborator", args, aOpts);
    const res = await ax.execute();
    //console.log("AH", ax.agent.history);
    return res.text;
}

export {
    action,
};
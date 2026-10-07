/*
# tool
name: run-team-member
description: run a team member agent in an independant context to accomplish a task
arguments:
    agentname:
        description: name of the team member, free form
        required: true
    role:
        description: role of the team member
        required: true
    task:
        description: the task assigned to the team member
        required: true
    model:
        description: the model name to use with the agent.
        required: true
    team:
        description:  |-
            A json list of team members with models and roles. Format:

            [{"model":"<model>", "role": "<role>"}]
        required: true
*/
import { useAgentExecutor } from "../../agents/useagent.js";
import { state } from "../../main.js";

async function action(args: Record<string, any>, options: Record<string, any>) {
    //console.log("RA ARGS", args);
    //console.log("RA OPTS", options);
    await state.init();
    const errb = new Array<string>();
    if (!args?.agentname) {
        errb.push(`loading agent: provide an agentname`);
    }
    if (!args?.model) {
        errb.push(`loading agent: provide an model for the agent`);
    }
    if (!args?.role) {
        errb.push(`loading agent: provide an role for the agent`);
    }
    if (!args?.task) {
        errb.push(`loading agent: provide an task for the agent`);
    }
    if (!args?.team) {
        errb.push(`loading agent: provide an team for the agent`);
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
    const name = "team-member";
    /*if (options?.debug) {
        console.log("Running agent", name);
        console.log(args.prompt);
        console.log("Options:", aOpts);
    }*/
    aOpts.variables = {
        name: args.agentname,
        role: args.role,
        team: args.team,
        model: args.model,
        workspace: aOpts.variables.workspace,
    }
    const ax = await useAgentExecutor(name, { prompt: args.task }, aOpts);
    const res = await ax.execute();
    //console.log("AH", ax.agent.history);
    return res.text
}

export {
    action,
}
/*
# tool
name: "run-worker"
description: run a worker
arguments:
    name:
        description: the name of the worker to run
        required: true
    "task-description": 
        description: description of the task to assign to the worker
        required: true
*/
import { executeAgent } from "../../agents/cmd.js";
import { runtimeDataError } from "../../utils/user_msgs.js";

async function action(args, options) {
    const opts = Object.assign({}, options);
    console.log("WORKER OPTS");
    console.dir(opts, { depth: 6 });
    opts.history = options?.history ?? [];
    let errMsg = "";
    if (opts.history.length == 0) {
        errMsg = `trying to run worker ${args.name} with no history`;
    }
    /*const an = Object.keys(args);
    if (an.includes("name")) {
        errMsg = `No name argument for worker ${args.name}: args:`;
        console.error(errMsg, args);
    }
    if (an.includes("task-description")) {
        errMsg = `No task-description argument for worker ${args.name}: args:`;
        console.error(errMsg, args);
    }
    if (errMsg) {
        if (options?.onError) {
            options.onError(errMsg, "run-worker");
        } else {
            runtimeDataError(errMsg);
        }
    }*/
    args.prompt = "<worker-mode />\n\n" + args["task-description"];
    //console.log("WORKER HIST", opts.agent.history);
    const res = await executeAgent(args.name, args, opts);
    return res.text;
}

export {
    action
};
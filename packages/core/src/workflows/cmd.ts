import colors from "ansi-colors";
import { pathToFileURL } from "node:url";
import type { AgentInferenceOptions, FeatureType } from "@agent-smith/types";
import { getFeatureSpec } from "../state/features.js";
import { executeAction } from "../actions/cmd.js";
import { executeAdaptater } from "../adaptaters/cmd.js";
import { executeTask } from "../tasks/cmd.js";
import { getInputFromOptions, getTaskPrompt } from "../utils/io.js";
import { runtimeError } from "../utils/user_msgs.js";
import { readWorkflow } from "./read.js";

async function executeWorkflow(wname: string, args: any, options: AgentInferenceOptions & Record<string, any>): Promise<any> {
    const { workflow, found } = await readWorkflow(wname);
    if (!found) {
        throw new Error(`Workflow ${wname} not found`)
    }
    const isDebug = options?.debug === true;
    const isVerbose = options?.verbose === true;
    const stepNames = Object.keys(workflow);
    if (isDebug || isVerbose) {
        console.log("Running workflow", wname, stepNames.length, "steps");
    }
    let i = 0;
    const finalTaskIndex = stepNames.length - 1;
    let taskRes: Record<string, any> = { cmdArgs: args as Array<string> };
    //console.log("WPARAMS", taskRes);
    let prevStepType: "cmd" | "agent" | "task" | "adaptater" | "action" | null = null;
    for (const step of workflow) {
        if (isDebug || isVerbose) {
            console.log(i + 1, step.name, colors.dim(step.type))
        }
        switch (step.type) {
            case "task":
                try {
                    let tdata: { prompt: string } & Record<string, any> = { prompt: "", ...taskRes };
                    if (i == 0) {
                        tdata.prompt = await getTaskPrompt(step.name, taskRes.cmdArgs, options);
                    } else {
                        if (prevStepType) {
                            if (prevStepType == "task") {
                                tdata.prompt = taskRes.text;
                            } else if (prevStepType == "action") {
                                if (taskRes?.args) {
                                    if (typeof taskRes.args == "string") {
                                        tdata.prompt = taskRes.args
                                    }
                                }
                            }
                        }
                    }
                    if (!tdata?.prompt) {
                        throw new Error(`Workflow ${wname} step ${i + 1}: provide a prompt for the task ${step.name}`)
                    }
                    options.isAgent = false;
                    const tr = await executeTask(step.name, tdata, options);
                    taskRes = { ...tr, ...taskRes };
                } catch (e) {
                    throw new Error(`workflow task ${i + 1}: ${e}`)
                }
                break;
            case "agent":
                try {
                    let tdata: { prompt: string } & Record<string, any> = { prompt: "", ...taskRes };
                    if (i == 0) {
                        tdata.prompt = await getTaskPrompt(step.name, taskRes.cmdArgs, options);
                    } else {
                        if (prevStepType) {
                            if (prevStepType == "task") {
                                tdata.prompt = taskRes.text;
                            } else if (prevStepType == "action") {
                                if (taskRes?.args) {
                                    if (typeof taskRes.args == "string") {
                                        tdata.prompt = taskRes.args
                                    }
                                }
                            }
                        }
                    }
                    if (!tdata?.prompt) {
                        throw new Error(`Workflow ${wname} step ${i + 1}: provide a prompt for the task ${step.name}`)
                    }
                    options.isAgent = true;
                    const tr = await executeTask(step.name, tdata, options);
                    options.isAgent = false;
                    taskRes = { ...tr, ...taskRes };
                } catch (e) {
                    throw new Error(`workflow task ${i + 1}: ${e}`)
                }
                break;
            case "action":
                try {
                    //console.log("EXEC ACTION ARGS", taskRes);
                    //const actArgs = i == 0 ? taskRes.cmdArgs : taskRes;
                    let actArgs: any;
                    if (i == 0) {
                        actArgs = taskRes.cmdArgs;
                        const inputData = await getInputFromOptions(options);
                        if (inputData) {
                            actArgs.push(inputData)
                        }
                    } else {
                        actArgs = taskRes
                    }
                    const ares = await executeAction(step.name, actArgs, options, true);
                    //console.log("WF ACTION RES", typeof ares, ares);
                    //console.log("LAST ACT", i, finalTaskIndex);
                    if (i == finalTaskIndex && !options?.isToolCall) {
                        console.log(ares);
                        break
                    }
                    if (typeof ares == "string" || Array.isArray(ares)) {
                        taskRes.args = ares;
                        //console.log("ARRAY ACTION RES", taskRes)
                    } else {
                        taskRes = { ...ares, ...taskRes };
                    }
                } catch (e) {
                    throw new Error(`workflow action ${i + 1}: ${e}`)
                }
                //console.log("END ACTION", step.name)
                break;
            case "adaptater":
                try {
                    //console.log("WF AD ARGS IN", taskRes);
                    //console.log("AD OPTS IN", options);
                    let actArgs: any;
                    if (i == 0) {
                        //console.log("TR", taskRes);
                        actArgs = taskRes.cmdArgs;
                        //console.log("ACT ARGS", actArgs);
                        const inputData = await getInputFromOptions(options);
                        if (inputData) {
                            actArgs.push(inputData)
                        }
                    } else {
                        actArgs = taskRes
                    }
                    const adres = await executeAdaptater(step.name, actArgs, options);
                    //console.log("WF AD FINAL RES", taskRes);
                    //console.log("LAST ACT", i, finalTaskIndex);
                    if (i == finalTaskIndex && !options?.isToolCall) {
                        console.log(adres);
                        break
                    }
                    //console.log("WF AD RES", typeof adres, adres);
                    if (typeof adres == "string" || Array.isArray(adres)) {
                        taskRes.args = adres;
                        //console.log("WF AD IT RES", taskRes);
                    } else {
                        taskRes = { ...adres };
                    }
                    //console.log("WF ADAPT RES", typeof ares, Array.isArray(ares) ? ares.length : "NA");
                } catch (e) {
                    throw new Error(`workflow adaptater ${i + 1}: ${e}`)
                }
                break;
            case "cmd":
                try {
                    const { found, path } = getFeatureSpec(step.name, "cmd" as FeatureType);
                    if (!found) {
                        throw new Error(`Command ${step.name} not found`)
                    }
                    const url = pathToFileURL(path).href;
                    let jsa: any;
                    try {
                        jsa = await import(/* @vite-ignore */ url);
                    } catch (e) {
                        throw new Error(`cmd import error ${e}`)
                    }
                    if (!jsa?.runCmd) {
                        runtimeError(`workflow ${wname}: can not import the runCmd function from step ${i} for command ${step.name}: please add a runCmd function export`)
                        return
                    }
                    let cArgs: any;
                    if (i == 0) {
                        cArgs = taskRes.cmdArgs;
                        const inputData = await getInputFromOptions(options);
                        if (inputData) {
                            cArgs.push(inputData)
                        }
                    } else {
                        cArgs = taskRes
                    }
                    const cres = await jsa.runCmd(cArgs, options);
                    if (typeof cres == "string" || Array.isArray(cres)) {
                        taskRes.args = cres;
                    } else {
                        taskRes = { ...cres, ...taskRes };
                    }
                } catch (e) {
                    throw new Error(`workflow command ${i + 1}: ${e}`)
                }
                break
            default:
                throw new Error(`unknown workflow step type ${step.type} in workflow ${wname}`)
        }
        prevStepType = step.type;
        //console.log("WF NODE RES", step.type, taskRes);
        /*if (isDebug) {
            console.log("->", params);
        }*/
        //console.log("WFR", taskRes)
        ++i
    }
    //console.log("WF RES")
    return taskRes
}

export {
    executeWorkflow,
};


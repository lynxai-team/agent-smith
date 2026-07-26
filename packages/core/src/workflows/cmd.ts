import { pathToFileURL } from "node:url";
import type { AgentInferenceOptions, FeatureType, WorkflowStep } from "@agent-smith/types";
import { getFeatureSpec } from "../state/features.js";
import { executeAction } from "../actions/cmd.js";
import { executeAdaptater } from "../adaptaters/cmd.js";
import { executeAgent } from "../agents/cmd.js";
import { getInputFromOptions, getAgentPrompt } from "../utils/io.js";
import { runtimeError } from "../utils/user_msgs.js";
import { readWorkflow } from "./read.js";

async function executeWorkflow(wname: string, args: any, options: AgentInferenceOptions & Record<string, any>): Promise<any> {
    let workflow: Array<WorkflowStep>;
    const isInline = options?.inlineWorkflow ? true : false;
    if (!isInline) {
        const wf = await readWorkflow(wname);
        if (!wf.found) {
            throw new Error(`Workflow ${wname} not found`)
        }
        workflow = wf.workflow;
    } else {
        workflow = options.inlineWorkflow;
        delete options.inlineWorkflow;
    }
    const isDebug = options?.debug === true;
    const isVerbose = options?.verbose === true;
    const stepNames = Object.keys(workflow);
    if (isDebug || isVerbose) {
        console.log("Running workflow", wname, stepNames.length, "steps");
    }
    let i = 0;
    const finalTaskIndex = stepNames.length - 1;
    let taskRes: any = { cmdArgs: args };
    //console.log("WPARAMS", taskRes);
    let prevStepType: "cmd" | "agent" | "task" | "adaptater" | "action" | null = null;
    //console.log("WF OPTS", options);
    for (const step of workflow) {
        if (isDebug || isVerbose) {
            console.log(i + 1, step.name, `\x1b[2m${step.type}\x1b[0m`)
        }
        switch (step.type) {
            case "agent":
                try {
                    let tdata: { prompt: string } & Record<string, any> = { prompt: "", ...taskRes };
                    if (i == 0) {
                        tdata.prompt = await getAgentPrompt(step.name, taskRes.cmdArgs, options);
                    } else {
                        if (prevStepType) {
                            if (prevStepType == "action") {
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
                    //console.log("WF EXEC AGENT", step.name, tdata, options);
                    const tr = await executeAgent(step.name, tdata, options);
                    //console.log("WFI AGENT RES", tr)
                    options.isAgent = false;
                    if (isInline && i == finalTaskIndex) {
                        //console.log("WFI AGENT", tr.text)
                        taskRes = tr.text
                    } else {
                        taskRes = { ...tr, ...taskRes };
                    }
                    if (i == finalTaskIndex && !options?.isToolCall && !isInline) {
                        console.log(tr);
                        break
                    }
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
                    //console.log("WF EXEC ACTION OPTS", options);
                    const ares = await executeAction(step.name, actArgs, options, true);
                    //console.log("LAST ACT", i, finalTaskIndex);
                    //console.log("WF ACTION RES", typeof ares, ares);
                    if (typeof ares == "string" || Array.isArray(ares)) {
                        taskRes.args = ares;
                        //console.log("ARRAY ACTION RES", taskRes)
                    } else {
                        if (isInline && (i == finalTaskIndex)) {
                            taskRes = ares
                        } else {
                            taskRes = { ...ares, ...taskRes };
                        }
                    }
                    if (i == finalTaskIndex && !options?.isToolCall && !options.nocli) {
                        console.log(ares);
                        break
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
                    if (typeof adres == "string" || Array.isArray(adres)) {
                        taskRes.args = adres;
                        //console.log("ARRAY ACTION RES", taskRes)
                    } else {
                        if (isInline && i == finalTaskIndex) {
                            taskRes = adres
                        } else {
                            taskRes = { ...adres, ...taskRes };
                        }
                    }
                    if (i == finalTaskIndex && !options?.isToolCall && !options.nocli) {
                        console.log(adres);
                        break
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
                        //console.log("ARRAY ACTION RES", taskRes)
                    } else {
                        if (isInline && i == finalTaskIndex) {
                            taskRes = cres
                        } else {
                            taskRes = { ...cres, ...taskRes };
                        }
                    }
                    if (i == finalTaskIndex && !options?.isToolCall && !options.nocli) {
                        console.log(cres);
                        break
                    }
                } catch (e) {
                    throw new Error(`workflow command ${i + 1}: ${e}`)
                }
                break
            default:
                throw new Error(`unknown workflow step type ${step.type} in workflow ${wname}`)
        }
        prevStepType = step.type;
        ++i
    }
    //console.log("WF FINAL RES", wname, isInline, taskRes);
    return taskRes
}

export {
    executeWorkflow,
};


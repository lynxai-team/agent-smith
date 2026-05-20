import { FeatureExecutor, FeatureType } from "@agent-smith/types";
import { pathToFileURL } from 'url';
import { getFeatureSpec } from '../state/features.js';
import { pyShell } from "../state/state.js";
import { processOutput, readPromptFile, getInputFromOptions } from "../utils/io.js";
import { readClipboard } from "../utils/sys/clipboard.js";
import { execute } from "../utils/sys/execute.js";
import { readYmlFile } from "../utils/sys/read_yml_file.js";
import { runPyScript } from "../utils/sys/run_python.js";
import { runtimeError } from "../utils/user_msgs.js";
import { createJsAction } from "./read.js";

async function executeAction(name: string, payload: any, options: Record<string, any>, quiet = false) {
    let run: FeatureExecutor<any, any>;
    //console.log("GET ACTION", name, payload);
    const inputData = await getInputFromOptions(options);
    if (inputData) {
        if (Array.isArray(payload)) {
            payload.push(inputData)
        }
    }
    const { found, path, ext } = getFeatureSpec(name, "action" as FeatureType);
    if (!found) {
        throw new Error(`Action ${name} not found at ${path}`);
    }
    //console.log("CREATE ACTION", name, ext, path);
    switch (ext) {
        case "js":
            const url = pathToFileURL(path).href;
            //console.log("CR JSA", url);
            const mjsa = await import(/* @vite-ignore */ url);
            run = createJsAction(mjsa.action);
            //console.log("END CR JSA")
            break;
        case "yml":
            run = systemAction(path);
            break
        case "py":
            run = pythonAction(path, options);
            break
        default:
            throw new Error(`Action ext ${ext} not implemented`)
    }
    //console.log("RUN", payload);
    const res = await run(payload, options);
    if (!quiet) {
        if (res) {
            console.log(res);
        }
    }
    await processOutput(res);
    return res
}

function systemAction(path: string): FeatureExecutor<Array<string>, any> {
    const run: FeatureExecutor = async (params: any) => {
        //console.log("SYS ACTION PARAMS", params);
        let runArgs = new Array<string>();
        // convert args for tool calls
        if (!Array.isArray(params)) {
            try {
                // obviously a tool call
                if (typeof params == "string") {
                    runArgs.push(params)
                } else {
                    runArgs = Object.values(params)
                }
            } catch (e) {
                throw new Error(`wrong python action args: ${e}`)
            }
        } else {
            runArgs = params
        }
        const actionSpec = readYmlFile(path);
        if (!actionSpec.found) {
            runtimeError("System action yml file", path, "not found")
        }
        //console.log("Yml action", JSON.stringify(actionSpec.data, null, "  "));
        //console.log("Args", args)
        if (!actionSpec.data?.args) {
            actionSpec.data.args = []
        }
        //console.log("EXEC", actionSpec.data.cmd, [...actionSpec.data.args, ...runArgs]);
        const out = await execute(actionSpec.data.cmd, [...actionSpec.data.args, ...runArgs]);
        return out.trim()
    }
    return run
}

function pythonAction(
    path: string,
    options: Record<string, any>
): FeatureExecutor<Array<string>> {
    const run: FeatureExecutor = async (params: any) => {
        //console.log("PY ACTION PARAMS", params);
        let runArgs = new Array<string>();
        if (!Array.isArray(params)) {
            try {
                // obviously a tool call
                if (typeof params == "string") {
                    runArgs.push(params)
                } else {
                    runArgs = Object.values(params)
                }
            } catch (e) {
                throw new Error(`wrong python action args: ${e}`)
            }
        } else {
            runArgs = params
        }
        //console.log("Py action", path);
        const { data, error } = await runPyScript(
            pyShell,
            "python3",
            path,
            runArgs,
        )
        /*console.log("----------------");
        console.log("PYOUT", data);
        console.log("----------------");*/
        if (error) {
            throw new Error(`python error: ${error}`)
        }
        let txt = data[0];
        if (data.length > 1) {
            txt = data.join("\n");
        }
        let final: string | Record<string, any> | Array<any> = txt;
        /*if ((txt.startsWith("{") || txt.startsWith("[")) && !options?.isToolCall) {
            try {
                final = JSON.parse(txt)
            } catch (e) {
                console.warn("Can not parse json from python action", path, e)
                //throw new Error(`python error: ${error}`) 
            }
        }*/
        console.log("PYTC TXT", final)
        return final
    }
    return run
}

export {
    executeAction,
    pythonAction,
    systemAction,
};


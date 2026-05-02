import YAML from 'yaml';
import { readClipboard } from '../utils/sys/clipboard.js';
import { readTask } from "../utils/sys/read_task.js";
import type { FeatureType, InferenceResult, TaskDef } from "@agent-smith/types";
import { getFeatureSpec } from "../state/features.js";
import { runtimeDataError } from '../utils/user_msgs.js';
import { initFilepaths, promptfilePath, outputMode, formatMode } from "../state/state.js";
import { readFile } from "../utils/sys/read.js";
import { runtimeError } from '../utils/user_msgs.js';
import { writeToClipboard } from '../utils/sys/clipboard.js';
import { MarkedExtension, marked } from 'marked';
// @ts-ignore
import { markedTerminal } from "marked-terminal";

marked.use(markedTerminal() as MarkedExtension);

function readPromptFile(): string {
    initFilepaths();
    return readFile(promptfilePath.value)
}

async function processOutput(res: InferenceResult) {
    //if (!(outputMode.value == "clipboard")) { return }
    let data = "";
    //console.log("Process OUTPUT", typeof res);
    let hasTextData = false;
    if (typeof res == "object") {
        if (res?.text) {
            data = res.text;
            hasTextData = true;
        } else {
            try {
                data = JSON.stringify(res);
            } catch (e) {
                runtimeError("Unable to parse json result")
            }
        }
    } else {
        data = res;
    }
    //onsole.log("OUTPUT", typeof res, data);
    if (outputMode.value == "clipboard") {
        //console.log("Writing to kb", data)
        await writeToClipboard(data);
    }
    if (hasTextData) {
        if (formatMode.value == "markdown") {
            console.log("\n------------------\n");
            console.log((marked.parse(data) as string).trim())
        }
    }
}

function openTaskSpec(name: string, isAgent = false): { taskDef: TaskDef, taskPath: string } {
    const ft = isAgent ? "agent" : "task";
    const { found, path } = getFeatureSpec(name, ft as FeatureType);
    if (!found) {
        throw new Error(`${ft} ${name} not found`);
    }
    const res = readTask(path);
    if (!res.found) {
        throw new Error(`${ft} ${name}, ${path} not found`)
    }
    const taskDef = YAML.parse(res.ymlTask);
    taskDef.name = name;
    return { taskDef: taskDef, taskPath: path }
}

async function getInputFromOptions(
    options: Record<string, any>,
): Promise<string | null> {
    let out: string | null = null;
    if (options?.clipboardInput === true) {
        out = await readClipboard();
        options.clipboardInput = false;
    } else if (options?.inputFile === true) {
        out = readPromptFile();
        options.inputFile = false;
    }
    return out
}

async function getTaskPrompt(
    name: string,
    args: Array<string>,
    options: Record<string, any>,
): Promise<string> {
    const ic = await getInputFromOptions(options);
    if (ic) {
        return ic
    }
    let pr: string;
    if (args[0] !== undefined) {
        pr = args[0]
    }
    else {
        runtimeDataError(options?.isAgent ? "agent" : "task", name, "provide a prompt or use input options")
        throw new Error()
    }
    return pr
}

export {
    getTaskPrompt,
    getInputFromOptions,
    openTaskSpec,
    readPromptFile,
    processOutput,
};

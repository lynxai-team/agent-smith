import YAML from 'yaml';
import { readClipboard } from '../utils/sys/clipboard.js';
import { readAgent } from "../utils/sys/read_agent.js";
import type { FeatureType, InferenceResult, AgentSpec } from "@agent-smith/types";
import { getFeatureSpec } from "../state/features.js";
import { runtimeDataError, runtimeWarning } from '../utils/user_msgs.js';
import { initFilepaths, promptfilePath, outputMode, formatMode } from "../state/state.js";
import { readFile } from "../utils/sys/read.js";
import { runtimeError } from '../utils/user_msgs.js';
import { writeToClipboard } from '../utils/sys/clipboard.js';
//import { MarkedExtension, marked } from 'marked';
// @ts-ignore
//import { markedTerminal } from "marked-terminal";
//marked.use(markedTerminal() as MarkedExtension);

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
    /*if (hasTextData) {
        if (formatMode.value == "markdown") {
            console.log("\n------------------\n");
            console.log((marked.parse(data) as string).trim())
        }
    }*/
}

function openAgentSpec(name: string): { agentSpec: AgentSpec, agentPath: string } {
    const { found, path } = getFeatureSpec(name, "agent" as FeatureType);
    if (!found) {
        throw new Error(`agent ${name} not found`);
    }
    const res = readAgent(path);
    if (!res.found) {
        throw new Error(`agent ${name}, ${path} not found`)
    }
    const agentSpec = YAML.parse(res.ymlAgent);
    agentSpec.name = name;
    return { agentSpec: agentSpec, agentPath: path }
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

async function getAgentPrompt(
    name: string,
    args: Array<any> | Record<string, any>,
    options: Record<string, any>,
): Promise<string> {
    const ic = await getInputFromOptions(options);
    if (ic) {
        return ic
    }
    let pr: string = "";
    if (Array.isArray(args)) {
        if (args[0] !== undefined) {
            pr = args[0]
        }
    } else {
        if (args?.prompt) {
            pr = args.prompt
        }
    }
    if (pr.length == 0) {
        runtimeWarning("empty prompt provided to agent", name)
    }
    return pr
}

export {
    getAgentPrompt,
    getInputFromOptions,
    openAgentSpec,
    readPromptFile,
    processOutput,
};

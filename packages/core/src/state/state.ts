import { FormatMode, InputMode, OutputMode } from "@agent-smith/types";
import { reactive, ref } from "@vue/reactivity";
import path from "path";
import { PythonShell } from 'python-shell';
import { createDirectoryIfNotExists } from "../utils/sys/dirs.js";
import { initDb } from "../db/db.js";
import { readFilePaths } from "../db/read.js";
import { runtimeDataError } from "../utils/user_msgs.js";
import { backend, initBackends } from "./backends.js";
//import { usePerfTimer } from "../main.js";

let pyShell: PythonShell;

const inputMode = ref<InputMode>("manual");
const outputMode = ref<OutputMode>("txt");
const formatMode = ref<FormatMode>("text");
//const verbosity = ref<VerbosityMode>("quiet");
const promptfilePath = ref("");
const dataDirPath = ref("");
const isStateReady = ref(false);
const isReady = ref(false);

const lastCmd = reactive<{ name: string, args: Array<string> }>({
    name: "",
    args: [],
});

function initFilepaths() {
    const filePaths = readFilePaths();
    //console.log("FP", filePaths);
    for (const fp of filePaths) {
        switch (fp.name) {
            case "promptfile":
                promptfilePath.value = fp.path
                break;
            case "datadir":
                dataDirPath.value = fp.path
        }
    }
}

async function init() {
    if (isStateReady.value) {
        return
    }
    //const perf = usePerfTimer();
    await initState();
    //perf.measure("initState");
    if (!isReady.value) {
        await initBackends();
    }
    //perf.measure("initBackends");
    if (!backend.value) {
        runtimeDataError("No backend found, can not initialize agent")
        return
    }
    isReady.value = true;
    //perf.final("init")
    //console.log("Agent", agent);
}

async function initState() {
    if (isStateReady.value) {
        return
    }
    //sconsole.log("INIT STATE");    
    initDb(false, false);
    initFilepaths();
    isStateReady.value = true;
    //console.log("State ready, available features:", readFeatures())
}

function _getDataDirPath() {
    if (dataDirPath.value.length == 0) {
        throw new Error("datadir path is not configured: update your config file with 'datadir' and run conf")
    }
    return dataDirPath.value
}


function pluginDataDir(pluginName: string): string {
    const dd = _getDataDirPath();
    const pluginDatapath = path.join(dd, pluginName);
    createDirectoryIfNotExists(pluginDatapath);
    return pluginDatapath
}

/*function setVerbosity(mode: VerbosityMode) {
    verbosity.value = mode
}*/


export {
    dataDirPath,
    formatMode,
    init,
    initFilepaths,
    initState,
    inputMode,
    isStateReady,
    lastCmd,
    outputMode,
    pluginDataDir,
    promptfilePath,
    pyShell
};

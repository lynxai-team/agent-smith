import { executeAction } from "./actions/cmd.js";
import { McpClient } from "./mcp.js";
import { executeTask } from "./tasks/cmd.js";
import { openTaskSpec } from "./utils/io.js";
import { extractToolDoc } from "./tools.js";
import { executeWorkflow } from "./workflows/cmd.js";
import { readWorkflow } from "./workflows/read.js";
import { writeToClipboard } from "./utils/sys/clipboard.js";
import { execute, runShellCmd } from "./utils/sys/execute.js";
import { readConf } from "./utils/sys/read_conf.js";
import { confDir, createConfigFile, dbPath, getConfigPath, processConfPath, updateConfigFile } from "./conf.js";
import { initDb } from "./db/db.js";
import { usePerfTimer } from "./utils/perf.js";
import { deleteFileIfExists } from "./utils/sys/delete_file.js";
import { getTaskPrompt, getInputFromOptions } from "./utils/io.js";
import { getFeatureSpec } from "./state/features.js";

import {
    updatePromptfilePath,
    updateDataDirPath,
    upsertBackends,
    setDefaultBackend,
    insertFeaturesPathIfNotExists,
    insertPluginIfNotExists,
    updateFeatures,
    updateAliases,
    cleanupFeaturePaths,
    upsertFilePath,
    upsertTaskSettings,
    deleteTaskSettings,
    deleteTaskSetting,
} from "./db/write.js";
import {
    readFeatures,
    readFeaturePaths,
    readFeature,
    readPlugins,
    readAliases,
    readFilePath,
    readFilePaths,
    readTool,
    readFeaturesType,
    readBackends,
    readTaskSettings,
    readTaskSetting,
} from "./db/read.js";
import {
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
    pyShell,
} from "./state/state.js";
import {
    backend,
    backends,
    initBackends,
    listBackends,
    setBackend,
} from "./state/backends.js";
import {
    tasksSettings,
    isTaskSettingsInitialized,
    initTaskSettings,
    getTaskSettings
} from "./state/tasks.js";
import {
    readTask,
    readTasksDir,
} from "./utils/sys/read_task.js";
import { extractBetweenTags } from "./utils/text.js";
import {
    updateConfCmd,
    updateFeaturesCmd,
} from "./updateconf.js";
import { useTaskExecutor } from "./tasks/usetask.js";

const db = {
    init: initDb,
    getTaskSettings,
    updatePromptfilePath,
    updateDataDirPath,
    upsertBackends,
    setDefaultBackend,
    insertFeaturesPathIfNotExists,
    insertPluginIfNotExists,
    updateFeatures,
    updateAliases,
    cleanupFeaturePaths,
    upsertFilePath,
    upsertTaskSettings,
    deleteTaskSettings,
    deleteTaskSetting,
    readFeatures,
    readFeaturePaths,
    readFeature,
    readPlugins,
    readAliases,
    readFilePath,
    readFilePaths,
    readTool,
    readFeaturesType,
    readBackends,
    readTaskSettings,
    readTaskSetting,
};

const fs = {
    openTaskSpec,
    readWorkflow,
}

const conf = {
    getConfigPath,
    processConfPath,
    readConf,
    updateConfigFile,
    createConfigFile,
    updateConfCmd,
    updateFeaturesCmd,
    confDir,
    dbPath,
}

const utils = {
    execute,
    runShellCmd,
    deleteFileIfExists,
    readTask,
    readTasksDir,
    extractBetweenTags,
    writeToClipboard,
    usePerfTimer,
}

const state = {
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
    pyShell,
    tasksSettings,
    isTaskSettingsInitialized,
    initTaskSettings,
    getTaskSettings,
    backend,
    backends,
    initBackends,
    listBackends,
    setBackend,
}

export {
    backend, db, fs, conf, utils, state,
    executeAction,
    executeTask,
    executeWorkflow,
    getTaskPrompt,
    getInputFromOptions,
    getFeatureSpec,
    extractToolDoc,
    McpClient,
    openTaskSpec,
    useTaskExecutor,
};


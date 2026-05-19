import { executeAction } from "./actions/cmd.js";
import { McpClient } from "./mcp.js";
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
import { getAgentPrompt, getInputFromOptions, openAgentSpec } from "./utils/io.js";
import { getFeatureSpec } from "./state/features.js";

import {
    updatePromptfilePath,
    updateDataDirPath,
    updateWorkspacePath,
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
    deleteWorkspace,
    upsertWorkspace,
    upsertSetting,
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
    readWorkspaces,
    readSetting,
    readSettings,
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
    agentSettings,
    isAgentSettingsInitialized,
    initAgentSettings,
    getAgentSettings
} from "./state/tasks.js";
import {
    readAgent,
    readAgentsDir,
} from "./utils/sys/read_agent.js";
import { extractBetweenTags } from "./utils/text.js";
import {
    updateConfCmd,
    updateFeaturesCmd,
} from "./updateconf.js";
import { useAgentExecutor } from "./agents/useagent.js";
import { executeAgent } from "./agents/cmd.js";

const db = {
    init: initDb,
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
    deleteWorkspace,
    upsertWorkspace,
    readWorkspaces,
    readSetting,
    readSettings,
    upsertSetting,
};

const fs = {
    openAgentSpec,
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
    readAgent,
    readAgentsDir,
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
    agentSettings,
    isAgentSettingsInitialized,
    initAgentSettings,
    getAgentSettings,
    backend,
    backends,
    initBackends,
    listBackends,
    setBackend,
}

export {
    backend, db, fs, conf, utils, state,
    executeAction,
    executeWorkflow,
    getAgentPrompt,
    getInputFromOptions,
    getFeatureSpec,
    extractToolDoc,
    McpClient,
    openAgentSpec,
    useAgentExecutor,
    updateWorkspacePath,
    executeAgent,
};


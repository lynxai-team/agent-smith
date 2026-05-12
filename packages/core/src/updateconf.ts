import path from "path";
import { confDir, processConfPath } from "./conf.js";
import { initDb } from "./db/db.js";
import { readFeaturePaths, readFilePath } from "./db/read.js";
import { cleanupFeaturePaths, updateAliases, updateDataDirPath, updateFeatures, updatePromptfilePath, upsertFilePath } from "./db/write.js";
import type { Features } from "@agent-smith/types";
import { readFeaturesDirs } from "./state/features.js";
import { readPluginsPaths } from "./state/plugins.js";
import { dataDirPath, promptfilePath } from "./state/state.js";
//import { runtimeDataError, runtimeInfo } from './user_msgs.js';
import { readUserCmd } from "./utils/sys/read_cmds.js";

async function getUserCmdsData(feats: Features): Promise<Features> {
    for (const feat of feats.cmd) {
        const cmdPath = path.join(feat.path, feat.name + "." + feat.ext);
        const { found, userCmd } = await readUserCmd(feat.name, cmdPath);
        if (found) {
            feat.variables = {
                description: userCmd.description,
                name: userCmd.name,
            }
            if (userCmd?.options) {
                feat.variables.options = userCmd.options
            }
        }
    }
    return feats
}

async function updateAllFeatures(paths: Array<string>, userFeats?: Features) {
    let feats = readFeaturesDirs(paths, true);
    feats = await getUserCmdsData(feats);
    if (userFeats?.action) {
        feats.action.push(...userFeats.action)
    }
    if (userFeats?.adaptater) {
        feats.adaptater.push(...userFeats.adaptater)
    }
    if (userFeats?.agent) {
        feats.agent.push(...userFeats.agent)
    }
    if (userFeats?.cmd) {
        feats.cmd.push(...userFeats.cmd)
    }
    if (userFeats?.task) {
        feats.task.push(...userFeats.task)
    }
    if (userFeats?.workflow) {
        feats.workflow.push(...userFeats.workflow)
    }
    if (userFeats?.skill) {
        feats.skill.push(...userFeats.skill)
    }
    updateFeatures(feats);
    updateAliases(feats);
    const deleted = cleanupFeaturePaths(paths);
    for (const el of deleted) {
        console.log("- [feature path]", el)
    }
}

async function updateFeaturesCmd(options: Record<string, any>, userFeats?: Features): Promise<any> {
    const fp = readFeaturePaths();
    const pp = await readPluginsPaths();
    const paths = [...fp, ...pp];
    updateAllFeatures(paths, userFeats)
}

async function updateConfCmd(args: Array<string>): Promise<any> {
    initDb(false, true);
    let confPath: string;
    const userProvidedConfPath = (args[0] != "conf") ? args[0] : null;
    if (userProvidedConfPath) {
        confPath = userProvidedConfPath;
        const isu = upsertFilePath("conf", confPath);
        if (isu) {
            console.log("Config path", confPath, "updated")
        }
    } else {
        // try to find a conf path in db
        const cf = readFilePath("conf");
        if (cf.found) {
            confPath = cf.path;
        } else {
            // use default conf path
            confPath = path.join(confDir, "config.yml");
            upsertFilePath("conf", confPath);
        }
    }
    const { paths, pf, dd } = await processConfPath(confPath);
    console.log("Using", confPath, "to update features");
    if (pf.length > 0) {
        updatePromptfilePath(pf);
        promptfilePath.value = pf;
    }
    if (dd.length > 0) {
        updateDataDirPath(dd);
        dataDirPath.value = dd;
    }
    updateAllFeatures(paths);
}

export {
    updateConfCmd,
    updateFeaturesCmd,
}
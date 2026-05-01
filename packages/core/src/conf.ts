import { ConfInferenceBackend, InferenceBackend, type ConfigFile } from "@agent-smith/types";
import fs from "node:fs";
import path from "node:path";
import { homedir } from 'os';
import { join } from 'path';
import yaml from "yaml";
import { runtimeError } from "./utils/user_msgs.js";
import { createDirectoryIfNotExists } from "./utils/sys/dirs.js";
import { readConf } from "./utils/sys/read_conf.js";
import { localBackends } from "./const.js";
import { deleteTaskSettings, insertFeaturesPathIfNotExists, insertPluginIfNotExists, upsertBackends, upsertTaskSettings } from "./db/write.js";
import { buildPluginsPaths } from "./state/plugins.js";
import { initTaskSettings, tasksSettings } from "./state/tasks.js";

function getConfigPath(appName: string, filename: string): { confDir: string, dbPath: string } {
    let confDir: string;
    let dbPath: string;
    if (process.platform === 'win32') {
        confDir = join(process.env.APPDATA!, appName)
        dbPath = join(process.env.APPDATA!, appName, filename);
    } else if (process.platform === 'darwin') {
        confDir = join(homedir(), 'Library', 'Application Support', appName);
        dbPath = join(homedir(), 'Library', 'Application Support', appName, filename);
    } else { // Linux, BSD, etc.
        confDir = join(homedir(), '.config', appName);
        dbPath = join(homedir(), '.config', appName, filename);
    }
    return { confDir: confDir, dbPath: dbPath }
}

const { confDir, dbPath } = getConfigPath("agent-smith", "config.db");

function updateConfigFile(conf: ConfigFile, cfp?: string): string {
    const fp = cfp ? cfp : path.join(confDir, "config.yml");
    const txt = yaml.stringify(conf);
    if (!fs.existsSync(fp)) {
        const err = `Config file ${fp} does not exist`;
        throw new Error(err)
    }
    try {
        fs.writeFileSync(fp, txt, { encoding: 'utf8' })
    } catch (e) {
        throw new Error(`Error creating config file at ${fp}: ${e}`)
    }
    return fp
}

function createConfigFile(cfp?: string): string {
    createDirectoryIfNotExists(confDir);
    const fp = cfp ? cfp : path.join(confDir, "config.yml")
    const fc: ConfigFile = {
        backends: {
            default: "llamacpp",
            llamacpp: {
                url: "http://localhost:8080/v1"
            }
        },
        promptfile: "",
    }
    const txt = yaml.stringify(fc);
    if (fs.existsSync(fp)) {
        const err = `Config file ${fp} already exists`;
        throw new Error(err)
    }
    try {
        fs.writeFileSync(fp, txt, { encoding: 'utf8' })
    } catch (e) {
        throw new Error(`Error creating config file at ${fp}: ${e}`)
    }
    return fp
}

async function processConfPath(confPath: string): Promise<{ paths: Array<string>, pf: string, dd: string }> {
    createDirectoryIfNotExists(confDir);
    const { found, data } = readConf(confPath);
    if (!found) {
        runtimeError(`Config file ${confPath} not found`);
    }
    //console.log(data)
    const allPaths = new Array<string>();
    // backends
    const backends: Record<string, InferenceBackend> = {};
    let defaultBackendName = "";
    if (data?.backends) {
        for (const [name, val] of Object.entries(data.backends)) {
            switch (name) {
                case "default":
                    const v1 = val as string;
                    defaultBackendName = v1;
                    break;
                default:
                    const v3 = val as ConfInferenceBackend;
                    let apiKey: string | undefined = undefined;
                    if (v3?.apiKey) {
                        apiKey = v3.apiKey;
                    }
                    const ib: InferenceBackend = {
                        name: name,
                        type: v3.type,
                        url: v3.url,
                        isDefault: false,
                    };
                    if (apiKey) {
                        ib.apiKey = apiKey
                    }
                    backends[name] = ib;
                    break;
            }
        }
    }
    console.log("Default backend:", defaultBackendName);
    //console.dir(backends, { depth: 4 });
    if (!Object.keys(backends).includes(defaultBackendName)) {
        throw new Error(`Undeclared default backend: ${defaultBackendName}`)
    }
    backends[defaultBackendName].isDefault = true;
    upsertBackends(Object.values(backends));
    // features and plugins from conf
    if (data?.features) {
        allPaths.push(...data.features);
        const fts = new Array<string>();
        data.features.forEach((f) => {
            if (!fts.includes(f)) {
                insertFeaturesPathIfNotExists(f);
                fts.push(f)
            }
        });
    }
    if (data?.plugins) {
        const plugins = await buildPluginsPaths(data.plugins);
        plugins.forEach((_pl) => {
            allPaths.push(_pl.path);
            insertPluginIfNotExists(_pl.name, _pl.path);
        });
    }
    if (data?.tasks) {
        initTaskSettings();
        const okTasks = new Array<string>();
        for (const [name, settings] of Object.entries(data.tasks)) {
            upsertTaskSettings(name, settings);
            okTasks.push(name);
        }
        const toDel = Object.keys(tasksSettings).filter(t => !okTasks.includes(t));
        deleteTaskSettings(toDel);
    }
    let pf = "";
    if (data?.promptfile) {
        pf = data.promptfile
    }
    let dd = "";
    if (data?.datadir) {
        dd = data.datadir
    }
    return { paths: allPaths, pf: pf, dd: dd }
}

export {
    confDir, createConfigFile, dbPath, getConfigPath, processConfPath, updateConfigFile
};

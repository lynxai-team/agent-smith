import { ToolSpec, TaskVariables, AliasType, FeatureExtension, FeatureSpec, FeatureType, ToolType, InferenceBackend } from "@agent-smith/types";
import { db } from "./db.js";

function readFeaturePaths(): Array<string> {
    const stmt = db.prepare("SELECT path FROM featurespath");
    const data = stmt.all() as Array<Record<string, any>>;
    let f = new Array<string>();
    data.forEach((row) => {
        f.push(row.path)
    });
    return f
}

function readBackends(): Record<string, InferenceBackend> {
    const stmt = db.prepare("SELECT name, type, url, apiKey, isdefault FROM backend");
    const data = stmt.all() as Array<Record<string, any>>;
    const bks: Record<string, InferenceBackend> = {};
    data.forEach((row) => {
        bks[row.name] = { name: row.name, type: row.type, url: row.url, apiKey: row.apiKey, isDefault: row.isdefault === 1 };
    });
    return bks
}

function readPlugins(): Array<Record<string, string>> {
    const stmt = db.prepare("SELECT name, path FROM plugin");
    const data = stmt.all() as Array<Record<string, any>>;
    let f = new Array<Record<string, string>>();
    data.forEach((row) => {
        f.push({ name: row.name, path: row.path })
    });
    return f
}

function readFeaturesType(type: FeatureType): Record<string, FeatureSpec> {
    //console.log(`SELECT name, path, ext, variables FROM ${type}`)
    let stmt = db.prepare(`SELECT name, path, ext, variables FROM ${type}`);
    if (["agent", "task"].includes(type)) {
        stmt = db.prepare(`SELECT name, path, ext, variables, type, category FROM ${type}`);
    }
    const data = stmt.all() as Array<Record<string, any>>;
    const res: Record<string, FeatureSpec> = {};
    data.forEach((row) => {
        const vars = row?.variables ? JSON.parse(row.variables) as TaskVariables : undefined;
        res[row.name] = {
            name: row.name,
            path: row.path,
            ext: row.ext,
            variables: vars,
        }
        if (["agent", "task"].includes(type)) {
            res[row.name].type = row.type;
            res[row.name].category = row.category;
        }
    });
    return res
}

function readFeatures(): Record<FeatureType, Record<string, FeatureSpec>> {
    const feats: Record<FeatureType, Record<string, FeatureSpec>> = {
        task: {}, action: {}, cmd: {}, workflow: {}, adaptater: {}, agent: {}
    };
    feats.agent = readFeaturesType("agent");
    feats.task = readFeaturesType("task");
    feats.action = readFeaturesType("action");
    feats.cmd = readFeaturesType("cmd");
    feats.workflow = readFeaturesType("workflow");
    feats.adaptater = readFeaturesType("adaptater");
    return feats
}

function readAliases(): Array<{ name: string, type: AliasType }> {
    const stmt = db.prepare("SELECT name, type FROM aliases");
    const data = stmt.all() as Array<Record<string, any>>;
    let f = new Array<{ name: string, type: AliasType }>();
    data.forEach((row) => {
        f.push({ name: row.name, type: row.type as AliasType })
    });
    return f
}

function readFeature(name: string, type: FeatureType): { found: boolean, feature: FeatureSpec } {
    const q = `SELECT id, name, path, ext FROM ${type} WHERE name='${name}'`;
    const stmt = db.prepare(q);
    const result = stmt.get() as Record<string, string>;
    if (result?.id) {
        return {
            found: true,
            feature: {
                name: result.name,
                path: result.path,
                ext: result.ext as FeatureExtension,
            }
        }
    }
    return { found: false, feature: {} as FeatureSpec }
}

function readTool(name: string): { found: boolean, tool: ToolSpec } {
    const q = `SELECT id, name, type, spec FROM tool WHERE name='${name}'`;
    const stmt = db.prepare(q);
    const result = stmt.get() as Record<string, string>;
    if (result?.id) {
        const tool = JSON.parse(result.spec);
        tool.type = result.type;
        return {
            found: true,
            tool: tool as ToolSpec,
        }
    }
    return { found: false, tool: {} as ToolSpec }
}

function readFilePaths(): Array<{ name: string, path: string }> {
    const stmt1 = db.prepare("SELECT name, path FROM filepath");
    const data = stmt1.all() as Array<{ name: string, path: string }>;
    let f = new Array<{ name: string, path: string }>();
    data.forEach((row) => {
        f.push({ name: row.name, path: row.path })
    });
    return f
}

function readFilePath(name: string): { found: boolean, path: string } {
    const q = `SELECT id, path FROM filepath WHERE name= ?`;
    const stmt = db.prepare(q);
    const result = stmt.get(name) as Record<string, string>;
    if (result?.id) {
        return { found: true, path: result.path }
    }
    return { found: false, path: "" }
}

function readTaskSettings(): Array<Record<string, any>> {
    const stmt1 = db.prepare("SELECT * FROM tasksettings ORDER BY name");
    const data = stmt1.all() as Array<Record<string, any>>;
    return data
}

function readTaskSetting(name: string): { found: boolean, settings: Record<string, string> } {
    const q = "SELECT * FROM tasksettings WHERE name= ?";
    const stmt = db.prepare(q);
    const result = stmt.get(name) as Record<string, string>;
    if (result?.id) {
        return { found: true, settings: result }
    }
    return { found: false, settings: {} }
}

export {
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
}
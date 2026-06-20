import type { AgentVariables, AliasType, FeatureExtension, FeatureSpec, FeatureType, InferenceBackend, SamplingPreset, ToolSpec, Workspace } from "@agent-smith/types";
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

function readFeaturesType(type: FeatureType, innerType?: string, names?: Array<string>): Record<string, FeatureSpec> {
    let q = `SELECT name, path, ext, variables FROM ${type}`;
    if (type == "agent") {
        q = `SELECT name, path, ext, variables, type, category FROM ${type}`;
    }
    if (innerType) {
        q += ` WHERE type = '${innerType}'`
    }
    if (names) {
        if (innerType) {
            q += " AND";
        } else {
            q += " WHERE";
        }
        let nqb = new Array<string>();
        names.forEach(n => nqb.push(`'${n}'`));

        q += ` name IN (${nqb.join(",")})`
    }
    //console.log("Q", q);
    let stmt = db.prepare(q);
    const data = stmt.all() as Array<Record<string, any>>;
    const res: Record<string, FeatureSpec> = {};
    data.forEach((row) => {
        const vars = row?.variables ? JSON.parse(row.variables) as AgentVariables : undefined;
        res[row.name] = {
            name: row.name,
            path: row.path,
            ext: row.ext,
            variables: vars,
        }
        if (type) {
            res[row.name].type = row.type;
            res[row.name].category = row.category;
        }
    });
    return res
}

/*function readSkill(name: string): { found: boolean, feature: FeatureSpec } {
    const q = `SELECT name, path, ext, variables FROM skill WHERE name='${name}`;
    const stmt = db.prepare(q);
    const result = stmt.get() as Record<string, string>;
    let res: FeatureSpec;
    if (result?.id) {
        const vars = result?.variables ? JSON.parse(result.variables) as Record<string, any> : {};
        res = {
            name: result.name,
            path: result.path,
            ext: result.ext as FeatureExtension,
            variables: vars,
        };
        return { found: true, feature: res }
    }
    return { found: false, feature: {} as FeatureSpec }
}*/

function readAllSkills(): Record<string, FeatureSpec> {
    const q = `SELECT name, path, ext, variables FROM skill`;
    const stmt = db.prepare(q);
    const data = stmt.all() as Array<Record<string, any>>;
    const res: Record<string, FeatureSpec> = {};
    data.forEach((row) => {
        const vars = row?.variables ? JSON.parse(row.variables) as Record<string, any> : {};
        res[row.name] = {
            name: row.name,
            path: row.path,
            ext: row.ext,
            variables: vars,
        };
    });
    return res;
}

function readSkillsFromList(names: Array<string>): Record<string, FeatureSpec> {
    if (names.length === 0) return {};
    const placeholders = names.map(() => '?').join(',');
    const q = `SELECT name, path, ext, variables FROM skill WHERE name IN (${placeholders})`;
    const stmt = db.prepare(q);
    const data = stmt.all(...names) as Array<Record<string, any>>;
    const res: Record<string, FeatureSpec> = {};
    data.forEach((row) => {
        const vars = row?.variables ? JSON.parse(row.variables) as Record<string, any> : {};
        res[row.name] = {
            name: row.name,
            path: row.path,
            ext: row.ext,
            variables: vars,
        };
    });
    return res;
}

function readFeatures(): Record<FeatureType, Record<string, FeatureSpec>> {
    const feats: Record<FeatureType, Record<string, FeatureSpec>> = {
        action: {}, cmd: {}, workflow: {}, adaptater: {}, agent: {}, skill: {}, task: {}, tasktemplate: {}
    };
    feats.agent = readFeaturesType("agent");
    feats.action = readFeaturesType("action");
    feats.cmd = readFeaturesType("cmd");
    feats.workflow = readFeaturesType("workflow");
    feats.adaptater = readFeaturesType("adaptater");
    feats.skill = readFeaturesType("skill");
    feats.skill = readFeaturesType("task");
    feats.skill = readFeaturesType("tasktemplate");
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

function readFeature(name: string, type: FeatureType, innerType?: string): { found: boolean, feature: FeatureSpec } {
    let q = `SELECT id, name, path, ext, variables FROM ${type} WHERE name='${name}'`;
    if (innerType) {
        q = q + ` AND type = '${innerType}'`
    }
    const stmt = db.prepare(q);
    const result = stmt.get() as Record<string, string>;
    if (result?.id) {
        return {
            found: true,
            feature: {
                name: result.name,
                path: result.path,
                ext: result.ext as FeatureExtension,
                variables: result.variables ? JSON.parse(result.variables) : undefined,
            }
        }
    }
    return { found: false, feature: {} as FeatureSpec }
}

function readTool(name: string): { found: boolean, tool: ToolSpec } {
    const q = `SELECT id, name, type, spec FROM tool WHERE name='${name}'`;
    const stmt = db.prepare(q);
    const result = stmt.get() as Record<string, string>;
    //console.log("db tool", result);
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

function readAgentSettings(): Array<Record<string, any>> {
    const stmt1 = db.prepare("SELECT * FROM agentsettings ORDER BY name");
    const data = stmt1.all() as Array<Record<string, any>>;
    return data
}

function readAgentSetting(name: string): { found: boolean, settings: Record<string, string> } {
    const q = "SELECT * FROM agentsettings WHERE name= ?";
    const stmt = db.prepare(q);
    const result = stmt.get(name) as Record<string, string>;
    if (result?.id) {
        return { found: true, settings: result }
    }
    return { found: false, settings: {} }
}

function readWorkspaces(): Array<Workspace> {
    const stmt1 = db.prepare("SELECT * FROM workspace ORDER BY name");
    const data = stmt1.all() as Array<Record<string, any>>;
    const wss = new Array<Workspace>();
    data.forEach(row => wss.push({ name: row.name, path: row.path, props: row.props }));
    return wss
}
function readSetting(name: string): { found: boolean, setting: string } {
    const q = "SELECT * FROM setting WHERE name= ?";
    const stmt = db.prepare(q);
    const result = stmt.get(name);
    if (result?.id) {
        return { found: true, setting: result }
    }
    return { found: false, setting: "" }
}

function readSettings(): Record<string, any> {
    const q = "SELECT name, value FROM setting";
    const stmt = db.prepare(q);
    const result: Array<Record<string, any>> = stmt.all();
    const st: Record<string, any> = {};
    result.forEach(row => st[row.name] = row.value)
    return st
}

function readSamplingPreset(name: string): { found: boolean, preset: SamplingPreset } {
    const q = "SELECT * FROM modelpreset WHERE name= ?";
    const stmt = db.prepare(q);
    const result = stmt.get(name) as Record<string, any>;
    if (result?.id) {
        return {
            found: true,
            preset: {
                name: result.name,
                model: result.model,
                max_tokens: result.max_tokens,
                top_k: result.top_k,
                top_p: result.top_p,
                min_p: result.min_p,
                temperature: result.temperature,
                repeat_penalty: result.repeat_penalty,
                presence_penalty: result.presence_penalty,
                frequency_penalty: result.frequency_penalty,
                backend: result.backend,
                chat_template_kwargs: JSON.parse(result.chat_template_kwargs),
                props: JSON.parse(result.props)
            }
        }
    }
    return { found: false, preset: {} as SamplingPreset }
}

function readSamplingPresets(): Array<SamplingPreset> {
    const stmt1 = db.prepare("SELECT * FROM modelpreset ORDER BY name");
    const data = stmt1.all() as Array<Record<string, any>>;
    const presets = new Array<SamplingPreset>();
    data.forEach(row => presets.push({
        name: row.name,
        model: row.model,
        max_tokens: row.max_tokens,
        top_k: row.top_k,
        top_p: row.top_p,
        min_p: row.min_p,
        temperature: row.temperature,
        repeat_penalty: row.repeat_penalty,
        presence_penalty: row.presence_penalty,
        frequency_penalty: row.frequency_penalty,
        backend: row.backend,
        chat_template_kwargs: JSON.parse(row.chat_template_kwargs),
        props: JSON.parse(row.props)
    }));
    return presets
}

export {
    readAgentSettings, readAliases, readBackends, readFeature, readFeaturePaths, readFeatures, readFeaturesType, readFilePath,
    readFilePaths, readPlugins, readSetting, readSettings, readSkillsFromList, readAgentSetting, readTool, readWorkspaces,
    readSamplingPreset, readSamplingPresets, readAllSkills,
    //readSkill
};

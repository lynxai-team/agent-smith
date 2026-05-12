import { extractTaskToolDocAndVariables, extractToolDoc } from "../tools.js";
import { AliasType, FeatureSpec, FeatureType, Features, InferenceBackend, TaskSettings, type Workspace } from "@agent-smith/types";
import { db } from "./db.js";

function updatePromptfilePath(pf: string) {
    const deleteStmt = db.prepare("DELETE FROM filepath WHERE name = ?");
    deleteStmt.run("promptfile");
    const stmt = db.prepare("INSERT INTO filepath (name, path) VALUES (?, ?)");
    stmt.run("promptfile", pf);
}

function updateDataDirPath(dd: string) {
    const deleteStmt = db.prepare("DELETE FROM filepath WHERE name = ?");
    deleteStmt.run("datadir");
    const stmt = db.prepare("INSERT INTO filepath (name, path) VALUES (?, ?)");
    stmt.run("datadir", dd);
}

function updateWorkspacePath(dd: string) {
    const deleteStmt = db.prepare("DELETE FROM filepath WHERE name = ?");
    deleteStmt.run("workspace");
    const stmt = db.prepare("INSERT INTO filepath (name, path) VALUES (?, ?)");
    stmt.run("workspace", dd);
}

function setDefaultBackend(name: string) {
    const updateStmt = db.prepare("UPDATE backend SET isdefault = 0 WHERE isdefault = 1");
    updateStmt.run();
    const nupdStmt = db.prepare("UPDATE backend SET isdefault = 1 WHERE name = ?")
    nupdStmt.run(name)
}

function upsertBackends(bdata: Array<InferenceBackend>): boolean {
    let hasUpdates = false;

    // Get all existing backend names
    const existingStmt = db.prepare("SELECT name FROM backend");
    const existingBackends = existingStmt.all() as Array<{ name: string }>;
    const existingNames = new Set(existingBackends.map(b => b.name));

    // Create a set of new backend names for comparison
    const newNames = new Set(bdata.map(b => b.name));

    // Delete backends that are not in the new list
    const toDelete = Array.from(existingNames).filter(name => !newNames.has(name));
    if (toDelete.length > 0) {
        const deleteStmt = db.prepare("DELETE FROM backend WHERE name = ?");
        for (const name of toDelete) {
            deleteStmt.run(name);
        }
        hasUpdates = true;
    }

    // Upsert the new backends
    for (const backend of bdata) {
        const stmt1 = db.prepare("SELECT * FROM backend WHERE name = ?");
        const result = stmt1.get(backend.name) as Record<string, any>;

        if (result?.id) {
            const updateStmt = db.prepare("UPDATE backend SET type = ?, url = ?, apiKey = ?, isdefault = ? WHERE name = ?");
            updateStmt.run(backend.type, backend.url, backend?.apiKey ?? "NULL", backend.isDefault ? 1 : 0, backend.name);
            hasUpdates = true;
        } else {
            const stmt = db.prepare("INSERT INTO backend (name,type,url,apiKey,isdefault) VALUES (?,?,?,?,?)");
            stmt.run(backend.name, backend.type, backend.url, backend?.apiKey ?? "NULL", backend.isDefault ? 1 : 0);
            hasUpdates = true;
        }
    }

    return hasUpdates;
}

function insertFeaturesPathIfNotExists(path: string): boolean {
    const stmt1 = db.prepare("SELECT * FROM featurespath WHERE path = ?");
    const result = stmt1.get(path) as Record<string, any>;
    if (result?.id) {
        return true;
    }
    const stmt = db.prepare("INSERT INTO featurespath (path) VALUES (?)");
    stmt.run(path);
    return false
}

function insertPluginIfNotExists(n: string, p: string): boolean {
    const stmt1 = db.prepare("SELECT * FROM plugin WHERE name = ?");
    const result = stmt1.get(n) as Record<string, any>;
    if (result?.id) {
        return true;
    }
    const stmt = db.prepare("INSERT INTO plugin (name, path) VALUES (?,?)");
    stmt.run(n, p);
    return false
}

function cleanupFeaturePaths(paths: Array<string>): Array<string> {
    const stmt = db.prepare("SELECT path FROM featurespath");
    const rows = stmt.all() as Array<Record<string, any>>;
    const deleted = new Array<string>();
    for (const entry of rows) {
        if (!paths.includes(entry.path)) {
            const deleteStmt = db.prepare("DELETE FROM featurespath WHERE path = ?");
            deleteStmt.run(entry.path);
            deleted.push(entry.path)
        }
    }
    return deleted
}

function _updateAlias(existingAliases: Array<string>, name: string, type: AliasType) {
    if (!existingAliases.includes(name)) {
        const insertStmt = db.prepare("INSERT INTO aliases (name, type) VALUES (?, ?)");
        insertStmt.run(name, type);
    } else {
        console.log("Can not create command alias", name, ": duplicate name")
    }
    existingAliases.push(name);
    return existingAliases
}

function updateAliases(feats: Features) {
    const deleteStmt = db.prepare("DELETE FROM aliases");
    deleteStmt.run();
    let existingAliases = new Array<string>();
    feats.agent.forEach((feat) => {
        existingAliases = _updateAlias(existingAliases, feat.name, "agent")
    });
    feats.task.forEach((feat) => {
        existingAliases = _updateAlias(existingAliases, feat.name, "task")
    });
    feats.action.forEach((feat) => {
        existingAliases = _updateAlias(existingAliases, feat.name, "action")
    });
    feats.workflow.forEach((feat) => {
        existingAliases = _updateAlias(existingAliases, feat.name, "workflow")
    });
}

function upsertAndCleanFeatures(feats: Array<FeatureSpec>, type: FeatureType): Array<FeatureSpec> {
    const stmt = db.prepare(`SELECT name FROM ${type}`);
    const rows = stmt.all() as Array<Record<string, any>>;
    const names = rows.map(row => row.name);
    // cleanup removed features
    const availableFeatsNames = feats.map((f) => f.name);
    //console.log("NAMES", names);
    //console.log("AVAILABLE", availableFeatsNames);
    const newFeatures = new Array<FeatureSpec>();
    names.forEach((name) => {
        //console.log(name, !availableFeatsNames.includes(name));
        if (!availableFeatsNames.includes(name)) {
            //console.log("DELETE", name);
            const deleteStmt = db.prepare(`DELETE FROM ${type} WHERE name = ?`);
            deleteStmt.run(name);
            console.log("-", "[" + type + "]", name);
            // check if the feature has a tool and delete if if so
            const stmt1 = db.prepare("SELECT * FROM tool WHERE name = ?");
            const result = stmt1.get(name) as Record<string, any>;
            if (result?.id) {
                const deleteStmt = db.prepare("DELETE FROM featurespath WHERE id = ?");
                deleteStmt.run(result.id);
                console.log("-", "[tool] from", type, ":", name);
            }
        }
    });
    feats.forEach((feat) => {
        if (!names.includes(feat.name)) {
            //console.log("ADD", type, feat);
            if (feat?.variables) {
                const insertStmt = db.prepare(`INSERT INTO ${type} (name, path, ext, variables) VALUES (?, ?, ?, ?)`);
                insertStmt.run(feat.name, feat.path, feat.ext, JSON.stringify(feat.variables, null, 2));
            } else {
                const insertStmt2 = db.prepare(`INSERT INTO ${type} (name, path, ext) VALUES (?, ?, ?)`);
                insertStmt2.run(feat.name, feat.path, feat.ext);
            }
            console.log("+", "[" + type + "]", feat.name, feat.path);
            newFeatures.push(feat)
        } else {
            //console.log("FFF", feat);
            if (type == "skill") {
                const updateStmt = db.prepare(`UPDATE ${type} SET variables = ? WHERE name = ?`);
                //console.log("Update skill", feat.name, feat.variables)
                updateStmt.run(JSON.stringify(feat.variables), feat.name);
            }
        }
    });
    return newFeatures
}

function updateVariablesAndInfo(name: string, type: string, variableDoc: string, itemType: string | null, itemCat: string | null) {
    const stmt1 = db.prepare(`SELECT id FROM ${type} WHERE name = ?`);
    const result = stmt1.get(name) as Record<string, any>;
    //console.log("UV res", result);
    if (!result?.id) {
        return;
    }
    const updateStmt = db.prepare(`UPDATE ${type} SET variables = ?, type = ?, category = ? WHERE id = ?`);
    //console.log("~", "task variables and info updated for", name, "/", itemType, itemCat);
    updateStmt.run(variableDoc, itemType, itemCat, result.id);
}

function updateUserCmd(feat: FeatureSpec) {
    const stmt1 = db.prepare("SELECT id FROM cmd WHERE name = ?");
    const result = stmt1.get(feat.name) as Record<string, any>;
    //console.log("UV res", result);
    if (!result?.id) {
        return;
    }
    const updateStmt = db.prepare("UPDATE cmd SET variables = ? WHERE id = ?");
    updateStmt.run(JSON.stringify(feat.variables, null, 2), result.id);
}

function upsertTool(name: string, type: FeatureType, toolDoc: string) {
    const stmt1 = db.prepare("SELECT * FROM tool WHERE name = ?");
    const result = stmt1.get(name) as Record<string, any>;
    if (result?.id) {
        // Update the existing tool
        const updateStmt = db.prepare("UPDATE tool SET spec = ?, type = ? WHERE id = ?");
        updateStmt.run(toolDoc, type, result.id);
        //console.log("~", "[tool] updated from", type, ":", name);
    } else {
        // Insert a new tool
        const stmt = db.prepare("INSERT INTO tool (name, spec, type) VALUES (?,?,?)");
        stmt.run(name, toolDoc, type);
        //console.log("+", "[tool] added from", type, ":", name);
    }
}

function updateFeatures(feats: Features) {
    //console.log("FEATS", feats);
    upsertAndCleanFeatures(feats.agent, "agent");
    feats.agent.forEach((feat) => {
        const { toolDoc, variables, type, category } = extractTaskToolDocAndVariables(feat.name, feat.ext, feat.path);
        //const { found, toolDoc } = extractToolDoc(feat.name, feat.ext, feat.path);
        //console.log(`TASK ${feat.name} TOOL DOC`, toolDoc);
        if (toolDoc.length > 0) {
            upsertTool(feat.name, "agent", toolDoc)
        }
        if (Object.keys(variables.required).length > 0 || Object.keys(variables.optional).length > 0 || type !== null || category !== null) {
            //console.log("UPDATE VARS", feat.name, ":", variables)
            updateVariablesAndInfo(feat.name, "agent", JSON.stringify(variables, null, "  "), type, category)
        }
    });
    upsertAndCleanFeatures(feats.task, "task");
    feats.task.forEach((feat) => {
        const { toolDoc, variables, type, category } = extractTaskToolDocAndVariables(feat.name, feat.ext, feat.path);
        //const { found, toolDoc } = extractToolDoc(feat.name, feat.ext, feat.path);
        //console.log(`TASK ${feat.name} TOOL DOC`, toolDoc);
        if (toolDoc.length > 0) {
            upsertTool(feat.name, "task", toolDoc)
        }
        if (Object.keys(variables.required).length > 0 || Object.keys(variables.optional).length > 0 || type !== null || category !== null) {
            //console.log("UPDATE VARS", feat.name, ":", variables)
            updateVariablesAndInfo(feat.name, "task", JSON.stringify(variables, null, "  "), type, category)
        }
    });
    upsertAndCleanFeatures(feats.action, "action");
    feats.action.forEach((feat) => {
        const { found, toolDoc } = extractToolDoc(feat.name, feat.ext, feat.path);
        //console.log(`ACTION ${feat.name} TOOL DOC`, found, toolDoc);
        if (found) {
            upsertTool(feat.name, "action", toolDoc)
        }
    });
    upsertAndCleanFeatures(feats.workflow, "workflow");
    feats.workflow.forEach((feat) => {
        const { found, toolDoc } = extractToolDoc(feat.name, feat.ext, feat.path);
        //console.log(`WORKFLOW ${feat.name} TOOL DOC`, toolDoc);
        if (found) {
            upsertTool(feat.name, "workflow", toolDoc)
        }
    });
    upsertAndCleanFeatures(feats.adaptater, "adaptater");
    upsertAndCleanFeatures(feats.cmd, "cmd");
    upsertAndCleanFeatures(feats.skill, "skill");
    feats.cmd.forEach(c => updateUserCmd(c))
}

function upsertSetting(name: string, value: any) {
    const selectStmt = db.prepare("SELECT * FROM setting WHERE name = ?");
    const result = selectStmt.get(name) as Record<string, any>;
    if (result?.id) {
        // If the exists, update 
        const q = `UPDATE setting SET value = ? WHERE name = ?`;
        const stmt = db.prepare(q);
        const updateResult = stmt.run(value, name);
        return updateResult.changes > 0;
    } else {
        // If not exists, insert it
        const insertStmt = db.prepare("INSERT INTO setting (name, value) VALUES (?, ?)");
        insertStmt.run(name, value);
        return true;
    }
}

function upsertWorkspace(workspace: Workspace): boolean {
    const selectStmt = db.prepare("SELECT * FROM workspace WHERE name = ?");
    const result = selectStmt.get(workspace.name) as Record<string, any>;
    if (result?.id) {
        // If the filepath exists, update it
        const q = `UPDATE workspace SET path = ?, props = ? WHERE name = ?`;
        const stmt = db.prepare(q);

        const updateResult = stmt.run(workspace.path, JSON.stringify(workspace.props), workspace.name);
        return updateResult.changes > 0;
    } else {
        // If the filepath does not exist, insert it
        const insertStmt = db.prepare("INSERT INTO workspace (name, path, props) VALUES (?, ?, ?)");
        insertStmt.run(workspace.name, workspace.path, JSON.stringify(workspace.props));
        return true;
    }
}

function upsertFilePath(name: string, newPath: string): boolean {
    const selectStmt = db.prepare("SELECT * FROM filepath WHERE name = ?");
    const result = selectStmt.get(name) as Record<string, any>;

    if (result?.id) {
        // If the filepath exists, update it
        const q = `UPDATE filepath SET path = ? WHERE name = ?`;
        const stmt = db.prepare(q);
        const updateResult = stmt.run(newPath, name);
        return updateResult.changes > 0;
    } else {
        // If the filepath does not exist, insert it
        const insertStmt = db.prepare("INSERT INTO filepath (name, path) VALUES (?, ?)");
        insertStmt.run(name, newPath);
        return true;
    }
}

function upsertTaskSettings(taskName: string, settings: TaskSettings): boolean {
    const selectStmt = db.prepare("SELECT * FROM tasksettings WHERE name = ?");
    const result = selectStmt.get(taskName) as Record<string, any>;
    if (result?.id) {
        const qparams = new Array<string>();
        const qvalues = new Array<string | number>();
        if (settings?.model) {
            qparams.push("model = ?");
            qvalues.push(settings.model)
        }
        if (settings?.ctx) {
            qparams.push("ctx = ?");
            qvalues.push(settings.ctx)
        }
        if (settings?.max_tokens) {
            qparams.push("maxtokens = ?");
            qvalues.push(settings.max_tokens)
        }
        if (settings?.top_k) {
            qparams.push("topk = ?");
            qvalues.push(settings.top_k)
        }
        if (settings?.top_p) {
            qparams.push("topp = ?");
            qvalues.push(settings.top_p)
        }
        if (settings?.min_p) {
            qparams.push("minp = ?");
            qvalues.push(settings.min_p)
        }
        if (settings?.temperature) {
            qparams.push("temperature = ?");
            qvalues.push(settings.temperature)
        }
        if (settings?.repeat_penalty) {
            qparams.push("repeat = ?");
            qvalues.push(settings.repeat_penalty)
        }
        if (settings?.backend) {
            qparams.push("backend = ?");
            qvalues.push(settings.backend)
        }
        const q = `UPDATE tasksettings SET ${qparams.join(", ")} WHERE name = ?`;
        //console.log("Q", q);
        const stmt = db.prepare(q);
        const updateResult = stmt.run(...qvalues, taskName);
        return updateResult.changes > 0;
    } else {
        const qnames = new Array<string>();
        const qvalues = new Array<string | number>();
        if (settings?.model) {
            qnames.push("model");
            qvalues.push(settings.model)
        }
        if (settings?.ctx) {
            qnames.push("ctx");
            qvalues.push(settings.ctx)
        }
        if (settings?.max_tokens) {
            qnames.push("max_tokens");
            qvalues.push(settings.max_tokens)
        }
        if (settings?.top_k) {
            qnames.push("top_k");
            qvalues.push(settings.top_k)
        }
        if (settings?.top_p) {
            qnames.push("top_p");
            qvalues.push(settings.top_p)
        }
        if (settings?.min_p) {
            qnames.push("min_p");
            qvalues.push(settings.min_p)
        }
        if (settings?.temperature) {
            qnames.push("temperature");
            qvalues.push(settings.temperature)
        }
        if (settings?.repeat_penalty) {
            qnames.push("repeat_penalty");
            qvalues.push(settings.repeat_penalty)
        }
        if (settings?.presence_penalty) {
            qnames.push("presence_penalty");
            qvalues.push(settings.presence_penalty)
        }
        if (settings?.frequency_penalty) {
            qnames.push("frequency_penalty");
            qvalues.push(settings.frequency_penalty)
        }
        if (settings?.backend) {
            qnames.push("backend");
            qvalues.push(settings.backend)
        }
        const nq = new Array<string>("?");
        qnames.forEach(n => nq.push("?"));
        const q = `INSERT INTO tasksettings (name, ${qnames.join(", ")}) VALUES (${nq.join(", ")})`;
        //console.log(q);
        //console.log("VALs", qvalues);
        const insertStmt = db.prepare(q);
        insertStmt.run(taskName, ...qvalues);
        return true;
    }
}

function deleteWorkspace(name: string) {
    const deleteStmt = db.prepare("DELETE FROM workspace WHERE name = ?");
    deleteStmt.run(name);
}

function deleteTaskSettings(settings: Array<string>) {
    settings.forEach(s => {
        const deleteStmt = db.prepare("DELETE FROM tasksettings WHERE name = ?");
        deleteStmt.run(s);
    })
}

function deleteTaskSetting(name: string) {
    const deleteStmt = db.prepare("DELETE FROM tasksettings WHERE name = ?");
    deleteStmt.run(name);
}

export {
    updatePromptfilePath,
    updateWorkspacePath,
    updateDataDirPath,
    upsertBackends,
    upsertSetting,
    upsertWorkspace,
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
}

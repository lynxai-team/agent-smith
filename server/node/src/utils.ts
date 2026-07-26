import { db, conf } from "@agent-smith/core";
import type { ConfigFile } from "@agent-smith/types";

function getConfig(): { found: boolean, conf: ConfigFile, path: string } {
    const fp = db.readFilePaths();
    let confFilePath = "";
    //let promptFilePath = "";
    for (const p of fp) {
        if (p.name == "conf") {
            confFilePath = p.path;
            break
        }
    }
    if (confFilePath == "") {
        return { found: false, conf: {}, path: "" }
    }
    const c = conf.readConf(confFilePath);
    return { found: c.found, conf: c.data, path: confFilePath }
}

function createAwaiter<T>() {
    let resolveFn: (value: T) => void;
    let rejectFn: (reason?: any) => void;

    const promise = new Promise<T>((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
    });

    return {
        promise,
        resolve: resolveFn!,
        reject: rejectFn!
    };
}

const excludedTaskTypes = ["app", "workflow", "terminal"];

export {
    getConfig,
    createAwaiter,
    excludedTaskTypes,
}
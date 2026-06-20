import type { AgentInferenceOptions } from "@agent-smith/types";

function parsePath(path: string, options: AgentInferenceOptions & Record<string, any>) {
    // check required args
    const location = options?.variables?.path ?? options?.variables?.workspace;
    if (!location) {
        return { ok: false, msg: "[Error]: missing path or workspace parameter" };
    }
    let requestedPath = path;
    if (path.startsWith("./")) {
        requestedPath = process.cwd() + path.slice(2);
    }
    let ok = false;
    let fp;
    //console.log("PPA", args);
    //console.log("PPO", options);
    // check for workspace
    if (options?.variables?.workspace) {
        fp = requestedPath.replace("/workspace", options.variables.workspace);
        ok = true;
    }
    // check for authorized paths if no workspace
    else if (options?.variables?.path) {
        const aps = options.variables.path.split(",");
        for (const ap of aps) {
            const authorizedPath = [".", "./"].includes(ap) ? process.cwd() : ap;
            //console.log("Auth path", authorizedPath);
            if (requestedPath.startsWith(authorizedPath)) {
                fp = requestedPath;
                ok = true;
                break;
            }
        }
    }
    if (!fp) {
        throw new Error("parse path: no fp " + path)
    }
    if (!ok) {
        return { ok: false, msg: "[Error]: unauthorized file path" };
    }
    return { ok: true, msg: fp };
}

export {
    parsePath,
}
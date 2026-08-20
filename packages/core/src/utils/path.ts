import * as fs from 'fs';
import path from "path";

function parsePath(args: Record<string, any>, options: Record<string, any>) {
    // check required args
    const location = options?.variables?.workspace;
    if (!location) {
        return { ok: false, msg: "[Error]: missing the workspace parameter" };
    }
    if (!args?.path) {
        return { ok: false, msg: "[Error]: provide a file path argument" };
    }
    if (!args.path.startsWith("/workspace")) {
        return { ok: false, msg: "[Error]: the file path must be absolute and start with /workspace" };
    }
    let requestedPath = args.path;
    let ok = false;
    let fp;
    //console.log("PPA", args);
    //console.log("PPO", options);
    // check for workspace
    if (options?.variables?.workspace) {
        fp = requestedPath.replace("/workspace", location);
        ok = true;
    }
    if (!ok) {
        return { ok: false, msg: "[Error]: unauthorized file path" };
    }
    return { ok: true, msg: fp };
}

export {
    parsePath,
};

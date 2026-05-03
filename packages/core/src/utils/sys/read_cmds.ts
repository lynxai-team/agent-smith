import { pathToFileURL } from 'url';
import { runtimeWarning } from "../user_msgs.js";
import type { UserCmdDef } from "@agent-smith/types";

async function readCmd(name: string, cmdPath: string): Promise<UserCmdDef | null> {
    const url = pathToFileURL(cmdPath).href;
    let _cmd: UserCmdDef;
    try {
        const mod = await import(/* @vite-ignore */ url);
        _cmd = mod.cmd;
    }
    catch (e) {
        runtimeWarning(`command ${name} not found at ${cmdPath}, ${e}`);
        return null
    }
    if (!_cmd) { throw new Error("no cmd") }
    return _cmd
}

async function readUserCmd(name: string, cmdPath: string): Promise<{ found: boolean, userCmd: UserCmdDef }> {
    const url = pathToFileURL(cmdPath).href;
    try {
        const mod = await import(/* @vite-ignore */ url);
        const cmdMod = mod.cmd;
        const uc: UserCmdDef = {
            name: cmdMod.name,
            description: cmdMod.description,
            run: cmdMod.run,
            options: cmdMod?.options ? cmdMod.options : undefined,
        }
        return { found: true, userCmd: uc }
    }
    catch (e) {
        runtimeWarning(`command ${name} not found at ${cmdPath}, ${e}`);
        return { found: false, userCmd: { name: "", description: "", run: async (a, b) => null } }
    }
}

export {
    readCmd,
    readUserCmd,
}
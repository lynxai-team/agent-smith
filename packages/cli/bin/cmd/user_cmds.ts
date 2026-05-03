import type { Features } from "@agent-smith/types";
import path from "path";
import { readUserCmd } from "./read_cmds.js";

async function getUserCmdsData(feats: Features): Promise<Features> {
    for (const feat of feats.cmd) {
        const cmdPath = path.join(feat.path, feat.name + "." + feat.ext);
        const { found, userCmd } = await readUserCmd(feat.name, cmdPath);
        console.log("USR CMD", userCmd);
        if (found) {
            feat.variables = {
                description: userCmd.description,
                name: userCmd.name,
            }
            if (userCmd?.options) {
                feat.variables.options = userCmd.options
            }
        } else {
            throw new Error(`user command ${feat.name} not found at ${cmdPath}`)
        }
    }
    return feats
}

export {
    getUserCmdsData,
}
/*
# tool
name: load-skill
description: read a given skill
arguments:
    name:
        description: the name of the skill to load
        required: true
*/
import { default as fm } from "front-matter";
import { readFeature } from "../../db/read.js";
import { readFile } from "../../utils/sys/read.js";
import { runtimeDataError } from "../../utils/user_msgs.js";

function action(args, options) {
    let sb = "";
    let errMsg = "";
    if (!args?.name) {
        errMsg = `loading skill: provide a skill name`;
    }
    const { found, feature } = readFeature(args.name, "skill");
    if (!found) {
        errMsg = `skill ${args.name} not found`;
    }
    if (errMsg) {
        if (options?.onError) {
            options.onError(errMsg, "run-worker");
        } else {
            runtimeDataError(errMsg);
        }
    }
    const fc = readFile(feature.path);
    const data = fm(fc);
    sb = data.body;
    return sb;
}

export {
    action,
}


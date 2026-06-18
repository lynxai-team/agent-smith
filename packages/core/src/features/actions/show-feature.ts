/*
# tool
name: show-feature
description: 'only use this to show the details of an Agent Smith feature: agent, action, adaptater, skill, command or workflow'
arguments:
    name:
        description: the feature name
        required: true
    type:
        description: 'the feature type: agent, action, adaptater, skill, command or workflow'
        required: true
*/

import type { FeatureType } from "@agent-smith/types";
import { getFeatureSpec } from "../../main.js";
import { readFile } from "../../utils/sys/read.js";

async function action(args: Record<string, any>, options: Record<string, any>) {
    //console.log("NA", args);
    //console.log("NO", options);
    const { found, path } = getFeatureSpec(args.name, args.type as FeatureType);
    if (!found) {
        return `feature ${args.name} of type ${args.type} not found`
    }
    const content = readFile(path);
    return JSON.stringify(content)
}

export {
    action,
}
import { default as path } from "path";
import { readFeaturesDir } from "../utils/sys/read_features.js";
import { FeatureExtension, FeatureType, Features } from "@agent-smith/types";
import { readFeature } from "../db/read.js";

function readFeaturesDirs(featuresPaths: Array<string>, isverbose = false): Features {
    const feats: Features = {
        task: [],
        action: [],
        cmd: [],
        workflow: [],
        adaptater: [],
        agent: [],
        skill: [],
    };
    featuresPaths.forEach((dir: string) => {
        if (isverbose) {
            console.log("Reading feats in", dir);
        }
        const _f = readFeaturesDir(dir);
        _f.agent.forEach((item) => feats.agent.push(item));
        _f.task.forEach((item) => feats.task.push(item));
        _f.action.forEach((item) => feats.action.push(item));
        _f.cmd.forEach((item) => feats.cmd.push(item));
        _f.workflow.forEach((item) => feats.workflow.push(item));
        _f.adaptater.forEach((item) => feats.adaptater.push(item));
        _f.skill.forEach((item) => feats.skill.push(item));
    });
    return feats
}

function getFeatureSpec(name: string, type: FeatureType): { found: boolean, path: string, ext: FeatureExtension, variables?: Record<string, any> } {
    const { found, feature } = readFeature(name, type);
    if (!found) {
        return { found: false, path: "", ext: "yml", variables: {} }
    }
    const f = path.join(feature.path, name + "." + feature.ext);
    return { found: true, path: f, ext: feature.ext, variables: feature?.variables }
}

export {
    readFeaturesDirs,
    getFeatureSpec,
}
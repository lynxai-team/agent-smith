import { ActionExtension, AdaptaterExtension, CmdExtension, Features, TaskExtension, WorkflowExtension, type AgentExtension, type SkillExtension } from "@agent-smith/types";
import { default as fs } from "fs";
import { default as path } from "path";
import { default as fm } from "front-matter";
import { readFile } from "./read.js";
import { runtimeDataError } from "../user_msgs.js";

function _readDir(dir: string, ext: Array<string>): Array<string> {
    const fileNames = new Array<string>;
    fs.readdirSync(dir).forEach((filename) => {
        const filepath = path.join(dir, filename);
        //console.log("F", filepath);
        const isDir = fs.statSync(filepath).isDirectory();
        if (!isDir) {
            if (ext.includes(path.extname(filename))) {
                fileNames.push(filename);
            }
        }
    });
    return fileNames
}

function _readSkills(dir: string): Array<{ name: string, path: string, info: { name: string, description: string } }> {
    const dirs = new Array<{ name: string, path: string, info: { name: string, description: string } }>();
    fs.readdirSync(dir).forEach((p) => {
        const isDir = fs.statSync(path.join(dir, p)).isDirectory();
        const skp = path.join(dir, p, "SKILL.md");
        const fc = readFile(skp);
        const data = fm<Record<string, any>>(fc);
        //console.log("FM DATA", data);
        if (!data.attributes?.name) {
            runtimeDataError(`error in skill ${p}: missing name`)
        }
        if (!data.attributes?.description) {
            runtimeDataError(`error in skill ${p}: missing description`)
        }
        //console.log("SKP", skp);
        if (isDir) {
            dirs.push({ name: p, path: skp, info: { name: data.attributes.name, description: data.attributes.description } })
        }
    });
    return dirs
}

function readFeaturesDir(dir: string): Features {
    const feats: Features = {
        task: [],
        action: [],
        cmd: [],
        workflow: [],
        adaptater: [],
        agent: [],
        skill: [],
    }
    let dirpath = path.join(dir, "tasks");
    if (fs.existsSync(dirpath)) {
        const data = _readDir(dirpath, [".yml"]);
        data.forEach((filename) => {
            const parts = filename.split(".");
            const ext = parts.pop()!;
            const name = parts.join("");
            feats.task.push({
                name: name,
                path: path.join(dirpath),
                ext: ext as TaskExtension,
            })
        });
    }
    dirpath = path.join(dir, "agents");
    if (fs.existsSync(dirpath)) {
        const data = _readDir(dirpath, [".yml"]);
        data.forEach((filename) => {
            const parts = filename.split(".");
            const ext = parts.pop()!;
            const name = parts.join("");
            feats.agent.push({
                name: name,
                path: path.join(dirpath),
                ext: ext as AgentExtension,
            })
        });
    }
    dirpath = path.join(dir, "workflows");
    if (fs.existsSync(dirpath)) {
        const data = _readDir(dirpath, [".yml"]);
        data.forEach((filename) => {
            const parts = filename.split(".");
            const ext = parts.pop()!;
            const name = parts.join("");
            feats.workflow.push({
                name: name,
                path: path.join(dirpath),
                ext: ext as WorkflowExtension,
            })
        });
    }
    dirpath = path.join(dir, "actions")
    if (fs.existsSync(dirpath)) {
        const data = _readDir(dirpath, [".yml", ".js", ".py"]);
        data.forEach((filename) => {
            const parts = filename.split(".");
            const ext = parts.pop()!;
            const name = parts.join("");
            feats.action.push({
                name: name,
                path: path.join(dirpath),
                ext: ext as ActionExtension,
            })
        });
    }
    dirpath = path.join(dir, "adaptaters");
    if (fs.existsSync(dirpath)) {
        const data = _readDir(dirpath, [".js"]);
        data.forEach((filename) => {
            const parts = filename.split(".");
            const ext = parts.pop()!;
            const name = parts.join("");
            feats.adaptater.push({
                name: name,
                path: path.join(dirpath),
                ext: ext as AdaptaterExtension,
            })
        });
    }
    dirpath = path.join(dir, "cmds");
    if (fs.existsSync(dirpath)) {
        const data = _readDir(dirpath, [".js"]);
        data.forEach((filename) => {
            const parts = filename.split(".");
            const ext = parts.pop()!;
            const name = parts.join("");
            feats.cmd.push({
                name: name,
                path: path.join(dirpath),
                ext: ext as CmdExtension,
            })
        });
    }
    dirpath = path.join(dir, "skills");
    if (fs.existsSync(dirpath)) {
        const data = _readSkills(dirpath);
        data.forEach((s) => {
            feats.skill.push({
                name: s.name,
                path: s.path,
                ext: "md",
                variables: s.info,
            })
        });
    }
    return feats
}

export { readFeaturesDir }
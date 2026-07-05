/*
# tool
name: load-task
description: load a task into the workspace before executing it
arguments:
    name:
        description: the name of the task to load
        required: true
    destinationpath:
        description: "the path where to load the task: default: /workspace/.agents/tasks. Use only if the user requests a specific path"
*/
import { readFeature } from "../../db/read.js";
import { runtimeDataError } from "../../utils/user_msgs.js";
import { parsePath } from "../../utils/path.js";
import fs from 'fs/promises';
import path from 'path';
import { init } from "../../state/state.js";
import { state } from "../../main.js";

async function copyDirectory(source: string, destination: string): Promise<boolean> {
    // Check if destination directory already exists
    try {
        const stat = await fs.stat(destination);
        if (stat.isDirectory()) {
            return false;
        }
    } catch {
        // Directory doesn't exist, proceed with creation
    }

    // Create destination directory if it doesn't exist
    await fs.mkdir(destination, { recursive: true });
    // Read all items in source directory
    const entries = await fs.readdir(source, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            // Recursively copy subdirectories
            await copyDirectory(srcPath, destPath);
        } else {
            // Copy files
            await fs.copyFile(srcPath, destPath);
        }
    }
    return true;
}


export async function listDirectoriesOnly(dirPath: string): Promise<string[]> {
    try {
        const stat = await fs.stat(dirPath);
        if (!stat.isDirectory()) {
            return [];
        }
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        return entries
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
    } catch {
        return [];
    }
}

async function action(args: Record<string, any>, options: Record<string, any>) {
    if (!state.isStateReady) {
        await init();
    }
    let errMsg = "";
    if (!args?.name) {
        errMsg = `loading task: provide a task name`;
    }
    let destDir: string;
    if (args?.destinationpath) {
        const { ok, msg } = parsePath(args.destinationpath, options);
        if (!ok) {
            throw new Error(msg)
        }
        destDir = msg;
    } else {
        const { ok, msg } = parsePath("/workspace/.agents/tasks", options);
        if (!ok) {
            throw new Error(msg)
        }
        destDir = msg;
    }
    //console.log("DEST DIR", parsePath(destDir, options));
    const wsPath = path.join(destDir.replace(options.variables.workspace, "/workspace"), args.name);
    // check task in destDir
    const tasks = await listDirectoriesOnly(destDir);
    if (tasks.includes(args.name)) {
        return "The task is available for you in the " + wsPath + " directory"
    }
    // check task in db
    const { found, feature } = readFeature(args.name, "task");
    if (!found) {
        errMsg = `task ${args.name} not found`;
    }
    if (errMsg) {
        if (options?.onError) {
            options.onError(errMsg, "load-task");
        } else {
            runtimeDataError(errMsg);
            return "[Error]: the task " + args.name + " can not be found"
        }
    }
    const created = await copyDirectory(feature.path, path.join(destDir, args.name));
    if (!created) {
        return "The task already exists in the " + wsPath + " directory"
    }
    return "The task is available for you in the " + wsPath + " directory"
}

export {
    action,
}


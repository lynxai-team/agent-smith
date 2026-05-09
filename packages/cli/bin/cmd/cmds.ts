import colors from "ansi-colors";
import { Command, Option } from 'commander';
import path from "path";
import YAML from 'yaml';
import { db, conf, utils, state, getFeatureSpec } from "@agent-smith/core";
import type { FeatureSpec, FeatureType } from '@agent-smith/types';
import { parseCommandArgs } from "../utils.js";
import { readCmd } from "./read_cmds.js";
import { runtimeDataError } from "../user_msgs.js";
import { allOptions, displayOptions, inferenceOptions, ioOptions } from "../options.js";
import { runMode } from "../state.js";

async function initUserCmds(cmdFeats: Record<string, FeatureSpec>, program: Command): Promise<Array<Command>> {
    const features = Object.values(cmdFeats);
    const usrCmds: Array<Command> = [];
    for (const feat of features) {
        //console.log("Init cmd", feat);
        const hasVariables = feat?.variables ? true : false;
        const vars = hasVariables ? feat.variables as Record<string, any> : {};
        let desc = "";
        let fullName = "";
        if (hasVariables) {
            desc = vars.description;
            fullName = vars.name;
        } else {
            throw new Error(`user command ${feat.name}: provide a name and description`)
        }
        //console.log("F", feat);
        // @ts-ignore
        const cmd = program.command(fullName)
            .description(desc)
            .action(async (...args: Array<any>) => {
                const ca = parseCommandArgs(args);
                const cmdPath = path.join(feat.path, feat.name + "." + feat.ext);
                const c = await readCmd(feat.name, cmdPath);
                if (!c) {
                    runtimeDataError(`can not import command ${feat.name}`);
                    throw new Error()
                }
                await c.run(ca.args, ca.options)
            });
        if (hasVariables) {
            if (vars?.options) {
                for (const opt of (vars.options as Array<Array<string>>)) {
                    if (Array.isArray(opt)) {
                        cmd.addOption(new Option(opt[0], opt[1]));
                    } else {
                        // predefined option
                        switch (opt) {
                            case "all":
                                allOptions.forEach(o => cmd.addOption(o));
                                break;
                            case "display":
                                displayOptions.forEach(o => cmd.addOption(o));
                                break
                            case "inference":
                                inferenceOptions.forEach(o => cmd.addOption(o));
                                break
                            case "io":
                                ioOptions.forEach(o => cmd.addOption(o));
                            default:
                                break;
                        }
                    }

                }
            }
        }
        usrCmds.push(cmd)
    }
    //console.log("USRCMDS", usrCmds.map(c => c.name()))
    return usrCmds
}

async function resetDbCmd(): Promise<any> {
    if (runMode.value == "cli") {
        console.log("This command can not be run in cli mode")
        return
    }
    utils.deleteFileIfExists(conf.dbPath);
    console.log("Config database reset ok. Run the conf command to recreate it")
}

async function processTasksCmd(args: Array<string>, options: Record<string, any>) {
    if (options?.conf) {
        if (!state.isTaskSettingsInitialized.value) {
            state.initTaskSettings()
        }
        //console.log("PTS", tasksSettings);
        console.log(YAML.stringify({ "tasks": state.tasksSettings }));
    } else {
        const ts = Object.keys(db.readFeaturesType("task")).sort();
        console.table(ts)
    }
}

async function processTaskCmd(args: Array<string>, options: Record<string, any>): Promise<any> {
    //console.log("TASK OPTS", options);
    if (args.length == 0) {
        console.warn("Provide a task name");
        return
    }
    const { found, path } = getFeatureSpec(args[0], "task" as FeatureType);
    if (!found) {
        console.warn(`Task ${args[0]} not found`)
        return
    }
    if (options?.reset) {
        db.deleteTaskSetting(args[0]);
        console.log("Task", args[0], "reset ok")
        return
    }
    //console.log("RT", path)
    const res = utils.readTask(path);
    if (!res.found) {
        throw new Error(`Task ${args[0]}, ${path} not found`)
    }
    //const ts = JSON.parse(res.ymlTask);
    console.log(res.ymlTask);
    if (Object.keys(options).length > 0) {
        db.upsertTaskSettings(args[0], options);
    }
    const s = db.readTaskSetting(args[0]);
    if (s.found) {
        const sts = s.settings;
        delete sts.id;
        delete sts.name;
        const display: Record<string, any> = {}
        for (const [k, v] of Object.entries(sts)) {
            if (v) {
                display[k] = v
            }
        }
        console.log(colors.dim("Settings") + ":", display);
    }
    //console.log(JSON.stringify(ts, null, "  "));
}

export {
    initUserCmds,
    processTaskCmd,
    processTasksCmd,
    resetDbCmd,
};


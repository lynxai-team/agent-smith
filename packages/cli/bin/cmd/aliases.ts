import { Command } from "commander";
import { allOptions } from "../options.js";
import { executeWorkflowCmd, executeAgentCmd } from "./features.js";
import type { AliasType, FeatureSpec, FeatureType } from "@agent-smith/types";

function initCommandsFromAliases(program: Command, aliases: {
    name: string;
    type: AliasType;
}[],
    features: Record<FeatureType, Record<string, FeatureSpec>>
): Command {
    aliases.forEach((alias) => {
        //console.log("A", alias)
        switch (alias.type) {
            case "agent":
                const agcmd = program.command(`${alias.name} [prompt_and_vars...]`)
                    .description("agent: " + alias.name)
                    .action(async (...args: Array<any>) => {
                        await executeAgentCmd(alias.name, args);
                    });
                allOptions.forEach(o => agcmd.addOption(o));
                //console.log("TVARS", alias.name, features.task[alias.name]?.variables)
                if (features.agent[alias.name]?.variables) {
                    const rtv = features.agent[alias.name].variables?.required;
                    if (rtv) {
                        for (const name of Object.keys(rtv)) {
                            agcmd.option(`--${name} <value>`)
                        }
                    }
                    const otv = features.agent[alias.name].variables?.optional;
                    if (otv) {
                        for (const name of Object.keys(otv)) {
                            agcmd.option(`--${name} <value>`)
                        }
                    }
                }
                break;
            /*case "action":
                const acmd = program.command(`${alias.name} [args...]`)
                    .description("action: " + alias.name)
                    .action(async (...args: Array<any>) => {
                        await executeActionCmd(alias.name, args)
                    });
                allOptions.forEach(o => acmd.addOption(o));
                break;*/
            case "workflow":
                const wcmd = program.command(`${alias.name} [args...]`)
                    .description("workflow: " + alias.name)
                    .action(async (...args: Array<any>) => {
                        await executeWorkflowCmd(alias.name, args)

                    });
                allOptions.forEach(o => wcmd.addOption(o));
        }
    });
    return program
}

export {
    initCommandsFromAliases,
}
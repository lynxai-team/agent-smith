import { Command, Option } from "commander";
import { conf, state } from "@agent-smith/core";
import { parseCommandArgs } from "../utils.js";
import { processAgentCmd, processAgentsCmd, recreateDbCmd, resetDbCmd } from "./cmds.js";
import { displayOptions, inferenceOptions } from "../options.js";

function initBaseCommands(program: Command): Command {
    /*program.command("ping")
        .description("ping inference servers")
        .action(async (...args: Array<any>) => { console.log("Found working inference server(s):", await initAgent(initRemoteBackends())) });*/
    program.command("exit")
        .description("exit the cli")
        .action(() => process.exit(0));
    const agentsCmd = program.command("agents")
        .description("list all the agents")
        .action(async (...args: Array<any>) => {
            const ca = parseCommandArgs(args);
            await processAgentsCmd(ca.args, ca.options)
        });
    agentsCmd.addOption(
        new Option("-c, --conf", "output the tasks config")
    )
    const agentCmd = program.command("agent <agent>")
        .description("view an agent")
        .action(async (...args: Array<any>) => {
            const ca = parseCommandArgs(args);
            await processAgentCmd(ca.args, ca.options)
        });
    inferenceOptions.forEach(o => agentCmd.addOption(o));
    agentCmd.addOption(new Option("--reset", "reset the task config to the original"));
    program.command("backend <name>")
        .description("set the default backend")
        .action(async (...args: Array<any>) => {
            const ca = parseCommandArgs(args);
            await state.setBackend(ca.args[0])
        });
    program.command("backends")
        .description("list the available backends")
        .action(async (...args: Array<any>) => {
            await state.listBackends()
        });
    const updateCmd = program.command("update")
        .description("update the available features: run this after adding a new feature")
        .action(async (...args: Array<any>) => {
            const ca = parseCommandArgs(args);
            await conf.updateFeaturesCmd(ca.options)
        });
    displayOptions.forEach(o => updateCmd.addOption(o));
    program.command("conf <path>")
        .description("process config file")
        .action(async (...args: Array<any>) => {
            const ca = parseCommandArgs(args);
            await conf.updateConfCmd(ca.args)
        });
    program.command("reset")
        .description("reset the config database")
        .action(async (...args: Array<any>) => {
            await resetDbCmd()
        });
    program.command("regendb")
        .description("regenerate the database from the current registered config file")
        .action(async (...args: Array<any>) => {
            await recreateDbCmd()
        });
    return program
}



export {
    initBaseCommands
};

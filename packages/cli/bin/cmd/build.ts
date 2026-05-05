import { input } from "@inquirer/prompts";
import type { AgentInferenceOptions, InferenceOptions } from "@agent-smith/types";
import { Command } from "commander";
import { query } from "../cli.js";
import { db, type McpClient } from "@agent-smith/core";
import type { Agent } from "@agent-smith/agent";
import { isChatMode, runMode, chatInferenceParams } from "../state.js";
import { initBaseCommands } from "./base.js";
import { initCommandsFromAliases } from "./aliases.js";
import { initUserCmds } from "./cmds.js";

const program = new Command();

async function chat(options: AgentInferenceOptions, agent: Agent, mcpServers: Array<McpClient>) {
    //console.log("CHAT AGENT", agent);
    const data = { message: '>', default: "" };
    const prompt = await input(data);
    if (prompt == "/q") {
        isChatMode.value = false;
        if (runMode.value == "cmd") {
            process.exit(0)
        } else {
            mcpServers.forEach(async (s) => await s.stop());
            await query(program)
        }
    }
    //console.log("CHAT HIST", agent.history);
    //options.history = undefined;
    //console.log("RUN W PROMPT", prompt);
    options.params = chatInferenceParams;
    await agent.run(prompt, options);
    console.log();
    await chat(options, agent, mcpServers);
}

async function buildCmds(): Promise<Command> {
    //program.allowUnknownOption(true);
    //const perf = usePerfTimer();
    initBaseCommands(program);
    //perf.measure("initBaseCommands");
    const aliases = db.readAliases();
    //perf.measure("readAliases");
    const feats = db.readFeatures();
    //perf.measure("readFeatures");
    initCommandsFromAliases(program, aliases, feats);
    //perf.measure("initCommandsFromAliases");
    await initUserCmds(feats.cmd, program);
    //perf.measure("initUserCmds");
    //perf.measure("cmds for each");
    //perf.final("buildCmds");
    return program
}

async function parseCmd(program: Command) {
    program.name('Agent Smith terminal client');
    program.description('Terminal agents toolkit');
    await program.parseAsync();
    //console.log("CMD END");
    //exit(0)
    /*if (isChatMode.value) {
        await chat(program)
    }*/
}

export {
    buildCmds,
    chat,
    parseCmd, program
};


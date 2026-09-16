#!/usr/bin/env node
import { argv } from 'process';
import { query } from "./cli.js";
import { resetDbCmd } from './cmd/cmds.js';
import { state, conf } from "@agent-smith/core"
import { isChatMode, runMode } from './state.js';
import { buildCmds, parseCmd } from './cmd/build.js';

async function main() {
    //const perf = usePerfTimer();
    const nargs = argv.length;
    if (nargs == 2) {
        runMode.value = "cli";
    }
    else if (nargs >= 3) {
        if (argv[2] == "conf") {
            await conf.updateConfCmd(argv.slice(-1));
            return
        } else if (argv[2] == "reset") {
            await resetDbCmd()
            return
        }
    }
    //perf.measure("base");
    if (argv[2] == "init") {
        await state.init(true);
    } else {
        await state.init();
    }
    //perf.measure("init");
    const program = await buildCmds();
    //perf.measure("buildCmds");
    //perf.final("index start");
    // @ts-ignore
    program.hook('preAction', async (thisCommand, actionCommand) => {
        const options = actionCommand.opts();
        //console.log("POPTS", options)
        //const v = options?.clipboardOutput !== undefined;
        if (options?.chat === true) {
            isChatMode.value = true
        }
        if (options?.clipboardInput !== undefined) {
            state.inputMode.value = "clipboard"
        }
        if (options?.inputFile !== undefined) {
            state.inputMode.value = "promptfile"
        }
        if (options?.markdownOutput !== undefined) {
            state.formatMode.value = "markdown"
        }
        if (options?.clipboardOutput !== undefined) {
            state.outputMode.value = "clipboard"
        }
    });
    switch (runMode.value) {
        case "cli":
            await query(program)
            break;
        default:
            await parseCmd(program);
            //console.log("PARSE CMD END")
            break;
    }
    //console.log("END");
}

(async () => {
    await main();
})();
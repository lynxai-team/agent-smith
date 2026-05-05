import { input } from '@inquirer/prompts';
import { chat } from './cmd/build.js';
import { isChatMode } from './state.js';
import { Command } from 'commander/typings/index.js';
import { Agent } from '@agent-smith/agent';
import { state } from '@agent-smith/core';

async function query(program: Command) {
    const data = { message: "$", default: "" };
    const q = await input(data);
    //console.log("QUERY", q);
    const args = q.split(" ")
    await program.parseAsync(args, { from: "user" });
    /*if (isChatMode.value) {
        const agent = new Agent({ lm: state.backend.value!, name: "chat" })
        await chat({}, agent, [])
    }*/
    await query(program)
}

export { query }

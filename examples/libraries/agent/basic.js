#!/usr/bin/env node
import { Agent, Lm } from "../../../packages/agent/dist/main.js";

const _prompt = "Give me a short list of the planets names in the solar system";
const model = "qwen4b";

async function main() {
    const lm = new Lm({
        serverUrl: "http://localhost:8080/v1",
    });
    const agent = new Agent({
        lm: lm,
        onToken: (t) => process.stdout.write(t),
        onThinkingToken: (t) => process.stdout.write(`\x1b[2m${t}\x1b[0m`),
        onError: (err) => {
            console.log("\nError:", err.code, err.type + ":");
            console.log(`\x1b[1m${err.message}\x1b[0m\n`);
            throw new Error(err.message);
        }
    });
    const result = await agent.run(_prompt, {
        verbose: true,
        model: model,
        //inference params
        params: {
            stream: true,
            temperature: 0.6,
            top_k: 40,
            top_p: 0.95,
            min_p: 0,
            max_tokens: 2048,
        },
    });
    console.log("RESULT:");
    console.dir(result, { depth: 6 });
    //console.log("HISTORY:");
    //console.dir(agent.history, { depth: 6 });
}

(async () => {
    await main();
})();

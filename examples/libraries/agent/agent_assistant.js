#!/usr/bin/env node
import { Agent, Lm } from "../../../packages/agent/dist/main.js";

const _prompt = "Give me a short list of the planets names in the solar system in json";
const assistant = "```json\n";
const stop = ["```"];
const model = "qwen4b";

async function main() {
    const lm = new Lm({
        serverUrl: "http://localhost:8080/v1",
    });
    const agent = new Agent({
        lm: lm,
        onToken: (t) => process.stdout.write(t),
        onThinkingToken: (t) => process.stdout.write(`\x1b[2m${t}\x1b[0m`),
    });
    const inferParams = {
        stream: true,
        temperature: 0.6,
        top_k: 40,
        top_p: 0.95,
        min_p: 0,
        max_tokens: 2048,
        stop: stop,
    };
    const result = await agent.run(_prompt, {
        verbose: true,
        model: model,
        //inference params
        params: inferParams,
        assistant: assistant,
    });
    console.dir(result, { depth: 6 });
}

(async () => {
    await main();
})();

#!/usr/bin/env node
import { Agent, Lm } from "../../../packages/agent/dist/main.js";

const _prompt = "Give me a short list of the planets names in the solar system";
const model = "qwen4b";

async function main() {
    const lm = new Lm({
        serverUrl: "http://localhost:8080/v1",
    });
    const agent = new Agent({ lm: lm });
    const models = await agent.lm.modelsInfo();
    console.log("Models:");
    console.dir(models, { depth: 3 });
}

(async () => {
    await main();
})();

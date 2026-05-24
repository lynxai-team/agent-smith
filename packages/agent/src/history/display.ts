import type { ChatCompletionContentPart, ChatCompletionMessageToolCall, ChatCompletionRole } from "openai/resources/index.js";
import { formatLimitTxt } from "../utils.js";

function displayMessagesHistory(msgs: Array<{
    role: ChatCompletionRole,
    content?: string | Array<ChatCompletionContentPart>,
    reasoning_content?: string,
    tool_calls?: Array<ChatCompletionMessageToolCall>
}>) {
    //console.log("MSGS:");
    //console.dir(msgs, { depth: 5 });
    let i = 1
    for (const msg of msgs) {
        if (msg.role == "system") {
            console.log(0, "SYSTEM:", formatLimitTxt(`${msg.content}`));
            continue
        }
        if (msg.role == "user") {
            console.log(i, "USER:", formatLimitTxt(`${msg.content}`))
        }
        if (msg.role == "assistant") {
            if (msg.reasoning_content) {
                console.log(i, "THINK:", formatLimitTxt(msg.reasoning_content))
            }
            if (msg?.content) {
                console.log(i, "ASSISTANT:", formatLimitTxt(`${msg.content}`))
            }
            if (msg?.tool_calls) {
                console.log(i, "TOOL CALLS:");
                msg.tool_calls.forEach(t => {
                    // @ts-ignore
                    const tcn = t.function.name;
                    // @ts-ignore
                    const tca = formatLimitTxt(t.function.arguments);
                    console.log("-", tcn, tca)
                })
            }
        }
        if (msg.role == "tool") {
            console.log(i, "TOOL RESPONSE:", formatLimitTxt(`${msg.content}`));
        }
        ++i
    }
}

export {
    displayMessagesHistory,
}
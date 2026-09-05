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
        else if (msg.role == "user") {
            if (msg?.content) {
                if (typeof msg.content == "string") {
                    console.log(i, "USER:", formatLimitTxt(`${msg.content}`))
                } else {
                    console.log(i, "USER:", formatLimitTxt(JSON.stringify(msg.content)));
                }
            }
        }
        else if (msg.role == "assistant") {
            if (msg.reasoning_content) {
                console.log(i, "THINK:", formatLimitTxt(msg.reasoning_content))
            }
            if (msg?.content) {
                console.log(i, "ASSISTANT:", formatLimitTxt(`${msg.content}`))
            }
            if (msg?.tool_calls) {
                console.log(i, "TOOL CALLS:");
                for (const t of msg.tool_calls) {
                    // @ts-ignore
                    if (t?.role == "tool") {
                        // tool response
                        continue
                    }
                    // @ts-ignore
                    const tcn = t.function.name;
                    // @ts-ignore
                    const tca = formatLimitTxt(t.function.arguments);
                    console.log("-", tcn, tca)
                }
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
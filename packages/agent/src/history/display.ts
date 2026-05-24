import type { ChatCompletionContentPart, ChatCompletionMessageToolCall, ChatCompletionRole } from "openai/resources/index.js";

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
            console.log(0, "SYSTEM:", msg.content?.slice(0, 75));
            continue
        }
        if (msg.role == "user") {
            console.log(i, "USER:", msg.content?.slice(0, 75))
        }
        if (msg.role == "assistant") {
            if (msg.reasoning_content) {
                console.log(i, "THINK:", msg.reasoning_content.slice(0, 75))
            }
            if (msg?.content) {
                console.log(i, "ASSISTANT:", msg.content.slice(0, 75))
            }
            if (msg?.tool_calls) {
                console.log(i, "TOOL CALLS:");
                msg.tool_calls.forEach(t => {
                    // @ts-ignore
                    const tcn = t.function.name;
                    // @ts-ignore
                    const tca = t.function.arguments.slice(0, 75)
                    console.log("-", tcn, tca)
                })
            }
        }
        if (msg.role == "tool") {
            console.log(i, "TOOL RESPONSE:", msg.content?.slice(0, 15));
        }
        ++i
    }
}

export {
    displayMessagesHistory,
}
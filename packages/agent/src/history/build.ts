import type { ClientInferenceOptions, HistoryTurn } from "@agent-smith/types";
import type { ChatCompletionContentPart, ChatCompletionMessageToolCall, ChatCompletionRole } from "openai/resources/index.js";

function buildMessagesHistory(
    history: Array<HistoryTurn>,
    options: ClientInferenceOptions,
): Array<{
    role: ChatCompletionRole,
    content?: string | Array<ChatCompletionContentPart>,
    reasoning_content?: string,
    tool_calls?: Array<ChatCompletionMessageToolCall>
}> {
    const msgs: Array<{
        role: ChatCompletionRole,
        content?: string | Array<ChatCompletionContentPart>,
        reasoning_content?: string,
        tool_calls?: Array<ChatCompletionMessageToolCall>
    }> = [];
    let i = 1;
    //console.log("Processing history:", history);
    //console.dir(options, { depth: 5 });
    if (history.length == 0 && options?.system) {
        msgs.push({
            role: "system",
            content: options.system
        })
    }
    history.forEach(turn => {
        if (i == 1 && options?.system) {
            msgs.push({ role: "system", content: options.system });
        }
        if (turn?.user) {
            //console.log("=> User", typeof turn.user, turn.user);
            let content: string | Array<ChatCompletionContentPart> = turn.user;
            if (turn.images) {
                content = [
                    { type: "text", text: turn.user },
                ];
                turn.images.forEach(img => {
                    // @ts-ignore
                    content.push({ type: "image_url", image_url: { url: img, detail: "auto" } })
                })
            }
            msgs.push({
                role: "user",
                content: content,
            });
        }
        let assistantMsg: {
            role: ChatCompletionRole,
            content?: string | Array<ChatCompletionContentPart>,
            reasoning_content?: string,
            tool_calls?: Array<ChatCompletionMessageToolCall>
        } = {
            role: "assistant",
        };
        if (turn?.assistant) {
            assistantMsg.content = turn.assistant;
        }
        if (turn?.think) {
            if (options?.params?.chat_template_kwargs) {
                if (options.params.chat_template_kwargs?.preserve_thinking) {
                    assistantMsg = { ...assistantMsg, reasoning_content: turn.think }
                }
            }
        }
        const toolResponses = new Array<any>();
        //console.log("TURNTOOLS", turn?.tools);
        if (turn?.tools) {
            const toolCalls = new Array<ChatCompletionMessageToolCall>();
            turn.tools.forEach(tt => {
                // null/undefined = pending call; falsy-but-valid results ("", 0, false) are real responses
                if (tt?.response !== undefined && tt?.response !== null) {
                    toolResponses.push({
                        role: "tool",
                        tool_call_id: tt.call.id,
                        content: JSON.stringify(tt.response),
                    })
                } else {
                    toolCalls.push({
                        id: tt.call.id,
                        type: "function",
                        "function": {
                            name: tt.call.name,
                            arguments: JSON.stringify(tt.call.arguments)
                        }
                    });
                    // @ts-ignore
                    assistantMsg = { ...assistantMsg, tool_calls: toolCalls }
                }
            });
        }
        // @ts-ignore
        if (assistantMsg?.content || assistantMsg?.reasoning_content || assistantMsg?.tool_calls) {
            if (assistantMsg?.reasoning_content && !assistantMsg?.tool_calls) {
                if (!assistantMsg?.content) {
                    // patch to not send an assistant message with only reasoning content
                    assistantMsg.content = "...";
                }
            }
            msgs.push(assistantMsg);
        }
        if (toolResponses.length > 0) {
            toolResponses.forEach(tr => msgs.push(tr));
        }
        ++i
    })
    return msgs
}

export {
    buildMessagesHistory,
}
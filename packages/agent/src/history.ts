import type { ClientInferenceOptions, HistoryTurn } from "@agent-smith/types";
import type { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources/index.js";

function buildHistory(
    history: Array<HistoryTurn>,
    options: ClientInferenceOptions,
): Array<ChatCompletionMessageParam | { role: "assistant", content?: string, reasoning_content?: string, tool_calls?: Array<ChatCompletionMessageToolCall> }> {
    const msgs: Array<ChatCompletionMessageParam | { role: "assistant", content: string, reasoning_content: string }> = [];
    let i = 1;
    history.forEach(turn => {
        if (i == 1 && options?.system) {
            msgs.push({ role: "system", content: options.system });
        }
        if (turn?.user) {
            msgs.push({
                role: "user",
                content: turn.user,
            });
        }
        let assistantMsg: ChatCompletionMessageParam | { role: "assistant", content?: string, reasoning_content?: string, tool_calls?: Array<ChatCompletionMessageToolCall> } = {
            role: "assistant"
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
        const toolResponses = new Array<ChatCompletionMessageParam>();
        if (turn?.tools) {
            const toolCalls = new Array<ChatCompletionMessageToolCall>();
            turn.tools.forEach(tt => {
                toolCalls.push({
                    id: tt.call.id ?? "",
                    type: "function",
                    "function": {
                        name: tt.call.name,
                        arguments: JSON.stringify(tt.call.arguments)
                    }
                });
                toolResponses.push({
                    role: "tool",
                    tool_call_id: tt.call.id,
                    content: JSON.stringify(tt.response),
                })
            });
            // @ts-ignore
            assistantMsg = { ...assistantMsg, tool_calls: toolCalls }
        }
        // @ts-ignore
        if (assistantMsg?.content || assistantMsg?.tool_calls) {
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
    buildHistory,
}
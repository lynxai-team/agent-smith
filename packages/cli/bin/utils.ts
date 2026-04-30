import type { ToolCallSpec } from '@agent-smith/types';
import { confirm } from '@inquirer/prompts';
import colors from "ansi-colors";

function parseCommandArgs(args: Array<any>): {
    args: Array<string>,
    options: Record<string, any>,
} {
    //discard the command (last arg)
    args.pop();
    //console.log("Raw command args:", args);
    const res = {
        args: new Array<string>(),
        options: {} as Record<string, any>,
    }
    res.options = args.pop();
    res.args = Array.isArray(args[0]) ? args[0] : args;
    //console.log("PARSE ARGS RES", res.args);
    //console.log("PARSE OPTS RES", res.options);
    return res
}

async function confirmToolUsage(toolCall: ToolCallSpec) {
    console.log("Tool call:", colors.bold(toolCall.name));
    if (toolCall?.arguments) {
        console.log("Arguments:", toolCall.arguments);
    } else {
        console.log("No arguments")
    }
    return await confirm({ message: `Execute tool ${toolCall.name}?` });
}

export {
    parseCommandArgs,
    confirmToolUsage,
}
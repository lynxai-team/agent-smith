import { extractBetweenTags } from "../../utils/text.js";

async function action(args: any, options: any) {
    //console.log("ARGS", args);
    //console.log("OPTS", options);
    const res = args.text;
    const prompt = args.cmdArgs[0];
    const txt = extractBetweenTags(res, "<skill>", "</skill>");
    const lines = [
        prompt + "\n\nSteps to execute one after the other:\n\n",
        "1. Read `/workspace/agent-smith/.agents/documentation/documentation-map.md` to navigate the documentation.",
        "2. Find and read some relevant documentation.",
    ]
    const finalLine = "Answer and provide documentation references links."
    if (txt.length > 0) {
        lines.push(`3. Load the "${txt}" skill to help you find an answer.`);
        lines.push("4. " + finalLine);
    } else {
        lines.push("3. " + finalLine)
    }
    lines.push("\nFollow these instructions step by step.")
    const instructions = lines.join("\n");
    //console.log("FINAL PROMPT", prompt);
    return { prompt: instructions };
}

export { action };
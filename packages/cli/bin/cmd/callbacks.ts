import type { AgentInferenceOptions, ToolCallSpec } from "@agent-smith/types";
import ora from "ora";
import { printToken } from "../utils.js";
import { default as color } from "ansi-colors";
import { utils } from "@agent-smith/core"

const useInferenceCallbacks = (
    agentName: string,
    options: AgentInferenceOptions,
) => {
    let emittedThinkingTokens = 0;
    let emittedTokens = 0;
    let isToolCallInProgress = false;
    let isToolCallRunning = false;
    const perfTimer = utils.usePerfTimer();
    const spinner = ora({ discardStdin: false, color: "green" });
    const thinkIcon = "  ";
    const talkIcon = "🏁";
    const toolIcon = "⚒️";

    const onToken = (t: string, from: string) => {
        if (emittedTokens == 0) {
            perfTimer.start();
            //console.log(talkIcon, from);
        }
        //if (!isToolCallRunning) {
        printToken(t, options?.showTokens);
        ++emittedTokens;
        //}
    };

    const onStartThinking = (from: string) => {
        //console.log("START THINKING");  
        if (!options?.debug && !options?.verbose) {
            spinner.start(`${from} is thinking ...`);
        }
    }

    const onEndThinking = (from: string) => {
        //console.log("END THINKING");
        if (!options?.debug && !options?.verbose) {
            spinner.stop();
            let msg = `${color.dim("Thinking")} ${from} ${color.bold(emittedThinkingTokens.toString())} ${color.dim("tokens")}`;
            msg = msg + " " + color.dim(perfTimer.time())
            //const space = agentName == from ? thinkIcon + " " : `   ${thinkIcon} `;
            const space = agentName == from ? "" : "   ";
            console.log(space + msg);
        }
        emittedThinkingTokens = 0;
    }

    const onThinkingToken = (t: string, from: string) => {
        if (options?.debug || options?.verbose) {
            printToken(t, options?.showTokens, options?.showTokens ? false : true)
        } else {
            let msg = `${color.dim("Thinking")} ${from} ${color.bold(emittedThinkingTokens.toString())} ${color.dim("tokens")}`;
            msg = msg + " " + color.dim(perfTimer.time());
            const space = agentName == from ? "" : "    ";
            spinner.prefixText = space;
            spinner.text = msg;
        }
        emittedThinkingTokens++
    };

    const onToolCallInProgress = (tc: Array<ToolCallSpec>, from: string) => {
        const txt = color.dim("Preparing tool call") + ` ${from} ${color.yellowBright(tc[tc.length - 1].name)} ...`;
        if (!isToolCallInProgress) {
            spinner.start(txt)
            isToolCallInProgress = true
        } else {
            spinner.text = txt
        }
    }

    const onToolCall = (tc: ToolCallSpec, from: string) => {
        isToolCallInProgress = false;
        isToolCallRunning = true;
        spinner.stop();
        //console.log("TC START");        
        const icon = agentName == from ? toolIcon + " " : "   " + toolIcon + " ";
        console.log(icon, color.bold(from), "=>", `${color.yellowBright(tc.name)}`, tc.arguments);
    };

    const onToolCallEnd = (tc: ToolCallSpec, tr: any, from: string) => {
        isToolCallRunning = false;
        if (options?.debug) {
            console.log(tc.name, "from", from + ":\n", tr)
        }
    }

    return {
        onToken,
        onStartThinking,
        onEndThinking,
        onThinkingToken,
        onToolCallInProgress,
        onToolCall,
        onToolCallEnd,
    }
}

export {
    useInferenceCallbacks,
}
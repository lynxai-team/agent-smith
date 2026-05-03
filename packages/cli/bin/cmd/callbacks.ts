import type { AgentInferenceOptions, ToolCallSpec } from "@agent-smith/types";
import ora from "ora";
import { printToken } from "../utils.js";
import { default as color } from "ansi-colors";
import { utils } from "@agent-smith/core"

const useInferenceCallbacks = (
    options: AgentInferenceOptions,
) => {
    let emittedThinkingTokens = 0;
    let emittedTokens = 0;
    const perfTimer = utils.usePerfTimer();
    let isToolCallRunning = false;
    const spinner = ora({ text: "Thinking ...", discardStdin: false });

    const onToken = (t: string) => {
        if (emittedTokens == 0) { perfTimer.start() }
        if (!isToolCallRunning) {
            printToken(t, options?.showTokens);
            ++emittedTokens;
        }
    };

    const onStartThinking = () => {
        //console.log("START THINKING");  
        if (!options?.debug && !options?.verbose) {
            spinner.start();
        }
    }

    const onEndThinking = () => {
        //console.log("END THINKING");
        if (!options?.debug && !options?.verbose) {
            spinner.stopAndPersist();
        }
        emittedThinkingTokens = 0;
    }

    const onThinkingToken = (t: string) => {
        if (options?.debug || options?.verbose) {
            printToken(t, options?.showTokens, options?.showTokens ? false : true)
        } else {
            let msg = `Thinking ${color.bold(emittedThinkingTokens.toString())} ${color.dim("tokens")}`;
            msg = msg + " " + color.dim(perfTimer.time())
            spinner.text = msg;
        }
        emittedThinkingTokens++
    };

    const onToolCallInProgress = (tc: Array<ToolCallSpec>) => {
        console.log(color.dim(`Preparing tool call ${tc[tc.length - 1].name} ...`))
    }

    const onToolCall = (tc: ToolCallSpec, from: string) => {
        isToolCallRunning = true;
        //console.log("TC START");
        console.log("⚒️ ", color.bold(from), "=>", `${color.yellowBright(tc.name)}`, tc.arguments);
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
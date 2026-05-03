import { Agent } from "@agent-smith/agent";
import type { TaskSettings, AgentInferenceOptions, InferenceResult, ToolCallSpec } from "@agent-smith/types";
import { default as color } from "ansi-colors";
import ora from 'ora';
import { backend, backends, listBackends } from "../state/backends.js";
import { initTaskSettings, isTaskSettingsInitialized, tasksSettings } from "../state/tasks.js";
import { processOutput } from "../utils/io.js";
import { usePerfTimer } from "../utils/perf.js";
import { runtimeDataError, runtimeError, runtimeWarning } from "../utils/user_msgs.js";
import { readTask } from "./read.js";
import { compile, serializeGrammar } from "@intrinsicai/gbnfgen";
//import { chat, program } from "../../cmds.js";

async function executeTask(
    name: string, payload: Record<string, any>, options: AgentInferenceOptions
): Promise<InferenceResult> {
    //console.log("EXEC TASK OPTS", options);
    //console.log("TN", name);
    //console.log("AGENT", agent);
    if (!isTaskSettingsInitialized.value) {
        initTaskSettings()
    }
    const agent = new Agent({
        name: name,
        lm: backend.value!,
    });
    const hasSettings = Object.keys(tasksSettings).includes(name);
    let settings: TaskSettings = {};
    if (hasSettings) {
        settings = tasksSettings[name]
    }
    if (options?.backend) {
        if (options.backend in backends) {
            agent.lm = backends[options.backend]
            //console.log("SET AGENT BACKEND TO", backends[options.backend]);
        } else {
            const bks = await listBackends(false);
            runtimeDataError(`The backend ${options.backend} is not registered in config. Available backends:\n`, bks)
        }
    } else if (settings?.backend) {
        //console.log("SET AGENT BACKEND TO", backends[options.backend]);
        agent.lm = backends[settings.backend]
    }
    /*if (options?.debug || options?.backend) {
        console.log("Agent:", color.bold(agent.name));
    }*/
    let { task, vars, mcpServers, taskDir } = await readTask(name, payload, options, agent);
    if (!options?.model) {
        options.model = task.def.model;
        if (hasSettings) {
            if (settings?.model) {
                options.model = settings.model;
            }
        }
    }
    if (options?.verbosity?.mcp && mcpServers.length > 0) {
        console.log("Starting", mcpServers.length, "mcp servers")
    }
    for (const mcp of mcpServers) {
        await mcp.start();
        const tools = await mcp.extractTools(options);
        tools.forEach(t => task.def.tools?.push(t));
        if (options?.verbosity?.mcp) {
            console.log("MCP start", mcp.name);
        }
    }
    //console.log("TASKCONF IP", conf.inferParams);
    if (!options?.params) {
        options.params = {}
    }
    if (hasSettings) {
        if (settings?.max_tokens && !options?.params?.max_tokens) {
            options.params.max_tokens = settings.max_tokens;
        }
        if (settings?.top_k && !options?.params?.top_k) {
            options.params.top_k = settings.top_k;
        }
        if (settings?.top_p && !options?.params?.top_p) {
            options.params.top_p = settings.top_p;
        }
        if (settings?.min_p && !options?.params?.min_p) {
            options.params.min_p = settings.min_p;
        }
        if (settings?.temperature && !options?.params?.temperature) {
            options.params.temperature = settings.temperature;
        }
        if (settings?.repeat_penalty && !options?.params?.repeat_penalty) {
            options.params.repeat_penalty = settings.repeat_penalty;
        }
        if (settings?.presence_penalty && !options?.params?.presence_penalty) {
            options.params.presence_penalty = settings.presence_penalty;
        }
        if (settings?.frequency_penalty && !options?.params?.frequency_penalty) {
            options.params.frequency_penalty = settings.frequency_penalty;
        }
    }
    //console.log("TASK MODEL", model);
    // check for grammars
    if (options.params?.tsGrammar) {
        //console.log("TSG");
        options.params.grammar = serializeGrammar(await compile(options.params.tsGrammar, "Grammar"));
        delete options.params.tsGrammar;
    }
    let c = false;
    if (options?.verbosity?.task) {
        console.log("Task model:", options.model);
        console.log("Task vars:", vars);
    }
    let emittedTokens = 0;
    let emittedThinkingTokens = 0;
    const printToken = (t: string, dim = false) => {
        if (dim === true) {
            process.stdout.write(`\x1b[2m${t}\x1b[0m`);
        } else {
            if (options?.showTokens === true) {
                let txt = t;
                txt = c ? t : `\x1b[100m${t}\x1b[0m`
                process.stdout.write(txt);
                c = !c
            } else {
                /*if (formatMode.value == "markdown") {
                    fullTxt += t;
                    process.stdout.write('\u001Bc\u001B[3J');
                    process.stdout.write(marked.parse(fullTxt) as string);*/
                //} else {
                process.stdout.write(t);
                //}
            }
        }

    };
    const formatTokenCount = (i: number) => {
        return `Thinking ${color.bold(i.toString())} ${color.dim("tokens")}`
    };
    const perfTimer = usePerfTimer(false);
    const spinner = ora({ text: "Thinking ...", discardStdin: false });
    let abort = options?.abort ? options.abort as AbortController : new AbortController();
    const abortTicker = setInterval(() => {
        //console.log("ABS", abort.signal.aborted);
        if (abort.signal.aborted) {
            agent.lm.abort();
            spinner.stop();
            abort = new AbortController();
            return
        }
    }, 200);
    const processToken = (t: string) => {
        if (emittedTokens == 0) { perfTimer.start() }
        //spinner.text = formatTokenCount(emittedTokens)
        printToken(t);
        ++emittedTokens;
    };
    const onStartThinking = options?.onStartThinking ?
        options.onStartThinking :
        !(options?.debug || options?.verbose) ? () => {
            spinner.start();
            if (emittedTokens == 0) { perfTimer.start() };
        } : undefined;
    const onEndThinking = options?.onEndThinking ?
        options.onEndThinking :
        !(options?.debug || options?.verbose) ? () => {
            spinner.stopAndPersist()
        } : undefined;
    const onThinkingToken = options?.onThinkingToken ?
        options.onThinkingToken :
        (t: string) => {
            if (options?.debug || options?.verbose) {
                printToken(t, true)
            } else {
                let msg = formatTokenCount(emittedThinkingTokens);
                msg = msg + " " + color.dim(perfTimer.time())
                spinner.text = msg;
            }
            emittedThinkingTokens++
        };
    /* const onToolCallInProgress = options?.onToolCallInProgress ?
        options.onToolCallInProgress :
        (tc: Array<ToolCallSpec>) => console.log(color.dim(`Preparing tool call ${tc[tc.length - 1].name} ...`));
    const _onToolCall = (tc: Record<string, any>) => {
        //console.log("TC START");
        console.log("⚒️ ", color.bold(name), "=>", `${color.yellowBright(tc.name)}`, tc.arguments);
    };*/
    /*const _onToolCallEnd = (tc: ToolCallSpec, tr: any) => {
        if (options?.debug) {
            console.log(tc.name + ":\n", tr)
        }
    }*/
    // const spinnerInit = (name: string) => ora(`Executing the ${name} tool ...\n`);
    const onToolCallInProgress = options?.onToolCallInProgress;
    const onToolCall = options?.onToolCall ?? undefined;
    const onToolCallEnd = options?.onToolCallEnd ?? undefined;
    const onToolsTurnStart = options?.onToolsTurnStart ?? undefined;
    const onToolsTurnEnd = options?.onToolsTurnEnd ?? undefined;
    const onTurnEnd = options?.onTurnEnd ?? undefined;
    const onAssistant = options?.onAssistant ?? undefined;
    const onThink = options?.onThink ?? undefined;
    //console.log("OOT", options?.onToken, "/", processToken);
    if (options?.onToken) {
        task.agent.lm.onToken = options.onToken;
    } else {
        task.agent.lm.onToken = processToken;
    }
    options.params.stream = true;

    const agentOptions: AgentInferenceOptions = {
        baseDir: taskDir,
        onToolCall: onToolCall,
        onToolCallEnd: onToolCallEnd,
        onToolsTurnStart: onToolsTurnStart,
        onToolsTurnEnd: onToolsTurnEnd,
        onTurnEnd: onTurnEnd,
        onAssistant: onAssistant,
        onThink: onThink,
        onThinkingToken: onThinkingToken,
        onStartThinking: onStartThinking,
        onEndThinking: onEndThinking,
        onToolCallInProgress: onToolCallInProgress,
        ...options,
    }
    //console.log("CORE AGENT OPTS", agentOptions);
    if (options?.history) {
        agent.history = options.history;
    }
    let out: InferenceResult;

    //console.log("CLI EXEC TASK", payload.prompt, "\nVARS:", vars, "\nOPTS", tconf)
    try {
        out = await task.run({ prompt: payload.prompt, ...vars }, agentOptions);
    } catch (e: any) {
        //console.log("ERR CATCH", e);
        const errMsg = `${e}`;
        if (errMsg.includes("502 Bad Gateway")) {
            clearInterval(abortTicker);
            runtimeError("The server answered with a 502 Bad Gateway error. It might be down or misconfigured. Check your inference server.")
            if (options?.nocli) {
                throw new Error(errMsg)
            }
            //@ts-ignore
            return
        } else if (errMsg.includes("404 Not Found")) {
            clearInterval(abortTicker);
            runtimeError("The server answered with a 404 Not Found error. That might mean that the model you are requesting does not exist on the server.")
            if (options?.nocli) {
                throw new Error(errMsg)
            }
            //@ts-ignore
            return
        } else if (errMsg.includes("400 Bad Request")) {
            clearInterval(abortTicker);
            runtimeError("The server answered with a 400 Bad Request error. That might mean that:\n- The model you are requesting does not exist on the server\n- A parameter is wrong or missing in your request\n- The request size exceeds the available context window size")
            if (options?.nocli) {
                throw new Error(errMsg)
            }
            //@ts-ignore
            return
        } else if (errMsg.includes("fetch failed")) {
            clearInterval(abortTicker);
            runtimeError("The server is not responding. Check if your inference backend is running.")
            if (options?.nocli) {
                throw new Error(errMsg)
            }
            //@ts-ignore
            return
        } else if (e instanceof DOMException && e.name === 'AbortError') {
            if (options?.debug || options?.verbose) {
                console.warn("\n*** The request was canceled by the user ***");
            }
            clearInterval(abortTicker);
            return {} as InferenceResult
        }
        else {
            throw new Error(errMsg)
        }
    }
    clearInterval(abortTicker);
    //console.log("END TASK", out);
    if (!options?.isToolCall) {
        if (!out.text.endsWith("\n")) {
            console.log()
        }
    }
    //console.log("END", name, "ISCM", isChatMode.value, "isTC", options?.isToolCall)
    /*if (!isChatMode.value || options?.isToolCall) {
        // close mcp connections
        if (options?.debug && mcpServers.length > 0) {
            console.log("Closing", mcpServers.length, "mcp server(s)")
        }
        mcpServers.forEach((s) => {
            s.stop();
            if (options?.debug) {
                console.log("MCP stop", s.name);
            }
        });
    }*/
    await processOutput(out);
    // chat mode
    //console.log("CLI CONF IP", initialInferParams);
    /*if (!options?.isToolCall && isChatMode.value) {
        if (task.def.tools) {
            options.tools = task.def.tools
        }
        if (task.def.shots) {
            options.history = options?.history ? [...options.history, ...task.def.shots] : task.def.shots;
        }
        if (task.def.template?.system) {
            options.system = task.def.template.system
        }
        if (task.def.template?.assistant) {
            options.assistant = task.def.template.assistant
        }
        setChatInferenceParams(initialInferParams);
        //await chat(program, options, agent, mcpServers);
    }*/
    if (options?.verbosity?.stats) {
        try {
            console.log(emittedTokens.toString(), color.dim("tokens"), out.stats.tokensPerSecond, color.dim("tps"));
        } catch (e) {
            runtimeWarning("Error formating stats:", `${e}`)
        }
    }
    if (options?.backend || settings?.backend) {
        //console.log("SET BACK AGENT BACKEND TO", backend.value);
        // set back the default backend
        agent.lm = backend.value!;
    }
    //console.log("TASK OUT", out);
    return out
}

export {
    executeTask
};


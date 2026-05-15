import { readTask } from "./read.js";
import { Agent } from "@agent-smith/agent";
import type { AgentInferenceOptions, InferenceResult, TaskSettings } from "@agent-smith/types";
import { compile, serializeGrammar } from "@intrinsicai/gbnfgen";
import { default as color } from "ansi-colors";
import { backend, backends, listBackends } from "../state/backends.js";
import { initTaskSettings, isTaskSettingsInitialized, tasksSettings } from "../state/tasks.js";
import { processOutput } from "../utils/io.js";
import { usePerfTimer } from "../utils/perf.js";
import { runtimeDataError, runtimeError, runtimeWarning } from "../utils/user_msgs.js";

const useTaskExecutor = async (name: string, payload: { prompt: string } & Record<string, any>, options: AgentInferenceOptions) => {
    if (!backend.value) {
        throw new Error("no backend set")
    }
    const agent = new Agent({
        name: name,
        lm: backend.value,
    });

    const localOptions = Object.assign({}, options);
    const { task, vars, mcpServers, taskDir, tools } = await readTask(name, payload, localOptions, agent);
    //const taskPayload = { ...payload, ...vars };
    //console.log("PAY", taskPayload);
    let settings: TaskSettings = {};

    const execute = async (): Promise<InferenceResult> => {
        //console.log("EXEC AGENT OPTS", localOptions);
        if (!isTaskSettingsInitialized.value) {
            initTaskSettings()
        }
        const hasSettings = Object.keys(tasksSettings).includes(name);
        if (hasSettings) {
            settings = tasksSettings[name]
        }
        if (localOptions?.backend) {
            if (localOptions.backend in backends) {
                agent.lm = backends[localOptions.backend]
                //console.log("SET AGENT BACKEND TO", backends[localOptions.backend]);
            } else {
                const bks = await listBackends(false);
                runtimeDataError(`The backend ${localOptions.backend} is not registered in config. Available backends:\n`, bks)
            }
        } else if (settings?.backend) {
            //console.log("SET AGENT BACKEND TO", backends[localOptions.backend]);
            agent.lm = backends[settings.backend]
        }
        /*if (localOptions?.debug || localOptions?.backend) {
            console.log("Agent:", color.bold(agent.name));
        }*/
        if (!localOptions?.model) {
            localOptions.model = task.def.model;
            if (hasSettings) {
                if (settings?.model) {
                    localOptions.model = settings.model;
                }
            }
        }
        if (localOptions?.verbosity?.mcp && mcpServers.length > 0) {
            console.log("Starting", mcpServers.length, "mcp servers")
        }
        for (const mcp of mcpServers) {
            await mcp.start();
            const _tools = await mcp.extractTools(localOptions);
            _tools.forEach(t => task.def.tools?.push(t));
            if (localOptions?.verbosity?.mcp) {
                console.log("MCP start", mcp.name);
            }
        }
        //console.log("TASKCONF IP", conf.inferParams);
        if (!localOptions?.params) {
            localOptions.params = {}
        }
        if (hasSettings) {
            if (settings?.max_tokens && !localOptions?.params?.max_tokens) {
                localOptions.params.max_tokens = settings.max_tokens;
            }
            if (settings?.top_k && !localOptions?.params?.top_k) {
                localOptions.params.top_k = settings.top_k;
            }
            if (settings?.top_p && !localOptions?.params?.top_p) {
                localOptions.params.top_p = settings.top_p;
            }
            if (settings?.min_p && !localOptions?.params?.min_p) {
                localOptions.params.min_p = settings.min_p;
            }
            if (settings?.temperature && !localOptions?.params?.temperature) {
                localOptions.params.temperature = settings.temperature;
            }
            if (settings?.repeat_penalty && !localOptions?.params?.repeat_penalty) {
                localOptions.params.repeat_penalty = settings.repeat_penalty;
            }
            if (settings?.presence_penalty && !localOptions?.params?.presence_penalty) {
                localOptions.params.presence_penalty = settings.presence_penalty;
            }
            if (settings?.frequency_penalty && !localOptions?.params?.frequency_penalty) {
                localOptions.params.frequency_penalty = settings.frequency_penalty;
            }
        }
        //console.log("TASK MODEL", model);
        // check for grammars
        if (localOptions.params?.tsGrammar) {
            //console.log("TSG");
            localOptions.params.grammar = serializeGrammar(await compile(localOptions.params.tsGrammar, "Grammar"));
            delete localOptions.params.tsGrammar;
        }
        let c = false;
        if (localOptions?.verbosity?.task) {
            console.log("Task model:", localOptions.model);
            console.log("Task vars:", vars);
        }
        let emittedTokens = 0;
        let emittedThinkingTokens = 0;
        const printToken = (t: string, dim = false) => {
            if (dim === true) {
                process.stdout.write(`\x1b[2m${t}\x1b[0m`);
            } else {
                if (localOptions?.showTokens === true) {
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
        const perfTimer = usePerfTimer(false);
        //const spinner = ora({ text: "Thinking ...", discardStdin: false });
        let abort = localOptions?.abort ? localOptions.abort as AbortController : new AbortController();
        const abortTicker = setInterval(() => {
            //console.log("ABS", abort.signal.aborted);
            if (abort.signal.aborted) {
                agent.lm.abort();
                abort = new AbortController();
                return
            }
        }, 200);
        const processToken = (t: string) => {
            if (emittedTokens == 0) { perfTimer.start() }
            printToken(t);
            ++emittedTokens;
        };
        localOptions.params.stream = true;
        if (!localOptions?.onToken) {
            localOptions.onToken = processToken;
        }
        localOptions.baseDir = taskDir;
        //console.log("CORE AGENT OPTS", agentOptions);
        if (localOptions?.history) {
            agent.history = localOptions.history;
        }
        localOptions.variables = vars;
        localOptions.tools = tools;
        //console.log("OPT VARS", localOptions.variables);
        let out: InferenceResult;
        //console.log("CLI EXEC TASK", payload.prompt, "\nOPTS", localOptions)
        try {
            out = await task.run(payload.prompt, localOptions);
        } catch (e: any) {
            //console.log("ERR CATCH", e);
            const errMsg = `${e}`;
            if (errMsg.includes("502 Bad Gateway")) {
                clearInterval(abortTicker);
                const msg = "The server answered with a 502 Bad Gateway error. It might be down or misconfigured. Check your inference server.";
                const err = msg + "\n" + errMsg;
                if ((localOptions?.onError)) {
                    localOptions.onError(err, name);
                } else {
                    runtimeError(msg)
                    if (localOptions?.nocli) {
                        throw new Error(err)
                    }
                }
                return {} as InferenceResult
            } else if (errMsg.includes("404 Not Found")) {
                clearInterval(abortTicker);
                const msg = "The server answered with a 404 Not Found error. That might mean that the model you are requesting does not exist on the server.";
                const err = msg + "\n" + errMsg;
                if ((localOptions?.onError)) {
                    localOptions.onError(err, name);
                } else {
                    runtimeError(msg)
                    if (localOptions?.nocli) {
                        throw new Error(err)
                    }
                }
                return {} as InferenceResult
            } else if (errMsg.includes("400 Bad Request")) {
                clearInterval(abortTicker);
                const msg = "The server answered with a 400 Bad Request error. That might mean that:\n- The model you are requesting does not exist on the server\n- A parameter is wrong or missing in your request\n- The request size exceeds the available context window size";
                const err = msg + "\n" + errMsg;
                if ((localOptions?.onError)) {
                    localOptions.onError(err, name);
                } else {
                    runtimeError()
                    if (localOptions?.nocli) {
                        throw new Error(err)
                    }
                }
                return {} as InferenceResult
            } else if (errMsg.includes("fetch failed")) {
                clearInterval(abortTicker);
                const msg = "The server is not responding. Check if your inference backend is running.";
                const err = msg + "\n" + errMsg;
                if ((localOptions?.onError)) {
                    localOptions.onError(err, name);
                } else {
                    runtimeError(msg)
                    if (localOptions?.nocli) {
                        throw new Error(err)
                    }
                }
                //@ts-ignore
                return
            } else if (e instanceof DOMException && e.name === 'AbortError') {
                if (localOptions?.debug || localOptions?.verbose) {
                    console.warn("\n*** The request was canceled by the user ***");
                }
                clearInterval(abortTicker);
                /*if ((localOptions?.onError)) {
                    localOptions.onError(errMsg, name);
                } else {*/
                return {} as InferenceResult
                // }
            }
            else {
                throw new Error(errMsg)
            }
        }
        clearInterval(abortTicker);
        //console.log("END TASK", out);
        if (!localOptions?.isToolCall) {
            if (!out.text.endsWith("\n")) {
                console.log()
            }
        }
        //console.log("END", name, "ISCM", isChatMode.value, "isTC", localOptions?.isToolCall)
        /*if (!isChatMode.value || localOptions?.isToolCall) {
            // close mcp connections
            if (localOptions?.debug && mcpServers.length > 0) {
                console.log("Closing", mcpServers.length, "mcp server(s)")
            }
            mcpServers.forEach((s) => {
                s.stop();
                if (localOptions?.debug) {
                    console.log("MCP stop", s.name);
                }
            });
        }*/
        await processOutput(out);
        // chat mode
        //console.log("CLI CONF IP", initialInferParams);
        /*if (!localOptions?.isToolCall && isChatMode.value) {
            if (task.def.tools) {
                localOptions.tools = task.def.tools
            }
            if (task.def.shots) {
                localOptions.history = localOptions?.history ? [...localOptions.history, ...task.def.shots] : task.def.shots;
            }
            if (task.def.template?.system) {
                localOptions.system = task.def.template.system
            }
            if (task.def.template?.assistant) {
                localOptions.assistant = task.def.template.assistant
            }
            setChatInferenceParams(initialInferParams);
            //await chat(program, localOptions, agent, mcpServers);
        }*/
        /*if (localOptions?.verbosity?.stats) {
            try {
                console.log(emittedTokens.toString(), color.dim("tokens"), out.stats.tokensPerSecond, color.dim("tps"));
            } catch (e) {
                runtimeWarning("Error formating stats:", `${e}`)
            }
        }*/
        if (localOptions?.backend || settings?.backend) {
            //console.log("SET BACK AGENT BACKEND TO", backend.value);
            // set back the default backend
            agent.lm = backend.value!;
        }
        //console.log("TASK OUT", out);
        //console.log("TASK A", agent);
        return out
    }

    return {
        agent,
        task,
        vars,
        mcpServers,
        taskDir,
        settings,
        execute,
    }
}

export {
    useTaskExecutor,
}
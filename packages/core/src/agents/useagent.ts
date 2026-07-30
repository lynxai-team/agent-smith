import { Agent, type Lm } from "@agent-smith/agent";
import { WorkflowStep, type AgentInferenceOptions, type AgentSettings, type InferenceResult } from "@agent-smith/types";
import { compile, serializeGrammar } from "@intrinsicai/gbnfgen";
import { backend, backends, listBackends } from "../state/backends.js";
import { initAgentSettings, isAgentSettingsInitialized, agentSettings } from "../state/tasks.js";
import { processOutput } from "../utils/io.js";
import { usePerfTimer } from "../utils/perf.js";
import { runtimeDataError, runtimeError } from "../utils/user_msgs.js";
import { readAgent } from "./read.js";
import { toRaw } from "@vue/reactivity";
import { readAllSkills } from "../db/read.js";
import { default as fm } from "front-matter";
import { readFile } from "../utils/sys/read.js";
import { executeWorkflow } from "../main.js";
import { readInlineWorkflow } from "../utils/workflow.js";

const useAgentExecutor = async (name: string, payload: { prompt: string } & Record<string, any>, options: AgentInferenceOptions) => {
    const localOptions = Object.assign({}, options) as AgentInferenceOptions & Record<string, any>;
    // skill loader
    if (payload.prompt.includes("%")) {
        const skills = readAllSkills();
        for (const [k, v] of Object.entries(skills)) {
            // Escape special regex characters in the skill name
            const escapedK = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Use regex with negative lookahead to ensure exact skill name match
            // (?![a-zA-Z0-9-]) ensures "%create" doesn't match inside "%create-2"
            const regex = new RegExp(`%${escapedK}(?![a-zA-Z0-9-])`, 'g');

            if (regex.test(payload.prompt)) {
                const fc = readFile(v.path);
                // @ts-ignore
                const data = fm(fc);
                payload.prompt = payload.prompt.replace(new RegExp(`%${escapedK}(?![a-zA-Z0-9-])`, 'g'), data.body);
                if (localOptions?.debug) {
                    console.log(`loading skill ${k} in prompt`)
                }
                break;
            }
        }
    }
    const { agentSpec, vars, mcpServers, agentDir } = await readAgent(name, payload, localOptions);
    if (!isAgentSettingsInitialized.value) {
        initAgentSettings()
    }
    const hasSettings = Object.keys(agentSettings).includes(name);
    let settings: AgentSettings = {};
    // backend
    let backendName = "";
    if (hasSettings) {
        settings = agentSettings[name]
    }
    //console.log("EA OPTS", localOptions);
    if (!localOptions?.isToolCall) {
        if (localOptions?.backend) {
            //console.log("BK from options", localOptions.backend);
            backendName = localOptions.backend
        } else if (settings?.backend) {
            //console.log("BK from settings", settings.backend);
            backendName = settings.backend
        } else
            if (agentSpec?.backend) {
                //console.log("BK from spec", agentSpec.backend);
                backendName = agentSpec.backend

            } else {
                // fallback to default backend
                if (!backend.value?.name) {
                    const m = `${name} agent executor: no default backend set`;
                    console.error(m);
                    throw new Error(m)
                }
                //console.log("BK from default", backend.value.name);
                // use default backend
                backendName = backend.value.name;
            }
    } else {
        if (localOptions?.propagateModel) {
            if (!localOptions?.backend) {
                const m = `${name} agent executor: set a backend in options if propagateModel is false`;
                console.error(m);
                throw new Error(m)
            }
            backendName = localOptions.backend
        } else {
            if (agentSpec?.backend) {
                backendName = agentSpec.backend
            } else {
                // if not specified use the default backend
                if (!backend.value) {
                    const m = `${name} agent executor: no default backend or agent spec backend specified for propagateModel false.`;
                    console.error(m, "Default backend:", toRaw(backend), "Backends:", toRaw(backends));
                    throw new Error(m)
                }
                backendName = backend.value.name
            }
        }
        if (localOptions?.system) {
            // in context agent
            if (!agentSpec?.template) {
                agentSpec.template = { system: localOptions.system }
            } else {
                agentSpec.template.system = localOptions.system
            }
        }
    }
    if (agentSpec?.template?.system) {
        localOptions.system = agentSpec.template.system
    }
    if (!(backendName in backends)) {
        const bks = await listBackends(false);
        runtimeDataError(`The backend ${backendName} is not registered in config. Available backends:\n`, bks)
        throw new Error()
    }
    /*if (localOptions?.debug) {
        console.log("Agent executor:", name, "backend:", backendName);
    }*/
    if (backendName?.length == 0) {
        throw new Error(`${name} agent executor: no backend set in options`)
    }
    // check setting for backend    
    const agent = new Agent({
        name: name,
        lm: backends[backendName],
    }, agentSpec);
    //console.log("AGENT BK", backends[backendName], "\nagb:", agent.lm.name)
    if (!localOptions?.model) {
        if (hasSettings) {
            if (settings?.model) {
                localOptions.model = settings.model;
            }
        }
    }

    const execute = async (): Promise<InferenceResult> => {
        //console.log("EXEC AGENT OPTS", localOptions);
        if (localOptions?.verbosity?.mcp && mcpServers?.length > 0) {
            console.log("Starting", mcpServers.length, "mcp servers")
        }
        for (const mcp of mcpServers) {
            await mcp.start();
            const _tools = await mcp.extractTools(localOptions);
            _tools.forEach(t => agentSpec.tools?.push(t));
            if (localOptions?.verbosity?.mcp) {
                console.log("MCP start", mcp.name);
            }
        }
        if (!localOptions?.params) {
            localOptions.params = {}
        }
        let applySettings = hasSettings;
        if (localOptions?.isToolCall) {
            if (!localOptions?.propagateInferParams) {
                applySettings = false;
            }
        }
        if (applySettings) {
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
            if (settings?.chat_template_kwargs && !localOptions?.params?.chat_template_kwargs) {
                localOptions.params.chat_template_kwargs = settings.chat_template_kwargs;
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
        /*if (localOptions?.verbosity?.task) {
            console.log("Task model:", localOptions.model);
            console.log("Task vars:", vars);
        }*/
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
        localOptions.baseDir = agentDir;
        localOptions.variables = vars;
        if (!localOptions?.tools) {
            localOptions.tools = agentSpec.tools;
        }
        let out: InferenceResult;
        //console.log("CORE EXEC AGENT", payload.prompt, "\nOPTS H", localOptions.history)
        let finalPrompt = payload.prompt;
        if (agentSpec?.workflow?.before) {
            //console.log("WFB", agentSpec.workflow.before);
            const workflow = readInlineWorkflow(agentSpec.workflow.before);
            localOptions.inlineWorkflow = workflow;
            //console.log("EXEC BEFORE WF", workflow);
            const res = await executeWorkflow("inline", [payload.prompt], localOptions);
            //console.log("IWF RES", res);
            if (typeof res == "string") {
                finalPrompt = res
            } else {
                if (!res?.prompt) {
                    throw new Error(`before agent workflow ${agentSpec.workflow.before} result: no prompt provided in object`);
                }
                finalPrompt = res.prompt;
                delete res.prompt;
                const ks = Object.keys(res);
                if (ks.length > 0) {
                    ks.forEach(k => localOptions[k] = res[k])
                }
            }
        }
        try {
            //console.log("AGENT RUN");
            out = await agent.run(finalPrompt, localOptions);
        } catch (e: any) {
            //console.log("ERR CATCH", e);
            const errMsg = `${e}`;
            if (errMsg.includes("502 Bad Gateway")) {
                clearInterval(abortTicker);
                const msg = "The server answered with a 502 Bad Gateway error. It might be down or misconfigured. Check your inference server.";
                const err = msg + "\n" + errMsg;
                if ((localOptions?.onError)) {
                    console.error(err, name);
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
                    console.error(err, name);
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
                    console.error(err, name);
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
                    console.error(err, name);
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
                console.error(e)
                throw new Error(errMsg)
            }
        }
        clearInterval(abortTicker);
        //console.log("END TASK", out);
        /*if (!localOptions?.isToolCall) {
            if (!out.text.endsWith("\n")) {
                console.log()
            }
        }*/
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
        if (agentSpec?.workflow?.after) {
            const workflow = readInlineWorkflow(agentSpec.workflow.after);
            localOptions.inlineWorkflow = workflow;
            //console.log("EXEC AFTER WF", workflow);
            out = await executeWorkflow("inline", out, localOptions);
            //console.log("EXEC AFTER WF RES", out);
        }
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
        /*if (localOptions?.backend || settings?.backend) {
            //console.log("SET BACK AGENT BACKEND TO", backend.value);
            // set back the default backend
            agent.lm = backend.value!;
        }*/
        //console.log("TASK OUT", out);
        //console.log("TASK A", agent);
        return out
    }

    return {
        agent,
        vars,
        mcpServers,
        agentDir,
        settings,
        execute,
    }
}

export {
    useAgentExecutor
};

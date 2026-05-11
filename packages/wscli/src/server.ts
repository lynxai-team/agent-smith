import type {
    ClientFeaturesOptions, ClientFeaturesService, ModelInfo, ToolDefSpec,
    ConfigFile, TaskState, UserTaskVariables, ServerParams,
    TaskDef,
    Workspace
} from "@agent-smith/types";
import { reactive, ref, toRaw } from "@vue/reactivity";
import { api } from "./api.js";
import { useWsServer } from "./ws.js";
import { createAwaiter } from "./utils.js";

const useClientFeatures = (stateLocal: TaskState, params: ServerParams = { onToken: (t) => null }): ClientFeaturesService => {
    //console.log(from, ":", params);
    const ws = useWsServer(params);
    const isReady = ref<boolean>(false);
    const task = ref<TaskDef>({} as TaskDef);
    const variables = reactive<UserTaskVariables>({ required: {}, optional: {}, values: { required: {}, optional: {} } });
    const mcp = reactive<{ servers: Record<string, any> }>({ servers: {} });
    let { awaiter, unblock } = createAwaiter<boolean>();

    //console.log("IP", inferOptions.params, "P", params?.defaultInferenceParams);
    //console.log("IPDF", defaultInferenceParams);
    const _old = ws.onToken;
    ws.onToken = (t: string, from: string) => {
        if (_old) {
            _old(t, from);
        }
        if (params?.onToken) {
            params.onToken(t, from);
        }
    }

    async function loadWorkflow(name: string) {
        const res = await api.get<Record<string, any>>("/workflow/" + name);
        if (!res.ok) {
            throw new Error(`${res.status} ${res.text}`)
        }
        if (stateLocal?.currentFeature) {
            // may not be used in external apps
            stateLocal.currentFeature.type = "workflow";
            stateLocal.currentFeature.name = name;
        }
        return res.data
    }

    async function load(name: string, isAgent: boolean = false) {
        variables.required = {};
        variables.optional = {};
        const type = isAgent ? "agent" : "task";
        const res = await api.get<TaskDef>(`/${type}/` + name);
        task.value = res.data;
        // set stateLocal
        if (stateLocal?.currentFeature) {
            // may not be used in external apps
            stateLocal.currentFeature.type = type;
            stateLocal.currentFeature.name = name;
        }
        //console.log(res.data);
        /*if (res.data?.inferParams) {
            //inferOptions.params = res.data.inferParams;
            for (const [k, v] of Object.entries(res.data.inferParams)) {
                // @ts-ignore
                inferOptions.params[k] = v
            }
        };*/
        /*if (res.data.model?.template) {
            inferOptions.params.template = res.data.model.template;
        }*/
        if (res.data?.variables) {
            //console.log("VARS", res.data.variables);
            if (res.data.variables?.required) {
                for (const [name, val] of Object.entries(res.data.variables.required as Record<string, any>)) {
                    // @ts-ignore
                    variables.required[name] = {
                        type: val?.type ? val.type : "string",
                        description: val.description,
                    };
                    variables.values.required[name] = "";
                }
            }
            if (res.data.variables?.optional) {
                for (const [name, val] of Object.entries(res.data.variables.optional as Record<string, any>)) {
                    // @ts-ignore
                    variables.optional[name] = {
                        type: val?.type ? val.type : "string",
                        description: val.description,
                    };
                    variables.values.optional[name] = "";
                }
            }
        };
        //console.log("VARS", variables);
        if (res.data?.mcp) {
            mcp.servers = res.data.mcp
        }
        //console.log("TS", name, toRaw(stateLocal.tasksSettings))
        /*if (name in stateLocal?.tasksSettings) {
            if (stateLocal.tasksSettings[name]?.model) {
                inferOptions.model = stateLocal.tasksSettings[name].model;
            }
        }*/
        isReady.value = true;
    }

    const _exec = async (prompt: string, opts: ClientFeaturesOptions, isAgent = false, isSync = false) => {
        if (isSync) {
            let oir = params?.onTurnEnd;
            initAwaiter();
            params.onTurnEnd = (r, from) => {
                if (oir) {
                    oir(r, from);
                };
                unblock(true);
            }
        }
        //console.log(payload);
        //options.model = task.value.model;
        let taskvars: Record<string, string> = {};

        if (opts?.variables) {
            taskvars = Object.assign({}, opts.variables);
        } else {
            //console.log("WSCLI VARS", variables.values);
            for (const name of Object.keys(variables.values.required)) {
                if (variables.values.required[name] == "") {
                    const msg = `[Error]: missing required variable: ${name} \n\nCurrent options:\n${JSON.stringify(opts)}`;
                    if (params?.onError) {
                        params.onError(msg, stateLocal.currentFeature.name)
                    }
                    throw new Error()
                };
                taskvars[name] = variables.values.required[name];
            };
            if (variables?.optional) {
                for (const name of Object.keys(variables.optional)) {
                    taskvars[name] = variables.values.optional[name];
                };
            };
        }
        //console.log("SRV OPTS VARS", taskvars);
        const payload = { prompt: prompt };
        opts = { ...opts, variables: taskvars };
        //console.log("WSCLI OPTS", opts);
        /*const _options: Record<string, any> = { model: task.value.model ?? opts.model };
        if (opts?.backend) {
            _options.backend = opts.backend;
        }*/
        if (!opts?.nohistory) {
            //console.log("OPTIONS", options)
            let pr = task.value.prompt.replace("{prompt}", prompt);
            if (stateLocal.history.length > 0) {
                //options.chatMode = true;
                opts.history = toRaw(stateLocal.history);
                pr = prompt;
            };
            stateLocal.history.push({
                from: task.value.name,
                user: pr,
                state: {
                    showThinking: false,
                    showToolResponses: [],
                    confirmRestartAtTurn: null,
                    confirmToolCalls: {},
                }
            });
        }
        //console.log("==> OPTS", options);
        if (!isAgent) {
            ws.executeTask(task.value?.name, payload, opts);
            if (isSync) {
                await awaiter;
            }
        } else {
            ws.executeAgent(task.value?.name, payload, opts);
            if (isSync) {
                await awaiter;
            }
        }
    }

    const _execWorkflow = async (name: string, payload: any, options: ClientFeaturesOptions = {}, isSync = false) => {
        if (isSync) {
            let oir = params?.onTurnEnd;
            initAwaiter();
            params.onTurnEnd = (r, from) => {
                if (oir) {
                    oir(r, from);
                };
                unblock(true);
            }
        }
        ws.executeWorkflow(name, payload, options);
        if (isSync) {
            await awaiter;
        }
    }

    const executeTask = async (
        prompt: string, opts: ClientFeaturesOptions = {}
    ) => _exec(prompt, opts, false);

    const executeAgent = async (
        prompt: string, opts: ClientFeaturesOptions = {}
    ) => _exec(prompt, opts, true);

    const executeTaskSync = async (
        prompt: string, opts: ClientFeaturesOptions = {}
    ) => _exec(prompt, opts, false, true);

    const executeAgentSync = async (
        prompt: string, opts: ClientFeaturesOptions = {}
    ) => _exec(prompt, opts, true, true);

    const executeWorkflow = async (
        name: string, payload: any, options: ClientFeaturesOptions = {}
    ) => _execWorkflow(name, payload, options, false);

    const executeWorkflowSync = async (
        name: string, payload: any, options: ClientFeaturesOptions = {}
    ) => _execWorkflow(name, payload, options, true);

    const cancel = async () => {
        await ws.cancel()
    }

    const loadModels = async (): Promise<Record<string, ModelInfo>> => {
        const res = await api.get<Array<ModelInfo>>("/models");
        //console.log("SMODELS", res.data);
        if (!res.ok) {
            throw new Error("can not load models")
        }
        const mi: Record<string, ModelInfo> = {};
        res.data.forEach(m => mi[m.id] = m)
        return mi
    }

    const getTools = async (tools: Array<string>): Promise<Array<{ def: ToolDefSpec, type: string }>> => {
        const tl = new Array<string>();
        tools.forEach(t => {
            let tn = t;
            if (t.endsWith("?")) {
                tn = t.slice(0, -1)
            }
            tl.push(tn);
        });
        return (await api.post<Array<{ def: ToolDefSpec, type: string }>>("/tools", tl)).data;
    }

    const loadTaskSettings = async () => {
        const res = await api.get<Record<string, Record<string, any>>>("/tasks/settings");
        if (!res.ok) {
            throw new Error("can not load tasks settings")
        }
        return res.data
    }

    const loadBackends = async () => {
        const res = await api.get<Record<string, Record<string, any>>>("/backends");
        if (!res.ok) {
            throw new Error("can not load backends")
        }
        return res.data
    }

    const loadWorkspaces = async () => {
        const res = await api.get<Array<Workspace>>("/workspace");
        if (!res.ok) {
            throw new Error("can not load workspaces")
        }
        return res.data
    }

    const setBackend = async (name: string) => {
        const res = await api.get<boolean>("/backend/" + name);
        if (!res.ok) {
            throw new Error("can not load backend")
        }
        return res.data
    }

    const checkState = async (): Promise<{ found: boolean, config: ConfigFile }> => {
        const res = await api.get<ConfigFile>("/state");
        //console.log("STATE", res.status);
        if (!res.ok) {
            throw new Error("can not load state")
        }
        if (res.status == 202) {
            return { found: false, config: {} }
        }
        return { found: true, config: res.data }
    }

    const initAwaiter = () => {
        const aw = createAwaiter();
        awaiter = aw.awaiter;
        unblock = aw.unblock;
    }

    return {
        isReady,
        task,
        variables,
        //inferOptions,
        mcp,
        loadModels,
        loadTaskSettings,
        load,
        executeTask,
        executeTaskSync,
        executeAgent,
        executeAgentSync,
        executeWorkflow,
        executeWorkflowSync,
        cancel,
        getTools,
        checkState,
        loadWorkflow,
        loadBackends,
        setBackend,
        loadWorkspaces,
    }
};

export {
    useClientFeatures,
};

import type {
    AgentSpec,
    ClientFeaturesOptions, ClientFeaturesService,
    ConfigFile,
    ModelInfo,
    ServerParams,
    ToolDefSpec,
    UserAgentVariables,
    Workspace,
    SamplingPreset,
} from "@agent-smith/types";
import { reactive, ref } from "@vue/reactivity";
import { api } from "./api.js";
import { createAwaiter } from "./utils.js";
import { useWsServer } from "./ws.js";

const useClientFeatures = (params: ServerParams = { onToken: (t) => null }): ClientFeaturesService => {
    //console.log(from, ":", params);
    const ws = useWsServer(params);
    const isReady = ref<boolean>(false);
    const agentSpec = ref<AgentSpec>({} as AgentSpec);
    const variables = reactive<UserAgentVariables>({ required: {}, optional: {}, values: { required: {}, optional: {} } });
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
        return res.data
    }

    async function load(name: string) {
        variables.required = {};
        variables.optional = {};
        const res = await api.get<AgentSpec>(`/agent/${name}/`);
        agentSpec.value = res.data;
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
        isReady.value = true;
    }

    const _exec = async (prompt: string, opts: ClientFeaturesOptions, isSync = false) => {
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
        let agentvars: Record<string, string> = {};

        if (opts?.variables) {
            agentvars = Object.assign({}, opts.variables);
        } else {
            //console.log("WSCLI VARS", variables.values);
            for (const name of Object.keys(variables.values.required)) {
                if (variables.values.required[name] == "") {
                    const msg = `[Error]: missing required variable: ${name} \n\nCurrent options:\n${JSON.stringify(opts)}`;
                    if (params?.onError) {
                        params.onError(msg, agentSpec.value.name)
                    }
                    throw new Error()
                };
                agentvars[name] = variables.values.required[name];
            };
            if (variables?.optional) {
                for (const name of Object.keys(variables.optional)) {
                    agentvars[name] = variables.values.optional[name];
                };
            };
        }
        //console.log("SRV OPTS VARS", agentvars);
        const payload = { prompt: prompt };
        opts = { ...opts, variables: agentvars };
        //console.log("==> OPTS", options);

        ws.executeAgent(agentSpec.value?.name, payload, opts);
        if (isSync) {
            await awaiter;
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

    const executeAgent = async (
        prompt: string, opts: ClientFeaturesOptions = {}
    ) => _exec(prompt, opts, true);

    const executeAgentSync = async (
        prompt: string, opts: ClientFeaturesOptions = {}
    ) => _exec(prompt, opts, true);

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

    const loadSamplingPresets = async (): Promise<Record<string, SamplingPreset>> => {
        const res = await api.get<Array<SamplingPreset>>("/models/presets");
        //console.log("SMODELS", res.data);
        if (!res.ok) {
            throw new Error("can not load model presets")
        }
        const mi: Record<string, SamplingPreset> = {};
        res.data.forEach(m => mi[m.name] = m)
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

    const loadAgentSettings = async () => {
        const res = await api.get<Record<string, Record<string, any>>>("/agentsettings");
        if (!res.ok) {
            throw new Error("can not load agents settings")
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

    const loadSettings = async (): Promise<Record<string, any>> => {
        const res = await api.get<Record<string, any>>("/settings");
        if (!res.ok) {
            throw new Error("can not load settings")
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
        variables,
        //inferOptions,
        mcp,
        agentSpec,
        loadModels,
        loadAgentSettings,
        load,
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
        loadSettings,
        loadSamplingPresets,
    }
};

export {
    useClientFeatures
};


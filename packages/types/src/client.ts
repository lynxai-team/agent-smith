import type { Reactive, Ref } from "vue";
import type { ConfigFile } from "./conf.js";
import type { AgentInferenceOptions, SamplingPreset } from "./inference.js";
import type { ToolDefSpec } from "./tools.js";
import type { Workspace } from "./workspace.js";
import type { AgentSettings, AgentSpec, UserAgentVariables } from "./agent.js";
import type { ModelInfo } from "./model.js";

interface ClientFeaturesOptions extends AgentInferenceOptions {
    backend?: string;
    variables?: Record<string, any>;
    nohistory?: boolean;
}

interface ClientFeaturesService {
    isReady: Ref<boolean>;
    agentSpec: Ref<AgentSpec>;
    variables: Reactive<UserAgentVariables>;
    //inferOptions: Reactive<{ params: InferenceParams, model: string }>;
    mcp: Reactive<{ servers: Record<string, any> }>;
    loadModels: () => Promise<Record<string, ModelInfo>>;
    loadAgentSettings: () => Promise<Record<string, AgentSettings>>;
    load: (name: string, isAgent?: boolean) => Promise<void>;
    loadWorkflow: (name: string) => Promise<Record<string, any>>;
    loadBackends: () => Promise<Record<string, any>>;
    setBackend: (name: string) => Promise<boolean>;
    executeAgent: (prompt: string, opts?: ClientFeaturesOptions) => Promise<void>;
    executeAgentSync: (prompt: string, opts?: ClientFeaturesOptions) => Promise<void>;
    executeWorkflow: (name: string, payload: any, options?: ClientFeaturesOptions) => Promise<void>;
    executeWorkflowSync: (name: string, payload: any, options?: ClientFeaturesOptions) => Promise<void>;
    cancel: () => Promise<void>;
    getTools: (tools: Array<string>) => Promise<Array<{ def: ToolDefSpec, type: string }>>;
    checkState: () => Promise<{ found: boolean, config: ConfigFile }>;
    loadWorkspaces: () => Promise<Array<Workspace>>;
    loadSettings: () => Promise<Record<string, any>>;
    loadSamplingPresets: () => Promise<Record<string, SamplingPreset>>;
}

export {
    ClientFeaturesOptions,
    ClientFeaturesService,
}


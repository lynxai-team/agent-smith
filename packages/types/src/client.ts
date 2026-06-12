/**
 * @file Defines client-side features and service interfaces for the Agent Smith framework.
 * Imports: Utilizes types from `vue`, `conf.js`, `inference.js`, `tools.js`, `workspace.js`, `agent.js`, and `model.js`.
 * @example
 * // Example of using ClientFeaturesService
 * import type { ClientFeaturesService, ClientFeaturesOptions } from './client';
 *
 * const options: ClientFeaturesOptions = {
 *   backend: 'ollama',
 *   variables: { userName: 'John' },
 *   nohistory: false
 * };
 *
 * // Load and execute an agent
 * await clientService.load('chat-agent');
 * await clientService.executeAgent('Hello, how are you?', options);
 */

import type { Reactive, Ref } from "vue";
import type { ConfigFile } from "./conf.js";
import type { AgentInferenceOptions, SamplingPreset } from "./inference.js";
import type { ToolDefSpec } from "./tools.js";
import type { Workspace } from "./workspace.js";
import type { AgentSettings, AgentSpec, UserAgentVariables } from "./agent.js";
import type { ModelInfo } from "./model.js";

/**
 * Options for client-side feature execution.
 * Extends agent inference options with additional client-specific settings.
 *
 * @interface ClientFeaturesOptions
 * @property {string} [backend] - The backend to use for inference (e.g., 'ollama', 'openai').
 * @property {Record<string, any>} [variables] - Key-value pairs of variables to inject into the agent execution.
 * @property {boolean} [nohistory] - If true, disables history tracking for this execution.
 * @example
 * const options: ClientFeaturesOptions = {
 *   backend: 'ollama',
 *   variables: { userName: 'Alice', context: 'project-alpha' },
 *   nohistory: false
 * };
 */
interface ClientFeaturesOptions extends AgentInferenceOptions {
    backend?: string;
    variables?: Record<string, any>;
    nohistory?: boolean;
}

/**
 * Service interface providing client-side agent and workflow execution capabilities.
 * This service manages the lifecycle of agents, workflows, models, and backends.
 *
 * @interface ClientFeaturesService
 * @property {Ref<boolean>} isReady - Reactive reference indicating whether the service is ready for execution.
 * @property {Ref<AgentSpec>} agentSpec - Reactive reference to the current agent specification.
 * @property {Reactive<UserAgentVariables>} variables - Reactive store of user-provided agent variables.
 * @property {Reactive<{ servers: Record<string, any> }>} mcp - Reactive MCP (Model Context Protocol) server configuration.
 * @property {(backend: string) => Promise<Record<string, ModelInfo>>} loadModels - Loads available models for a given backend.
 * @property {() => Promise<Record<string, AgentSettings>>} loadAgentSettings - Loads all configured agent settings.
 * @property {(name: string, isAgent?: boolean) => Promise<void>} load - Loads an agent or workflow by name.
 * @property {(name: string) => Promise<Record<string, any>>} loadWorkflow - Loads a workflow configuration.
 * @property {() => Promise<Record<string, any>>} loadBackends - Loads available backend configurations.
 * @property {(name: string) => Promise<boolean>} setBackend - Sets the active backend by name.
 * @property {(prompt: string, opts?: ClientFeaturesOptions) => Promise<void>} executeAgent - Executes an agent asynchronously with a prompt.
 * @property {(prompt: string, opts?: ClientFeaturesOptions) => Promise<void>} executeAgentSync - Executes an agent synchronously with a prompt.
 * @property {(name: string, payload: any, options?: ClientFeaturesOptions) => Promise<void>} executeWorkflow - Executes a workflow asynchronously.
 * @property {(name: string, payload: any, options?: ClientFeaturesOptions) => Promise<void>} executeWorkflowSync - Executes a workflow synchronously.
 * @property {() => Promise<void>} cancel - Cancels the current execution.
 * @property {(tools: Array<string>) => Promise<Array<{ def: ToolDefSpec, type: string }>>} getTools - Retrieves tool definitions by name.
 * @property {() => Promise<{ found: boolean, config: ConfigFile }>} checkState - Checks the current state and configuration.
 * @property {() => Promise<Array<Workspace>>> loadWorkspaces - Loads available workspaces.
 * @property {() => Promise<Record<string, any>>} loadSettings - Loads general application settings.
 * @property {() => Promise<Record<string, SamplingPreset>>>} loadSamplingPresets - Loads available sampling presets.
 * @example
 * const service: ClientFeaturesService = getFeaturesService();
 *
 * // Wait for the service to be ready
 * await waitFor(() => service.isReady.value);
 *
 * // Load available backends and set one
 * const backends = await service.loadBackends();
 * console.log('Available backends:', Object.keys(backends));
 * await service.setBackend('ollama');
 *
 * // Load models for the backend
 * const models = await service.loadModels('ollama');
 * console.log('Loaded models:', Object.keys(models));
 *
 * // Load and execute an agent
 * await service.load('chat-agent');
 * await service.executeAgent('Hello, how can you help me?', {
 *   variables: { userName: 'Alice' }
 * });
 *
 * // Execute a workflow with payload
 * await service.executeWorkflow('data-pipeline', {
 *   input: 'sample-data.csv',
 *   output: 'results.json'
 * }, { nohistory: true });
 */
interface ClientFeaturesService {
    isReady: Ref<boolean>;
    agentSpec: Ref<AgentSpec>;
    variables: Reactive<UserAgentVariables>;
    //inferOptions: Reactive<{ params: InferenceParams, model: string }>;
    mcp: Reactive<{ servers: Record<string, any> }>;
    loadModels: (backend: string) => Promise<Record<string, ModelInfo>>;
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

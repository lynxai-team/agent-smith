
import type { Reactive, Ref } from "vue";
import type { ConfigFile } from "./conf.js";
import type { HistoryTurn, UiHistoryTurn } from "./history.js";
import type { AgentInferenceOptions, InferenceParams } from "./inference.js";
import type { ModelInfo } from "./model.js";
import type { ToolDefSpec, ToolSpec } from "./tools.js";
import type { McpServerSpec } from "./core.js";

/**
 * Settings for a task configuration.
 *
 * @interface TaskSettings
 * @param {string} [model] - The model to use for the task.
 * @param {number} [ctx] - Context window size.
 * @param {number} [max_tokens] - Maximum number of tokens to generate.
 * @param {number} [top_k] - Top-k sampling parameter.
 * @param {number} [top_p] - Top-p sampling parameter.
 * @param {number} [min_p] - Minimum probability for nucleus sampling.
 * @param {number} [temperature] - Sampling temperature.
 * @param {number | undefined} repeat_penalty - Adjusts penalty for repeated tokens.
 * @param {number | undefined} presence_penalty - Adjusts penalty for presence.
 * @param {number | undefined} frequency_penalty - Repeat alpha frequency penalty.
 * @param {string} [backend] - The backend to use for the task.
 * @example
 * const taskSettings: TaskSettings = {
 *   model: 'llama3',
 *   ctx: 2048,
 *   temperature: 0.7
 * };
 */
interface TaskSettings {
    model?: string;
    ctx?: number;
    max_tokens?: number;
    top_k?: number;
    top_p?: number;
    min_p?: number;
    temperature?: number;
    repeat_penalty?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    backend?: string;
}

/**
 * Definition of a task variable.
 *
 * @interface TaskVariableDef
 * @param {string | Array<string>} type - The type of the variable, can be a string or array for enums.
 * @param {string} description - Description of the variable.
 * @example
 * const variableDef: TaskVariableDef = {
 *   type: 'string',
 *   description: 'User name'
 * };
 */
interface TaskVariableDef {
    type: string | Array<string>; // array is for enums
    description: string;
}

/**
 * Definition of an optional task variable.
 *
 * @interface TaskOptionalVariableDef
 * @param {string | Array<string>} type - The type of the variable, can be a string or array for enums.
 * @param {string} description - Description of the variable.
 * @param {any} [default] - Default value for the variable.
 * @example
 * const optionalVariableDef: TaskOptionalVariableDef = {
 *   type: 'string',
 *   description: 'User age',
 *   default: '25'
 * };
 */
interface TaskOptionalVariableDef extends TaskVariableDef {
    default?: any
}

/**
 * Task variables structure.
 *
 * @interface TaskVariables
 * @param {Record<string, TaskVariableDef>} [required] - Required variable definitions.
 * @param {Record<string, TaskOptionalVariableDef>} [optional] - Optional variable definitions.
 * @example
 * const taskVariables: TaskVariables = {
 *   required: {
 *     name: { type: 'string', description: 'User name' }
 *   },
 *   optional: {
 *     age: { type: 'string', description: 'User age', default: '25' }
 *   }
 * };
 */
interface TaskVariables {
    required?: Record<string, TaskVariableDef>;
    optional?: Record<string, TaskOptionalVariableDef>;
}

/**
 * User task variables with required and optional values.
 *
 * @interface UserTaskVariables
 * @param {Record<string, string>} required - Required variable values.
 * @param {Record<string, string>} optional - Optional variable values.
 * @example
 * const variables: UserTaskVariables = {
 *   values: {
 *     required: { name: 'John' },
 *     optional: { age: '30' }
 *   }
 * };
 */
interface UserTaskVariables extends TaskVariables {
    values: {
        required: Record<string, string>,
        optional: Record<string, string>,
    }
}

interface ClientFeaturesOptions extends AgentInferenceOptions {
    backend?: string;
    variables?: Record<string, any>;
    nohistory?: boolean;
}

/**
 * Service interface for task management.
 *
 * @interface ClientFeaturesService
 * @param {Ref<boolean>} isReady - Reactive reference indicating if service is ready.
 * @param {Ref<LmTaskFileSpec>} task - Reactive reference to current task.
 * @param {Reactive<UserTaskVariables>} variables - Reactive task variables.
 * @param {Reactive<{ servers: Record<string, any> }>} mcp - Reactive MCP servers.
 * @param {() => Promise<Record<string, any>>} loadModels - Loads available models.
 * @param {() => Promise<Record<string, Record<string, any>>>} loadTaskSettings - Loads task settings.
 * @param {(name: string, isAgent?: boolean) => Promise<void>} load - Loads a specific task.
 * @param {(name: string) => Promise<Record<string, any>>} loadWorkflow - Loads a workflow.
 * @param {() => Promise<Record<string, any>>} loadBackends - Loads backend configurations.
 * @param {(name: string) => Promise<boolean>} setBackend - Sets the active backend.
 * @param {(prompt: string, opts?: Record<string, any>, isAgent?: boolean) => Promise<void>} exec - Executes a prompt.
 * @param {(prompt: string, opts?: Record<string, any>, isAgent?: boolean, isSync?: boolean) => Promise<void>} execSync - Synchronously executes a prompt.
 * @param {() => Promise<void>} cancel - Cancels current execution.
 * @param {(tools: Array<string>) => Promise<Array<{ def: ToolDefSpec, type: string }>>} getTools - Retrieves tool specifications.
 * @param {() => Promise<{ found: boolean, config: ConfigFile }>} checkState - Checks current configuration state.
 * @example
 * const taskService: ClientFeaturesService = {
 *   isReady: ref(false),
 *   task: ref({}),
 *   variables: reactive({ values: { required: {}, optional: {} } }),
 *   inferOptions: reactive({ data: {}, model: "" }),
 *   mcp: reactive({ servers: {} }),
 *   loadModels: async () => ({}),
 *   loadTaskSettings: async () => ({}),
 *   load: async (name) => {},
 *   loadWorkflow: async (name) => ({}),
 *   loadBackends: async () => ({}),
 *   setBackend: async (name) => true,
 *   exec: async (prompt) => {},
 *   execSync: async (prompt) => {},
 *   cancel: async () => {},
 *   getTools: async (tools) => [],
 *   checkState: async () => ({ found: false, config: {} })
 * };
 */
interface ClientFeaturesService {
    isReady: Ref<boolean>;
    task: Ref<TaskDef>;
    variables: Reactive<UserTaskVariables>;
    //inferOptions: Reactive<{ params: InferenceParams, model: string }>;
    mcp: Reactive<{ servers: Record<string, any> }>;
    loadModels: () => Promise<Record<string, any>>;
    loadTaskSettings: () => Promise<Record<string, Record<string, any>>>;
    load: (name: string, isAgent?: boolean) => Promise<void>;
    loadWorkflow: (name: string) => Promise<Record<string, any>>;
    loadBackends: () => Promise<Record<string, any>>;
    setBackend: (name: string) => Promise<boolean>;
    executeTask: (prompt: string, opts?: ClientFeaturesOptions) => Promise<void>;
    executeTaskSync: (prompt: string, opts?: ClientFeaturesOptions) => Promise<void>;
    executeAgent: (prompt: string, opts?: ClientFeaturesOptions) => Promise<void>;
    executeAgentSync: (prompt: string, opts?: ClientFeaturesOptions) => Promise<void>;
    executeWorkflow: (name: string, payload: any, options?: ClientFeaturesOptions) => Promise<void>;
    executeWorkflowSync: (name: string, payload: any, options?: ClientFeaturesOptions) => Promise<void>;
    cancel: () => Promise<void>;
    getTools: (tools: Array<string>) => Promise<Array<{ def: ToolDefSpec, type: string }>>;
    checkState: () => Promise<{ found: boolean, config: ConfigFile }>;
}

/**
 * Task state management structure.
 *
 * @interface TaskState
 * @param {boolean} isReady - Whether the task is ready.
 * @param {Promise<boolean>} onReady - Promise that resolves when ready.
 * @param {boolean} hasConfig - Whether configuration exists.
 * @param {Array<UiHistoryTurn>} history - History of turns.
 * @param {Record<string, ModelInfo>} models - Available models.
 * @param {Record<string, Record<string, any>>} tasksSettings - Task settings.
 * @param {Record<string, Record<string, any>>} backends - Backend configurations.
 * @param {Object} currentFeature - Current feature information.
 * @param {string} currentFeature.name - Feature name.
 * @param {string} currentFeature.type - Feature type.
 * @example
 * const taskState: TaskState = {
 *   isReady: false,
 *   onReady: Promise.resolve(false),
 *   hasConfig: false,
 *   history: [],
 *   models: {},
 *   tasksSettings: {},
 *   backends: {},
 *   currentFeature: { name: 'chat', type: 'task' }
 * };
 */
interface TaskState {
    isReady: boolean,
    onReady: Promise<boolean>,
    hasConfig: boolean,
    history: Array<UiHistoryTurn>,
    models: Record<string, ModelInfo>,
    tasksSettings: Record<string, Record<string, any>>,
    backends: Record<string, Record<string, any>>,
    currentFeature: { name: string, type: string },
}

/**
 * Template specification for a language model task.
 *
 * @interface TemplateSpec
 * @param {string} [system] - The system message for the template.
 * @param {string} [afterSystem] - The message that comes after the system message.
 * @param {Array<string>} [stop] - Extra stop sequences for the template.
 * @param {string} [assistant] - The assistant start message for the template.
 * @example
 * const template: TemplateSpec = {
 *   system: "You are a helpful AI",
 *   stop: ["\n", "<tool_call>"],
 * };
 */
interface TemplateSpec {
    system?: string;
    afterSystem?: string;
    stop?: Array<string>;
    assistant?: string;
}

/**
 * Task definition structure.
 *
 * @interface TaskDef
 * @param {string} name - The name of the task.
 * @param {string} prompt - The prompt for the task.
 * @param {string} description - Description of the task.
 * @param {string} model - The model to use for the task.
 * @param {number} ctx - Context window size.
 * @param {TemplateSpec} [template] - Template specification for the task.
 * @param {InferenceParams} [inferParams] - Inference parameters for the task.
 * @param {Array<string>} [models] - Available models for the task.
 * @param {Array<HistoryTurn>} [shots] - Example turns for the task.
 * @param {TaskVariables} [variables] - Variables for the task.
 * @param {Array<ToolSpec>} [tools] - Tools available for the task.
 * @param {Array<string>} [toolsList] - List of tool names for the task.
 * @param {string} [type] - Type of the task.
 * @param {string} [category] - Category of the task.
 * @example
 * const taskDef: TaskDef = {
 *   name: 'chat',
 *   prompt: 'Chat with the user',
 *   description: 'A simple chat task',
 *   model: 'llama3',
 *   ctx: 2048
 * };
 */
interface TaskDef {
    name: string;
    prompt: string;
    description: string;
    model: string;
    ctx: number;
    template?: TemplateSpec;
    inferParams?: InferenceParams;
    models?: Array<string>;
    shots?: Array<HistoryTurn>;
    variables?: TaskVariables;
    tools?: Array<ToolSpec>;
    toolsList?: Array<string>;
    type?: string;
    category?: string;
    mcp?: McpServerSpec;
}

export {
    ClientFeaturesOptions, TaskDef, TaskOptionalVariableDef, ClientFeaturesService, TaskSettings, TaskState, TaskVariableDef, TaskVariables, TemplateSpec, UserTaskVariables
};


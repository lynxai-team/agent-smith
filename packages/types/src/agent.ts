import type { AllCallbacks } from "./callbacks.js";
import type { LmProvider } from "./lm.js";
import type { McpServerSpec } from "./core.js";
import type { HistoryTurn, UiHistoryTurn } from "./history.js";
import type { InferenceParams, PromptProcessingInProgressStats, SamplingPreset } from "./inference.js";
import type { ModelInfo } from "./model.js";
import type { ToolSpec } from "./tools.js";
import type { Workspace } from "./workspace.js";

/**
 * Settings for a agent configuration.
 *
 * @interface AgentSettings
 * @property {string} [model] - The model to use for the agent.
 * @property {number} [ctx] - Context window size.
 * @property {number} [max_tokens] - Maximum number of tokens to generate.
 * @property {number} [top_k] - Top-k sampling parameter.
 * @property {number} [top_p] - Top-p sampling parameter.
 * @property {number} [min_p] - Minimum probability for nucleus sampling.
 * @property {number} [temperature] - Sampling temperature.
 * @property {number | undefined} repeat_penalty - Adjusts penalty for repeated tokens.
 * @property {number | undefined} presence_penalty - Adjusts penalty for presence.
 * @property {number | undefined} frequency_penalty - Repeat alpha frequency penalty.
 * @property {string} [backend] - The backend to use for the agent.
 * @example
 * const agentSettings: AgentSettings = {
 *   model: 'llama3',
 *   ctx: 2048,
 *   temperature: 0.7
 * };
 */
interface AgentSettings {
    model?: string;
    backend?: string;
    max_tokens?: number;
    top_k?: number;
    top_p?: number;
    min_p?: number;
    temperature?: number;
    repeat_penalty?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    chat_template_kwargs?: Record<string, any>;
    props?: Record<string, any>;
}

/**
 * Definition of a agent variable.
 *
 * @interface AgentVariableDef
 * @property {string | Array<string>} type - The type of the variable, can be a string or array for enums.
 * @property {string} description - Description of the variable.
 * @example
 * const variableDef: AgentVariableDef = {
 *   type: 'string',
 *   description: 'User name'
 * };
 */
interface AgentVariableDef {
    type: string | Array<string>; // array is for enums
    description: string;
}

/**
 * Definition of an optional agent variable.
 *
 * @interface AgentOptionalVariableDef
 * @property {string | Array<string>} type - The type of the variable, can be a string or array for enums.
 * @property {string} description - Description of the variable.
 * @property {any} [default] - Default value for the variable.
 * @example
 * const optionalVariableDef: AgentOptionalVariableDef = {
 *   type: 'string',
 *   description: 'User age',
 *   default: '25'
 * };
 */
interface AgentOptionalVariableDef extends AgentVariableDef {
    default?: any
}

/**
 * Agent variables structure.
 *
 * @interface AgentVariables
 * @property {Record<string, AgentVariableDef>} [required] - Required variable definitions.
 * @property {Record<string, AgentOptionalVariableDef>} [optional] - Optional variable definitions.
 * @example
 * const agentVariables: AgentVariables = {
 *   required: {
 *     name: { type: 'string', description: 'User name' }
 *   },
 *   optional: {
 *     age: { type: 'string', description: 'User age', default: '25' }
 *   }
 * };
 */
interface AgentVariables {
    required?: Record<string, AgentVariableDef>;
    optional?: Record<string, AgentOptionalVariableDef>;
}

/**
 * User agent variables with required and optional values.
 *
 * @interface UserAgentVariables
 * @property {Record<string, string>} required - Required variable values.
 * @property {Record<string, string>} optional - Optional variable values.
 * @example
 * const variables: UserAgentVariables = {
 *   values: {
 *     required: { name: 'John' },
 *     optional: { age: '30' }
 *   }
 * };
 */
interface UserAgentVariables extends AgentVariables {
    values: {
        required: Record<string, string>,
        optional: Record<string, string>,
    }
}

/**
 * Agent state management structure.
 *
 * @interface AgentState
 * @property {boolean} isReady - Whether the agent is ready.
 * @property {Promise<boolean>} onReady - Promise that resolves when ready.
 * @property {boolean} hasConfig - Whether configuration exists.
 * @property {Array<UiHistoryTurn>} history - History of turns.
 * @property {Record<string, ModelInfo>} models - Available models.
 * @property {Record<string, Record<string, any>>} agentsSettings - Agent settings.
 * @property {Record<string, Record<string, any>>} backends - Backend configurations.
 * @property {Object} currentFeature - Current feature information.
 * @property {string} currentFeature.name - Feature name.
 * @property {string} currentFeature.type - Feature type.
 * @example
 * const agentState: AgentState = {
 *   isReady: false,
 *   onReady: Promise.resolve(false),
 *   hasConfig: false,
 *   history: [],
 *   models: {},
 *   agentsSettings: {},
 *   backends: {},
 *   currentFeature: { name: 'chat', type: 'agent' }
 * };
 */
interface AgentState {
    isReady: boolean,
    isProcessingPrompt: boolean,
    isLoadingModel: boolean,
    onReady: Promise<boolean>,
    promptProcessingProgress: PromptProcessingInProgressStats,
    hasConfig: boolean,
    uihistory: Array<UiHistoryTurn>,
    history: Array<HistoryTurn>,
    models: Record<string, ModelInfo>,
    agentsSettings: Record<string, Record<string, any>>,
    backends: Record<string, Record<string, any>>,
    currentFeature: { name: string, type: string },
    currentWorkspace: Workspace;
    currentModel: ModelInfo;
    workspaces: Record<string, Workspace>;
    settings: Record<string, any>;
    samplingPresets: Record<string, SamplingPreset>;
}

/**
 * Template specification for a language model agent.
 *
 * @interface TemplateSpec
 * @property {string} [system] - The system message for the template.
 * @property {string} [afterSystem] - The message that comes after the system message.
 * @property {Array<string>} [stop] - Extra stop sequences for the template.
 * @property {string} [assistant] - The assistant start message for the template.
 * @example
 * const template: TemplateSpec = {
 *   system: "You are a helpful AI",
 *   stop: ["\n", "<tool_call>"],
 * };
 */
interface TemplateSpec {
    system?: string;
    stop?: Array<string>;
    assistant?: string;
}

/**
 * Agent definition structure.
 *
 * @interface AgentDef
 * @property {string} name - The name of the agent.
 * @property {string} prompt - The prompt for the agent.
 * @property {string} description - Description of the agent.
 * @property {string} model - The model to use for the agent.
 * @property {number} ctx - Context window size.
 * @property {TemplateSpec} [template] - Template specification for the agent.
 * @property {InferenceParams} [inferParams] - Inference parameters for the agent.
 * @property {Array<string>} [models] - Available models for the agent.
 * @property {Array<HistoryTurn>} [shots] - Example turns for the agent.
 * @property {AgentVariables} [variables] - Variables for the agent.
 * @property {Array<ToolSpec>} [tools] - Tools available for the agent.
 * @property {Array<string>} [toolsList] - List of tool names for the agent.
 * @property {string} [type] - Type of the agent.
 * @property {string} [category] - Category of the agent.
 * @example
 * const agentDef: AgentDef = {
 *   name: 'chat',
 *   prompt: 'Chat with the user',
 *   description: 'A simple chat agent',
 *   model: 'llama3',
 *   ctx: 2048
 * };
 */
interface AgentSpec {
    name: string;
    prompt: string;
    description: string;
    model: string;
    backend?: string;
    template?: TemplateSpec;
    inferParams?: InferenceParams;
    models?: Array<string>;
    shots?: Array<HistoryTurn>;
    variables?: AgentVariables;
    tools?: Array<ToolSpec>;
    toolsList?: Array<string>;
    type?: string;
    category?: string;
    mcp?: McpServerSpec;
    skills?: Array<string>;
    workflow?: AgentWorkflow;
}

/**
 * Represents the parameters required to configure an Agent.
 *
 * @interface AgentParams
 * @augments AllCallbacks
 * @property {string} [name] - Optional name for the agent.
 * @property {LmProvider} lm - The language model provider used by the agent.
 * @example
 * const agentParams: AgentParams = {
 *   name: 'AssistantAgent',
 *   lm: new OpenAILMProvider(),
 *   onMessage: (message) => console.log(`Received: ${message}`),
 *   onError: (error) => console.error(`Error: ${error}`),
 * };
 */
interface AgentParams extends AllCallbacks {
    name?: string;
    lm: LmProvider,
}

interface AgentWorkflow {
    before?: Array<Record<string, string>>;
    after?: Array<Record<string, string>>;
}

export {
    AgentParams,
    AgentSpec,
    AgentOptionalVariableDef,
    AgentSettings,
    AgentState,
    AgentVariableDef,
    AgentVariables,
    TemplateSpec,
    UserAgentVariables,
    AgentWorkflow,
}

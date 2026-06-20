/**
 * @file Core type definitions and interfaces for the Agent Smith project.
 * Defines fundamental types for features, agents, commands, workflows, MCP servers, and settings.
 * Imports: Utilizes `AgentVariables` from "./agent.js".
 * @example
 * // Using FeatureSpec to define a new agent feature
 * const agentFeature: FeatureSpec = {
 *   name: 'my-agent',
 *   path: './agents/my-agent.yml',
 *   ext: 'yml',
 *   type: 'agent'
 * };
 *
 * // Creating a Settings object
 * const settings: Settings = {
 *   name: 'default',
 *   inputmode: 'manual',
 *   outputmode: 'txt',
 *   runmode: 'cli',
 *   formatmode: 'text',
 *   ischatMode: false,
 *   isdebug: false,
 *   isverbose: false,
 *   promptfile: './prompt.txt'
 * };
 */

import type { AgentVariables } from "./agent.js";

/**
 * Represents the specification of a feature in the Agent Smith system.
 * @interface FeatureSpec
 * @property {number} [id] - Optional unique identifier for the feature.
 * @property {string} name - The name of the feature.
 * @property {string} path - The file path where the feature is defined.
 * @property {FeatureExtension} ext - The file extension type of the feature.
 * @property {AgentVariables | Record<string, any>} [variables] - Optional variables associated with the feature.
 * @property {string} [type] - Optional type classification of the feature.
 * @property {string} [category] - Optional category for organizing features.
 * @example
 * const feature: FeatureSpec = {
 *   id: 1,
 *   name: 'code-review',
 *   path: './features/code-review.yml',
 *   ext: 'yml',
 *   type: 'agent',
 *   category: 'development'
 * };
 */
interface FeatureSpec {
    id?: number;
    name: string;
    path: string;
    ext: FeatureExtension;
    variables?: AgentVariables | Record<string, any>;
    type?: string;
    category?: string;
}

/**
 * Represents a collection of all feature types available in the system.
 * Each key maps to an array of features of that specific type.
 * @interface Features
 * @property {Array<{ name: string, path: string, ext: AgentExtension }>} agent - Array of agent features.
 * @property {Array<{ name: string, path: string, ext: CmdExtension, variables?: { name: string, options?: Array<Array<string> | string>, description: string }>} cmd - Array of command features.
 * @property {Array<{ name: string, path: string, ext: ActionExtension }>} action - Array of action features.
 * @property {Array<{ name: string, path: string, ext: WorkflowExtension }>} workflow - Array of workflow features.
 * @property {Array<{ name: string, path: string, ext: AdaptaterExtension }>} adaptater - Array of adapter features.
 * @property {Array<{ name: string, path: string, ext: SkillExtension, variables?: Record<string, any>}>} skill - Array of skill features.
 * @example
 * const allFeatures: Features = {
 *   agent: [{ name: 'coder', path: './agents/coder.yml', ext: 'yml' }],
 *   cmd: [{ name: 'build', path: './cmds/build.js', ext: 'js', description: 'Build the project' }],
 *   action: [{ name: 'lint', path: './actions/lint.js', ext: 'js' }],
 *   workflow: [{ name: 'deploy', path: './workflows/deploy.yml', ext: 'yml' }],
 *   adaptater: [{ name: 'slack', path: './adapters/slack.js', ext: 'js' }],
 *   skill: [{ name: 'debug', path: './skills/debug.md', ext: 'md' }],
 *   task: [{ name: 'debug', path: './skills/debug.md', ext: 'md' }],
 *   tasktemplate: [{ name: 'debug', path: './skills/debug.md', ext: 'md' }]
 * };
 */
interface Features {
    agent: Array<{ name: string, path: string, ext: AgentExtension }>;
    cmd: Array<{
        name: string, path: string, ext: CmdExtension,
        variables?: { name: string, options?: Array<Array<string> | string>, description: string }
    }>;
    action: Array<{ name: string, path: string, ext: ActionExtension }>;
    workflow: Array<{ name: string, path: string, ext: WorkflowExtension }>;
    adaptater: Array<{ name: string, path: string, ext: AdaptaterExtension }>;
    skill: Array<{ name: string, path: string, ext: SkillExtension, variables?: Record<string, any> }>;
    task: Array<{ name: string, path: string, ext: "md" }>;
    tasktemplate: Array<{ name: string, path: string, ext: "md" }>;
}

/**
 * Represents the definition of a user command.
 * @interface UserCmdDef
 * @property {string} name - The name of the command.
 * @property {string} description - A brief description of what the command does.
 * @property {(args: any, options: Record<string, any>) => Promise<any>} run - The function that executes the command.
 * @property {Array<Array<string> | string>} [options] - Optional command-line options for the command.
 * @example
 * const buildCmd: UserCmdDef = {
 *   name: 'build',
 *   description: 'Build the project and output artifacts',
 *   run: async (args, options) => {
 *     console.log('Building...');
 *     return { success: true };
 *   },
 *   options: [['--verbose', '-v'], '--output']
 * };
 */
interface UserCmdDef {
    name: string;
    description: string;
    run: (args: any, options: Record<string, any>) => Promise<any>;
    options?: Array<Array<string> | string>;
}

/**
 * Represents the runtime settings configuration for the Agent Smith system.
 * @interface Settings
 * @property {string} name - The name of the settings profile.
 * @property {InputMode} inputmode - The mode for input handling (manual, promptfile, or clipboard).
 * @property {OutputMode} outputmode - The mode for output handling (txt or clipboard).
 * @property {RunMode} runmode - The execution mode (cli or cmd).
 * @property {FormatMode} formatmode - The output format mode (text or markdown).
 * @property {boolean} ischatMode - Whether chat mode is enabled.
 * @property {boolean} isdebug - Whether debug mode is enabled.
 * @property {boolean} isverbose - Whether verbose logging is enabled.
 * @property {string} promptfile - The path to the prompt file when using promptfile input mode.
 * @example
 * const settings: Settings = {
 *   name: 'development',
 *   inputmode: 'manual',
 *   outputmode: 'txt',
 *   runmode: 'cli',
 *   formatmode: 'markdown',
 *   ischatMode: true,
 *   isdebug: true,
 *   isverbose: true,
 *   promptfile: './prompts/dev-prompt.md'
 * };
 */
interface Settings {
    name: string;
    inputmode: InputMode;
    outputmode: OutputMode;
    runmode: RunMode;
    formatmode: FormatMode;
    ischatMode: boolean;
    isdebug: boolean;
    isverbose: boolean;
    promptfile: string;
}

/**
 * Represents a database model definition.
 * @interface DbModelDef
 * @property {number} [id] - Optional unique identifier for the database model.
 * @property {string} name - The full name of the database model.
 * @property {string} shortname - A shortened alias for the model.
 * @property {Record<string, any>} data - The data payload associated with the model.
 * @example
 * const userDbModel: DbModelDef = {
 *   id: 1,
 *   name: 'User',
 *   shortname: 'usr',
 *   data: { fields: ['id', 'name', 'email'], table: 'users' }
 * };
 */
interface DbModelDef {
    id?: number;
    name: string;
    shortname: string;
    data: Record<string, any>;
}

/**
 * Represents a single step within a workflow.
 * @interface WorkflowStep
 * @property {string} name - The name of the workflow step.
 * @property {string} type - The type/category of the workflow step.
 * @example
 * const step: WorkflowStep = {
 *   name: 'compile',
 *   type: 'build'
 * };
 */
interface WorkflowStep {
    name: string;
    type: string;
}

/**
 * Represents the specification for an MCP (Model Context Protocol) server connection.
 * @interface McpServerSpec
 * @property {string} command - The command to start the MCP server.
 * @property {string[]} arguments - Arguments to pass to the MCP server command.
 * @property {string[]} tools - List of available tool names provided by the server.
 * @example
 * const serverSpec: McpServerSpec = {
 *   command: 'npx',
 *   arguments: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
 *   tools: ['read_file', 'write_file', 'list_directory']
 * };
 */
interface McpServerSpec {
    command: string;
    arguments: string[];
    tools: string[];
}

/**
 * Represents a tool provided by an MCP server.
 * @interface McpServerTool
 * @property {string} name - The name of the tool.
 * @property {string} description - A description of what the tool does.
 * @property {{ type: string; properties: Record<string, { type: string; description: string }>; required: string[] }} inputSchema - The JSON schema defining the tool's input parameters.
 * @example
 * const readFileTool: McpServerTool = {
 *   name: 'read_file',
 *   description: 'Read the contents of a file',
 *   inputSchema: {
 *     type: 'object',
 *     properties: {
 *       path: { type: 'string', description: 'The file path to read' }
 *     },
 *     required: ['path']
 *   }
 * };
 */
interface McpServerTool {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, { type: string; description: string }>;
        required: string[];
    };
}

/**
 * Defines the possible modes for input handling in the system.
 * @typedef {('manual' | 'promptfile' | 'clipboard')} InputMode
 * @example
 * const input: InputMode = 'manual'; // Direct user input
 * const promptInput: InputMode = 'promptfile'; // Input from a file
 * const clipInput: InputMode = 'clipboard'; // Input from clipboard
 */
type InputMode = "manual" | "promptfile" | "clipboard";

/**
 * Defines the possible modes for output handling in the system.
 * @typedef {('txt' | 'clipboard')} OutputMode
 * @example
 * const output: OutputMode = 'txt'; // Output as text
 * const clipOutput: OutputMode = 'clipboard'; // Copy to clipboard
 */
type OutputMode = "txt" | "clipboard";

/**
 * Defines the possible execution modes for the system.
 * @typedef {('cli' | 'cmd')} RunMode
 * @example
 * const mode: RunMode = 'cli'; // Command-line interface mode
 * const cmdMode: RunMode = 'cmd'; // Command mode
 */
type RunMode = "cli" | "cmd";

/**
 * Defines the possible output format modes.
 * @typedef {('text' | 'markdown')} FormatMode
 * @example
 * const format: FormatMode = 'text'; // Plain text output
 * const mdFormat: FormatMode = 'markdown'; // Markdown formatted output
 */
type FormatMode = "text" | "markdown";

/**
 * Defines all possible feature types that can be registered in the system.
 * @typedef {('agent' | 'action' | 'cmd' | 'workflow' | 'adaptater' | 'skill' | 'task' | 'tasktemplate')} FeatureType
 * @example
 * const type: FeatureType = 'agent';
 * const skillType: FeatureType = 'skill';
 */
type FeatureType = "agent" | "action" | "cmd" | "workflow" | "adaptater" | "skill" | "task" | "tasktemplate";

/**
 * Defines the types of features that can act as tools.
 * @typedef {('agent' | 'action' | 'cmd' | 'workflow')} ToolType
 * @example
 * const toolType: ToolType = 'agent';
 * const workflowTool: ToolType = 'workflow';
 */
type ToolType = "agent" | "action" | "cmd" | "workflow";

/**
 * Defines the valid file extensions for action features.
 * @typedef {('js' | 'mjs' | 'py' | 'yml')} ActionExtension
 * @example
 * const ext: ActionExtension = 'js';
 * const pyExt: ActionExtension = 'py';
 */
type ActionExtension = "js" | "mjs" | "py" | "yml";

/**
 * Defines the valid file extension for agent features.
 * @typedef {'yml'} AgentExtension
 * @example
 * const ext: AgentExtension = 'yml';
 */
type AgentExtension = "yml";

/**
 * Defines the valid file extension for adapter features.
 * @typedef {'js'} AdaptaterExtension
 * @example
 * const ext: AdaptaterExtension = 'js';
 */
type AdaptaterExtension = "js";

/**
 * Defines the valid file extension for workflow features.
 * @typedef {'yml'} WorkflowExtension
 * @example
 * const ext: WorkflowExtension = 'yml';
 */
type WorkflowExtension = "yml";

/**
 * Defines the valid file extension for command features.
 * @typedef {'js'} CmdExtension
 * @example
 * const ext: CmdExtension = 'js';
 */
type CmdExtension = "js";

/**
 * Defines the valid file extension for skill features.
 * @typedef {'md'} SkillExtension
 * @example
 * const ext: SkillExtension = 'md';
 */
type SkillExtension = "md";

/**
 * Union type of all valid feature file extensions.
 * @typedef {(AgentExtension | CmdExtension | ActionExtension | WorkflowExtension | SkillExtension)} FeatureExtension
 * @example
 * const ext: FeatureExtension = 'yml'; // Valid for agent or workflow
 * const scriptExt: FeatureExtension = 'js'; // Valid for cmd, action, or adapter
 */
type FeatureExtension = AgentExtension | CmdExtension | ActionExtension | WorkflowExtension | SkillExtension;

/**
 * Defines the types of aliases that can be created.
 * @typedef {('agent' | 'action' | 'workflow')} AliasType
 * @example
 * const alias: AliasType = 'agent';
 * const workflowAlias: AliasType = 'workflow';
 */
type AliasType = "agent" | "action" | "workflow";

/**
 * Defines a generic executor function type for features.
 * Takes input parameters of type I and returns a Promise of type O.
 * @typedef {(params: I, options: Record<string, any>) => Promise<O>} FeatureExecutor
 * @example
 * // Using FeatureExecutor with specific types
 * const myExecutor: FeatureExecutor<{ query: string }, { result: string }> = async (params) => {
 *   return { result: `Processed: ${params.query}` };
 * };
 *
 * // Generic usage without type parameters
 * const genericExecutor: FeatureExecutor = async (params, options) => {
 *   console.log('Executing with:', params);
 *   return {} as any;
 * };
 */
type FeatureExecutor<I = any, O = any> = (params: I, options: Record<string, any>) => Promise<O>;

/**
 * Re-exports all core types and interfaces for external use.
 * @module core
 * @example
 * import { FeatureSpec, Settings, McpServerSpec } from '@agent-smith/types';
 *
 * const feature: FeatureSpec = { name: 'test', path: './test.yml', ext: 'yml' };
 * const settings: Settings = { name: 'default', inputmode: 'manual', outputmode: 'txt', runmode: 'cli', formatmode: 'text', ischatMode: false, isdebug: false, isverbose: false, promptfile: '' };
 */
export {
    ActionExtension, AdaptaterExtension, AliasType, CmdExtension, DbModelDef, FeatureExecutor, FeatureExtension, Features, FeatureSpec, FeatureType, FormatMode, InputMode, McpServerSpec,
    McpServerTool, OutputMode,
    RunMode, Settings, SkillExtension, AgentExtension, ToolType, UserCmdDef, WorkflowExtension, WorkflowStep
};

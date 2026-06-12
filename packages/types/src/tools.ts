/**
 * Defines types and interfaces for tool specifications, tool calls, and tool execution within agent conversations.
 * Imports: Utilizes `AgentInferenceOptions` from `./inference.js`.
 * @example
 * // Example of creating a tool specification
 * import type { ToolSpec } from './tools';
 *
 * const weatherTool: ToolSpec = {
 *   name: "WeatherFetcher",
 *   description: "Fetches weather information for a given location.",
 *   type: "weather",
 *   arguments: {
 *     location: {
 *       description: "The city or location to fetch weather for.",
 *       required: true
 *     }
 *   },
 *   parallelCalls: false,
 *   execute: async (args) => {
 *     const { location } = args || {};
 *     return `Weather in ${location}: Sunny, 72°F`;
 *   },
 *   canRun: async (tool) => {
 *     return tool.arguments?.location !== undefined;
 *   }
 * };
 */

import type { AgentInferenceOptions } from "./inference.js";

/**
 * Specification for a tool that can be used within the conversation.
 * Defines the metadata and argument schema for a tool without the execution logic.
 *
 * @interface ToolDefSpec
 * @property {string} name - The unique name of the tool.
 * @property {string} description - A human-readable description of what the tool does.
 * @property {{ [key: string]: { description: string; type?: string; required?: boolean } }} arguments - Arguments required by the tool, with descriptions for each argument. Each key is an argument name, and its value contains the description, optional type hint, and whether it's required.
 * @example
 * const toolSpecExample: ToolDefSpec = {
 *   name: "WeatherFetcher",
 *   description: "Fetches weather information.",
 *   arguments: {
 *     location: {
 *       description: "The location for which to fetch the weather.",
 *       type: "string",
 *       required: true
 *     },
 *     units: {
 *       description: "Temperature units (celsius or fahrenheit).",
 *       type: "string",
 *       required: false
 *     }
 *   }
 * };
 */
interface ToolDefSpec {
    /**
     * The unique name of the tool.
     */
    name: string;

    /**
     * A human-readable description of what the tool does.
     */
    description: string;

    /**
     * Arguments required by the tool, with descriptions for each argument.
     * Each key is an argument name, and its value contains the description, optional type hint, and whether it's required.
     */
    arguments: {
        [key: string]: {
            description: string;
            type?: string;
            required?: boolean;
        };
    };
}

/**
 * Represents a complete tool specification with an execute function.
 * Extends ToolDefSpec by adding execution logic, type metadata, and parallel call configuration.
 * This interface is used to define tools that agents can invoke during conversation.
 *
 * @interface ToolSpec
 * @extends ToolDefSpec
 * @property {string} type - The type/category of the tool (e.g., "weather", "search").
 * @property {string | undefined} [agentType] - Optional agent type filter that specifies which agents can use this tool.
 * @property {boolean} parallelCalls - Whether multiple calls to this tool can be executed in parallel.
 * @property {(args: { [key: string]: any } & { toolOptions?: AgentInferenceOptions } | undefined) => Promise<any>} execute - The async function to execute the tool with the provided arguments. Returns a Promise that resolves to the tool's result.
 * @property {(tool: ToolCallSpec) => Promise<boolean>} [canRun] - Optional function to determine if the tool can run based on the tool call spec. Returns true if the tool is ready to execute.
 * @example
 * const weatherTool: ToolSpec = {
 *   name: "WeatherFetcher",
 *   description: "Fetches weather information for a given location.",
 *   type: "weather",
 *   arguments: {
 *     location: {
 *       description: "The city or location to fetch weather for.",
 *       required: true
 *     }
 *   },
 *   parallelCalls: false,
 *   execute: async (args) => {
 *     const { location } = args || {};
 *     return `Weather in ${location}: Sunny, 72°F`;
 *   },
 *   canRun: async (tool) => {
 *     return tool.arguments?.location !== undefined && tool.arguments.location.trim().length > 0;
 *   }
 * };
 */
interface ToolSpec extends ToolDefSpec {
    type: string;
    agentType?: string;
    parallelCalls: boolean;
    execute: <O = any>(args: {
        [key: string]: any
    } & { toolOptions?: AgentInferenceOptions } | undefined
    ) => Promise<O>;
    canRun?: (tool: ToolCallSpec) => Promise<boolean>;
}

/**
 * Represents a tool call specification used to invoke a tool.
 * Contains the unique identifier, tool name, and arguments for a specific tool invocation.
 *
 * @interface ToolCallSpec
 * @property {string} id - The unique identifier for this tool call instance.
 * @property {string} name - The name of the tool being called (must match a registered tool's name).
 * @property {{ [key: string]: string } | undefined} [arguments] - Optional arguments to pass to the tool as key-value pairs.
 * @example
 * const toolCall: ToolCallSpec = {
 *   id: 'call_abc123',
 *   name: 'getWeather',
 *   arguments: { location: 'New York', units: 'fahrenheit' }
 * };
 *
 * // Example of a tool call without arguments
 * const simpleToolCall: ToolCallSpec = {
 *   id: 'call_def456',
 *   name: 'getCurrentTime'
 * };
 */
interface ToolCallSpec {
    id: string;
    name: string;
    arguments?: {
        [key: string]: string;
    };
}

export {
    ToolCallSpec,
    ToolDefSpec,
    ToolSpec,
};

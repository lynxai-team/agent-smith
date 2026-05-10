/**
 * Specification for a tool that can be used within the conversation.
 *
 * @interface ToolDefSpec
 * @param {string} name - The name of the tool.
 * @param {string} description - A description of what the tool does.
 * @param {Record<string, { description: string, type?: string, required?: boolean }>} arguments - Arguments required by the tool, with descriptions for each argument.
 * @example
 * const toolSpecExample: ToolDefSpec = {
 *   name: "WeatherFetcher",
 *   description: "Fetches weather information.",
 *   arguments: {
 *     location: {
 *       description: "The location for which to fetch the weather.",
 *       required: true
 *     }
 *   }
 * };
 */
interface ToolDefSpec {
    /**
     * The name of the tool.
     */
    name: string;

    /**
     * A description of what the tool does.
     */
    description: string;

    /**
     * Arguments required by the tool, with descriptions for each argument.
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
 * Represents a tool specification with an execute function.
 *
 * @interface ToolSpec
 * @extends ToolDefSpec
 * @param {(args: Record<string, string> | undefined) => Promise<any>} execute - The function to execute the tool with the provided arguments.
 * @param {(tool: ToolCallSpec) => Promise<boolean>} canRun - Optional function to determine if the tool can run based on the tool call spec.
 * @example
 * const toolSpec: ToolSpec = {
 *   name: "WeatherFetcher",
 *   description: "Fetches weather information.",
 *   arguments: {
 *     location: {
 *       description: "The location for which to fetch the weather.",
 *       required: true
 *     }
 *   },
 *   execute: async (args) => {
 *     const { location } = args || {};
 *     return `Weather in ${location}: Sunny, 72°F`;
 *   },
 *   canRun: async (tool) => {
 *     const args = tool.arguments;
 *     return args?.location !== undefined && args.location.trim().length > 0;
 *   }
 * };
 */
interface ToolSpec extends ToolDefSpec {
    type: string;
    parallelCalls: boolean;
    execute: <O = any>(args: { [key: string]: string; } | undefined) => Promise<O>;
    canRun?: (tool: ToolCallSpec) => Promise<boolean>;
}

/**
 * Represents a tool call specification.
 *
 * @interface ToolCallSpec
 * @param {string} id - The unique identifier for the tool call.
 * @param {string} name - The name of the tool being called.
 * @param {Record<string, string> | undefined} arguments - The arguments to pass to the tool.
 * @example
 * const toolCall: ToolCallSpec = {
 *   id: '1',
 *   name: 'getWeather',
 *   arguments: { location: 'New York' }
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
}

/**
 * Defines verbosity options for controlling the level of detail in agent output.
 * 
 * This module provides configuration options to selectively enable or disable
 * various categories of verbose output during agent execution, including events,
 * requests, tool invocations, and more.
 * 
 * @module verbosity
 * @example
 * import { VerbosityOptions } from '@agent-smith/types';
 * 
 * const verboseConfig: VerbosityOptions = {
 *   events: true,
 *   request: true,
 *   tools: true,
 *   toolResults: true,
 *   history: false,
 *   stats: false
 * };
 */

/**
 * Configuration options for controlling verbosity levels in agent output.
 * 
 * Each property corresponds to a category of output that can be individually
 * enabled (true) or disabled (false). When set to true, detailed information
 * about that category will be included in the agent's output.
 * 
 * @interface VerbosityOptions
 * @property {boolean} [events] - Enable or disable verbose logging for agent events and lifecycle changes.
 * @property {boolean} [request] - Enable or disable verbose logging for HTTP requests made by the agent.
 * @property {boolean} [options] - Enable or disable verbose logging of configuration options being used.
 * @property {boolean} [inferenceParams] - Enable or disable verbose logging of parameters used during inference.
 * @property {boolean} [history] - Enable or disable verbose logging of conversation history.
 * @property {boolean} [stats] - Enable or disable verbose logging of performance statistics and metrics.
 * @property {boolean} [tools] - Enable or disable verbose logging of tool invocations.
 * @property {boolean} [toolResults] - Enable or disable verbose logging of tool execution results.
 * @property {boolean} [mcp] - Enable or disable verbose logging for Model Context Protocol (MCP) interactions.
 * @property {boolean} [task] - Enable or disable verbose logging for task execution and progress.
 * @example
 * const verbosity: VerbosityOptions = {
 *   events: true,
 *   request: true,
 *   options: false,
 *   inferenceParams: false,
 *   history: true,
 *   stats: true,
 *   tools: true,
 *   toolResults: true,
 *   mcp: false,
 *   task: true
 * };
 */
interface VerbosityOptions {
    events?: boolean;
    request?: boolean;
    options?: boolean;
    inferenceParams?: boolean;
    history?: boolean;
    stats?: boolean;
    tools?: boolean;
    toolResults?: boolean;
    mcp?: boolean;
    task?: boolean;
}

export {
    VerbosityOptions,
};

import type { LmProviderType } from "./lm.js";
import type { AgentSettings } from "./agent.js";

/**
 * @file Defines configuration types for the Agent Smith framework, including inference backends and application settings.
 * Imports: Utilizes `LmProviderType` from `lm.js` and `AgentSettings` from `agent.js`.
 * @example
 * // Example of creating a configuration file
 * import type { ConfigFile, InferenceBackend } from './conf';
 * const config: ConfigFile = {
 *   promptfile: './prompts/main.prompt',
 *   datadir: './data',
 *   backends: {
 *     default: 'llamacpp',
 *     secondary: {
 *       type: 'openai',
 *       url: 'http://localhost:8080/v1',
 *       apiKey: 'sk-...'
 *     }
 *   },
 *   agents: {
 *     chatAgent: { model: 'llama3', ctx: 2048 }
 *   }
 * };
 */

/**
 * Configuration for an inference backend.
 *
 * @interface ConfInferenceBackend
 * @property {LmProviderType} [type] - The type of language model provider (e.g., 'llamacpp', 'openai', 'browser').
 * @property {string} url - The URL of the backend service.
 * @property {string} [apiKey] - The API key for authentication (optional).
 * @example
 * const backend: ConfInferenceBackend = {
 *   type: 'llamacpp',
 *   url: 'http://localhost:8080',
 *   apiKey: 'my-api-key'
 * };
 */
interface ConfInferenceBackend {
    type?: LmProviderType;
    url: string;
    apiKey?: string;
}

/**
 * Represents backend entries configuration with a default backend and additional backends.
 * The index signature allows dynamic backend names mapping to either a backend object or a URL string.
 *
 * @interface BackendEntries
 * @property {string} default - The name of the default backend.
 * @property {ConfInferenceBackend | string} [name] - Additional backend configurations by name, where each key is a backend identifier and the value is either a full backend object or a URL string reference.
 * @example
 * const entries: BackendEntries = {
 *   default: 'llamacpp',
 *   secondary: {
 *     type: 'openai',
 *     url: 'http://localhost:8080/v1'
 *   },
 *   remote: 'http://remote-server.com/api'
 * };
 */
interface BackendEntries {
    default: string;
    [key: string]: ConfInferenceBackend | string;
}

/**
 * Extends the base inference backend configuration with a name and default flag.
 * This type is used in runtime agent state to track active backends.
 *
 * @interface InferenceBackend
 * @property {LmProviderType} [type] - The type of language model provider (e.g., 'llamacpp', 'openai', 'browser').
 * @property {string} url - The URL of the backend service.
 * @property {string} [apiKey] - The API key for authentication (optional).
 * @property {string} name - The unique name of the backend.
 * @property {boolean} [isDefault] - Whether this is the default backend used for inference.
 * @example
 * const backend: InferenceBackend = {
 *   name: 'my-backend',
 *   type: 'llamacpp',
 *   url: 'https://api.llamacpp.local/v1',
 *   apiKey: 'sk-...',
 *   isDefault: true
 * };
 */
interface InferenceBackend extends ConfInferenceBackend {
    name: string;
    isDefault?: boolean;
}

/**
 * Configuration file structure for the application.
 * Defines the top-level schema for the application's configuration file.
 *
 * @interface ConfigFile
 * @property {string} [promptfile] - Path to the prompt file used by agents.
 * @property {string} [datadir] - Directory for data storage.
 * @property {Array<string>} [features] - Enabled features directories.
 * @property {Array<string>} [plugins] - Loaded plugins.
 * @property {BackendEntries} [backends] - Backend configurations for inference providers.
 * @property {Record<string, AgentSettings>} [agents] - Agent settings keyed by agent name.
 * @property {Record<string, string>} [apps] - Application configurations.
 * @property {Record<string, string>} [workspaces] - Workspace configurations keyed by workspace name.
 * @example
 * const config: ConfigFile = {
 *   promptfile: './prompts/main.prompt',
 *   datadir: './data',
 *   features: ['/some/features/dir'],
 *   backends: {
 *     default: 'llamacpp',
 *     secondary: {
 *       type: 'openai',
 *       url: 'http://localhost:8080/v1'
 *     }
 *   },
 *   agents: {
 *     chat: { model: 'llama3', ctx: 2048 }
 *   },
 *   workspaces: {
 *     projectA: '/path/to/projectA',
 *     projectB: '/path/to/projectB'
 *   }
 * };
 */
interface ConfigFile {
    promptfile?: string;
    datadir?: string;
    features?: Array<string>;
    plugins?: Array<string>;
    backends?: BackendEntries;
    agents?: Record<string, AgentSettings>;
    apps?: Record<string, string>;
    workspaces?: Record<string, string>;
}

export {
    ConfInferenceBackend,
    InferenceBackend,
    BackendEntries,
    ConfigFile,
};

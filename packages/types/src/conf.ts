import type { LmProviderType } from "./lm.js";
import type { TaskSettings } from "./task.js";

/**
 * Configuration for an inference backend.
 *
 * @interface ConfInferenceBackend
 * @param {LmProviderType | undefined} type - The type of language model provider.
 * @param {string} url - The URL of the backend service.
 * @param {string} [apiKey] - The API key for authentication (optional).
 * @example
 * const backend: ConfInferenceBackend = {
 *   type: 'ollama',
 *   url: 'http://localhost:11434',
 *   apiKey: 'my-api-key'
 * };
 */
interface ConfInferenceBackend {
    type?: LmProviderType;
    url: string;
    apiKey?: string;
}

interface BackendEntries {
    default: string;
    [key: string]: ConfInferenceBackend | string;
}

interface InferenceBackend extends ConfInferenceBackend {
    name: string;
    isDefault?: boolean;
}

/**
 * Configuration file structure for the application.
 *
 * @interface ConfigFile
 * @param {string} [promptfile] - Path to the prompt file.
 * @param {string} [datadir] - Directory for data storage.
 * @param {Array<string>} [features] - Enabled features directories.
 * @param {Array<string>} [plugins] - Loaded plugins.
 * @param {BackendEntries} [backends] - Backend configurations.
 * @param {Record<string, TaskSettings>} [tasks] - Task settings.
 * @param {Record<string, string>} [apps] - Application configurations.
 * @example
 * const config: ConfigFile = {
 *   features: ['/some/fetures/dir'],
 *   backends: {
 *     'default': {
 *       url: 'http://localhost:8080/v1'
 *     }
 *   }
 * };
 */
interface ConfigFile {
    promptfile?: string;
    datadir?: string;
    features?: Array<string>;
    plugins?: Array<string>;
    backends?: BackendEntries;
    tasks?: Record<string, TaskSettings>;
    apps?: Record<string, string>;
}

export {
    ConfInferenceBackend,
    InferenceBackend,
    BackendEntries,
    ConfigFile,
}
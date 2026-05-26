/**
 * Model information structure.
 *
 * @interface ModelInfo
 * @param {string} id - The model id
 * @param {string} status - The status of the model.
 * @param {number} ctx - Context window size.
 * @param {boolean} hasVision - If the model can process images 
 * @example
 * const modelInfo: ModelInfo = {
 *   id: "qwen4b"
 *   status: 'loaded',
 *   ctx: 31768,
 *   hasVision: true
 * };
 */
interface ModelInfo {
    id: string;
    status: string;
    ctx: number;
    hasVision: boolean;
}

/**
 * Template information for model.
 *
 * @interface ModelTemplate
 * @param {string} name - The name of the template.
 * @param {number | undefined} ctx - The context window size for the model.
 * @example
 * const modelTemplate: ModelTemplate = {
 *   name: 'default_template',
 *   ctx: 2048
 * };
 */
interface ModelTemplate {
    name: string;
    ctx?: number;
}

/**
 * Represents the state of the available models on server.
 *
 * @interface ModelState
 * @param {Record<string, ModelTemplate>} models - The models info object (name, template name, context window size).
 * @param {boolean} isModelLoaded - Indicates whether a model is loaded or not.
 * @param {string} loadedModel - The loaded model name, empty if no model is loaded.
 * @param {number | undefined} ctx - The loaded model context window size, 0 if no model is loaded.
 * @example
 * const modelState: ModelState = {
 *   models: { gpt3: { name: 'qwen4b', ctx: 2048 } },
 *   isModelLoaded: true,
 *   loadedModel: 'qwen4b',
 *   ctx: 2048
 * };
 */
interface ModelState {
    models: Record<string, ModelTemplate>;
    isModelLoaded: boolean;
    loadedModel: string;
    ctx?: number;
}

/**
 * Represents the unloaded model status.
 *
 * @interface ModelStatusUnloaded
 * @param {"unloaded"} value - The status value indicating the model is unloaded.
 * @example
 * const unloadedStatus: ModelStatusUnloaded = {
 *   value: "unloaded"
 * };
 */
interface ModelStatusUnloaded {
    value: "unloaded";
}

/**
 * Represents the loading model status.
 *
 * @interface ModelStatusLoading
 * @param {"loading"} value - The status value indicating the model is loading.
 * @param {string[]} args - Arguments used during the loading process.
 * @example
 * const loadingStatus: ModelStatusLoading = {
 *   value: "loading",
 *   args: ["--model", "qwen4b"]
 * };
 */
interface ModelStatusLoading {
    value: "loading";
    args: string[];
}

/**
 * Represents the failed model status.
 *
 * @interface ModelStatusFailed
 * @param {"failed"} value - The status value indicating the model failed to load.
 * @param {string[]} args - Arguments used during the loading process.
 * @param {true} failed - Indicates that the model loading failed.
 * @param {number} exit_code - The exit code from the failed loading process.
 * @example
 * const failedStatus: ModelStatusFailed = {
 *   value: "failed",
 *   args: ["--model", "qwen4b"],
 *   failed: true,
 *   exit_code: 1
 * };
 */
interface ModelStatusFailed {
    value: "failed";
    args: string[];
    failed: true;
    exit_code: number;
}

/**
 * Represents the loaded model status.
 *
 * @interface ModelStatusLoaded
 * @param {"loaded"} value - The status value indicating the model is loaded.
 * @param {string[]} args - Arguments used during the loading process.
 * @example
 * const loadedStatus: ModelStatusLoaded = {
 *   value: "loaded",
 *   args: ["--model", "qwen4b"]
 * };
 */
interface ModelStatusLoaded {
    value: "loaded";
    args: string[];
}

/**
 * Represents the status of a model.
 * @example
 * const status: ModelStatus = {
 *   value: "loaded",
 *   args: ["--model", "qwen4b"]
 * };
 */
type ModelStatus = ModelStatusUnloaded | ModelStatusLoading | ModelStatusFailed | ModelStatusLoaded;

/**
 * Represents data about a model.
 *
 * @interface ModelData
 * @param {string} id - The unique identifier of the model.
 * @param {boolean} in_cache - Indicates if the model is in cache.
 * @param {string} path - The file path of the model.
 * @param {ModelStatus} status - The current status of the model.
 * @example
 * const modelData: ModelData = {
 *   id: "model-123",
 *   in_cache: true,
 *   path: "/models/qwen4b",
 *   status: { value: "loaded", args: ["--model", "qwen4b"] }
 * };
 */
interface ModelData {
    id: string;
    in_cache: boolean;
    path: string;
    status: ModelStatus;
}

/**
 * Represents the API response for model data.
 *
 * @interface ModelApiResponse
 * @param {ModelData[]} data - Array of model data objects.
 * @example
 * const apiResponse: ModelApiResponse = {
 *   data: [
 *     {
 *       id: "model-123",
 *       in_cache: true,
 *       path: "/models/qwen4b",
 *       status: { value: "loaded", args: ["--model", "qwen4b"] }
 *     }
 *   ]
 * };
 */
interface ModelApiResponse {
    data: ModelData[];
}

export {
    ModelInfo,
    ModelTemplate,
    ModelState,
    ModelApiResponse,
    ModelData,
    ModelStatus,
    ModelStatusFailed,
    ModelStatusLoaded,
    ModelStatusLoading,
    ModelStatusUnloaded,
}

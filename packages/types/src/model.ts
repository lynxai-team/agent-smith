/**
 * @file Defines TypeScript interfaces and types for model information, status tracking,
 * and API responses related to AI model management.
 *
 * This module provides type definitions for:
 * - Model metadata and configuration
 * - Model loading states (unloaded, loading, loaded, failed)
 * - Server model state representation
 * - API response structures for model data
 *
 * @example
 * import { ModelInfo, ModelData, ModelStatusLoaded } from './model';
 *
 * // Creating a model info object
 * const modelInfo: ModelInfo = {
 *   id: "qwen4b",
 *   status: 'loaded',
 *   ctx: 31768,
 *   hasVision: true
 * };
 *
 * // Creating a loaded model status
 * const loadedStatus: ModelStatusLoaded = {
 *   value: "loaded",
 *   args: ["--model", "qwen4b"]
 * };
 */

/**
 * Represents detailed information about an AI model.
 *
 * @interface ModelInfo
 * @property {string} id - The unique identifier of the model.
 * @property {string} status - The current status of the model.
 * @property {number} ctx - The context window size in tokens.
 * @property {boolean} hasVision - Whether the model can process image inputs.
 * @example
 * const modelInfo: ModelInfo = {
 *   id: "qwen4b",
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
 * Represents a template configuration for model loading.
 *
 * @interface ModelTemplate
 * @property {string} name - The name of the template.
 * @property {number | undefined} ctx - The context window size for the model. Optional; defaults to model's default if not specified.
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
 * Represents the aggregate state of all available models on the server.
 *
 * @interface ModelState
 * @property {Record<string, ModelTemplate>} models - A map of model names to their template configurations.
 * @property {boolean} isModelLoaded - Indicates whether any model is currently loaded.
 * @property {string} loadedModel - The name of the currently loaded model; empty string if no model is loaded.
 * @property {number | undefined} ctx - The context window size of the loaded model; undefined if no model is loaded.
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
 * Represents an unloaded model status.
 * This is a discriminated union member with `value` set to `"unloaded"`.
 *
 * @interface ModelStatusUnloaded
 * @property {"unloaded"} value - The discriminator value indicating the model is not loaded.
 * @example
 * const unloadedStatus: ModelStatusUnloaded = {
 *   value: "unloaded"
 * };
 */
interface ModelStatusUnloaded {
    value: "unloaded";
}

/**
 * Represents a model currently in the loading state.
 * This is a discriminated union member with `value` set to `"loading"`.
 *
 * @interface ModelStatusLoading
 * @property {"loading"} value - The discriminator value indicating the model is loading.
 * @property {string[]} args - The command-line arguments used during the loading process.
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
 * Represents a model that failed to load.
 * This is a discriminated union member with `value` set to `"failed"`.
 *
 * @interface ModelStatusFailed
 * @property {"failed"} value - The discriminator value indicating the model loading failed.
 * @property {string[]} args - The command-line arguments used during the attempted loading process.
 * @property {true} failed - A literal `true` flag confirming the failure.
 * @property {number} exit_code - The exit code returned by the failed loading process.
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
 * Represents a successfully loaded model.
 * This is a discriminated union member with `value` set to `"loaded"`.
 *
 * @interface ModelStatusLoaded
 * @property {"loaded"} value - The discriminator value indicating the model is loaded and ready.
 * @property {string[]} args - The command-line arguments used during the loading process.
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
 * Represents the current status of a model as a discriminated union.
 *
 * This type combines all possible model states: unloaded, loading, loaded, and failed.
 * The `value` property acts as the discriminator to narrow down the specific state.
 *
 * @typedef {ModelStatusUnloaded | ModelStatusLoading | ModelStatusFailed | ModelStatusLoaded} ModelStatus
 * @example
 * // Example of a loaded model status
 * const loadedStatus: ModelStatus = {
 *   value: "loaded",
 *   args: ["--model", "qwen4b"]
 * };
 *
 * // Example of a failed model status
 * const failedStatus: ModelStatus = {
 *   value: "failed",
 *   args: ["--model", "qwen4b"],
 *   failed: true,
 *   exit_code: 1
 * };
 */
type ModelStatus = ModelStatusUnloaded | ModelStatusLoading | ModelStatusFailed | ModelStatusLoaded;

/**
 * Represents comprehensive data about a model instance.
 *
 * @interface ModelData
 * @property {string} id - The unique identifier of the model.
 * @property {boolean} in_cache - Indicates whether the model is cached locally.
 * @property {string} path - The file system path where the model is stored.
 * @property {ModelStatus} status - The current loading status of the model.
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
 * Represents the standardized API response structure for model data queries.
 *
 * @interface ModelApiResponse
 * @property {ModelData[]} data - An array of model data objects returned by the API.
 * @example
 * const apiResponse: ModelApiResponse = {
 *   data: [
 *     {
 *       id: "model-123",
 *       in_cache: true,
 *       path: "/models/qwen4b",
 *       status: { value: "loaded", args: ["--model", "qwen4b"] }
 *     },
 *     {
 *       id: "model-456",
 *       in_cache: false,
 *       path: "/models/llama7b",
 *       status: { value: "unloaded" }
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
};

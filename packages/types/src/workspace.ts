/**
 * Defines the Workspace interface representing a project workspace.
 * 
 * A Workspace encapsulates the essential metadata and configuration for a
 * development or execution environment, including its name, filesystem path,
 * and custom properties.
 * 
 * @example
 * // Creating a new Workspace object
 * const myWorkspace: Workspace = {
 *   name: 'my-project',
 *   path: '/home/user/projects/my-project',
 *   props: {
 *     language: 'typescript',
 *     framework: 'node'
 *   }
 * };
 */

/**
 * Represents a project workspace with its metadata and configuration.
 * 
 * @interface Workspace
 * @property {string} name - The unique name identifier for the workspace.
 * @property {string} path - The absolute filesystem path where the workspace resides.
 * @property {Record<string, any>} props - A record of custom key-value properties for
 *   extensible workspace configuration. Values can be of any type.
 * 
 * @example
 * const workspace: Workspace = {
 *   name: 'agent-smith',
 *   path: '/workspace/agent-smith',
 *   props: {
 *     version: '1.0.0',
 *     environment: 'development'
 *   }
 * };
 */
interface Workspace {
    name: string;
    path: string;
    props: Record<string, any>;
}

export {
    Workspace,
};

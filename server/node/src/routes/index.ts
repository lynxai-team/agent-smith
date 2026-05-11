import { Router } from "@koa/router";
import { getModelsCmd } from "./models.js";
import { getTaskSettingsCmd, updateTaskSettingsCmd } from "./task_settings.js";
import { getTaskRoute, getTasksRoute } from "./tasks.js";
import { getAgentRoute, getAgentsRoute } from "./agents.js";
import { createConfRoute, getConfRoute } from "./conf.js";
import { getToolsRoute } from "./tools.js";
import { getStateRoute } from "./state.js";
import { installPluginRoute } from "./plugins.js";
import { addFolderRoute } from "./folders.js";
import { getWorkflowRoute, getWorkflowsRoute } from "./workflows.js";
import { getBackendsRoute, setBackendRoute } from "./backends.js";
import { getOrCreateAppConfigFileRoute, updateAppConfigFileRoute } from "./apps.js";
import { getWorkspaceRoute, updateDefaultWorkspaceRoute, upsertWorkspaceRoute } from "./workspace.js";

const baseRoutes = new Array<((r: Router) => void)>(
    getConfRoute,
    getTasksRoute,
    getTaskRoute,
    getAgentRoute,
    getAgentsRoute,
    getModelsCmd,
    getToolsRoute,
    getTaskSettingsCmd,
    getStateRoute,
    createConfRoute,
    updateTaskSettingsCmd,
    installPluginRoute,
    addFolderRoute,
    getWorkflowRoute,
    getWorkflowsRoute,
    getBackendsRoute,
    setBackendRoute,
    getOrCreateAppConfigFileRoute,
    updateAppConfigFileRoute,
    getWorkspaceRoute,
    upsertWorkspaceRoute,
    updateDefaultWorkspaceRoute,
);

export { baseRoutes }
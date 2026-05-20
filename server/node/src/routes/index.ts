import { Router } from "@koa/router";
import { getModelsCmd } from "./models.js";
import { getAgentSettingsCmd, updateAgentSettingsCmd } from "./agent_settings.js";
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
import { getSettingsRoute } from "./settings.js";

const baseRoutes = new Array<((r: Router) => void)>(
    getConfRoute,
    getAgentRoute,
    getAgentsRoute,
    getModelsCmd,
    getToolsRoute,
    getAgentSettingsCmd,
    getStateRoute,
    createConfRoute,
    updateAgentSettingsCmd,
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
    getSettingsRoute,
);

export { baseRoutes }
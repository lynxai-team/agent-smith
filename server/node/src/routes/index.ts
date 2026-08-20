import { Router } from "@koa/router";
import { getModelsRoute, getModelsPresetsRoute, upsertModelPresetRoute, delModelPresetRoute } from "./models.js";
import { getAgentSettingsCmd, updateAgentSettingsCmd } from "./agent_settings.js";
import { getAgentRoute, getAgentsRoute } from "./agents.js";
import { createConfRoute, getConfRoute } from "./conf.js";
import { getToolsRoute } from "./tools.js";
import { getStateRoute } from "./state.js";
import { addFolderRoute } from "./folders.js";
import { getWorkflowRoute, getWorkflowsRoute } from "./workflows.js";
import { getBackendsRoute, setBackendRoute } from "./backends.js";
import { getOrCreateAppConfigFileRoute, updateAppConfigFileRoute } from "./apps.js";
import { getWorkspaceRoute, updateDefaultWorkspaceRoute, upsertWorkspaceRoute } from "./workspace.js";
import { getSettingsRoute } from "./settings.js";
import { applyTemplateRoute } from "./templates.js";
import { getSkillssRoute } from "./skills.js";

const baseRoutes = new Array<((r: Router) => void)>(
    getConfRoute,
    getAgentRoute,
    getAgentsRoute,
    getModelsRoute,
    getModelsPresetsRoute,
    getToolsRoute,
    getAgentSettingsCmd,
    getStateRoute,
    createConfRoute,
    updateAgentSettingsCmd,
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
    upsertModelPresetRoute,
    delModelPresetRoute,
    applyTemplateRoute,
    getSkillssRoute,
);

export { baseRoutes }
import { ref } from "@vue/reactivity";
import { readTaskSettings } from "../db/read.js";
import { AgentSettings } from "@agent-smith/types";

const agentSettings: Record<string, AgentSettings> = {};
const isAgentSettingsInitialized = ref(false);

function initAgentSettings() {
    const data = readTaskSettings();
    data.forEach(row => {
        const name = row.name;
        delete row.name;
        delete row.id;
        const vals: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
            if (v !== null) {
                vals[k] = v
            }
        }
        agentSettings[name] = vals;
    });
    //console.log("TS", agentSettings);
    isAgentSettingsInitialized.value = true;
}

function getAgentSettings(force: boolean = false): Record<string, AgentSettings> {
    if (!isAgentSettingsInitialized.value === true || force) {
        initAgentSettings()
    }
    return agentSettings;
}

export {
    agentSettings,
    isAgentSettingsInitialized,
    initAgentSettings,
    getAgentSettings
}
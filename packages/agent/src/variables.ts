import { HistoryTurn, AgentSpec, type AgentInferenceOptions } from "@agent-smith/types";

function applyVariables(agentSpec: AgentSpec, options: AgentInferenceOptions): AgentSpec {
    //console.log("\n--------APPLY VARS OPTS", options)
    // check agentSpec variables
    if (agentSpec?.variables) {
        if (!options?.variables) {
            throw new Error(`Task: options variables required for task ${agentSpec.name}: ${agentSpec.variables}`)
        }
        if (agentSpec.variables?.required) {
            for (const name of Object.keys(agentSpec.variables.required)) {
                if (!(name in options.variables)) {
                    let m = `The variable ${name} is required to run the agent ${agentSpec.name}`;
                    //m += `${JSON.stringify(agentSpec.variables, null, 2)}\n`;
                    m += `Provided options variables: ${JSON.stringify(options.variables, null, 2)}`;
                    console.log("OPTs", options);
                    throw new Error(m)
                }
            }
        }
        if (agentSpec.variables?.optional) {
            for (const name of Object.keys(agentSpec.variables.optional)) {
                // cleanup unused optional variables
                if (!(name in options.variables)) {
                    const v = agentSpec.variables.optional[name]?.default ?? "";
                    agentSpec.prompt = agentSpec.prompt.replaceAll(`{${name}}`, v);
                    if (agentSpec.template?.system) {
                        agentSpec.template.system = agentSpec.template.system.replaceAll(`{${name}}`, v);
                    }
                    if (agentSpec?.shots) {
                        const nshots = new Array<HistoryTurn>();
                        agentSpec.shots.forEach(s => {
                            let nshot = s;
                            if (s?.user) {
                                nshot.user = s.user.replaceAll(`{${name}}`, v);
                            }
                            nshots.push(nshot)
                        })
                        agentSpec.shots = nshots;
                    }
                }
            }
        }
        // apply variables
        for (const [k, v] of Object.entries(options.variables)) {
            //console.log("APPLY", k, v);
            agentSpec.prompt = agentSpec.prompt.replaceAll(`{${k}}`, v);
            if (agentSpec.template?.system) {
                agentSpec.template.system = agentSpec.template.system.replaceAll(`{${k}}`, v);
            }
            if (agentSpec?.shots) {
                const nshots = new Array<HistoryTurn>();
                agentSpec.shots.forEach(s => {
                    let nshot = s;
                    if (s?.user) {
                        nshot.user = s.user.replaceAll(`{${k}}`, v);
                    }
                    nshots.push(nshot)
                })
                agentSpec.shots = nshots;
            }
        }
    }
    //console.log("TD FINAL", agentSpec);
    return agentSpec;
}

export {
    applyVariables,
}
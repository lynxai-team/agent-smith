import { HistoryTurn, TaskDef, type AgentInferenceOptions } from "@agent-smith/types";

function applyVariables(taskDef: TaskDef, options: AgentInferenceOptions): TaskDef {
    //console.log("\n--------TD", typeof taskDef, Object.keys(taskDef))
    // check taskDef variables
    if (taskDef?.variables) {
        if (!options?.variables) {
            throw new Error(`Task: options variables required for task ${taskDef.name}: ${taskDef.variables}`)
        }
        if (taskDef.variables?.required) {
            for (const name of Object.keys(taskDef.variables.required)) {
                if (!(name in options.variables)) {
                    throw new Error(`The variable ${name} is required to run this task: variables: \n${JSON.stringify(taskDef.variables, null, 2)}\nProvided: ${JSON.stringify(options.variables, null, 2)}`)
                }
            }
        }
        if (taskDef.variables?.optional) {
            for (const name of Object.keys(taskDef.variables.optional)) {
                // cleanup unused optional variables
                if (!(name in options.variables)) {
                    const v = taskDef.variables.optional[name]?.default ?? "";
                    taskDef.prompt = taskDef.prompt.replaceAll(`{${name}}`, v);
                    if (taskDef.template?.system) {
                        taskDef.template.system = taskDef.template.system.replaceAll(`{${name}}`, v);
                    }
                    if (taskDef?.shots) {
                        const nshots = new Array<HistoryTurn>();
                        taskDef.shots.forEach(s => {
                            let nshot = s;
                            if (s?.user) {
                                nshot.user = s.user.replaceAll(`{${name}}`, v);
                            }
                            nshots.push(nshot)
                        })
                        taskDef.shots = nshots;
                    }
                }
            }
        }

        // apply variables
        for (const [k, v] of Object.entries(options.variables)) {
            //console.log("APPLY", k, v);
            taskDef.prompt = taskDef.prompt.replaceAll(`{${k}}`, v);
            if (taskDef.template?.system) {
                taskDef.template.system = taskDef.template.system.replaceAll(`{${k}}`, v);
            }
            if (taskDef.template?.afterSystem) {
                taskDef.template.afterSystem = taskDef.template.afterSystem.replaceAll(`{${k}}`, v);
            }
            if (taskDef?.shots) {
                const nshots = new Array<HistoryTurn>();
                taskDef.shots.forEach(s => {
                    let nshot = s;
                    if (s?.user) {
                        nshot.user = s.user.replaceAll(`{${k}}`, v);
                    }
                    nshots.push(nshot)
                })
                taskDef.shots = nshots;
            }
        }
    }
    //console.log("TD FINAL", taskDef);
    return taskDef;
}

export {
    applyVariables,
}
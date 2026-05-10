import { Agent } from "@agent-smith/agent";
import { Task } from "@agent-smith/task";
import type { TaskDef, AgentInferenceOptions, InferenceResult } from "@agent-smith/types";
import { applyFilePlaceholders } from './files.js';

class NodeTask extends Task {

    constructor(agent: Agent, def: TaskDef) {
        super(agent, def)
    }

    async run(
        prompt: string,
        options?: AgentInferenceOptions
    ): Promise<InferenceResult> {
        //console.log("NODE TASK AGENT OPTS", options);
        this.def = applyFilePlaceholders(this.def, options?.baseDir);
        return super.run(prompt, options);
    }
}

export {
    NodeTask
};

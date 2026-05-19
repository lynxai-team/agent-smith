import { Agent } from "@agent-smith/agent";
import { AgentInferenceOptions, InferenceResult, TaskDef } from '@agent-smith/types';
import YAML from 'yaml';
import { formatInferParams } from './inferparams.js';
import { applyVariables } from './variables.js';

class Task {
    def: TaskDef;
    agent: Agent;

    constructor(agent: Agent, def: TaskDef) {
        this.agent = agent;
        this.def = def;
    }

    static fromYaml(agent: Agent, txt: string) {
        const data = YAML.parse(txt);
        return new Task(agent, data as TaskDef)
    }

    async run(
        prompt: string, options: AgentInferenceOptions = {}
    ): Promise<InferenceResult> {
        /*if (prompt) {
            throw new Error(`Task ${this.def.name}: no prompt parameter provided. Parameters: ${JSON.stringify(params, null, 2)}`);
        }*/
        //console.log("RUN TASK opts", options);
        //console.log("RUN TASK def", this.def);
        let model = this.def.model;
        const localOptions: AgentInferenceOptions = Object.assign({}, options);
        if (localOptions?.model) {
            model = localOptions.model;
        }
        // add task tools to the agent
        if (this.def?.tools) {
            if (!localOptions?.tools) {
                localOptions.tools = []
            }
            if (this.def.tools.length > 0) {
                for (const t of this.def.tools) {
                    //console.log("push t", t)
                    localOptions.tools.push(t);
                    //console.log("push ok")
                }
            }
        }
        //console.log("TASK PARAMS", params);
        //console.log("TASK OPTS", localOptions);
        applyVariables(this.def, localOptions);
        //tpl = formatTaskTemplate(this.def, model?.template ? model.template : undefined);
        this.def.inferParams = formatInferParams(this.def.inferParams ?? {}, localOptions ?? {});
        //finalPrompt = params.prompt;
        /*console.log("-------------------------");
        console.log("DEF", this.def);
        console.log("-------------------------");*/
        //console.log("P", params.prompt);
        const finalPrompt = this.def.prompt.replace("{prompt}", prompt);
        //console.log("FP", finalPrompt);        
        let answer: InferenceResult;
        /*if (localOptions?.debug) {
            // cut debug here. TODO: debug log levels
            localOptions.debug = false
        }*/
        let isRoutingAgent = false;
        if (this.def?.description) {
            isRoutingAgent = this.def.description.includes("routing agent")
        }
        if (isRoutingAgent) {
            localOptions.isToolsRouter = true
        }
        if (this.def.template?.system) {
            localOptions.system = this.def.template.system;
        }
        if (this.def?.shots) {
            localOptions.history = localOptions?.history ? [...this.def.shots, ...localOptions.history] : this.def.shots;
        }
        if (localOptions?.debug) {
            console.log("-----------", model, "-----------");
            if (localOptions?.system) {
                console.log("SYSTEM:", localOptions.system, "\n");
            }
            console.log(finalPrompt);
            console.log("----------------------------------------------")
            console.log("Infer params:", this.def.inferParams);
            console.log("----------------------------------------------")
            //localOptions.debug = true
        }
        if (localOptions?.isToolCall) {
            // subagents use fresh context
            localOptions.history = [];
        }
        const agentOpts: AgentInferenceOptions = {
            ...localOptions,
            params: this.def.inferParams,
        }
        //console.log("TASK RUN agent localOptions:", agentOpts);
        answer = await this.agent.run(finalPrompt, agentOpts);

        // remove task tools from the agent
        /*if (hasTools) {
            this.def.tools?.forEach(
                t => {
                    delete this.agent.tools[t.name];
                }
            );
        }*/
        //console.log("TASK: ANSWER FINAL:", { answer: answer.result, errors: {}, template: answer.template })
        return answer
    }
}

export {
    Task
};

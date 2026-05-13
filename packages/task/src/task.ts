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
        if (options?.model) {
            model = options.model;
        }
        // add task tools to the agent
        if (this.def?.tools) {
            if (!options?.tools) {
                options.tools = []
            }
            if (this.def.tools.length > 0) {
                console.log("t of")
                for (const t of this.def.tools) {
                    //console.log("push t", t)
                    options.tools.push(t);
                    //console.log("push ok")
                }
            }
        }
        //console.log("TASK PARAMS", params);
        //console.log("TASK OPTS", options);
        applyVariables(this.def, options);
        //tpl = formatTaskTemplate(this.def, model?.template ? model.template : undefined);
        this.def.inferParams = formatInferParams(this.def.inferParams ?? {}, options ?? {});
        //finalPrompt = params.prompt;
        /*console.log("-------------------------");
        console.log("DEF", this.def);
        console.log("-------------------------");*/
        //console.log("P", params.prompt);
        const finalPrompt = this.def.prompt.replace("{prompt}", prompt);
        //console.log("FP", finalPrompt);        
        let answer: InferenceResult;
        /*if (options?.debug) {
            // cut debug here. TODO: debug log levels
            options.debug = false
        }*/
        let isRoutingAgent = false;
        if (this.def?.description) {
            isRoutingAgent = this.def.description.includes("routing agent")
        }
        if (isRoutingAgent) {
            options.isToolsRouter = true
        }
        if (this.def.template?.system) {
            options.system = this.def.template.system;
        }
        if (this.def?.shots) {
            options.history = options?.history ? [...this.def.shots, ...options.history] : this.def.shots;
        }
        if (options?.debug) {
            console.log("-----------", model, "-----------");
            if (options?.system) {
                console.log("SYSTEM:", options.system, "\n");
            }
            console.log(finalPrompt);
            console.log("----------------------------------------------")
            console.log("Infer params:", this.def.inferParams);
            console.log("----------------------------------------------")
            //options.debug = true
        }
        const agentOpts: AgentInferenceOptions = {
            ...options,
            params: this.def.inferParams,
        }
        //console.log("TASK RUN agent options:", agentOpts);
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

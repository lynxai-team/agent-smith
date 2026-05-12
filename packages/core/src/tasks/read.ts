import path from "path";
import { Agent } from "@agent-smith/agent";
import { NodeTask } from "@agent-smith/nodetask";
import { compile, serializeGrammar } from "@intrinsicai/gbnfgen";
import type { ToolSpec, ToolCallSpec, AgentInferenceOptions } from "@agent-smith/types";
import { readTool } from "../db/read.js";
import { executeAction } from "../actions/cmd.js";
import { McpClient } from "../mcp.js";
import { executeWorkflow } from "../workflows/cmd.js";
import { executeTask } from "./cmd.js";
import { mergeInferParams } from "./conf.js";
import { openTaskSpec } from "../utils/io.js";
//import { confirmToolUsage } from "../tools.js";

async function readTask(
    name: string, payload: { prompt: string } & Record<string, any>, options: AgentInferenceOptions & Record<string, any>, agent: Agent
): Promise<{
    task: NodeTask;
    vars: Record<string, any>;
    mcpServers: Array<McpClient>;
    taskDir: string;
}> {
    /*console.log("Read Task", name);
    console.log("Payload:", payload);
    console.log("Options:", options);*/
    const { taskDef, taskPath } = openTaskSpec(name, options?.isAgent);
    //console.log("Task vars:", taskDef?.variables);
    const taskDir = path.dirname(taskPath);
    options.params = mergeInferParams(options.params ?? {}, taskDef.inferParams ?? {});
    // vars
    let vars: Record<string, any> = {};
    if (taskDef?.variables?.optional) {
        for (const k of Object.keys(taskDef.variables.optional)) {
            if (k in payload) {
                vars[k] = payload[k];
                vars[k] = payload[k];
                delete payload[k]
            } else if (options?.variables) {
                if (k in options.variables) {
                    vars[k] = options.variables[k]
                }
            } else {
                // workflow takes variables in options
                if (k in options) {
                    vars[k] = options[k];
                    delete options[k];
                }
            }
        }
    }
    if (taskDef?.variables?.required) {
        for (const k of Object.keys(taskDef.variables.required)) {
            //console.log("TASK V required:", Object.keys(taskDef.variables.required), "/", k in options, "/", k in payload);
            if (k in payload) {
                vars[k] = payload[k];
                vars[k] = payload[k];
                delete payload[k]
            } else if (options?.variables) {
                if (k in options.variables) {
                    vars[k] = options.variables[k]
                }
            } else {
                // workflow takes variables in options
                if (k in options) {
                    vars[k] = options[k];
                    delete options[k];
                }
            }
        }
    }
    //console.log("END VARS", vars);
    const mcpServers = new Array<McpClient>();
    if (!taskDef?.tools) {
        taskDef.tools = []
    }
    const mcpServersArgs: Record<string, Array<string>> = {};
    if (options?.mcpArgs) {
        (options.mcpArgs).forEach(v => {
            const s = v.split(":");
            if (s.length < 2) {
                throw new Error(`Malformed mcp option ${v}: use --mcp servername:arg1,arg2`)
            }
            const sn = s[0];
            const sa = s[1];
            const _margs = sa.split(",");
            mcpServersArgs[sn] = _margs;
        });
        if (options?.debug) {
            console.log("Opening", options.mcpArgs.length, "server(s)")
        }
    }
    // mcp tools
    if (taskDef?.mcp) {
        for (const [servername, tool] of Object.entries(taskDef.mcp)) {
            //console.log("MCP TOOL:", tool)
            const authorizedTools = new Array<string>();
            const askUserTools = new Array<string>();
            if (tool?.tools) {
                (tool.tools as Array<string>).forEach(t => {
                    let tn = t;
                    if (t.endsWith("?")) {
                        tn = t.slice(0, -1);
                        askUserTools.push(tn)
                    }
                    authorizedTools.push(tn)
                });
            }
            const margs = tool.arguments;
            if (servername in mcpServersArgs) {
                margs.push(...mcpServersArgs[servername])
            }
            const mcp = new McpClient(
                servername,
                tool.command,
                tool.arguments,
                authorizedTools.length > 0 ? authorizedTools : null,
                askUserTools.length > 0 ? askUserTools : null,
            );
            //console.log("MCP", mcp);
            mcpServers.push(mcp);
            /*await mcp.start();
            const tools = await mcp.extractTools();
            tools.forEach(t => taskDef.tools?.push(t))*/
        }
    }
    // tools
    //console.log("Task tools list:", taskDef.toolsList);
    if (taskDef.toolsList) {
        for (const rawToolName of taskDef.toolsList) {
            let toolName = rawToolName;
            let autoRunTool = true;
            if (rawToolName.endsWith("?")) {
                autoRunTool = false;
                toolName = rawToolName.slice(0, -1);
            }
            const { found, tool } = readTool(toolName);
            if (!found) {
                throw new Error(`tool ${toolName} not found for task ${taskDef.name}`);
            }
            //console.log("Tool found:", toolName, tool);
            const quiet = !options?.debug;
            const lmTool: ToolSpec = {
                ...tool,
                execute: async (params) => {
                    //console.log("EXEC TOOL:", type, toolName, params);
                    switch (tool.type) {
                        case "action":
                            const res = await executeAction(toolName, params as { prompt: string & Record<string, any> }, options, quiet);
                            return res
                        case "task":
                            options.isToolCall = true;
                            options.isAgent = false;
                            const tres = await executeTask(toolName, params as { prompt: string & Record<string, any> }, options);
                            options.isToolCall = false;
                            //console.log("WFTRESP", tres.answer.text);
                            return tres.text
                        case "agent":
                            options.isToolCall = true;
                            options.isAgent = true;
                            const agres = await executeTask(toolName, params as { prompt: string & Record<string, any> }, options);
                            options.isAgent = false;
                            options.isToolCall = false;
                            //console.log("WFTRESP", tres.answer.text);
                            if (agres?.text) {
                                return agres.text
                            }
                            return agres
                        case "workflow":
                            options.isToolCall = true;
                            const wres = await executeWorkflow(toolName, params, options);
                            options.isToolCall = false;
                            return wres
                        default:
                            throw new Error(`unknown tool execution function type: ${tool.type} for ${toolName}`)
                    }
                }
            }
            if (!autoRunTool) {
                if (!options?.confirmToolUsage) {
                    throw new Error("provide a tool usage confirm function")
                }
                lmTool.canRun = options.confirmToolUsage as (tool: ToolCallSpec) => Promise<boolean>;
            }
            taskDef.tools.push(lmTool)
        }
        delete taskDef.toolsList
    };
    if (options?.isChatMode) {
        taskDef.prompt = "{prompt}";
    }
    //console.log("TASK SPEC:", JSON.stringify(taskDef, null, "  "));
    const task = new NodeTask(agent, taskDef);
    //task.addTools(taskDef.tools);
    //console.log("TASK TOOLS", task.agent.tools);
    // check for grammars
    if (taskDef?.inferParams?.tsGrammar) {
        //console.log("TSG");
        taskDef.inferParams.grammar = serializeGrammar(await compile(taskDef.inferParams.tsGrammar, "Grammar"));
    }
    /*if (options?.debug) {
        console.log("Task model:", model);
        //console.log("Task vars:", vars);
    }*/
    return { task, vars, mcpServers, taskDir }
}

export {
    readTask
};


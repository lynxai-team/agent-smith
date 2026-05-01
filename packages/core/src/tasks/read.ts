import path from "path";
import { Agent } from "@agent-smith/agent";
import { NodeTask } from "@agent-smith/nodetask";
import { compile, serializeGrammar } from "@intrinsicai/gbnfgen";
import type { ToolSpec, ToolCallSpec, LmTaskConfig, TaskDef, AgentInferenceOptions } from "@agent-smith/types";
import { readTool } from "../db/read.js";
import { executeAction } from "../actions/cmd.js";
import { McpClient } from "../mcp.js";
import { parseTaskConfigOptions } from "../utils/options_parsers.js";
import { executeWorkflow } from "../workflows/cmd.js";
import { executeTask } from "./cmd.js";
import { mergeInferParams } from "./conf.js";
import { openTaskSpec } from "../utils/io.js";
//import { confirmToolUsage } from "../tools.js";

async function readTask(
    name: string, payload: Record<string, any>, options: Record<string, any> & AgentInferenceOptions, agent: Agent
): Promise<{
    task: NodeTask;
    model: string;
    conf: LmTaskConfig;
    vars: Record<string, any>;
    mcpServers: Array<McpClient>;
    taskDir: string;
}> {
    if (options?.debug) {
        console.log("Task", name);
        console.log("Payload:", payload);
        console.log("Task options:", options);
    }
    const { taskFileSpec, taskPath } = openTaskSpec(name, options?.isAgent);
    const taskDir = path.dirname(taskPath);
    // merge passed options from payload
    //const opts = payload?.inferParams ? { ...options, ...payload.inferParams } : options;
    const conf = parseTaskConfigOptions(options);
    if (options?.debug) {
        console.log("Task conf:", conf);
        conf.debug = true;
    }
    conf.inferParams = mergeInferParams(conf.inferParams, taskFileSpec.inferParams ?? {});
    const model = conf?.model ? conf.model : taskFileSpec.model;
    // vars
    const taskSpec = taskFileSpec as TaskDef;
    let vars: Record<string, any> = {};
    if (taskSpec?.variables?.optional) {
        for (const k of Object.keys(taskSpec.variables.optional)) {
            if (k in options) {
                vars[k] = options[k]
            } else if (k in payload) {
                vars[k] = payload[k]
            }
        }
    }
    if (taskSpec?.variables?.required) {
        for (const k of Object.keys(taskSpec.variables.required)) {
            //console.log("TASK V required:", Object.keys(taskSpec.variables.required), "/", k in options, "/", k in payload);
            if (k in options) {
                vars[k] = options[k]
            } else if (k in payload) {
                vars[k] = payload[k]
            }
        }
    }
    const mcpServers = new Array<McpClient>();
    if (!taskSpec?.tools) {
        taskSpec.tools = []
    }
    const mcpServersArgs: Record<string, Array<string>> = {};
    if (options?.mcp) {
        (options.mcp as Array<string>).forEach(v => {
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
            console.log("Opening", options.mcp.length, "server(s)")
        }
    }
    // mcp tools
    if (taskFileSpec?.mcp) {
        for (const [servername, tool] of Object.entries(taskFileSpec.mcp)) {
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
            tools.forEach(t => taskSpec.tools?.push(t))*/
        }
    }
    // tools
    //console.log("Task tools list:", taskSpec.toolsList);
    if (taskSpec.toolsList) {
        for (const rawToolName of taskSpec.toolsList) {
            let toolName = rawToolName;
            let autoRunTool = true;
            if (rawToolName.endsWith("?")) {
                autoRunTool = false;
                toolName = rawToolName.slice(0, -1);
            }
            const { found, tool, type } = readTool(toolName);
            if (!found) {
                throw new Error(`tool ${toolName} not found for task ${taskSpec.name}`);
            }
            //console.log("Tool found:", toolName, tool);
            const quiet = !options?.debug;
            const lmTool: ToolSpec = {
                ...tool,
                execute: async (params) => {
                    //console.log("EXEC TOOL:", type, toolName, params);
                    switch (type) {
                        case "action":
                            const res = await executeAction(toolName, params as Record<string, any>, options, quiet);
                            return res
                        case "task":
                            options.isToolCall = true;
                            options.isAgent = false;
                            const tres = await executeTask(toolName, params as Record<string, any>, options);
                            options.isToolCall = false;
                            //console.log("WFTRESP", tres.answer.text);
                            return tres.text
                        case "agent":
                            options.isToolCall = true;
                            options.isAgent = true;
                            const agres = await executeTask(toolName, params as Record<string, any>, options);
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
                            throw new Error(`unknown tool execution function type: ${type} for ${toolName}`)
                    }
                }
            }
            if (!autoRunTool) {
                if (!options?.confirmToolUsage) {
                    throw new Error("provide a tool usage confirm function")
                }
                lmTool.canRun = options.confirmToolUsage as (tool: ToolCallSpec) => Promise<boolean>;
            }
            taskSpec.tools.push(lmTool)
        }
        delete taskSpec.toolsList
    };
    if (options?.chatMode) {
        taskSpec.prompt = "{prompt}";
    }
    //console.log("TASK SPEC:", JSON.stringify(taskSpec, null, "  "));
    const task = new NodeTask(agent, taskSpec);
    //task.addTools(taskSpec.tools);
    //console.log("TASK TOOLS", task.agent.tools);
    // check for grammars
    if (taskSpec?.inferParams?.tsGrammar) {
        //console.log("TSG");
        taskSpec.inferParams.grammar = serializeGrammar(await compile(taskSpec.inferParams.tsGrammar, "Grammar"));
    }
    /*if (options?.debug) {
        console.log("Task model:", model);
        //console.log("Task vars:", vars);
    }*/
    return { task, model, conf, vars, mcpServers, taskDir }
}

export {
    readTask
};


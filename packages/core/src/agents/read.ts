import path from "path";
import { Agent } from "@agent-smith/agent";
import { compile, serializeGrammar } from "@intrinsicai/gbnfgen";
import type { ToolSpec, ToolCallSpec, AgentInferenceOptions, AgentSpec, InferenceParams } from "@agent-smith/types";
import { readFeature, readFeaturesType, readSkillsFromList, readTool } from "../db/read.js";
import { executeAction } from "../actions/cmd.js";
import { McpClient } from "../mcp.js";
import { executeWorkflow } from "../workflows/cmd.js";
import { executeAgent } from "./cmd.js";
import { mergeInferParams } from "./conf.js";
import { openAgentSpec } from "../utils/io.js";
import { default as fm } from "front-matter";
import { readFile } from "../utils/sys/read.js";
import { applyFilePlaceholders } from "./files.js";
//import { confirmToolUsage } from "../tools.js";

async function readAgent(
    name: string, payload: { prompt: string } & Record<string, any>, options: AgentInferenceOptions & Record<string, any>
): Promise<{
    agentSpec: AgentSpec;
    vars: Record<string, any>;
    mcpServers: Array<McpClient>;
    agentDir: string;
}> {
    /*console.log("Read Agent", name);
    console.log("Payload:", payload);
    console.log("Options:", options);*/
    const { agentSpec, agentPath } = openAgentSpec(name);
    //console.log("Agent vars:", agentSpec?.variables);
    const agentDir = path.dirname(agentPath);
    if (!options?.backend && agentSpec?.backend) {
        options.backend = agentSpec.backend;
    }
    let ip: InferenceParams = {};
    if (!options?.isToolCall) {
        if (options?.params) {
            ip = options.params
        } else if (agentSpec?.inferParams) {
            ip = agentSpec.inferParams
        }
    } else {
        if (options?.propagateInferParams) {
            if (options?.params) {
                ip = options.params
            }
        } else if (agentSpec?.inferParams) {
            ip = agentSpec.inferParams
        }
    }
    // vars
    let vars: Record<string, any> = {};
    if (agentSpec?.variables?.optional) {
        for (const k of Object.keys(agentSpec.variables.optional)) {
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
    if (agentSpec?.variables?.required) {
        for (const k of Object.keys(agentSpec.variables.required)) {
            //console.log("TASK V required:", Object.keys(agentSpec.variables.required), "/", k in options, "/", k in payload);
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
    if (!agentSpec?.tools) {
        agentSpec.tools = []
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
    if (agentSpec?.mcp) {
        for (const [servername, tool] of Object.entries(agentSpec.mcp)) {
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
            tools.forEach(t => agentSpec.tools?.push(t))*/
        }
    }
    // tools
    //console.log("AGENT SPECS", agent.name, agentSpec);
    if (agentSpec?.skills) {
        // skills text
        const sks = readSkillsFromList(agentSpec.skills);
        const skLines = new Array<string>();
        for (const s of Object.values(sks)) {
            if (!s?.variables) {
                throw new Error(`no variables in skill feature ${s.name}`)
            }
            const vars = s.variables as Record<string, any>;
            skLines.push("- **" + vars.name + "**: " + vars.description);
        }
        const skt = skLines.join("\n");
        if (agentSpec.prompt.includes("{skills}")) {
            agentSpec.prompt = agentSpec.prompt.replace("{skills}", skt);
        }
        if (agentSpec?.template?.system) {
            if (agentSpec.template.system.includes("{skills}")) {
                agentSpec.template.system = agentSpec.template.system.replace("{skills}", skt);
            }
        }
        // load skill
        //if (agentSpec?.skills) {
        if (!agentSpec?.toolsList) {
            agentSpec.toolsList = []
        }
        agentSpec.toolsList.push("load-skill")
        /*} else {
            throw new Error(`loading skill: no skills defined in agent`)
        }*/
    }
    //console.log("ATL", agentSpec.toolsList);
    if (agentSpec?.toolsList) {
        for (const rawToolName of agentSpec.toolsList) {
            let toolName = rawToolName;
            let autoRunTool = true;
            if (rawToolName.endsWith("?")) {
                autoRunTool = false;
                toolName = rawToolName.slice(0, -1);
            }
            const { found, tool } = readTool(toolName);
            if (!found) {
                throw new Error(`tool ${toolName} not found for agent ${agentSpec.name}`);
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
                        case "agent":
                            options.isToolCall = true;
                            const agres = await executeAgent(toolName, params as { prompt: string & Record<string, any> }, options);
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
            agentSpec.tools.push(lmTool)
        }
        delete agentSpec.toolsList
    };
    //console.log("AS TOOLS", agentSpec.name, agentSpec.tools);
    if (options?.isChatMode) {
        agentSpec.prompt = "{prompt}";
    }
    //console.log("TASK SPEC:", JSON.stringify(agentSpec, null, "  "));
    if (!options?.baseDir) {
        options.baseDir = agentDir
    }
    applyFilePlaceholders(agentSpec, options.baseDir);
    //task.addTools(agentSpec.tools);
    //console.log("TASK TOOLS", task.agent.tools);
    // check for grammars
    if (agentSpec?.inferParams?.tsGrammar) {
        //console.log("TSG");
        agentSpec.inferParams.grammar = serializeGrammar(await compile(agentSpec.inferParams.tsGrammar, "Grammar"));
    }
    //console.log("AS END", agentSpec);
    return { agentSpec, vars, mcpServers, agentDir }
}

export {
    readAgent
};

